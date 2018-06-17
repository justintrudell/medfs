FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install -y python3-pip python3.6 build-essential
COPY requirements.txt /app
WORKDIR /app
RUN pip3 install -r requirements.txt
COPY . /app
ENTRYPOINT ["python3"]
CMD ["app.py"]
