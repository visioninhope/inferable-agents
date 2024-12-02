#!/bin/bash

set -e

PIDS=()

# Start 10 instances of the machine
for i in $(seq 1 10); do
  tsx machine.ts &
  PIDS+=($!)
done

# Every 10 seconds, check if all 50 instances are still running
while true; do
  for pid in "${PIDS[@]}"; do
    kill -0 $pid || exit 1
  done
  echo "All instances are still running"
  sleep 30
done
