// ─── TYPES ─── //
export type OperationStatus = 'draft' | 'ready' | 'waiting' | 'done' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: string;
  perUnitCost: number;
  onHand: number;
  freeToUse: number;
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
}

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  warehouseId: string;
}

export interface OperationProduct {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  doneQty?: number;
}

export interface Receipt {
  id: string;
  reference: string;
  from: string;
  to: string;
  scheduledDate: string;
  status: OperationStatus;
  responsible: string;
  products: OperationProduct[];
  sourceLocation: string;
}

export interface Delivery {
  id: string;
  reference: string;
  from: string;
  to: string;
  scheduledDate: string;
  status: OperationStatus;
  responsible: string;
  deliveryType: string;
  products: OperationProduct[];
  sourceLocation: string;
}

export interface MoveHistoryEntry {
  id: string;
  date: string;
  reference: string;
  from: string;
  to: string;
  productName: string;
  quantity: number;
  status: OperationStatus;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
}

// ─── MOCK DATA ─── //

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Office Desk', sku: 'DESK001', category: 'Furniture', uom: 'Unit', perUnitCost: 249.99, onHand: 45, freeToUse: 38 },
  { id: 'p2', name: 'Ergonomic Chair', sku: 'CHAIR001', category: 'Furniture', uom: 'Unit', perUnitCost: 399.99, onHand: 28, freeToUse: 22 },
  { id: 'p3', name: 'LED Monitor 27"', sku: 'MON001', category: 'Electronics', uom: 'Unit', perUnitCost: 329.00, onHand: 62, freeToUse: 55 },
  { id: 'p4', name: 'Wireless Keyboard', sku: 'KB001', category: 'Accessories', uom: 'Unit', perUnitCost: 59.99, onHand: 5, freeToUse: 3 },
  { id: 'p5', name: 'USB-C Dock', sku: 'DOCK001', category: 'Accessories', uom: 'Unit', perUnitCost: 89.99, onHand: 0, freeToUse: 0 },
  { id: 'p6', name: 'Steel Rods 10mm', sku: 'STL001', category: 'Raw Materials', uom: 'kg', perUnitCost: 4.50, onHand: 1200, freeToUse: 1100 },
  { id: 'p7', name: 'Printer Paper A4', sku: 'PAP001', category: 'Supplies', uom: 'Ream', perUnitCost: 5.99, onHand: 150, freeToUse: 130 },
  { id: 'p8', name: 'Laptop Stand', sku: 'LSTD001', category: 'Accessories', uom: 'Unit', perUnitCost: 45.00, onHand: 2, freeToUse: 1 },
];

export const mockWarehouses: Warehouse[] = [
  { id: 'wh1', name: 'Main Warehouse', shortCode: 'WH', address: '123 Industrial Park, Building A, Mumbai 400001' },
  { id: 'wh2', name: 'East Wing Storage', shortCode: 'EW', address: '456 Logistics Avenue, East Wing, Mumbai 400002' },
];

export const mockLocations: Location[] = [
  { id: 'loc1', name: 'Rack A - Ground Floor', shortCode: 'WH/RACK-A', warehouseId: 'wh1' },
  { id: 'loc2', name: 'Rack B - Ground Floor', shortCode: 'WH/RACK-B', warehouseId: 'wh1' },
  { id: 'loc3', name: 'Cold Storage', shortCode: 'WH/COLD', warehouseId: 'wh1' },
  { id: 'loc4', name: 'East Shelf 1', shortCode: 'EW/SH-1', warehouseId: 'wh2' },
  { id: 'loc5', name: 'East Shelf 2', shortCode: 'EW/SH-2', warehouseId: 'wh2' },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

export const mockReceipts: Receipt[] = [
  {
    id: 'r1', reference: 'WH/IN/0001', from: 'Azure Interior', to: 'Main Warehouse',
    scheduledDate: today, status: 'ready', responsible: 'Admin User',
    sourceLocation: 'Vendor/Azure Interior',
    products: [
      { productId: 'p1', productName: 'Office Desk', sku: 'DESK001', quantity: 6 },
      { productId: 'p3', productName: 'LED Monitor 27"', sku: 'MON001', quantity: 10 },
    ],
  },
  {
    id: 'r2', reference: 'WH/IN/0002', from: 'Azure Interior', to: 'Main Warehouse',
    scheduledDate: today, status: 'ready', responsible: 'Admin User',
    sourceLocation: 'Vendor/Azure Interior',
    products: [
      { productId: 'p2', productName: 'Ergonomic Chair', sku: 'CHAIR001', quantity: 12 },
    ],
  },
  {
    id: 'r3', reference: 'WH/IN/0003', from: 'TechSupply Co', to: 'East Wing Storage',
    scheduledDate: yesterday, status: 'waiting', responsible: 'Admin User',
    sourceLocation: 'Vendor/TechSupply Co',
    products: [
      { productId: 'p4', productName: 'Wireless Keyboard', sku: 'KB001', quantity: 50 },
      { productId: 'p5', productName: 'USB-C Dock', sku: 'DOCK001', quantity: 25 },
    ],
  },
  {
    id: 'r4', reference: 'WH/IN/0004', from: 'SteelWorld Ltd', to: 'Main Warehouse',
    scheduledDate: twoDaysAgo, status: 'done', responsible: 'Admin User',
    sourceLocation: 'Vendor/SteelWorld Ltd',
    products: [
      { productId: 'p6', productName: 'Steel Rods 10mm', sku: 'STL001', quantity: 500 },
    ],
  },
  {
    id: 'r5', reference: 'WH/IN/0005', from: 'PaperMart', to: 'Main Warehouse',
    scheduledDate: twoDaysAgo, status: 'draft', responsible: 'Admin User',
    sourceLocation: 'Vendor/PaperMart',
    products: [
      { productId: 'p7', productName: 'Printer Paper A4', sku: 'PAP001', quantity: 200 },
    ],
  },
];

export const mockDeliveries: Delivery[] = [
  {
    id: 'd1', reference: 'WH/OUT/0001', from: 'Main Warehouse', to: 'Client - Infosys',
    scheduledDate: today, status: 'ready', responsible: 'Admin User',
    deliveryType: 'Standard Delivery', sourceLocation: 'WH/RACK-A',
    products: [
      { productId: 'p1', productName: 'Office Desk', sku: 'DESK001', quantity: 4, doneQty: 0 },
      { productId: 'p2', productName: 'Ergonomic Chair', sku: 'CHAIR001', quantity: 4, doneQty: 0 },
    ],
  },
  {
    id: 'd2', reference: 'WH/OUT/0002', from: 'Main Warehouse', to: 'Client - TCS',
    scheduledDate: today, status: 'waiting', responsible: 'Admin User',
    deliveryType: 'Express Delivery', sourceLocation: 'WH/RACK-B',
    products: [
      { productId: 'p3', productName: 'LED Monitor 27"', sku: 'MON001', quantity: 8, doneQty: 0 },
    ],
  },
  {
    id: 'd3', reference: 'WH/OUT/0003', from: 'East Wing Storage', to: 'Client - Wipro',
    scheduledDate: yesterday, status: 'done', responsible: 'Admin User',
    deliveryType: 'Standard Delivery', sourceLocation: 'EW/SH-1',
    products: [
      { productId: 'p4', productName: 'Wireless Keyboard', sku: 'KB001', quantity: 10, doneQty: 10 },
    ],
  },
  {
    id: 'd4', reference: 'WH/OUT/0004', from: 'Main Warehouse', to: 'Client - HCL',
    scheduledDate: yesterday, status: 'draft', responsible: 'Admin User',
    deliveryType: 'Standard Delivery', sourceLocation: 'WH/RACK-A',
    products: [
      { productId: 'p8', productName: 'Laptop Stand', sku: 'LSTD001', quantity: 5, doneQty: 0 },
    ],
  },
];

export const mockMoveHistory: MoveHistoryEntry[] = [
  { id: 'm1', date: today, reference: 'WH/IN/0001', from: 'Vendor/Azure Interior', to: 'WH/RACK-A', productName: 'Office Desk', quantity: 6, status: 'ready', type: 'in' },
  { id: 'm2', date: today, reference: 'WH/IN/0001', from: 'Vendor/Azure Interior', to: 'WH/RACK-A', productName: 'LED Monitor 27"', quantity: 10, status: 'ready', type: 'in' },
  { id: 'm3', date: today, reference: 'WH/OUT/0001', from: 'WH/RACK-A', to: 'Client - Infosys', productName: 'Office Desk', quantity: 4, status: 'ready', type: 'out' },
  { id: 'm4', date: today, reference: 'WH/OUT/0001', from: 'WH/RACK-A', to: 'Client - Infosys', productName: 'Ergonomic Chair', quantity: 4, status: 'ready', type: 'out' },
  { id: 'm5', date: yesterday, reference: 'WH/IN/0003', from: 'Vendor/TechSupply Co', to: 'EW/SH-1', productName: 'Wireless Keyboard', quantity: 50, status: 'waiting', type: 'in' },
  { id: 'm6', date: yesterday, reference: 'WH/OUT/0003', from: 'EW/SH-1', to: 'Client - Wipro', productName: 'Wireless Keyboard', quantity: 10, status: 'done', type: 'out' },
  { id: 'm7', date: twoDaysAgo, reference: 'WH/IN/0004', from: 'Vendor/SteelWorld Ltd', to: 'WH/RACK-B', productName: 'Steel Rods 10mm', quantity: 500, status: 'done', type: 'in' },
  { id: 'm8', date: twoDaysAgo, reference: 'ADJ/0001', from: 'WH/RACK-B', to: 'WH/RACK-B', productName: 'Steel Rods 10mm', quantity: -3, status: 'done', type: 'adjustment' },
];

// ─── DASHBOARD STATS ─── //
export function getDashboardStats() {
  const receiptsByStatus = {
    toReceive: mockReceipts.filter(r => r.status === 'ready').length,
    waiting: mockReceipts.filter(r => r.status === 'waiting').length,
    late: mockReceipts.filter(r => r.scheduledDate < today && r.status !== 'done' && r.status !== 'cancelled').length,
    total: mockReceipts.length,
  };

  const deliveriesByStatus = {
    toDeliver: mockDeliveries.filter(d => d.status === 'ready').length,
    waiting: mockDeliveries.filter(d => d.status === 'waiting').length,
    late: mockDeliveries.filter(d => d.scheduledDate < today && d.status !== 'done' && d.status !== 'cancelled').length,
    total: mockDeliveries.length,
  };

  return { receiptsByStatus, deliveriesByStatus };
}
