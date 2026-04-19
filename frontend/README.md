# Shahzaib Supply Chain Frontend

A React-based web interface for interacting with the Shahzaib Supply Chain smart contract on Polygon Mumbai Testnet.

## Features

- **Connect Wallet**: Connect to MetaMask and Polygon Mumbai Testnet
- **Register Products**: Manufacturers can create and track new products
- **Transfer Products**: Move products through the supply chain with full history
- **View All Products**: Browse all products in the system
- **Product History**: Complete audit trail for each product
- **Verify Authenticity**: Validate product authenticity through blockchain verification
- **Admin Panel**: Owner can register users with specific roles

## Installation

```bash
cd frontend
npm install
```

## Configuration

1. Create `.env` file with:
```
VITE_CONTRACT_ADDRESS=<your_deployed_contract_address>
```

2. Update the contract address in `src/config.js`

3. Update the contract ABI in `src/abi/shahzaib_supplychain.json` if needed

## Running the App

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Building for Production

```bash
npm run build
npm run preview
```

## Requirements

- MetaMask browser extension installed
- Polygon Mumbai Testnet configured in MetaMask
- MATIC tokens for gas fees (get from faucet)

## Network Details

- **Network**: Polygon Mumbai Testnet
- **Chain ID**: 80001
- **RPC**: https://rpc-mumbai.maticvigil.com
- **Faucet**: https://faucet.polygon.technology/
