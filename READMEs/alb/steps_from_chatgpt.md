#!/bin/bash

# Variables
TARGET_GROUP_NAME="kalygo2-api-target-group"
VPC_ID="<VPC_ID>"
INSTANCE_ID="<INSTANCE_ID>"
LOAD_BALANCER_NAME="kalygo2-api"
SUBNET_ID_1="<SUBNET_ID_1>"
SUBNET_ID_2="<SUBNET_ID_2>"
DEFAULT_SECURITY_GROUP="<DEFAULT_SECURITY_GROUP>"
CERTIFICATE_ARN="<CERTIFICATE_ARN>"
REGION="us-east-1"

# Create Target Group
TARGET_GROUP_ARN=$(aws elbv2 create-target-group --name $TARGET_GROUP_NAME --target-type instance --port 80 --health-check-port 80 --health-check-path /api/v1 --vpc-id $VPC_ID --query 'TargetGroups[0].TargetGroupArn' --output text --region $REGION)

echo "Target Group Created: $TARGET_GROUP_ARN"

# Register Targets
aws elbv2 register-targets --target-group-arn $TARGET_GROUP_ARN --targets Id=$INSTANCE_ID --region $REGION

echo "Instance $INSTANCE_ID Registered to Target Group"

# Create Load Balancer
LOAD_BALANCER_ARN=$(aws elbv2 create-load-balancer --name $LOAD_BALANCER_NAME --subnets $SUBNET_ID_1 $SUBNET_ID_2 --scheme internet-facing --ip-address-type ipv4 --security-groups $DEFAULT_SECURITY_GROUP --query 'LoadBalancers[0].LoadBalancerArn' --output text --region $REGION)

echo "Load Balancer Created: $LOAD_BALANCER_ARN"

# Create Listener for Load Balancer
aws elbv2 create-listener --load-balancer-arn $LOAD_BALANCER_ARN --protocol HTTPS --port 443 --certificates CertificateArn=$CERTIFICATE_ARN --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN --region $REGION

echo "HTTPS Listener Created for Load Balancer"