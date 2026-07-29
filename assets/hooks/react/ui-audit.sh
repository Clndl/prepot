#!/bin/bash
# Hook: UI Audit for accessibility and performance basics

FILE=$1

echo "🔍 Auditing UI component: $FILE"

# 1. Check for hardcoded text (i18n check)
if grep -q ">[A-Za-z ]\{2,\}<" "$FILE"; then
    echo "⚠️ Warning: Potential hardcoded text detected. Use useTranslation()."
fi

# 2. Check for Accessibility basics
if ! grep -q "aria-\|role=\|tabIndex" "$FILE"; then
    echo "⚠️ Warning: No accessibility attributes found. Verify a11y requirements."
fi

# 3. Check for Performance (memoization)
if grep -q ".map(" "$FILE" && ! grep -q "useMemo" "$FILE"; then
    echo "💡 Optimization: Consider useMemo if the mapped list is large or computed."
fi

# 4. Check for React 19 Patterns
if grep -q "React.FC" "$FILE"; then
    echo "💡 Note: Prefer direct function definitions over React.FC in React 19."
fi

echo "✅ UI Audit complete for $FILE"