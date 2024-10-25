INFERABLE_API_SECRET="sk_cluster_machine_151qeOFp251eH9v0MxRTYDnxOt2wexZQLmIXU8Vb8"

source ./inferable.sh

# Initialize the SDK
inferable_init || exit 1

# Create a handler file (handler.sh)
cat > handler.sh << 'EOF'
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
EOF

# Define your functions
FUNCTIONS='[
    {
        "name": "greet",
        "description": "Greet a user",
        "schema": "{\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"}},\"required\":[\"name\"]}"
    }
]'

# Register the service
CLUSTER_ID=$(register_service "greetingService" "$FUNCTIONS")

# Start polling with your handler
start_service "$CLUSTER_ID" "greetingService" "./handler.sh"
