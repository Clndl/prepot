#!/bin/bash
# Hook: DTO Synchronization Guard
# Usage: Run after modifying an entity to ensure DTOs match.

ENTITY_FILE=$1
ENTITY_NAME=$(basename "$ENTITY_FILE" .java)
DTO_DIR="src/main/java/com/<company>/<project_name>/dto"

echo "🔗 Checking DTO synchronization for: $ENTITY_NAME"

# 1. Extract fields from Entity (ignoring ID and audit fields if necessary)
ENTITY_FIELDS=$(grep "private" "$ENTITY_FILE" | grep -v "static" | awk '{print $3}' | sed 's/;//' | sort)

# 2. Identify associated DTOs
DTOS=$(find "$DTO_DIR" -name "${ENTITY_NAME}*DTO.java")

if [ -z "$DTOS" ]; then
    echo "❌ Error: No DTOs found for $ENTITY_NAME in $DTO_DIR"
    exit 1
fi

# 3. Cross-reference fields
for DTO in $DTOS; do
    DTO_NAME=$(basename "$DTO")
    echo "🧐 Checking $DTO_NAME..."
    
    for FIELD in $ENTITY_FIELDS; do
        # We search if the field name exists in the DTO record/class
        if ! grep -q "$FIELD" "$DTO"; then
            if [[ "$DTO_NAME" == *"CreateDTO"* ]] && [[ "$FIELD" == "id" ]]; then
                continue # Skip ID for CreateDTOs
            fi
            echo "⚠️ Warning: Field '$FIELD' found in Entity but missing in $DTO_NAME"
        fi
    done
done

echo "✅ DTO Sync check complete."