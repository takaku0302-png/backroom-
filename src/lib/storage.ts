/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, MonthlySheet, RestockMemo } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const KEYS = {
  PRODUCTS: 'hair_salon_products',
  SHEETS: 'hair_salon_sheets',
  MEMOS: 'hair_salon_memos'
};

// Initialize with sample items if empty
const initStorage = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.SHEETS)) {
    localStorage.setItem(KEYS.SHEETS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.MEMOS)) {
    localStorage.setItem(KEYS.MEMOS, JSON.stringify([]));
  }
};

initStorage();

export const storage = {
  getProducts: (): Product[] => {
    return JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },
  
  getSheets: (): MonthlySheet[] => {
    return JSON.parse(localStorage.getItem(KEYS.SHEETS) || '[]');
  },
  saveSheet: (sheet: MonthlySheet) => {
    const sheets = storage.getSheets();
    const index = sheets.findIndex(s => s.id === sheet.id);
    if (index >= 0) {
      sheets[index] = { ...sheet, updatedAt: new Date().toISOString() };
    } else {
      sheets.push({ ...sheet, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(KEYS.SHEETS, JSON.stringify(sheets));
  },

  getMemos: (): RestockMemo[] => {
    return JSON.parse(localStorage.getItem(KEYS.MEMOS) || '[]');
  },
  saveMemo: (memo: RestockMemo) => {
    const memos = storage.getMemos();
    const index = memos.findIndex(m => m.id === memo.id);
    if (index >= 0) {
      memos[index] = { ...memo, updatedAt: new Date().toISOString() };
    } else {
      memos.push({ ...memo, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(KEYS.MEMOS, JSON.stringify(memos));
  },
  deleteMemo: (id: string) => {
    const memos = storage.getMemos();
    const filtered = memos.filter(m => m.id !== id);
    localStorage.setItem(KEYS.MEMOS, JSON.stringify(filtered));
  }
};
