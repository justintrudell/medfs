#!/bin/bash

openssl rsa -outform PEM -pubout -passin file:$1
