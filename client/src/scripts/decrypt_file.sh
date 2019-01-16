#!/bin/bash

openssl enc -aes-256-cbc -K $2 -iv $3 -in $1 -d -a
