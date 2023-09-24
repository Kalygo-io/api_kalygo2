# MANUAL STEPS

## Configure S3

- created an S3 bucket called `media.kalygo.io`
    - then turned off `Block all public access`
    - add the following policy.json
```.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::media.kalygo.io/*"
        }
    ]
}
```
- enable `Static Website Hosting` on S3 bucket

## Configure Route53

- create an `A` record in Route53
    - media.kalygo.io > us-east-1

- EVERYTHING LOOKING GOOD √

## Configure CLOUDFRONT

- Configure a CDN with Cloudfront
- First create an SSL cert w/ ACM
- Create distribution
    - specify default root object - index.html
    - select relevant ACM cert
    - DO (or DO NOT perhaps) enable WAF
    - Then wait for CDN to be deployed

## Update Route53 to point to the CDN (ie: Cloudfront)

