#!/bin/bash

openssl ec -passin file:$1 -pubout
