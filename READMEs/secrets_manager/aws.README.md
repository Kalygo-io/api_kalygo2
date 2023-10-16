# Reference Docs for V1 implementation

https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/secrets-manager/

https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/secrets-manager/command/CreateSecretCommand/

##

curl -X POST http://localhost:3000/api/v1/account/add-api-key
   -H "Content-Type: application/json"
   -d '{"service": "OPEN_AI, "apiKey": "API_KEY_HERE"}'  

##

https://zaccharles.medium.com/store-and-rotate-api-keys-with-aws-secrets-manager-26f7f7a6c211

##

curl http://localhost:3000/api/v1/account/get-api-key