#!/bin/bash

# Deploy Prediction Market Contract to Passet Testnet

source "$HOME/.cargo/env"

cd /Users/ghostxd/Desktop/papi/papi-workshop/contracts/target/ink

echo "🚀 Deploying Prediction Market contract to Passet testnet..."
echo ""

cargo contract instantiate prediction_market.contract \
  --suri "" \
  --constructor new \
  --url wss://testnet-passet-hub.polkadot.io \
  --skip-confirm \
  -x

echo ""
echo "✅ Deployment complete!"
echo "Copy the contract address above and update App.tsx"

