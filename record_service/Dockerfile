FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install -y python3-pip python3.6 build-essential

RUN mkdir -p /app
COPY requirements.txt /app
WORKDIR /app
RUN pip3 install -r requirements.txt
COPY . /app
ENTRYPOINT ["gunicorn"]
CMD ["--workers=4", "--worker-class=eventlet", "-b", "0.0.0.0:5000", "app:app"]
