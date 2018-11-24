#!/bin/bash

openssl genrsa -aes256 -passout file:$1
