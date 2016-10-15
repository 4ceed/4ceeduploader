FROM php:5.5
ADD . /code
WORKDIR /code
EXPOSE 8000
CMD ["/code/uploader-start.sh"]
