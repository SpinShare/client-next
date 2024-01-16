#!/bin/bash

# Set the folder where you want to download and store the .so files
TARGET_FOLDER="libwebkit_download"

# Create the target folder if it doesn't exist
mkdir -p "$TARGET_FOLDER"
cd "$TARGET_FOLDER" || exit

# Function to download a package and its dependencies
download_package() {
    package_name="$1"
    dependencies=$(apt-cache depends --recurse --no-suggests --no-conflicts --no-breaks --no-replaces --no-enhances --no-pre-depends "$package_name" | grep "Depends:" | sed 's/Depends://')

    # Download the package and its dependencies
    sudo apt-get download --allow-unauthenticated --yes $package_name $dependencies | grep -o "http://.*deb" | wget -i - -P .
}

# Download libwebkit2gtk-4.1-0 and its dependencies
download_package libwebkit2gtk-4.1-0

# Extract shared objects (.so files) from the .deb files
for deb in *.deb; do
    dpkg-deb -x "$deb" .
    dpkg-deb --control "$deb" .
    cat DEBIAN/shlibs >> ./usr/share/doc/"$deb.shlibs"
done

# Extract a list of shared objects and store it in libs.txt
grep -o '/[^[:space:]]*\.so[^[:space:]]*' ./usr/share/doc/*.shlibs | sort -u > libs.txt

# Create a folder for shared objects
mkdir -p shared_objects

# Copy shared objects to the shared_objects folder
xargs -I{} cp -v --parents {} < libs.txt shared_objects/

echo "Shared objects are downloaded and stored in the $TARGET_FOLDER/shared_objects directory."
