#!/bin/bash

openssl ecparam -genkey -name secp256k1 | openssl ec -aes256 -passout file:$1
