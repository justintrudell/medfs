#!/bin/bash

rm -r lambda_deps
mkdir -p lambda_deps
cd lambda_deps
pip install -r ../requirements.txt --target .

zip -r9 ../dbCleaner.zip .

cd ../

zip -g dbCleaner.zip db_cleaner.py

aws lambda update-function-code --function-name dbCleaner --zip-file fileb://dbCleaner.zip --profile medfs
