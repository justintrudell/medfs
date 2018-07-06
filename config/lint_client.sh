#!/bin/bash


if git diff --name-only | grep "client/"; then
    echo "Client files changed, running linter..."
    cd client && yarn lint
fi
