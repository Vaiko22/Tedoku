#!/usr/bin/env bash

set -euo pipefail

# This script runs before npm install
# Copy the shared package to make it available

echo "Setting up monorepo dependencies..."

# Navigate to the workspace root
cd ../..

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Navigate back to mobile app
cd apps/mobile

echo "Monorepo setup complete!"
