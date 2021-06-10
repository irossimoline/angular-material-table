#!/bin/bash

NODE_VERSION=12

# Node JS (using nvm - Node Version Manager)
NVM_DIR="$HOME/.config/nvm"
if [[ ! -d "${NVM_DIR}" && -d "$HOME/.nvm" ]]; then
  NVM_DIR="$HOME/.nvm"  ## Try alternative path
fi
if [[ -d "${NVM_DIR}" ]]; then

  # Load NVM
  . ${NVM_DIR}/nvm.sh

  # Switch to expected version
  nvm use ${NODE_VERSION}

  # Or install it
  if [[ $? -ne 0 ]]; then
      nvm install ${NODE_VERSION}
      [[ $? -ne 0 ]] && exit 1
  fi
else
  echo "nvm (Node version manager) not found (directory ${NVM_DIR} not found)."
  echo "Please install nvm (see https://github.com/nvm-sh/nvm), then retry"
  exit 1
fi

npm install
[[ $? -ne 0 ]] && exit 1

rm -rf dist
npm run build
[[ $? -ne 0 ]] && exit 1

cp -Rf package*.json README.md dist/

cd dist
npm link
