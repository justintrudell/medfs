#!/bin/bash

openssl enc -aes-256-cbc -K $3 -iv $4 -in "$1" -out "$2" -d
