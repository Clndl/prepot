#!/bin/bash
# Hook: Sync API Interfaces Guard
# Ensures that every Service has a corresponding Interface and follows naming conventions.

SERVICE_FILE=$1
SERVICE_NAME=$(basename "$SERVICE_FILE" Service.ts)
INTERFACE_FILE="src/interfaces/Domain.interface.ts"

echo "🔍 Checking API Service integrity: $SERVICE_NAME"

# 1. Check if Interface exists
if ! grep -q "interface $SERVICE_NAME" "$INTERFACE_FILE"; then
    echo "❌ Error: Interface for $SERVICE_NAME not found in $INTERFACE_FILE"
    echo "Please create the TypeScript interface before the Service."
    exit 1
fi

# 2. Check for adapter usage
if ! grep -q "serverApi" "$SERVICE_FILE"; then
    echo "⚠️ Warning: $SERVICE_FILE does not seem to use 'serverApi' adapter."
fi

# 3. Translation Check
if find src/pages -name "*.tsx" -exec grep -q "\".*\"" {} +; then
    echo "⚠️ Warning: Potential hardcoded strings detected in components."
fi

echo "✅ Frontend Service check complete."