# STEPS - Needs to be scripted but this is solid

## Table of Contents

*** PART 1 ***
1. Setup a new AWS user using the AWS Console (w/ multi-factor auth)
2. Create an AWS IAM Access key and associate it with the new AWS user
3. Attach a policy for being able to create AWS SSH key pairs to the user
4. Create a SSH key pair
*** PART 2 ***
5. Create VPC (and verify creation)
6. Create Subnets in VPC for any EC2 instances needed
7. Create a security group
8. Launch an instance into subnet
9. Tag the instance
*** PART 3 ***
10. Attach an Internet Gateway to the VPC so the Elastic IP can connect to the EC2 Instance
11. Allocate Elastic IP
12. Associate Elastic IP to instance
13. Add rule to security group for EC2 instance
14. Test ssh'ing into the instance

## Content

### 1 - Create an AWS user...
Use the AWS Console

### 2 - Create AWS-CLI access key for user
Use the AWS Console. Go to the `Security Credentials` pane of the AWS Users detail page and create an Access Key

### 3 - Attach policy for creating AWS SSH key pairs to the user
attach the permissions outlined in `policies/all_perms_for_ec2_setup.json` to the user

### 4 - Create a key pair
export AWS_PROFILE=<AWS_USER_HERE>
export AWS_REGION=<AWS_REGION_HERE>
aws ec2 create-key-pair --key-name <DESIRED_KEY_PAIR_NAME_HERE> --query 'KeyMaterial' --output text > <PEM_FILE_NAME_HERE>.pem

### 5 - Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/24 --tag-specification 'ResourceType=vpc,Tags=[{Key=Name,Value=Kalygo}]'  <!-- note the cidr block -->

- then verify VPC was created ie: `aws ec2 describe-vpcs`

### 6 - Create Subnets in VPC
aws ec2 create-subnet \
    --vpc-id <VPC_ID> \
    --cidr-block 10.0.0.0/28 \ <!-- note the cidr block -->
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=<SUBNET_NAME_HERE>}]'

aws ec2 create-subnet \
    --vpc-id vpc-0d5be98ca00e10f9b \
    --cidr-block 10.0.0.16/28 \
    --availability-zone us-east-1b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=kalygo-public-subnet-2}]'

*** BIG GAME ***
Need to create 2 subnets in 2 DIFFERENT availability zones for ALB support

### 7 - Create a Security Group

aws ec2 create-security-group
--description "Kalygo security group"
--group-name kalygo-server
--vpc-id vpc-0d5be98ca00e10f9b

### 8 - Launch an instance into subnet

- Could use AWS Console or CLI [https://docs.aws.amazon.com/cli/latest/userguide/cli-services-ec2-instances.html]
- ami-06b09bfacae1453cb <!-- this is the latest AMI ID at the time this was documented 7-1-2023 -->

aws ec2 run-instances --image-id ami-xxxxxxxx --count 1 --instance-type t3.medium --key-name <SSH_KEY_HERE> --security-group-ids <SECURITY_GROUP_ID_HERE> --subnet-id <SUBNET_ID_HERE>

```.sh
aws ec2 run-instances --image-id ami-06b09bfacae1453cb --count 1 --instance-type t3.medium --key-name Kalygo_server --security-group-ids sg-08f67194018a52053 --subnet-id subnet-031c4e39ef0f77db8 --block-device-mappings "[{\"DeviceName\":\"/dev/xvda\",\"Ebs\":{\"VolumeSize\":16,\"DeleteOnTermination\":false}}]" 
```

### 9 - Tag the instance

aws ec2 create-tags --resources i-02ca7250acf7b159e --tags Key=Name,Value=Kalygo

### 10 - Attach an Internet Gateway to the VPC so the Elastic IP can connect to the EC2 Instance

#### 10a - Create Internet Gateway
aws ec2 create-internet-gateway

#### 10b - Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway --internet-gateway-id igw-0e3bdbad7d72b7a3a --vpc-id vpc-0d5be98ca00e10f9b

#### 10c - Add route on the route table 
aws ec2 create-route --route-table-id rtb-0069eb414ef4604b9 --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0e3bdbad7d72b7a3a

### 11 - Allocate Elastic IP

aws ec2 allocate-address

### 12 - Associate Elastic IP to instance

aws ec2 associate-address --allocation-id eipalloc-01cbbe3e5845a4cc6 --instance-id i-02ca7250acf7b159e

### 13 - add rule to security group for EC2 instance

aws ec2 authorize-security-group-ingress --group-id sg-08f67194018a52053 --protocol tcp --port 22 --cidr 185.197.192.0/24

## 14 - test ssh'ing into the instance

ssh -i "kalygo.pem" ec2-user@44.195.161.114

