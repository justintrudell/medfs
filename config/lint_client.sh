#!/bin/bash


if git diff --cached --name-only | grep "client/" >> /dev/null; then
    echo "Client files changed, running linter..."
    cd client && yarn lint
fi
