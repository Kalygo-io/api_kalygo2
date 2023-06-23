# REDIS

## TLDR

Run redis, make a job queue, track the progress of summarization on a document

```.sh
docker run --name kalygo-redis-queue -p 6379:6379 -d redis
```