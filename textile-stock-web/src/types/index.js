// User model
export const User = {
  create: (id, email, role, shopName = null) => ({
    id,
    email,
    role,
    shopName,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

// Stock Item model
export const StockItem = {
  create: (id, name, category, unit, totalQuantity, pricePerUnit) => ({
    id,
    name,
    category,
    unit,
    totalQuantity: parseFloat(totalQuantity),
    remainingQuantity: parseFloat(totalQuantity),
    pricePerUnit: parseFloat(pricePerUnit),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

// Stock Movement model
export const StockMovement = {
  create: (id, stockItemId, type, quantity, reason, shopName, userId) => ({
    id,
    stockItemId,
    type, // 'in' or 'out'
    quantity: parseFloat(quantity),
    reason,
    shopName,
    userId,
    createdAt: new Date(),
  }),
};

// Sale model
export const Sale = {
  create: (id, stockItemId, quantity, totalAmount, shopName, customerName, createdBy) => ({
    id,
    stockItemId,
    quantity: parseFloat(quantity),
    totalAmount: parseFloat(totalAmount),
    shopName,
    customerName,
    createdBy,
    saleDate: new Date(),
    createdAt: new Date(),
  }),
};

// Shop model
export const Shop = {
  create: (id, name, location, manager, contactNumber) => ({
    id,
    name,
    location,
    manager,
    contactNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

// Firestore collection names (same as original)
export const COLLECTIONS = {
  USERS: 'users',
  STOCK_ITEMS: 'stock_items',
  SALES: 'sales',
  STOCK_MOVEMENTS: 'stock_movements',
  SHOPS: 'shops',
};

// Helper functions
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};
