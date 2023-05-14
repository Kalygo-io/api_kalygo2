# TLDR

- Setting up an ec2 instance with express + postgres + possible redis in one box
- Scripting rebuilding the box as much as possible
- this approach is nice because it is cheap : )

## General Steps

1. provision ec2 instance (lookin good)
2. install software (lookin good)
3. install db (looking good)
4. setup alb

TIP: ssh -i "*.pem" <USER_NAME>@<IP_ADDRESS>