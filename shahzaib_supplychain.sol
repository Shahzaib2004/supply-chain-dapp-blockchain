// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Shahzaib Supply Chain Management DApp
 * @dev Decentralized supply chain tracking system deployed on Polygon (Mumbai Testnet)
 * @author Shahzaib
 * 
 * This contract implements a transparent, traceable, and tamper-proof supply chain system
 * where products move through stages: Manufacturer → Distributor → Retailer → Consumer
 */

contract shahzaib_supplychain {
    
    // ==================== Data Types ====================
    
    enum Role { Manufacturer, Distributor, Retailer, Customer }
    enum ProductStatus { Manufactured, InTransit, Delivered, Received }
    
    struct Product {
        uint256 id;
        string name;
        string description;
        address currentOwner;
        ProductStatus status;
        uint256 createdAt;
        uint256 lastUpdatedAt;
        string location;
    }
    
    struct HistoryRecord {
        address actor;
        Role actorRole;
        ProductStatus status;
        string location;
        uint256 timestamp;
        string notes;
    }
    
    struct User {
        address userAddress;
        Role role;
        string organizationName;
        bool isActive;
        uint256 registeredAt;
    }
    
    // ==================== State Variables ====================
    
    address public owner;
    string public companyName = "Shahzaib Supply Chain";
    
    mapping(address => User) public users;
    mapping(uint256 => Product) public products;
    mapping(uint256 => HistoryRecord[]) public productHistory;
    
    uint256 public productCounter = 0;
    uint256 public userCounter = 0;
    
    // ==================== Events ====================
    
    event UserRegistered(address indexed userAddress, Role role, string organizationName);
    event ProductRegistered(uint256 indexed productId, address indexed manufacturer, string productName);
    event ProductTransferred(uint256 indexed productId, address indexed from, address indexed to, ProductStatus newStatus);
    event ProductStatusChanged(uint256 indexed productId, ProductStatus newStatus, string location);
    event UserDeactivated(address indexed userAddress);
    
    // ==================== Modifiers ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isActive, "User must be registered and active");
        _;
    }
    
    modifier onlyRole(Role _role) {
        require(users[msg.sender].role == _role, "User does not have the required role");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(_productId < productCounter, "Product does not exist");
        require(products[_productId].id == _productId, "Invalid product");
        _;
    }
    
    // ==================== Constructor ====================
    
    constructor() {
        owner = msg.sender;
        users[msg.sender] = User({
            userAddress: msg.sender,
            role: Role.Manufacturer,
            organizationName: "Admin",
            isActive: true,
            registeredAt: block.timestamp
        });
    }
    
    // ==================== User Management Functions ====================
    
    /**
     * @dev Register a new user with a specific role
     * @param _userAddress Address of the user to register
     * @param _role Role to assign (0=Manufacturer, 1=Distributor, 2=Retailer, 3=Customer)
     * @param _organizationName Name of the organization/company
     */
    function registerUser(
        address _userAddress,
        Role _role,
        string memory _organizationName
    ) external onlyOwner {
        require(_userAddress != address(0), "Invalid address");
        require(!users[_userAddress].isActive, "User already registered");
        require(bytes(_organizationName).length > 0, "Organization name is required");
        
        users[_userAddress] = User({
            userAddress: _userAddress,
            role: _role,
            organizationName: _organizationName,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        userCounter++;
        emit UserRegistered(_userAddress, _role, _organizationName);
    }
    
    /**
     * @dev Deactivate a user account
     * @param _userAddress Address of the user to deactivate
     */
    function deactivateUser(address _userAddress) external onlyOwner {
        require(users[_userAddress].isActive, "User is not active");
        users[_userAddress].isActive = false;
        emit UserDeactivated(_userAddress);
    }
    
    /**
     * @dev Get user information
     * @param _userAddress Address of the user
     * @return User struct containing user details
     */
    function getUser(address _userAddress) external view returns (User memory) {
        require(users[_userAddress].isActive, "User not found or inactive");
        return users[_userAddress];
    }
    
    // ==================== Product Management Functions ====================
    
    /**
     * @dev Register a new product (Manufacturer only)
     * @param _name Product name
     * @param _description Product description
     * @param _location Initial location
     */
    function registerProduct(
        string memory _name,
        string memory _description,
        string memory _location
    ) external onlyRegistered onlyRole(Role.Manufacturer) {
        require(bytes(_name).length > 0, "Product name is required");
        require(bytes(_description).length > 0, "Product description is required");
        require(bytes(_location).length > 0, "Location is required");
        
        uint256 productId = productCounter;
        
        products[productId] = Product({
            id: productId,
            name: _name,
            description: _description,
            currentOwner: msg.sender,
            status: ProductStatus.Manufactured,
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp,
            location: _location
        });
        
        // Record initial history
        productHistory[productId].push(HistoryRecord({
            actor: msg.sender,
            actorRole: Role.Manufacturer,
            status: ProductStatus.Manufactured,
            location: _location,
            timestamp: block.timestamp,
            notes: "Product manufactured"
        }));
        
        productCounter++;
        emit ProductRegistered(productId, msg.sender, _name);
    }
    
    /**
     * @dev Transfer product to next party in supply chain
     * @param _productId ID of the product to transfer
     * @param _newOwner Address of the new owner
     * @param _newStatus New status of the product
     * @param _location Location of the product
     * @param _notes Additional notes about the transfer
     */
    function transferProduct(
        uint256 _productId,
        address _newOwner,
        ProductStatus _newStatus,
        string memory _location,
        string memory _notes
    ) external onlyRegistered productExists(_productId) {
        require(_newOwner != address(0), "Invalid recipient address");
        require(users[_newOwner].isActive, "Recipient must be registered and active");
        require(_newOwner != msg.sender, "Cannot transfer to self");
        
        Product storage product = products[_productId];
        require(product.currentOwner == msg.sender, "Only current owner can transfer");
        
        // Validate role progression
        Role senderRole = users[msg.sender].role;
        Role recipientRole = users[_newOwner].role;
        validateRoleProgression(senderRole, recipientRole);
        
        // Update product
        product.currentOwner = _newOwner;
        product.status = _newStatus;
        product.location = _location;
        product.lastUpdatedAt = block.timestamp;
        
        // Record history
        productHistory[_productId].push(HistoryRecord({
            actor: msg.sender,
            actorRole: senderRole,
            status: _newStatus,
            location: _location,
            timestamp: block.timestamp,
            notes: _notes
        }));
        
        emit ProductTransferred(_productId, msg.sender, _newOwner, _newStatus);
    }
    
    /**
     * @dev Update product status and location without changing owner
     * @param _productId ID of the product
     * @param _newStatus New status
     * @param _location Current location
     * @param _notes Notes about the update
     */
    function updateProductStatus(
        uint256 _productId,
        ProductStatus _newStatus,
        string memory _location,
        string memory _notes
    ) external onlyRegistered productExists(_productId) {
        Product storage product = products[_productId];
        require(product.currentOwner == msg.sender, "Only current owner can update");
        
        product.status = _newStatus;
        product.location = _location;
        product.lastUpdatedAt = block.timestamp;
        
        productHistory[_productId].push(HistoryRecord({
            actor: msg.sender,
            actorRole: users[msg.sender].role,
            status: _newStatus,
            location: _location,
            timestamp: block.timestamp,
            notes: _notes
        }));
        
        emit ProductStatusChanged(_productId, _newStatus, _location);
    }
    
    /**
     * @dev Validate role progression in supply chain
     * @param _senderRole Role of sender
     * @param _recipientRole Role of recipient
     */
    function validateRoleProgression(Role _senderRole, Role _recipientRole) internal pure {
        // Valid progressions: Manufacturer -> Distributor -> Retailer -> Customer
        if (_senderRole == Role.Manufacturer) {
            require(_recipientRole == Role.Distributor, "Manufacturer can only send to Distributor");
        } else if (_senderRole == Role.Distributor) {
            require(_recipientRole == Role.Retailer, "Distributor can only send to Retailer");
        } else if (_senderRole == Role.Retailer) {
            require(_recipientRole == Role.Customer, "Retailer can only send to Customer");
        } else {
            revert("Invalid sender role for transfer");
        }
    }
    
    // ==================== Product Query Functions ====================
    
    /**
     * @dev Get product details
     * @param _productId ID of the product
     * @return Product struct
     */
    function getProduct(uint256 _productId) external view productExists(_productId) returns (Product memory) {
        return products[_productId];
    }
    
    /**
     * @dev Get complete product history (audit trail)
     * @param _productId ID of the product
     * @return Array of history records
     */
    function getProductHistory(uint256 _productId) 
        external 
        view 
        productExists(_productId) 
        returns (HistoryRecord[] memory) 
    {
        return productHistory[_productId];
    }
    
    /**
     * @dev Get product history count
     * @param _productId ID of the product
     * @return Number of history records
     */
    function getProductHistoryCount(uint256 _productId) 
        external 
        view 
        productExists(_productId) 
        returns (uint256) 
    {
        return productHistory[_productId].length;
    }
    
    /**
     * @dev Get detailed history record at specific index
     * @param _productId ID of the product
     * @param _index Index of the history record
     * @return History record at the specified index
     */
    function getHistoryRecord(uint256 _productId, uint256 _index) 
        external 
        view 
        productExists(_productId) 
        returns (HistoryRecord memory) 
    {
        require(_index < productHistory[_productId].length, "Invalid history index");
        return productHistory[_productId][_index];
    }
    
    /**
     * @dev Get total number of products
     * @return Total product count
     */
    function getProductCount() external view returns (uint256) {
        return productCounter;
    }
    
    /**
     * @dev Get total number of registered users
     * @return Total user count
     */
    function getUserCount() external view returns (uint256) {
        return userCounter;
    }
    
    /**
     * @dev Verify product authenticity by checking complete history
     * @param _productId ID of the product
     * @return isAuthentic Boolean indicating if product chain is valid
     */
    function verifyProductAuthenticity(uint256 _productId) 
        external 
        view 
        productExists(_productId) 
        returns (bool isAuthentic) 
    {
        require(productHistory[_productId].length > 0, "No history found");
        
        // Check if history chain is valid (proper role progression)
        HistoryRecord[] storage history = productHistory[_productId];
        
        for (uint256 i = 1; i < history.length; i++) {
            Role prevRole = history[i-1].actorRole;
            Role currRole = history[i].actorRole;
            
            // Verify proper progression
            if (prevRole == Role.Manufacturer && currRole != Role.Distributor) {
                return false;
            }
            if (prevRole == Role.Distributor && currRole != Role.Retailer && currRole != Role.Distributor) {
                return false;
            }
            if (prevRole == Role.Retailer && currRole != Role.Customer && currRole != Role.Retailer) {
                return false;
            }
        }
        
        return true;
    }
    
    // ==================== Admin Functions ====================
    
    /**
     * @dev Get contract information
     * @return name Company name
     * @return contractOwner Contract owner address
     * @return totalProducts Total products in system
     * @return totalUsers Total users in system
     */
    function getContractInfo() 
        external 
        view 
        returns (
            string memory name,
            address contractOwner,
            uint256 totalProducts,
            uint256 totalUsers
        ) 
    {
        return (companyName, owner, productCounter, userCounter);
    }
}
