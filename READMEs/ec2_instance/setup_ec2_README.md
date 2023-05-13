# STEPS

## Create a key pair

export AWS_PROFILE=kalygo2_dev
export AWS_REGION=us-east-1

aws ec2 create-key-pair --key-name Kalygo2_dev_server --query 'KeyMaterial' --output text > kalygo2_dev.pem

## Previous didn't work due to IAM permissions

Add the permissions outlined in `policies/ability_to_create_key_pair.json`

## Then `Create a key pair` worked

√

## Create a VPC

aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specification 'ResourceType=vpc,Tags=[{Key=Name,Value=Kalygo2}]'

## Ran into errors so trying to decode the encoded failure message

aws sts decode-authorization-message --encoded-message (encoded error message) --query DecodedMessage --output text | jq '.'

ie: aws sts decode-authorization-message --encoded-message KgI107dNZNJWfwaqcpnhSX-cbwQe_oKPtD9v2z88c9Y9bgefD6jvX5mwVUp8IbFT-DmUU24O4NRPLxM3aBrKRRtM2yHHZAYwViN98pnw5eXnN4aoY6-BrW4VjrWWdeQWx3HUkJLnw5BdNI0gze-GcZYJ60g2dg3hlzSBR-Hh5Q9T2Mq8UiRUfh_FHFBqwgxu586YGsKnv8G8gFF7McFIYD5vi4enI6CiRzyl-q7kJXtZdK98NeJa3VoXaZ1nXuDjQpUGC9fn3lb2PSB3P0axeLumTniZw6fMsDBtMiWVEBEO1JwmZh6ZZK5QZdluwMtQlU8SIbf3BRYEcLJJwt8-H5oIKK0LeKkABUliK_dieIKkX4qcb0Qc18s803WfwLxP3ejhrgzgsbmaet2KHj3dGaHtrza21ZQtpSRo7J9yzYwhpIx4Nr3hHPSmn3ysoJUM8xCq-5nhHk6v9tfDHMaQ2Tv4nOrYhpUhs21AHNrwbBaSX2k71aHjXOzZnP42YnvWIUqwB32c2Wf6 --output text

## Need to add more IAM perms ie: `An error occurred (AccessDenied) when calling the DecodeAuthorizationMessage operation: User: arn:aws:iam::333427308013:user/kalygo2_dev`

reference: `ec2_instance/policies/perms_with_no_arn_restrictions`

"sts:*", <!-- for being able to decode encoded error messages -->
"ec2:DeleteTags",
"ec2:CreateTags"

## Create a VPC

aws ec2 create-vpc --cidr-block 10.0.0.0/24 --tag-specification 'ResourceType=vpc,Tags=[{Key=Name,Value=Kalygo2}]'

# DETOUR

## Create an EC2 instance to view the old EFS data

Associate Elastic IP address to connect to EC2 instance in VPC to make EC2 instance in the subnet with the offending EFS mount publicly accessible

## then ssh'd into the box and used the following commands to inspect the efs data

```.sh
df -h
cd /mnt/efs/fs1
```

# BACK ON TRACK

## List VPCs

brew install jq
aws ec2 describe-vpcs <!-- the VPC created for Kalygo 2.0 is vpc-0ddf64f712f5c8dd1 --->

## create a subnet

aws ec2 create-subnet \
    --vpc-id vpc-0a0df004351173477 \
    --cidr-block 10.0.0.0/28 \
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=kalygo2-public-subnet-1}]'

aws ec2 create-subnet \
    --vpc-id vpc-0a0df004351173477 \
    --cidr-block 10.0.0.16/28 \
    --availability-zone us-east-1f \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=kalygo2-public-subnet-2}]'

Needed perms outlined in: `ec2_instance/policies/perms_to_create_subnets_in_the_vpc.json`

NOTES: creating subnet seemed to create a route table
NOTES: Needed to create 2 subnets in 2 availability zones for ALB support

## Recreating VPC and subnet

- delete subnet before deleting vpc
- aws ec2 delete-vpc --vpc-id vpc-06a531c0c83b347e5
- when you create a subnet you will have a default route table and security-group
- needed

## create internet gateway

aws ec2 create-internet-gateway

```.sh
{
    "InternetGateway": {
        "Attachments": [],
        "InternetGatewayId": "igw-0e680fd87671fabc9",
        "OwnerId": "333427308013",
        "Tags": []
    }
}
```

aws ec2 attach-internet-gateway --internet-gateway-id igw-0e680fd87671fabc9 --vpc-id vpc-0a0df004351173477

## create a route table 

aws ec2 create-route-table --vpc-id vpc-0a0df004351173477

{
    "RouteTable": {
        "Associations": [],
        "PropagatingVgws": [],
        "RouteTableId": "rtb-0b24a06cf614c354d",
        "Routes": [
            {
                "DestinationCidrBlock": "10.0.0.0/24",
                "GatewayId": "local",
                "Origin": "CreateRouteTable",
                "State": "active"
            }
        ],
        "Tags": [],
        "VpcId": "vpc-0a0df004351173477",
        "OwnerId": "333427308013"
    }
}

## Now to modify the route table

aws ec2 create-route --route-table-id rtb-0b24a06cf614c354d --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0e680fd87671fabc9

```
aws ec2 create-route --route-table-id rtb-0b24a06cf614c354d --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0e680fd87671fabc9

returns...

{
    "Return": true
}
```

## Associate route table with subnet

aws ec2 associate-route-table --route-table-id rtb-0b24a06cf614c354d --subnet-id subnet-0cba3f1bdfaf17bcd
aws ec2 associate-route-table --route-table-id rtb-0b24a06cf614c354d --subnet-id subnet-07fdbe4f50f68c90f

```
aws ec2 associate-route-table --route-table-id rtb-0b24a06cf614c354d --subnet-id subnet-0cba3f1bdfaf17bcd

returns...

{
    "AssociationId": "rtbassoc-0c3276aa717f041f8",
    "AssociationState": {
        "State": "associated"
    }
}
```

## Launch an instance into subnet

- I used the EC2 console
- but with cli: https://docs.aws.amazon.com/cli/latest/userguide/cli-services-ec2-instances.html

## Assign EIP to EC2 instance

- I used the EC2 console

## Test 

ssh -i "Kalygo2_dev_server.pem" ec2-user@184.73.125.247

## Use user data to script software installion

