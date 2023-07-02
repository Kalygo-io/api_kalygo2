# STEPS - Needs to be scripted but this is solid

## Table of Contents

*** PART 1 ***
1. Create target group
2. Register targets
3. Create security group for ALB
4. Add Inbound Rules to security group
*** PART 2 ***
5. Create load balancer
6. Create HTTP listener for load balancer
7. Create Listener HTTPS
8. Final Testing

## Content

### 1 - Create target group

aws elbv2 create-target-group --name kalygo-api-target-group \
    --target-type instance \
    --port 80 \
    --health-check-port 80 \
    --health-check-path /api/v1 \
    --vpc-id vpc-0d5be98ca00e10f9b \
    --protocol HTTP

### 2 - Register targets

aws elbv2 register-targets \
    --target-group-arn arn:aws:elasticloadbalancing:us-east-1:333427308013:targetgroup/kalygo-api-target-group/7242036a001d3478 \
    --targets Id=i-02ca7250acf7b159e

### 3 - Create security group for ALB

aws ec2 create-security-group \
--description "Kalygo API ALB security group" \
--group-name kalygo-alb \
--vpc-id vpc-0d5be98ca00e10f9b

### 4 - Add Inbound Rules to security group

aws ec2 authorize-security-group-ingress --group-id sg-03436e5356638a1ba --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-03436e5356638a1ba --protocol tcp --port 443 --cidr 0.0.0.0/0

### 5 - Create load balancer

aws elbv2 create-load-balancer --name kalygo-api --subnets subnet-031c4e39ef0f77db8 subnet-0da71271a3286e30a --scheme internet-facing --ip-address-type ipv4 --region us-east-1 --security-groups sg-03436e5356638a1ba

### 6 - Create HTTP listener for load balancer

aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:333427308013:loadbalancer/app/kalygo-api/91185d29a9cbff76 \
    --protocol HTTP --port 80  \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:333427308013:targetgroup/kalygo-api-target-group/7242036a001d3478

### 7 - Create Listener 443

aws elbv2 create-listener \
    --load-balancer-arn LOAD_BALANCER_ARN \
    --protocol HTTPS --port 443  \
    --certificates CertificateArn=CERTIFICATE_ARN \
    --default-actions Type=forward,TargetGroupArn=TARGET_GROUP_ARN

### 8 - Final Testing

- Had to add inbound rule for the security group on the ec2 instance on the port where the nginx server is running
- Have to add inbound rule from ALB security group to the port where the nginx server is running

### 9 - Sleep



