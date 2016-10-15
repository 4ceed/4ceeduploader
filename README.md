4CeeD Uploader
=====

These are the instructions to run only 4CeeD Uploader. To setup the whole 4CeeD software suite, please use the [4CeeD Framework](https://github.com/4ceed/4ceedframework) repository.

## Prerequisites
- PHP (5.5 or later)
- Docker (to build Docker image, 1.9.1 or later)

## Quickstart

Before running the uploader, update the configuration information in `uploader.conf`:
- `CURATOR_HOME`: Home address of 4CeeD curator instance
- `CURATOR_API_URL`: Address of 4CeeD curator APIs
- `UPLOADER_HOME`: Home address of this uploader

Run the uploader:
```
./uploader-start.sh
```

## Build Uploader Docker image

Build Docker image:
```
docker build -t [Your Org.]/t2c24ceeduploader .
```

Push newly built image to Docker Hub:
```
docker push [Your Org.]/t2c24ceeduploader
```

