#!/bin/bash

function_name=$1
input=$2

case "$function_name" in
    "greet")
        name=$(echo "$input" | jq -r '.name')
        echo "{\"message\": \"Hello, $name!\"}"
        ;;
    *)
        echo "{\"error\": \"Unknown function\"}"
        ;;
esac
