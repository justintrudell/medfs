#!/bin/bash

openssl rsa -outform PEM -pubout -in $1 -passin file:$2
