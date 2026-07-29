#!/bin/bash
# Hook: Pre-Schema Change Validation
# Usage: Run whenever a file in com.<company>.<project_name>.model is modified.

ENTITY_FILE=$1
ENTITY_NAME=$(basename "$ENTITY_FILE" .java)

echo "🛡️ Analyzing potential schema changes for: $ENTITY_NAME"

# 1. Detect field changes (checks if git tracked changes in the file)
if git diff --quiet "$ENTITY_FILE"; then
    echo "✅ No changes detected in $ENTITY_NAME."
    exit 0
fi

# 2. Extract current fields and compare with the previous version
NEW_FIELDS=$(grep -E "private .*" "$ENTITY_FILE" | awk '{print $3}' | sed 's/;//')
OLD_FIELDS=$(git show HEAD:"$ENTITY_FILE" | grep -E "private .*" | awk '{print $3}' | sed 's/;//')

echo "📝 Field delta analysis..."
DIFF=$(diff <(echo "$OLD_FIELDS") <(echo "$NEW_FIELDS"))

if [ -n "$DIFF" ]; then
    echo "⚠️ DATABASE SCHEMA CHANGE DETECTED!"
    echo "$DIFF"
    echo "-------------------------------------------------------"
    echo "ACTION REQUIRED:"
    echo "1. Verify if 'spring.jpa.hibernate.ddl-auto' is set to 'update'."
    echo "2. Update the architecture Mermaid diagram in '.wiki/architecture-overview.md'."
    echo "3. If this is a breaking change, notify the user about data migration."
    echo "-------------------------------------------------------"
else
    echo "✅ Only non-structural changes detected (annotations/comments)."
fi