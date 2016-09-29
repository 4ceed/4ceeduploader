FROM php:5.5
ADD . /code
WORKDIR /code
EXPOSE 2309
ENV CURATOR_HOME="https://4ceed.illinois.edu/" \
    CURATOR_API_URL="https://4ceed.illinois.edu/api/" \
    UPLOADER_HOME="https://4ceed.illinois.edu/4ceeduploader/"
CMD ["/usr/local/bin/php", "-S", "0.0.0.0:2309"]
