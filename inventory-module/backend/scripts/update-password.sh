#!/bin/bash

cd "$(dirname "$0")/.."

if [ $# -lt 2 ]; then
    echo "Usage: $0 <email> <new-password>"
    echo "Example: $0 admin@example.com MySecure123"
    exit 1
fi

EMAIL="$1"
NEWPASS="$2"

mvn compile exec:java -Dexec.mainClass="com.inventory.module.command.UpdatePasswordCommand" -Dexec.args="$EMAIL $NEWPASS" -q