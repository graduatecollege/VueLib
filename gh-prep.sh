#!/bin/bash

# This script creates an API.md from each package's
# d.ts files to make it easier for AI agents to consume.
# The idea is that a documentation MCP can be utilized to
# process the markdown files

for package_dir in packages/*; do
    if [ -d "$package_dir/dist" ]; then
        package_name=$(basename "$package_dir")
        api_file="$package_dir/API.md"

        echo "# $package_name" > "$api_file"
        echo "" >> "$api_file"
        echo "Full d.ts definition:" >> "$api_file"
        echo "" >> "$api_file"

        echo '```typescript' >> "$api_file"

        for dts_file in "$package_dir/dist"/*.d.ts; do
            if [ -f "$dts_file" ]; then
                # Escape backticks to prevent breaking the markdown code block
                sed 's/`/\\`/g' "$dts_file" >> "$api_file"
                echo "" >> "$api_file"
            fi
        done

        echo '```' >> "$api_file"
    fi
done
