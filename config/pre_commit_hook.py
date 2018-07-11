#!/usr/bin/env python
import subprocess
import sys

DIRS_TO_CHECK = ["acl", "record_service", "client", "message_service"]

RED_TXT = "\033[91m"
HEADER = "\033[94m"
END_CLR = "\033[0m"


def print_err(s):
    print(RED_TXT + s + END_CLR)


if len(sys.argv) == 1:
    print(
        HEADER + "Running pre-commit hook - to skip, commit with --no-verify" + END_CLR
    )
else:
    print(HEADER + "Manually linting..." + END_CLR)


print("Formatting with black...")
black_args = (
    ["black"]
    + DIRS_TO_CHECK
    + [
        "--include",
        "\.py$",
        "--exclude",
        "env|venv|experimental|pb2.*\.py|node_modules",
        "--check",
    ]
)
ret = subprocess.run(black_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
# 123 signifies a fatal error
if ret.returncode == 123:
    print_err("Black encountered an error: ")
    print(ret.stderr)
    sys.exit(1)
elif ret.returncode == 1:
    ret = subprocess.run(black_args[:-1])
    if len(sys.argv) == 1:
        print_err("Files were formatted - please re-commit with these formatted files")
        sys.exit(1)
    else:
        print_err("Files were formatted - please include these formatted files")

print("Linting with flake8...")
ret = subprocess.run(
    ["flake8"]
    + DIRS_TO_CHECK
    + [
        "--exclude",
        "env,venv,experimental,*pb2*.py,alembic,node_modules",
        "--config",
        "config/setup.cfg",
    ]
)
if ret.returncode != 0:
    print_err("Lint issues found with flake8 - please fix them before committing")
    if len(sys.argv) == 1:
        sys.exit(1)

print("Type checking with mypy...")
ret = subprocess.run(["mypy", "--ignore-missing-imports", "."])
if ret.returncode != 0:
    print_err("Typing issues found with mypy - please fix them before committing")
    if len(sys.argv) == 1:
        sys.exit(1)
