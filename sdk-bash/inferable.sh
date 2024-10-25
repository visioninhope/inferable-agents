#!/bin/bash

# Inferable Bash SDK
# Version: 0.1.0

# Check for INFERABLE_API_SECRET immediately
if [ -z "$INFERABLE_API_SECRET" ]; then
    echo "Error: INFERABLE_API_SECRET environment variable is required" >&2
    exit 1
fi

# Default configuration
INFERABLE_API_ENDPOINT="${INFERABLE_API_ENDPOINT:-https://api.inferable.ai}"
INFERABLE_SDK_VERSION="0.1.0"
INFERABLE_SDK_LANGUAGE="bash"
PING_INTERVAL=60  # Ping every 60 seconds
MAX_CONSECUTIVE_FAILURES=50

# Generate a unique machine ID if not provided
generate_machine_id() {
    local length=$1
    local charset="abcdefghijklmnopqrstuvwxyz"
    local machine_id="bash-"
    
    # Get system info for seed
    local hostname=$(hostname)
    local os_info=$(uname -a)
    local seed=$(($(echo "$hostname$os_info" | cksum | cut -d' ' -f1) % 1000000))
    
    # Generate random string
    for ((i=0; i<length; i++)); do
        local rand=$((RANDOM % ${#charset}))
        machine_id+="${charset:$rand:1}"
    done
    
    echo "$machine_id"
}

# HTTP request helper function
make_request() {
    local method=$1
    local path=$2
    local body=$3
    local headers=()
    
    # Add authorization header if API secret is set
    if [ -n "$INFERABLE_API_SECRET" ]; then
        headers+=(-H "Authorization: Bearer $INFERABLE_API_SECRET")
    fi
    
    # Add standard SDK headers
    headers+=(-H "X-Machine-SDK-Version: $INFERABLE_SDK_VERSION")
    headers+=(-H "X-Machine-SDK-Language: $INFERABLE_SDK_LANGUAGE")
    headers+=(-H "X-Machine-ID: $INFERABLE_MACHINE_ID")
    
    # Add content-type for requests with body
    if [ -n "$body" ]; then
        headers+=(-H "Content-Type: application/json")
    fi
    
    # Make the request
    if [ -n "$body" ]; then
        curl -s -X "$method" \
            "${headers[@]}" \
            -d "$body" \
            "$INFERABLE_API_ENDPOINT$path"
    else
        curl -s -X "$method" \
            "${headers[@]}" \
            "$INFERABLE_API_ENDPOINT$path"
    fi
}

# Ping function to maintain machine registration
ping_server() {
    local cluster_id=$1
    
    # Make ping request
    local response=$(make_request "GET" "/clusters/$cluster_id/machines")
    if [ $? -ne 0 ]; then
        echo "Warning: Failed to ping server" >&2
        return 1
    fi
    
    return 0
}

# Start ping loop in background
start_ping_loop() {
    local cluster_id=$1
    local failure_count=0
    
    while true; do
        if ! ping_server "$cluster_id"; then
            ((failure_count++))
            if [ $failure_count -gt $MAX_CONSECUTIVE_FAILURES ]; then
                echo "Error: Too many consecutive ping failures" >&2
                exit 1
            fi
        else
            failure_count=0
        fi
        
        sleep $PING_INTERVAL
    done
}

# Initialize the SDK
inferable_init() {
    # Validate required environment variables
    if [ -z "$INFERABLE_API_SECRET" ]; then
        echo "Error: INFERABLE_API_SECRET environment variable is required" >&2
        exit 1
    fi
    
    # Generate machine ID if not set
    INFERABLE_MACHINE_ID=${INFERABLE_MACHINE_ID:-$(generate_machine_id 8)}
    
    # Test connection
    local response=$(make_request "GET" "/live")
    if ! echo "$response" | jq -e '.status == "ok"' > /dev/null; then
        echo "Error: Failed to connect to Inferable API" >&2
        return 1
    fi
    
    return 0
}

# Register a service
register_service() {
    local service_name=$1
    local functions_json=$2
    
    # Ensure functions_json is a valid JSON string
    if ! echo "$functions_json" | jq empty 2>/dev/null; then
        echo "Error: Invalid JSON for functions" >&2
        return 1
    fi
    
    local payload="{
        \"service\": \"$service_name\",
        \"functions\": $functions_json
    }"
    
    local response=$(make_request "POST" "/machines" "$payload")

    local cluster_id=$(echo "$response" | jq -r '.clusterId')

    if [ -z "$cluster_id" ] || [ "$cluster_id" = "null" ]; then
        echo "$response" >&2
        echo "Error: Failed to register service" >&2
        return 1
    fi
    
    echo "$cluster_id"
    return 0
}

# Poll for jobs
poll_jobs() {
    local cluster_id=$1
    local service_name=$2
    
    local response=$(make_request "GET" "/clusters/$cluster_id/calls?acknowledge=true&service=$service_name&status=pending&limit=10")
    echo "$response"
}

# Submit job result
submit_result() {
    local cluster_id=$1
    local call_id=$2
    local result=$3
    local result_type=${4:-"resolution"}
    local execution_time=$5
    
    local meta="{}"
    if [ -n "$execution_time" ]; then
        meta="{\"functionExecutionTime\": $execution_time}"
    fi
    
    local payload="{
        \"result\": $result,
        \"resultType\": \"$result_type\",
        \"meta\": $meta
    }"
    
    make_request "POST" "/clusters/$cluster_id/calls/$call_id/result" "$payload"
}

# Start service polling loop
start_service() {
    local cluster_id=$1
    local service_name=$2
    local handler_script=$3
    local poll_interval=${4:-10}
    
    echo "Starting service '$service_name' polling..."
    
    # Start ping loop in background
    start_ping_loop "$cluster_id" &
    local ping_pid=$!
    
    # Trap to kill ping loop on exit
    trap "kill $ping_pid 2>/dev/null" EXIT
    
    # Main polling loop
    while true; do
        local jobs=$(poll_jobs "$cluster_id" "$service_name")
        
        # Check if jobs is valid JSON
        if ! echo "$jobs" | jq empty 2>/dev/null; then
            echo "Error: Invalid response from poll_jobs" >&2
            sleep "$poll_interval"
            continue
        fi
        
        echo "$jobs" | jq -c '.[]' | while read -r job; do
            # Validate job structure
            if ! echo "$job" | jq -e '.id and .function and .input' > /dev/null 2>&1; then
                echo "Error: Invalid job structure" >&2
                continue
            fi
            
            local call_id=$(echo "$job" | jq -r '.id')
            local function_name=$(echo "$job" | jq -r '.function')
            local input=$(echo "$job" | jq -r '.input')
            
            # Execute handler script with job details
            local start_time=$(date +%s)
            local result=$($handler_script "$function_name" "$input")
            local end_time=$(date +%s)
            local execution_time=$((end_time - start_time))
            
            # Submit result
            submit_result "$cluster_id" "$call_id" "$result" "resolution" "$execution_time"
        done
        
        sleep "$poll_interval"
    done
}

# Example usage:
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    echo "This script should be sourced, not executed directly."
    echo "Usage: source inferable.sh"
    exit 1
fi
