4CeeD Uploader
=====

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

