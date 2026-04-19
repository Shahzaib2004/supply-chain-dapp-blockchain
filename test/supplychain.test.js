const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Shahzaib Supply Chain Contract", function () {
  let supplyChain;
  let owner;
  let manufacturer;
  let distributor;
  let retailer;
  let customer;

  beforeEach(async function () {
    // Get signers
    [owner, manufacturer, distributor, retailer, customer] = await ethers.getSigners();

    // Deploy contract
    const SupplyChain = await ethers.getContractFactory("shahzaib_supplychain");
    supplyChain = await SupplyChain.deploy();
  });

  describe("Contract Initialization", function () {
    it("Should set the correct owner", async function () {
      const contractInfo = await supplyChain.getContractInfo();
      expect(contractInfo.contractOwner).to.equal(owner.address);
    });

    it("Should have correct company name", async function () {
      const contractInfo = await supplyChain.getContractInfo();
      expect(contractInfo.name).to.equal("Shahzaib Supply Chain");
    });
  });

  describe("User Management", function () {
    it("Should register a new user", async function () {
      await supplyChain.registerUser(
        manufacturer.address,
        0, // Manufacturer role
        "Tech Manufacturer Ltd"
      );

      const user = await supplyChain.getUser(manufacturer.address);
      expect(user.organizationName).to.equal("Tech Manufacturer Ltd");
      expect(user.role).to.equal(0);
      expect(user.isActive).to.be.true;
    });

    it("Should not allow duplicate registration", async function () {
      await supplyChain.registerUser(
        manufacturer.address,
        0,
        "Tech Manufacturer Ltd"
      );

      await expect(
        supplyChain.registerUser(
          manufacturer.address,
          0,
          "Tech Manufacturer Ltd"
        )
      ).to.be.revertedWith("User already registered");
    });

    it("Should allow only owner to register users", async function () {
      await expect(
        supplyChain.connect(manufacturer).registerUser(
          distributor.address,
          1,
          "Distributor Inc"
        )
      ).to.be.revertedWith("Only contract owner can perform this action");
    });
  });

  describe("Product Management", function () {
    beforeEach(async function () {
      // Register users
      await supplyChain.registerUser(
        manufacturer.address,
        0,
        "Tech Manufacturer Ltd"
      );
      await supplyChain.registerUser(
        distributor.address,
        1,
        "Logistics Distributor"
      );
      await supplyChain.registerUser(retailer.address, 2, "Tech Retail Store");
      await supplyChain.registerUser(customer.address, 3, "End Consumer");
    });

    it("Should register a product", async function () {
      await supplyChain.connect(manufacturer).registerProduct(
        "Laptop",
        "High-performance laptop",
        "Manufacturing Plant A"
      );

      const product = await supplyChain.getProduct(0);
      expect(product.name).to.equal("Laptop");
      expect(product.description).to.equal("High-performance laptop");
      expect(product.currentOwner).to.equal(manufacturer.address);
      expect(product.status).to.equal(0); // Manufactured
    });

    it("Should not allow non-manufacturers to register products", async function () {
      await expect(
        supplyChain.connect(distributor).registerProduct(
          "Laptop",
          "High-performance laptop",
          "Manufacturing Plant A"
        )
      ).to.be.revertedWith("User does not have the required role");
    });

    it("Should transfer product between supply chain parties", async function () {
      // Register product
      await supplyChain.connect(manufacturer).registerProduct(
        "Laptop",
        "High-performance laptop",
        "Manufacturing Plant A"
      );

      // Transfer from manufacturer to distributor
      await supplyChain.connect(manufacturer).transferProduct(
        0,
        distributor.address,
        1, // InTransit
        "In Transit to Warehouse",
        "Shipped via Express"
      );

      const product = await supplyChain.getProduct(0);
      expect(product.currentOwner).to.equal(distributor.address);
      expect(product.status).to.equal(1);
      expect(product.location).to.equal("In Transit to Warehouse");
    });

    it("Should maintain product history", async function () {
      // Register product
      await supplyChain.connect(manufacturer).registerProduct(
        "Laptop",
        "High-performance laptop",
        "Manufacturing Plant A"
      );

      // Transfer to distributor
      await supplyChain.connect(manufacturer).transferProduct(
        0,
        distributor.address,
        1,
        "Warehouse",
        "Received at warehouse"
      );

      // Transfer to retailer
      await supplyChain.connect(distributor).transferProduct(
        0,
        retailer.address,
        2, // Delivered
        "Retail Store",
        "Delivered to retail store"
      );

      const history = await supplyChain.getProductHistory(0);
      expect(history.length).to.equal(3); // Initial + 2 transfers
      expect(history[0].actorRole).to.equal(0); // Manufacturer (from registerProduct)
      expect(history[1].actorRole).to.equal(1); // Distributor (recipient of manufacturer's transfer)
      expect(history[2].actorRole).to.equal(2); // Retailer (recipient of distributor's transfer)
    });

    it("Should verify product authenticity", async function () {
      // Register product
      await supplyChain.connect(manufacturer).registerProduct(
        "Laptop",
        "High-performance laptop",
        "Manufacturing Plant A"
      );

      // Transfer through supply chain
      await supplyChain.connect(manufacturer).transferProduct(
        0,
        distributor.address,
        1,
        "Warehouse",
        "Received"
      );

      await supplyChain.connect(distributor).transferProduct(
        0,
        retailer.address,
        2,
        "Retail Store",
        "Delivered"
      );

      const isAuthentic = await supplyChain.verifyProductAuthenticity(0);
      expect(isAuthentic).to.be.true;
    });
  });

  describe("Product Status Updates", function () {
    beforeEach(async function () {
      await supplyChain.registerUser(
        manufacturer.address,
        0,
        "Tech Manufacturer Ltd"
      );
      await supplyChain.registerUser(
        distributor.address,
        1,
        "Logistics Distributor"
      );

      await supplyChain.connect(manufacturer).registerProduct(
        "Laptop",
        "High-performance laptop",
        "Manufacturing Plant A"
      );

      await supplyChain.connect(manufacturer).transferProduct(
        0,
        distributor.address,
        1,
        "Warehouse",
        "Received"
      );
    });

    it("Should update product status without changing owner", async function () {
      await supplyChain.connect(distributor).updateProductStatus(
        0,
        1,
        "Distribution Center",
        "Quality check completed"
      );

      const product = await supplyChain.getProduct(0);
      expect(product.currentOwner).to.equal(distributor.address);
      expect(product.location).to.equal("Distribution Center");
    });
  });

  describe("Query Functions", function () {
    it("Should return correct product count", async function () {
      await supplyChain.registerUser(
        manufacturer.address,
        0,
        "Tech Manufacturer Ltd"
      );

      await supplyChain.connect(manufacturer).registerProduct(
        "Laptop",
        "High-performance laptop",
        "Plant A"
      );

      await supplyChain.connect(manufacturer).registerProduct(
        "Phone",
        "Smartphone",
        "Plant B"
      );

      const count = await supplyChain.getProductCount();
      expect(count).to.equal(2);
    });

    it("Should return product history count", async function () {
      await supplyChain.registerUser(
        manufacturer.address,
        0,
        "Tech Manufacturer Ltd"
      );
      await supplyChain.registerUser(
        distributor.address,
        1,
        "Distributor Inc"
      );

      await supplyChain.connect(manufacturer).registerProduct(
        "Laptop",
        "High-performance laptop",
        "Plant A"
      );

      await supplyChain.connect(manufacturer).transferProduct(
        0,
        distributor.address,
        1,
        "Warehouse",
        "Received"
      );

      const count = await supplyChain.getProductHistoryCount(0);
      expect(count).to.equal(2);
    });
  });
});
