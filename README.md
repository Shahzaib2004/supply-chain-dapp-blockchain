# Shahzaib Supply Chain DApp

Decentralized supply chain management on Ethereum Sepolia. Track products from **Manufacturer → Distributor → Retailer → Customer** with immutable blockchain records.

---

## 🎯 Key Features

- **4 Roles**: Manufacturer, Distributor, Retailer, Customer
- **Product Tracking**: Register, transfer, and verify authenticity
- **Audit Trail**: Complete history on blockchain
- **MetaMask Integration**: Connect directly with Web3
- **Responsive UI**: Works on mobile & desktop
- **13 Unit Tests**: Fully tested

## 🚀 Quick Start

### 1. Setup Backend
```bash
npm install
npx hardhat compile
npx hardhat test              # Run tests (should see 13 passing)
```

### 2. Deploy to Sepolia
```bash
# Configure .env file first with your private key
npx hardhat run scripts/deploy.js --network sepolia
# Should output contract address
```

### 3. Setup Frontend
```bash
cd frontend
npm install
# Update frontend/.env with contract address
npm run dev
```

Visit **http://localhost:5174** and connect MetaMask to Sepolia

---

## 📁 Project Structure

```
├── contracts/shahzaib_supplychain.sol    # Smart contract
├── scripts/deploy.js                     # Deploy script
├── test/supplychain.test.js              # 13 unit tests
├── frontend/                             # React Vite app
│   ├── src/pages/
│   │   ├── Home.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── RegisterProduct.jsx
│   │   ├── TransferProduct.jsx
│   │   ├── ViewProducts.jsx
│   │   └── ProductHistory.jsx
│   └── src/context/Web3Context.jsx       # Web3 provider
├── hardhat.config.js
└── .env
```

---

## 🔧 Smart Contract

**18 Functions**
- `registerUser()` - Add supply chain participant (admin only)
- `registerProduct()` - Create new product (manufacturer only)
- `transferProduct()` - Move to next participant (role-based)
- `verifyProductAuthenticity()` - Check product chain validity
- `getProductHistory()` - View complete audit trail

**Data Structures**
- Product: id, name, description, owner, status, location
- User: address, role, organization, active status
- History: actor, role, status, location, timestamp, notes

---

## 📋 Usage

### Admin
1. Go to Admin Panel
2. Register users with roles before they can participate

### Manufacturer
1. Register Product - Creates product with "Manufactured" status
2. Transfer to Distributor - Changes owner & status to "In Transit"

### Distributor & Retailer
1. Receive product from previous party
2. Transfer to next party in supply chain

### Customer
1. Receives final product with "Received" status

### Everyone
- **View Products** - See all products in system
- **Check History** - View complete audit trail
- **Verify Authenticity** - Blockchain validates product chain

---

## 🌐 Networks

**Sepolia Testnet** (current)
- Chain ID: 11155111
- RPC: https://ethereum-sepolia.publicnode.com
- Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

**Get Testnet ETH**: https://www.alchemy.com/faucets/ethereum-sepolia

---

## ✅ Testing

```bash
# Run all tests
npx hardhat test

# Result: 13 passing ✓
# Tests: Contract initialization, user management, product lifecycle,
#        history tracking, authenticity verification, status updates
```

---

## 📦 Deployment Info

After deployment, contract address is saved to `deployment.json`:
```json
{
  "contractAddress": "0x...",
  "deploymentTx": "0x...",
  "network": "sepolia",
  "chainId": 11155111
}
```

---

## 🔐 Important Notes

- Only contract owner can register users
- Strict role progression enforced (Manufacturer → Distributor → Retailer → Customer)
- Products cannot be transferred to same person twice
- All transfers immutably recorded on blockchain
- Authenticity verified by chain progression

---

## 📚 For Complete Details

See `DEPLOYMENT_GUIDE.md` for step-by-step setup  
See `ASSIGNMENT_REPORT.md` for documentation & screenshots

## 🐛 Troubleshooting

### Contract Issues
| Error | Solution |
|-------|----------|
| "User not registered" | Contact admin to register wallet |
| "Cannot transfer to self" | Use different address |
| "Invalid role progression" | Follow Manufacturer→Distributor→Retailer→Customer |
| "Product not found" | Verify product ID |

### Deployment Issues
| Error | Solution |
|-------|----------|
| "Insufficient balance" | Get MATIC from faucet |
| "Already registered" | Use different address |
| "Network error" | Check RPC URL and connection |

### Frontend Issues
| Error | Solution |
|-------|----------|
| "Contract not found" | Verify address and ABI |
| "MetaMask not connected" | Click Connect button |
| "Wrong network" | Switch to Mumbai Testnet |

## 📚 Resources

- [Solidity Docs](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/)
- [Ethers.js Guide](https://docs.ethers.org/)
- [Polygon Docs](https://polygon.technology/developers)
- [Mumbai Testnet](https://mumbai.polygonscan.com/)
- [React Documentation](https://react.dev/)

## 📈 Performance Characteristics

- **Transaction Time**: ~15-30 seconds (including confirmations)
- **Smart Contract Size**: ~8 KB bytecode
- **Max Products**: Unlimited (theoretically)
- **Max Users**: Unlimited (theoretically)
- **History Records**: Unlimited per product

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Solidity smart contract development
- ✅ Hardhat deployment framework
- ✅ Web3 integration with MetaMask
- ✅ React frontend development
- ✅ Blockchain architecture
- ✅ Supply chain use cases
- ✅ DApp best practices

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

**Shahzaib**
- Assignment: Supply Chain Management DApp
- Semester: 8th
- Year: 2026
- Network: Polygon Mumbai Testnet
- Framework: Hardhat + React

## 🤝 Contributing

This is an academic project. Enhancement suggestions welcome!

## 📞 Support

For issues, check:
1. Error messages in console
2. DEPLOYMENT_GUIDE.md for detailed steps
3. Contract verification on Polygonscan
4. MetaMask network settings

---

**Status**: ✅ Ready for Deployment

**Last Updated**: April 2026

**Version**: 1.0.0
