import { ProductService } from './products';
import { OrderService } from './orders';

/**
 * @typedef {Object} Product
 * @property {string|number} id - Unique identifier
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {string} image - URL of the product image
 * @property {string} category - Product category
 * @property {string} [description] - Product description
 * @property {number} [stock] - Available stock
 * @property {string} [unit] - Unit of measure (e.g., 'kg', 'pz')
 */

/**
 * @typedef {Object} CartItem
 * @property {string|number} id - Product ID
 * @property {string} name - Product name
 * @property {number} price - Price at time of addition
 * @property {number} quantity - Quantity in cart
 * @property {string} image - Product image
 */

/**
 * @typedef {Object} Order
 * @property {string} [id] - Order ID (assigned by backend)
 * @property {CartItem[]} items - List of items in the order
 * @property {number} total - Total amount
 * @property {string} status - Order status (pending, completed, etc.)
 * @property {string} date - ISO date string
 * @property {string} [userId] - ID of the user who placed the order
 * @property {Object} [shippingAddress] - Shipping details
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User full name
 * @property {string} email - User email
 * @property {string} role - User role ('admin', 'client', 'cashier')
 * @property {string} [phone] - User phone number
 * @property {Object[]} [addresses] - Saved addresses
 */

import { StorageService } from './storage';

// ... (existing typedefs)

export const api = {
    products: {
        // ... existing product methods
        getAll: ProductService.getAllProducts,
        getProductsPaginated: ProductService.getProductsPaginated,
        getCategories: ProductService.getAllCategories,
        add: ProductService.addProduct,
        update: ProductService.updateProduct,
        delete: ProductService.deleteProduct,
        addCategory: ProductService.addCategory,
        updateCategory: ProductService.updateCategory,
        deleteCategory: ProductService.deleteCategory
    },
    orders: {
        create: OrderService.createOrder,
        getAll: OrderService.getOrders,
        updateStatus: OrderService.updateStatus
    },
    storage: {
        upload: StorageService.uploadFile,
        getAllImages: StorageService.getAllImages
    },
    // ... existing auth
    // Auth placeholder for future implementation
    auth: {
        login: async (email, password) => {
            // Simulation
            return { id: '1', name: 'Demo User', email, role: 'client' };
        },
        register: async (userData) => {
            // Simulation
            return { id: '2', ...userData, role: 'client' };
        },
        logout: async () => {
            return true;
        }
    }
};
