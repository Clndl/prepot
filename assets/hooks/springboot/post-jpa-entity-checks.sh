#!/bin/bash
# Hook: Post-Entity Creation / Modification Tasks
# Usage: Run or simulate after adding a new JPA Entity to ensure architectural integrity.

ENTITY_NAME=$1

echo "🔍 Running post-creation checks for: $ENTITY_NAME"

# 1. Boilerplate Verification
# Ensure Lombok is used and no manual getters/setters exist.
grep -q "@Getter" src/main/java/com/<company>/<project_name>/model/$ENTITY_NAME.java || echo "⚠️ Warning: @Getter missing"

# 2. MapStruct Compilation Trigger
# Force Maven to generate Mapper implementations in target/generated-sources
echo "⚙️ Triggering MapStruct generation..."
mvn clean compile -DskipTests

# 3. Inheritance Check
# Verify the entity extends BaseEntity<UUID>
grep -q "extends BaseEntity<UUID>" src/main/java/com/<company>/<project_name>/model/$ENTITY_NAME.java || echo "❌ Error: $ENTITY_NAME must extend BaseEntity<UUID>"

# 4. Documentation Check
# Ensure Swagger annotations are present in the new Controller
if [ -f "src/main/java/com/<company>/<project_name>/controller/${ENTITY_NAME}Controller.java" ]; then
    grep -q "@Operation" src/main/java/com/<company>/<project_name>/controller/${ENTITY_NAME}Controller.java || echo "⚠️ Warning: Swagger @Operation missing in Controller"
fi

echo "✅ Integrity check complete."