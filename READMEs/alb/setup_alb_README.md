# STEPS

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


