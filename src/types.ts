
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'staff';
  storeId?: string;
  password: string;
}

export interface Store {
  id: string;
  name: string;
}

export interface Product {
  code: string;
  name: string;
  supplier: string;
  capacity: string;
  cost: number;
  minNecessary: number;
  orderTo: string;
  category: string;
  active: boolean;
  targetStores?: string[];
  orderDestination?: string;
  usageType?: string;
  unit?: string;
}

export interface SheetItem {
  productCode: string;
  midMonthUsage: number;
  endMonthUsage: number;
  inventoryCount: number;
}

export interface MonthlySheet {
  id: string;
  storeId: string;
  month: string;
  totalSales: number;
  items: SheetItem[];
  updatedAt?: string;
}

export interface MemoItem {
  productName: string;
  count: number;
  note: string;
  isCompleted?: boolean;
}

export interface RestockMemo {
  id: string;
  storeId: string;
  month: string;
  content: string;
  items: MemoItem[];
  updatedAt: string;
}

export interface StoreInput {
  date: string;
  month: string;
  storeId: string;
  type: 'mid' | 'end';
  productCode: string;
  productName: string; // From master
  usageCount: number;
  inventoryCount: number;
  cost: number;
  usageAmount: number;
  inventoryAmount: number;
}

export interface SupplementMemo {
  id: string;
  date: string;
  storeId: string;
  productCode: string;
  productName: string;
  currentStock: number;
  minNecessary: number;
  hopeCount: number;
  orderTo: string;
  status: 'uncollected' | 'collected';
  note: string;
}

export interface MonthlyReport {
  id: string;
  month: string;
  storeId: string;
  usageTotal: number;
  inventoryTotal: number;
  salesTotal: number;
  ratio: number;
  aiComment?: string;
}
