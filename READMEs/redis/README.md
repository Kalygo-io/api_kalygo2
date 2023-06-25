# REDIS

## TLDR

Run redis, make a job queue, track the progress of summarization on a document

```.sh
docker run --name kalygo-redis-queue -p 6379:6379 -d redis
```

## Instruction for setting up JobQueue on the server

### 1

```.sh
docker run --name kalygo-redis-queue -p 6379:6379 -d redis
```

### 2 tried pushing via a merge or directly calling the .git hook

`./.git/hooks/post-merge` or `git merge <BRANCH_WITH_BULL_LIBRARY_CHANGES>` 