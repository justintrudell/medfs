#!/bin/bash

openssl rsa -in $1 -passin file:$2
