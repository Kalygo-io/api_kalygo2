# STEPS

https://medium.com/@codebyamir/adding-ssl-tls-to-a-web-application-using-aws-application-load-balancer-79e5ceea5733

- setup alb
- create a target group of type instance
- protocol will be http
- select the vpc-id
- healthcheck
- choose the instance
- create a load balancer - internet facing, select VPC, 2 subnets, select security group
- Security Group, Ingress HTTP and HTTPS from anywhere, Egress to instance id or SG
- HTTPS listener and select target group
- ACM will be for the domain and associate it with the ALB

## create target group

 aws elbv2 create-target-group --name kalygo2-api-target-group \
    --target-type instance \
    --port 80 \
    --health-check-port 80 \
    --health-check-path /api/v1 \
    --vpc-id vpc-0a0df004351173477

## register targets

aws elbv2 register-targets \
    --target-group-arn TARGET_GROUP_ARN \
    --targets Id=INSTANCE_ID

## create load balancer

aws elbv2 create-load-balancer \
    --name kalygo2-api \
    --subnets SUBNET_ID_1 SUBNET_ID_2 \ 
    --scheme internet-facing \
    --ip-address-type ipv4 \
    --region us-east-1 \ 
    --security-groups <DEFAULT_BLAH_BLAH_BLAH> \ 


## create listeners for load balancer

aws elbv2 create-listener \
    --load-balancer-arn LOAD_BALANCER_ARN \
    --protocol HTTPS --port 443  \
    --certificates CertificateArn=CERTIFICATE_ARN \
    --default-actions Type=forward,TargetGroupArn=TARGET_GROUP_ARN

### Create ACM cert and add A record to Route53 for API domain

- Create ACM cert
- Add ACM to Route53 aka DNS Validation

## TIP

make 80 listener redirect to 443

## Verify

via health check on Load Balance console

## Adjust security group on the target group of the ALB and the EC2 instance

Blah blah blah




