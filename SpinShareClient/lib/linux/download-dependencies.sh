#!/bin/bash

# Define the target directory for copying libraries
TARGET_DIR="."

# Get the shared library dependencies using ldd
LIBS=$(ldd /usr/lib/x86_64-linux-gnu/libwebkit2gtk-4.1.so.0 | grep "=>" | awk '{print $3}' | sort -u)

# Create the target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy the main library
cp /usr/lib/x86_64-linux-gnu/libwebkit2gtk-4.1.so.0 "$TARGET_DIR"

# Copy the library dependencies
for lib in $LIBS; do
    cp "$lib" "$TARGET_DIR"
done

echo "Libraries copied to $TARGET_DIR"
