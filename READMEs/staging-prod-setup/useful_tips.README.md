# Useful tips while creating a staging-prod setup

## How to decode encoded AWS error messages

```.sh
aws sts decode-authorization-message --encoded-message (encoded error message) --query DecodedMessage --output text | jq '.'
```

ie: 

aws sts decode-authorization-message --encoded-message tBcN5HyH1-njlPVJBSVrowPt7kYI7CGlXSZxwIFMmDgpLro84bbasiSrCE-1s9uA_E3Wt2JZf3HlN-g8Rzu5URFwsTisGZ8x_cnq-6kh0BBb2v1z-6KcDWsLaPT5o_fz7J35x9IwRYNJw-fNjqWdflx9iEvI5qdFQeELxeOQSTiJ6d7DXb5otdnVuB1U_OkRB_aEgUtiY8zsA4vfGQ6fZR7NrBbGeLOt7Eh8zQkslSghGS6r2V3jszPGvAe6Hj8PiQ1vfq8MvRFX5eRQK1Z6OdIALOE2_0EnDHhJey0CPRtRE9BShftW052Om_W4FULX0lB54jy9NhKfQm3x6Na_dfnTgfAEsVAXEa1yQSMKFyKUAbqV1ewqx57tUGwivn08fQSXOX7044u6pZc83B_A_s-sNOCND17ZzP9iX0rU3sDXTNkVAdw1k78nE3tNjE-RZtC7UNDtKCyUTm1brLXoK_d1TlDb029MKMGkzlJTVt7L9En8JSVnsnWqko7QhuC1M7PWWVuakcCnfFa39ccrnIkKahLN0TeLazTK4Fk41VTXYrehFb7EGIaKsP8MNOq2VfBpoKjbacYHUKMmMeWSkIourAAfmeHDp7XlefustCQ --query DecodedMessage --output text | jq '.'

## Might be useful

```.sh needed perms for running an instance with the AWS CLI
{
            "Effect": "Allow",
            "Action": "ec2:RunInstances",
            "Resource": [
                "arn:aws:ec2:*:*:subnet/subnet-subnet-id",
                "arn:aws:ec2:*:*:network-interface/*",
                "arn:aws:ec2:*:*:instance/*",
                "arn:aws:ec2:*:*:volume/*",
                "arn:aws:ec2:*::image/ami-*",
                "arn:aws:ec2:*:*:key-pair/*",
                "arn:aws:ec2:*:*:security-group/*"
            ]
        }
```

## You can only have so many perms added as a inline policy so for the perms needed for creating the ALB for the EC2 instance needed to create a dedicated policy