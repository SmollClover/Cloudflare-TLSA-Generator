#/bin/bash

set -e

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 {build|tag|push}"
    exit 1
fi

version=$(jq -r '.version' package.json)
IFS='.' read -r major minor patch <<< "$version"

case $1 in
    build)
        echo "Building image..."
        docker build -t cloudflare-tlsa-generator .
        ;;
    tag)
        echo "Tagging image..."
        docker tag cloudflare-tlsa-generator smollclover/cloudflare-tlsa-generator:$major.$minor.$patch
        docker tag cloudflare-tlsa-generator smollclover/cloudflare-tlsa-generator:$major.$minor
        docker tag cloudflare-tlsa-generator smollclover/cloudflare-tlsa-generator:$major
        docker tag cloudflare-tlsa-generator smollclover/cloudflare-tlsa-generator:latest
        ;;
    push)
        echo "Pushing tagged images..."
        docker push smollclover/cloudflare-tlsa-generator:$major.$minor.$patch
        docker push smollclover/cloudflare-tlsa-generator:$major.$minor
        docker push smollclover/cloudflare-tlsa-generator:$major
        docker push smollclover/cloudflare-tlsa-generator:latest
        ;;
    *)
        echo "Invalid argument. Usage: $0 {build|tag|push}"
        exit 1
        ;;
esac


