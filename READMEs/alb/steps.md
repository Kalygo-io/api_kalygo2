aws elbv2 create-target-group --name kalygo2-api-target-group \
    --target-type instance \
    --port 80 \
    --health-check-port 80 \
    --health-check-path /api/v1 \
    --vpc-id vpc-0a0df004351173477
