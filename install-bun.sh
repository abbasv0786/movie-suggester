#!/bin/bash

echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH for the build process
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

echo "Bun version:"
bun --version
