/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart3, 
  Package, 
  ClipboardList, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  Save, 
  Trash2, 
  Plus, 
  Download, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Menu,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Store, Product, MonthlySheet, RestockMemo, SheetItem, MemoItem } from './types';
import { STORES, INITIAL_USERS } from './constants';
import { storage } from './lib/storage';

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', icon: Icon, className = '', disabled = false }: any) => {
  const base = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants: any = {
    primary: "bg-slate-grey text-white hover:bg-dark-grey shadow-sm",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    ghost: "text-gray-500 hover:bg-gray-100",
    slate: "bg-slate-grey text-white hover:bg-dark-grey shadow-sm"
  };
  
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Card = ({ children, title, subtitle, className = "" }: any) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {(title || subtitle) && (
      <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30">
        {title && <h3 className="text-lg font-bold text-slate-grey">{title}</h3>}
        {subtitle && <p className="text-sm text-dark-grey">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Input = ({ label, type = "text", value, onChange, placeholder, className = "", required = false }: any) => (
  <div className={`space-y-1 ${className}`}>
    {label && <label className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-grey focus:bg-white transition-all text-gray-800"
      placeholder={placeholder}
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'sheet' | 'memo' | 'admin' | 'master'>('sheet');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [currentStoreId, setCurrentStoreId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [sheets, setSheets] = useState<MonthlySheet[]>([]);
  const [memos, setMemos] = useState<RestockMemo[]>([]);

  // Load Data
  useEffect(() => {
    setProducts(storage.getProducts());
    setSheets(storage.getSheets());
    setMemos(storage.getMemos());
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleLogin = (id: string, password: string) => {
    const found = INITIAL_USERS.find(u => u.id === id && u.password === password);
    if (found) {
      setUser(found);
      setCurrentStoreId(found.storeId || STORES[1].id);
      if (found.role === 'admin') setView('admin');
      else setView('sheet');
      showNotification('ログインしました');
    } else {
      showNotification('IDまたはパスワードが正しくありません', 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsSidebarOpen(false);
    showNotification('ログアウトしました');
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-grey p-2 rounded-lg">
            <Package className="text-white" size={20} />
          </div>
          <span className="font-bold text-slate-grey tracking-tight">材料管理</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-grey hover:bg-gray-100 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar / Navigation */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            className={`fixed md:static inset-0 z-40 bg-white md:bg-transparent md:block w-72 h-screen border-r border-gray-100 overflow-y-auto ${isSidebarOpen ? 'block' : 'hidden md:block'}`}
          >
            <div className="p-6 flex flex-col h-full bg-white">
              <div className="hidden md:flex items-center gap-3 mb-10">
                <div className="bg-slate-grey p-2 rounded-lg shadow-md">
                  <Package className="text-white" size={24} />
                </div>
                <span className="text-xl font-black text-slate-grey tracking-tighter uppercase">TOPS App</span>
              </div>

              <div className="mb-8 p-5 bg-ivory rounded-2xl border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:rotate-12 transition-transform">
                   <Package size={60} />
                </div>
                <p className="text-[10px] text-dark-grey font-black mb-1 uppercase tracking-widest">Current Session</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-grey animate-pulse"></div>
                  <p className="font-extrabold text-slate-grey truncate">
                    {STORES.find(s => s.id === user.storeId)?.name || '本部管理室'}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">{user.role === 'admin' ? 'SYSTEM ADMIN' : 'SHOP STAFF'}</p>
              </div>

              <nav className="space-y-1.5 flex-1">
                {user.role === 'staff' && (
                  <>
                    <NavButton active={view === 'sheet'} icon={FileSpreadsheet} onClick={() => { setView('sheet'); setIsSidebarOpen(false); }}>店舗材料シート</NavButton>
                    <NavButton active={view === 'memo'} icon={ClipboardList} onClick={() => { setView('memo'); setIsSidebarOpen(false); }}>補充メモ</NavButton>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <NavButton active={view === 'admin'} icon={LayoutDashboard} onClick={() => { setView('admin'); setIsSidebarOpen(false); }}>本部集計状況</NavButton>
                    <NavButton active={view === 'master'} icon={Package} onClick={() => { setView('master'); setIsSidebarOpen(false); }}>商品マスター</NavButton>
                    <div className="my-4 border-t border-gray-100 pt-4">
                      <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">店舗ビュー切替</p>
                      <NavButton active={view === 'sheet'} icon={FileSpreadsheet} onClick={() => { setView('sheet'); setIsSidebarOpen(false); }}>店舗シート確認</NavButton>
                    </div>
                  </>
                )}
              </nav>

              <div className="pt-6 mt-auto border-t border-gray-100">
                <Button variant="ghost" icon={LogOut} onClick={handleLogout} className="w-full !justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                  ログアウト
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-full overflow-hidden flex flex-col">
        <header className="hidden md:flex bg-white px-8 py-4 border-b border-gray-200 items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {view === 'sheet' && '店舗材料シート'}
            {view === 'memo' && '補充メモ'}
            {view === 'admin' && '本部集計・店舗状況'}
            {view === 'master' && '商品マスター管理'}
          </h2>
          <div className="flex items-center gap-4">
            {(view === 'sheet' || view === 'memo') && user.role === 'admin' && (
              <div className="flex items-center gap-2 bg-slate-grey/5 px-3 py-1.5 rounded-lg border border-slate-grey/10">
                <span className="text-sm font-bold text-slate-grey">表示店舗:</span>
                <select 
                  value={currentStoreId}
                  onChange={(e) => setCurrentStoreId(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-grey focus:outline-none"
                >
                  {STORES.filter(s => s.id !== 'admin').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
               <span className="text-sm font-medium text-gray-600">対象月:</span>
               <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none"
               />
            </div>
          </div>
        </header>

        {/* Mobile Month & Store Switcher */}
        <div className="md:hidden bg-white p-4 border-b border-gray-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
               <span className="text-sm font-medium text-gray-500">対象月:</span>
               <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent flex-1 font-bold text-gray-800 text-center"
               />
            </div>
            {(view === 'sheet' || view === 'memo') && user.role === 'admin' && (
              <div className="flex items-center gap-2 bg-ivory px-4 py-2 rounded-xl border border-gray-100 w-full">
                <span className="text-sm font-bold text-slate-grey">店舗:</span>
                <select 
                  value={currentStoreId}
                  onChange={(e) => setCurrentStoreId(e.target.value)}
                  className="bg-transparent flex-1 font-bold text-slate-grey text-center focus:outline-none"
                >
                  {STORES.filter(s => s.id !== 'admin').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            {view === 'sheet' && (
              <SheetView 
                key={`sheet-${currentStoreId}`}
                storeId={currentStoreId || user.storeId || STORES[1].id} 
                month={selectedMonth} 
                products={products}
                sheets={sheets}
                setSheets={setSheets}
                showNotification={showNotification}
                isAdmin={user.role === 'admin'}
              />
            )}
            {view === 'memo' && (
              <MemoView 
                key={`memo-${currentStoreId}`}
                storeId={currentStoreId || user.storeId || STORES[1].id} 
                month={selectedMonth} 
                products={products}
                memos={memos}
                setMemos={setMemos}
                showNotification={showNotification}
              />
            )}
            {view === 'admin' && (
              <AdminDashboard 
                key="admin"
                month={selectedMonth} 
                products={products}
                sheets={sheets}
                memos={memos}
                setMemos={setMemos}
              />
            )}
            {view === 'master' && (
              <MasterView 
                key="master"
                products={products} 
                setProducts={setProducts} 
                showNotification={showNotification}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-red-500" />}
            <span className="font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Specific Views ---

const LoginView = ({ onLogin }: { onLogin: (id: string, pass: string) => void }) => {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-slate-grey p-10 flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-4">
              <Package className="text-slate-grey" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">美容室 材料管理アプリ</h1>
            <p className="text-ivory text-sm mt-1 opacity-80 uppercase tracking-widest">Material Management</p>
          </div>
          <div className="p-10 space-y-6">
            <Input label="ログインID" placeholder="IDを入力" value={id} onChange={setId} />
            <Input label="パスワード" type="password" placeholder="パスワードを入力" value={pass} onChange={setPass} />
            <Button variant="slate" onClick={() => onLogin(id, pass)} className="w-full py-4 text-lg">
              ログイン
            </Button>
            
            <div className="pt-6 mt-6 border-t border-gray-50">
              <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">クイックログイン</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {INITIAL_USERS.map((user) => (
                  <Button 
                    key={user.id} 
                    variant="secondary" 
                    onClick={() => onLogin(user.id, user.password)} 
                    className="!py-2 !text-[10px] font-bold"
                  >
                    {user.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SheetView = ({ storeId, month, products, sheets, setSheets, showNotification, isAdmin }: any) => {
  const sheet = useMemo(() => {
    const s = sheets.find((sh: any) => sh.storeId === storeId && sh.month === month);
    return s || { 
      id: `${storeId}_${month}`, 
      storeId, 
      month, 
      totalSales: 0, 
      items: products.filter((p: any) => p.active && p.targetStores.includes(storeId)).map((p: any) => ({
        productCode: p.code,
        midMonthUsage: 0,
        endMonthUsage: 0,
        inventoryCount: 0
      }))
    };
  }, [storeId, month, sheets, products]);

  const [localSheet, setLocalSheet] = useState<MonthlySheet>(sheet);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalSheet(sheet);
  }, [sheet]);

  // Auto-save logic (every 60 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAutoSaving(true);
      storage.saveSheet(localSheet);
      setTimeout(() => setIsAutoSaving(false), 2000);
    }, 60000);
    return () => clearInterval(timer);
  }, [localSheet]);

  const updateItem = (code: string, field: 'midMonthUsage' | 'endMonthUsage' | 'inventoryCount', value: string) => {
    const num = value === '' ? 0 : parseInt(value);
    if (isNaN(num) || num < 0 || num > 99999) {
      setErrors(prev => ({ ...prev, [`${code}-${field}`]: '範囲外' }));
    } else {
      setErrors(prev => { const next = {...prev}; delete next[`${code}-${field}`]; return next; });
    }
    const newItems = localSheet.items.map(item => 
      item.productCode === code ? { ...item, [field]: num } : item
    );
    setLocalSheet({ ...localSheet, items: newItems });
  };

  const handleSave = () => {
    storage.saveSheet(localSheet);
    setSheets(storage.getSheets());
    showNotification('シートを保存しました');
  };

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const sheetViewRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!sheetViewRef.current) return;
    const inputs = Array.from(sheetViewRef.current.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
    const currentIndex = inputs.indexOf(e.target as HTMLInputElement);

    if (['Enter', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const nextIndex = e.key === 'Enter' ? currentIndex + 1 : currentIndex + 3;
      if (nextIndex < inputs.length) {
        inputs[nextIndex].focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex - 3;
      if (prevIndex >= 0) {
        inputs[prevIndex].focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentIndex > 0 && e.target.selectionStart === 0) {
         e.preventDefault();
         inputs[currentIndex - 1].focus();
      }
    } else if (e.key === 'ArrowRight') {
      if (currentIndex < inputs.length - 1 && (e.target.selectionStart === (e.target.value ?? '').length)) {
         e.preventDefault();
         inputs[currentIndex + 1].focus();
      }
    }
  };

  const categories = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const suppliers = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.supplier)))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesSupplier = supplierFilter === 'all' || p.supplier === supplierFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSupplier && matchesSearch && p.active && (p.targetStores?.includes(storeId) ?? true);
    });
  }, [products, categoryFilter, supplierFilter, searchQuery, storeId]);

  // Calculations
  const totals = useMemo(() => {
    let usageTotal = 0;
    let inventoryTotal = 0;
    localSheet.items.forEach(item => {
      const p = products.find((pr: any) => pr.code === item.productCode);
      if (p) {
        const totalUsage = (item.midMonthUsage || 0) + (item.endMonthUsage || 0);
        usageTotal += p.cost * totalUsage;
        inventoryTotal += p.cost * item.inventoryCount;
      }
    });
    const ratio = localSheet.totalSales > 0 ? (usageTotal / localSheet.totalSales) * 100 : 0;
    return { usageTotal, inventoryTotal, ratio };
  }, [localSheet, products]);

  const storeName = STORES.find(s => s.id === storeId)?.name;

  return (
    <motion.div ref={sheetViewRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-dark-grey text-sm font-medium mb-1">売上 (税込)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-gray-400 text-sm">¥</span>
            <input 
              type="number"
              min="0"
              value={localSheet.totalSales} 
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (val < 0 || val > 9999999) setErrors(prev => ({...prev, totalSales: '範囲外'}));                
                else { setErrors(prev => { const next = {...prev}; delete next.totalSales; return next; }); }
                setLocalSheet({...localSheet, totalSales: val});
              }}
              className={`text-2xl font-bold text-slate-grey bg-transparent focus:outline-none w-full border-b border-dashed ${errors.totalSales ? 'border-red-500' : 'border-gray-300'} focus:border-slate-grey`}
            />
            {errors.totalSales && <p className="text-[10px] text-red-500 mt-1">{errors.totalSales}</p>}
          </div>
        </Card>
        <Card className="bg-slate-grey text-white !border-0 shadow-lg shadow-slate-grey/20">
          <p className="text-gray-200 text-sm font-medium mb-1">払出し合計</p>
          <p className="text-3xl font-bold text-ivory">¥ {totals.usageTotal.toLocaleString()}</p>
        </Card>
        <Card className="bg-white">
          <p className="text-dark-grey text-sm font-medium mb-1">在庫合計</p>
          <p className="text-2xl font-bold text-slate-grey">¥ {totals.inventoryTotal.toLocaleString()}</p>
        </Card>
        <Card className="bg-ivory border-dark-grey/20">
          <p className="text-slate-grey text-sm font-medium mb-1">材料比率</p>
          <p className="text-2xl font-bold text-dark-grey">{totals.ratio.toFixed(2)} %</p>
        </Card>
      </div>

      <AnimatePresence>
        {isAutoSaving && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-xs text-dark-grey py-1"
          >
            <div className="w-2 h-2 bg-slate-grey rounded-full animate-ping"></div>
            自動保存しました...
          </motion.div>
        )}
      </AnimatePresence>

      <Card title={`${storeName} 材料管理シート`} subtitle={`${month} の在庫・使用状況`}>
         <div className="mb-6 p-4 bg-gray-50 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">分類で絞り込み</label>
             <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
               {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'すべて' : c}</option>)}
             </select>
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">商品名で検索</label>
             <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="名称またはコード..." className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700" />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">仕入先で絞り込み</label>
             <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
               {suppliers.map(s => <option key={s} value={s}>{s === 'all' ? 'すべて' : s}</option>)}
             </select>
           </div>
         </div>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-grey/5 text-slate-grey text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold border-b border-gray-100">商品</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100">仕入原価</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 bg-slate-grey/5">[月中払出し]</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100">月末追加払出し</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 text-slate-grey">払出し合計</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 text-slate-grey">払出金額</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 bg-gray-50/50">在庫数</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 text-right">在庫金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredProducts.map(p => {
                const item = localSheet.items.find(i => i.productCode === p.code) || { productCode: p.code, midMonthUsage: 0, endMonthUsage: 0, inventoryCount: 0 };
                const midUsage = item.midMonthUsage || 0;
                const endUsage = item.endMonthUsage || 0;
                const totalUsage = midUsage + endUsage;
                const invCount = item.inventoryCount || 0;

                return (
                  <tr key={p.code} className="hover:bg-ivory/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-grey">{p.name}</p>
                      <p className="text-[10px] text-dark-grey uppercase tracking-wider">{p.supplier} | {p.capacity}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-grey font-medium">¥ {p.cost.toLocaleString()}</td>
                    
                    {/* Mid Usage */}
                    <td className="px-6 py-4 bg-slate-grey/5">
                      <input 
                        type="number" 
                        inputMode="numeric"
                        min="0"
                        value={midUsage === 0 ? '' : midUsage}
                        placeholder="0"
                        onChange={(e) => updateItem(p.code, 'midMonthUsage', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={handleKeyDown}
                        className={`w-24 px-4 py-2 border ${errors[`${p.code}-midMonthUsage`] ? 'border-red-500' : 'border-slate-grey/20'} rounded-lg bg-white focus:ring-2 focus:ring-slate-grey outline-none text-right font-bold text-slate-grey shadow-sm`}
                      />
                      {errors[`${p.code}-midMonthUsage`] && <p className="text-[10px] text-red-500 mt-1">{errors[`${p.code}-midMonthUsage`]}</p>}
                    </td>

                    {/* End Usage */}
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        inputMode="numeric"
                        min="0"
                        value={endUsage === 0 ? '' : endUsage}
                        placeholder="0"
                        onChange={(e) => updateItem(p.code, 'endMonthUsage', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={handleKeyDown}
                        className={`w-24 px-4 py-2 border ${errors[`${p.code}-endMonthUsage`] ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white focus:ring-2 focus:ring-dark-grey outline-none text-right font-bold text-slate-grey shadow-sm`}
                      />
                      {errors[`${p.code}-endMonthUsage`] && <p className="text-[10px] text-red-500 mt-1">{errors[`${p.code}-endMonthUsage`]}</p>}
                    </td>

                    {/* Total Usage */}
                    <td className="px-6 py-4 font-bold text-slate-grey bg-gray-50/30">
                      {totalUsage}
                    </td>

                    {/* Usage Amount */}
                    <td className="px-6 py-4 font-bold text-slate-grey">
                      ¥ {(p.cost * totalUsage).toLocaleString()}
                    </td>

                    {/* Inventory Count */}
                    <td className="px-6 py-4 bg-gray-50/50">
                      <input 
                        type="number" 
                        inputMode="numeric"
                        min="0"
                        value={invCount === 0 ? '' : invCount}
                        placeholder="0"
                        onChange={(e) => updateItem(p.code, 'inventoryCount', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={handleKeyDown}
                        className={`w-24 px-4 py-2 border ${errors[`${p.code}-inventoryCount`] ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white focus:ring-2 focus:ring-slate-grey outline-none text-right font-bold text-dark-grey shadow-sm`}
                      />
                      {errors[`${p.code}-inventoryCount`] && <p className="text-[10px] text-red-500 mt-1">{errors[`${p.code}-inventoryCount`]}</p>}
                    </td>

                    {/* Inventory Amount */}
                    <td className="px-6 py-4 font-bold text-dark-grey text-right bg-gray-50/10">
                      ¥ {(p.cost * invCount).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-10 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setLocalSheet(sheet)}>キャンセル</Button>
          <Button variant="slate" icon={Save} onClick={handleSave} className="min-w-[140px]">変更を保存</Button>
        </div>
      </Card>
    </motion.div>
  );
};

const MemoView = ({ storeId, month, products, memos, setMemos, showNotification }: any) => {
  const currentMemo = useMemo(() => {
    return memos.find((m: any) => m.storeId === storeId && m.month === month);
  }, [memos, storeId, month]);

  const [localMemo, setLocalMemo] = useState<RestockMemo | null>(currentMemo || null);
  const [tempItem, setTempItem] = useState({ productName: '', count: 1, note: '' });
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [masterSearch, setMasterSearch] = useState('');

  useEffect(() => {
    setLocalMemo(currentMemo || null);
  }, [currentMemo]);

  // Handle outside click for suggestions
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (!tempItem.productName || !showSuggestions) return [];
    return products
      .filter((p: any) => 
        p.active && 
        p.name.toLowerCase().includes(tempItem.productName.toLowerCase())
      )
      .slice(0, 10);
  }, [tempItem.productName, products, showSuggestions]);

  // Auto-save logic
  useEffect(() => {
    if (!localMemo) return;
    const timer = setInterval(() => {
      setIsAutoSaving(true);
      storage.saveMemo(localMemo);
      setTimeout(() => setIsAutoSaving(false), 2000);
    }, 60000);
    return () => clearInterval(timer);
  }, [localMemo]);

  const filteredMaster = useMemo(() => {
    return products.filter((p: any) => 
      p.active && 
      (p.name.toLowerCase().includes(masterSearch.toLowerCase()) || 
       p.code.toLowerCase().includes(masterSearch.toLowerCase()))
    );
  }, [products, masterSearch]);

  const updateItemCountFromMaster = (name: string, count: number) => {
    if (!localMemo) return;
    const existingIdx = localMemo.items.findIndex(i => i.productName === name);
    let newItems;
    if (count <= 0) {
      newItems = localMemo.items.filter(i => i.productName !== name);
    } else if (existingIdx >= 0) {
      newItems = localMemo.items.map((item, idx) => 
        idx === existingIdx ? { ...item, count } : item
      );
    } else {
      newItems = [...localMemo.items, { productName: name, count, note: '' }];
    }
    setLocalMemo({ ...localMemo, items: newItems });
  };

  const updateItemNoteFromMaster = (name: string, note: string) => {
    if (!localMemo) return;
    const existingIdx = localMemo.items.findIndex(i => i.productName === name);
    if (existingIdx >= 0) {
      const newItems = localMemo.items.map((item, idx) => 
        idx === existingIdx ? { ...item, note } : item
      );
      setLocalMemo({ ...localMemo, items: newItems });
    } else if (note.trim() !== '') {
      setLocalMemo({ ...localMemo, items: [...localMemo.items, { productName: name, count: 1, note }] });
    }
  };

  const handleCreateNew = () => {
    setLocalMemo({
      id: `${storeId}_${month}_${Date.now()}`,
      storeId,
      month,
      content: '',
      items: [],
      updatedAt: new Date().toISOString()
    });
  };

  const handleSave = () => {
    if (!localMemo) return;
    storage.saveMemo(localMemo);
    setMemos(storage.getMemos());
    showNotification('メモを保存しました');
  };

  const handleDelete = () => {
    if (!localMemo) return;
    storage.deleteMemo(localMemo.id);
    setMemos(storage.getMemos());
    setLocalMemo(null);
    showNotification('メモを削除しました');
  };

  const addItem = () => {
    if (!localMemo || !tempItem.productName) return;
    setLocalMemo({
      ...localMemo,
      items: [...localMemo.items, tempItem]
    });
    setTempItem({ productName: '', count: 1, note: '' });
    setShowSuggestions(false);
  };

  const removeItem = (idx: number) => {
    if (!localMemo) return;
    const newItems = localMemo.items.filter((_, i) => i !== idx);
    setLocalMemo({ ...localMemo, items: newItems });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {isAutoSaving && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-xs text-gray-400 py-1"
          >
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
            自動保存しました...
          </motion.div>
        )}
      </AnimatePresence>

      {!localMemo ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 flex flex-col items-center text-center">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
            <ClipboardList size={48} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{month} の補充メモはまだありません</h3>
          <p className="text-gray-500 mb-8 max-w-sm">足りなくなった商品や注文予定のものをメモしておきましょう。</p>
          <Button onClick={handleCreateNew} icon={Plus} className="py-4 px-8 text-lg">
            新規メモを作成
          </Button>
        </div>
      ) : (
        <Card title={`${month} 補充・発注メモ`} subtitle={localMemo.updatedAt ? `最終更新: ${new Date(localMemo.updatedAt).toLocaleString()}` : ''}>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                 <Plus size={18} className="text-slate-grey" /> 不足品の追加
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative">
                 <div className="md:col-span-6 relative" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">商品名</label>
                    <input 
                      type="text"
                      placeholder="商品名を検索または入力"
                      value={tempItem.productName}
                      onChange={(e) => {
                        setTempItem({...tempItem, productName: e.target.value});
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-grey outline-none"
                    />
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                        >
                          {suggestions.map((p: any) => (
                            <button
                              key={p.code}
                              onClick={() => {
                                setTempItem({...tempItem, productName: p.name});
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-ivory transition-colors border-b border-gray-50 last:border-0"
                            >
                              <p className="font-bold text-sm text-slate-grey">{p.name}</p>
                              <p className="text-[10px] text-gray-400">{p.supplier} | {p.capacity}</p>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
                 <div className="md:col-span-2">
                    <Input label="個数" type="number" value={tempItem.count} onChange={(val: string) => setTempItem({...tempItem, count: parseInt(val) || 0})} />
                 </div>
                 <div className="md:col-span-4">
                    <Button onClick={addItem} className="w-full" disabled={!tempItem.productName}>リストに追加</Button>
                 </div>
               </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-700 mb-2">補充アイテム一覧</h4>
              {localMemo.items.length === 0 && (
                <p className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">アイテムが追加されていません</p>
              )}
              {localMemo.items.map((item, idx) => (
                <div key={idx} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-shadow gap-4 ${item.isCompleted ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer p-2">
                        <input 
                            type="checkbox" 
                            checked={item.isCompleted || false} 
                            onChange={() => {
                                const newItems = localMemo.items.map((i, iIdx) => iIdx === idx ? {...i, isCompleted: !i.isCompleted} : i);
                                setLocalMemo({...localMemo, items: newItems, updatedAt: new Date().toISOString()});
                            }}
                            className="w-6 h-6 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={item.count}
                      onChange={(e) => {
                        const newCount = parseInt(e.target.value) || 0;
                        const newItems = localMemo.items.map((i, iIdx) => iIdx === idx ? {...i, count: newCount} : i);
                        setLocalMemo({...localMemo, items: newItems, updatedAt: new Date().toISOString()});
                      }}
                      className={`w-20 h-12 rounded-lg border border-gray-200 text-center font-bold text-slate-grey focus:ring-2 focus:ring-emerald-500 outline-none ${item.isCompleted ? 'opacity-50' : ''}`}
                    />
                    <div>
                      <p className={`font-bold text-gray-800 ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>{item.productName}</p>
                      {item.note && <p className={`text-sm text-gray-500 ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>{item.note}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" icon={Trash2} onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-500 self-end sm:self-auto" />
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
              <Button variant="danger" icon={Trash2} onClick={handleDelete}>このメモを削除</Button>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setLocalMemo(currentMemo || null)}>元に戻す</Button>
                <Button icon={Save} onClick={handleSave} className="min-w-[120px]">保存する</Button>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t-2 border-dashed border-gray-100">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                 <div>
                    <h4 className="text-lg font-bold text-gray-800">商品マスターからまとめて追加</h4>
                    <p className="text-xs text-gray-400">数量を入力すると自動的に上のリストに追加されます</p>
                 </div>
                 <div className="w-full sm:w-64">
                    <Input placeholder="マスターから商品を検索..." value={masterSearch} onChange={setMasterSearch} />
                 </div>
               </div>
               
               <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-grey/5 text-slate-grey uppercase text-base tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-bold border-b border-gray-100">商品名 / 本部仕入先</th>
                          <th className="px-6 py-4 font-bold border-b border-gray-100">容量</th>
                          <th className="px-6 py-4 font-bold border-b border-gray-100 text-center bg-ivory/50">補充数</th>
                          <th className="px-6 py-4 font-bold border-b border-gray-100 text-center">メモ欄に記載</th>
                        </tr>
                      </thead>
                     <tbody className="divide-y divide-gray-50">
                       {filteredMaster.slice(0, 15).map((p: any) => {
                         const item = localMemo.items.find(i => i.productName === p.name);
                         return (
                           <tr key={p.code} className="hover:bg-gray-50 transition-colors">
                             <td className="px-6 py-4">
                               <p className="font-bold text-gray-700">{p.name}</p>
                               <p className="text-[10px] text-gray-400">{p.supplier}</p>
                             </td>
                             <td className="px-6 py-4 text-gray-500">{p.capacity}</td>
                             <td className="px-6 py-4 text-center bg-ivory/20">
                               <input 
                                 type="number" 
                                 min="0"
                                 value={item?.count || ''}
                                 placeholder="0"
                                 onChange={(e) => updateItemCountFromMaster(p.name, parseInt(e.target.value) || 0)}
                                 className="w-20 px-3 py-1.5 border border-slate-grey/20 rounded-lg bg-white focus:ring-2 focus:ring-slate-grey outline-none text-center font-bold"
                               />
                             </td>
                             <td className="px-6 py-4">
                               <input 
                                 type="text"
                                 placeholder="備考・メモ..."
                                 value={item?.note || ''}
                                 onChange={(e) => updateItemNoteFromMaster(p.name, e.target.value)}
                                 className="w-full px-3 py-1.5 border border-gray-100 rounded-lg text-xs outline-none focus:border-slate-grey/50"
                               />
                             </td>
                           </tr>
                         );
                       })}
                       {filteredMaster.length === 0 && (
                         <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">該当する商品が見つかりません</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
                 {filteredMaster.length > 15 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-50 text-center">
                       <p className="text-xs text-gray-400 font-medium">他にも {filteredMaster.length - 15} 件の商品があります。検索して絞り込んでください。</p>
                    </div>
                 )}
               </div>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

const AdminDashboard = ({ month, products, sheets, memos, setMemos }: any) => {
  const [storeFilter, setStoreFilter] = useState('all');

  const allSummaryData = useMemo(() => {
    return STORES.filter(s => s.id !== 'admin').map(store => {
      const sheet = sheets.find((sh: any) => sh.storeId === store.id && sh.month === month);
      const memoCount = memos.filter((m: any) => m.storeId === store.id && m.month === month).length;
      
      let usageTotal = 0;
      let inventoryTotal = 0;
      if (sheet) {
        sheet.items.forEach((item: any) => {
          const p = products.find((pr: any) => pr.code === item.productCode);
          if (p) {
            const totalUsage = (item.midMonthUsage || 0) + (item.endMonthUsage || 0);
            usageTotal += p.cost * totalUsage;
            inventoryTotal += p.cost * (item.inventoryCount || 0);
          }
        });
      }
      
      const ratio = sheet && sheet.totalSales > 0 ? (usageTotal / sheet.totalSales) * 100 : 0;
      
      return {
        id: store.id,
        name: store.name,
        totalSales: sheet?.totalSales || 0,
        usageTotal,
        inventoryTotal,
        ratio,
        memoCount,
        status: sheet ? '完了' : '未入力'
      };
    });
  }, [month, products, sheets, memos]);

  const summaryData = useMemo(() => {
    if (storeFilter === 'all') return allSummaryData;
    return allSummaryData.filter(d => d.id === storeFilter);
  }, [allSummaryData, storeFilter]);

  const addToRestockMemo = (alert: any) => {
    const existingMemo = memos.find((m: any) => m.storeId === alert.storeId && m.month === month);
    
    if (existingMemo) {
      const existingItem = existingMemo.items.find((i: any) => i.productCode === alert.productCode);
      let newItems;
      if (existingItem) {
        newItems = existingMemo.items.map((i: any) => 
          i.productCode === alert.productCode 
            ? { ...i, count: i.count + (alert.min - alert.stock) } 
            : i
        );
      } else {
        newItems = [...existingMemo.items, { productCode: alert.productCode, productName: alert.productName, count: alert.min - alert.stock, note: "自動補充要請" }];
      }
      const updatedMemos = memos.map((m: any) => m.id === existingMemo.id ? { ...m, items: newItems, updatedAt: new Date().toISOString() } : m);
      setMemos(updatedMemos);
    } else {
      const newMemo = {
        id: Date.now().toString(),
        storeId: alert.storeId,
        month: month,
        items: [{ productCode: alert.productCode, productName: alert.productName, count: alert.min - alert.stock, note: "自動補充要請" }],
        updatedAt: new Date().toISOString()
      };
      setMemos([...memos, newMemo]);
    }
  };

  const lowStockProducts = useMemo(() => {
    const alerts: { storeId: string, storeName: string, productCode: string, productName: string, stock: number, min: number }[] = [];
    STORES.filter(s => s.id !== 'admin').forEach(store => {
       const sheet = sheets.find((sh: any) => sh.storeId === store.id && sh.month === month);
       if (sheet) {
          sheet.items.forEach((item: any) => {
             const p = products.find((pr: any) => pr.code === item.productCode);
             if (p && p.minNecessary > 0 && item.inventoryCount < p.minNecessary) {
                alerts.push({
                   storeId: store.id,
                   storeName: store.name,
                   productCode: p.code,
                   productName: p.name,
                   stock: item.inventoryCount,
                   min: p.minNecessary
                });
             }
          });
       }
    });
    return alerts;
  }, [month, products, sheets]);

  const grandTotals = useMemo(() => {
    return summaryData.reduce((acc, curr) => ({
      sales: acc.sales + curr.totalSales,
      usage: acc.usage + curr.usageTotal,
      inventory: acc.inventory + curr.inventoryTotal
    }), { sales: 0, usage: 0, inventory: 0 });
  }, [summaryData]);

  const overallRatio = grandTotals.sales > 0 ? (grandTotals.usage / grandTotals.sales) * 100 : 0;

  const exportCSV = () => {
    const headers = ['店舗', 'ステータス', '売上', '払出合計', '在庫合計', '材料比率'];
    const rows = summaryData.map(d => [
      d.name,
      d.status,
      d.totalSales,
      d.usageTotal,
      d.inventoryTotal,
      d.ratio.toFixed(2) + '%'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `材料集計_${month}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-grey text-white !border-0 shadow-lg shadow-slate-grey/20">
          <p className="text-ivory/70 text-sm font-medium mb-1 uppercase tracking-widest">全店 払出合計</p>
          <p className="text-3xl font-black text-ivory tracking-tighter">¥ {grandTotals.usage.toLocaleString()}</p>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-ivory/60 uppercase tracking-widest font-bold">
            <span>対象店舗: {summaryData.length}店</span>
            <span className="text-white bg-white/10 px-2 py-0.5 rounded-full">平均比率: {overallRatio.toFixed(2)}%</span>
          </div>
        </Card>
        <Card>
          <p className="text-dark-grey text-sm font-medium mb-1">全店 売上合計</p>
          <p className="text-3xl font-bold text-slate-grey">¥ {grandTotals.sales.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-dark-grey text-sm font-medium mb-1">全店 在庫合計</p>
          <p className="text-3xl font-bold text-slate-grey">¥ {grandTotals.inventory.toLocaleString()}</p>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
         <Card title="⚠️ 在庫不足アラート" subtitle="必要最低在庫数を下回っている商品があります" className="border-red-200 mb-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {lowStockProducts.map((a, i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-lg text-sm">
                 <div className="flex flex-col">
                   <span className="font-bold text-red-800">{a.storeName}: {a.productName}</span>
                   <span className="text-red-600 font-medium">在庫: {a.stock} <span className="text-red-400">/ 最低: {a.min}</span></span>
                 </div>
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addToRestockMemo(a)} 
                    className="bg-white border-red-200 text-red-700 hover:bg-red-100"
                  >
                    補充メモへ
                  </Button>
               </div>
             ))}
           </div>
         </Card>
      )}

      <Card title={`${month} 店舗別稼働・集計状況`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-dark-grey">店舗絞り込み:</span>
              <select 
                value={storeFilter} 
                onChange={(e) => setStoreFilter(e.target.value)}
                className="bg-ivory/50 border border-dark-grey/20 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-slate-grey outline-none font-bold text-slate-grey"
              >
                <option value="all">全店舗を表示</option>
                {STORES.filter(s => s.id !== 'admin').map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-wider">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 完了: {allSummaryData.filter(d => d.status === '完了').length}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-ivory text-dark-grey rounded-full text-[10px] font-black border border-gray-200 uppercase tracking-wider">
               <div className="w-1.5 h-1.5 rounded-full bg-dark-grey"></div> 未入力: {allSummaryData.filter(d => d.status === '未入力').length}
            </div>
          </div>
          <Button variant="secondary" icon={Download} onClick={exportCSV}>CSV出力</Button>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead className="bg-slate-grey/5 text-slate-grey text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold border-b border-gray-100">店舗名</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 text-center">状況</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 text-right">売上</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 text-right">払出合計</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 text-right">在庫合計</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 text-center">材料比率</th>
                <th className="px-6 py-4 font-bold border-b border-gray-100 text-center">メモ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {summaryData.map(d => (
                <tr key={d.id} className="hover:bg-ivory/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-grey">{d.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                      d.status === '完了' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-dark-grey font-medium">¥ {d.totalSales.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-grey">¥ {d.usageTotal.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-dark-grey">¥ {d.inventoryTotal.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center min-w-[120px]">
                    <div className="bg-ivory w-full rounded-full h-1.5 mb-1 overflow-hidden">
                      <div className="bg-slate-grey h-full" style={{ width: `${Math.min(d.ratio, 100)}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-dark-grey">{d.ratio.toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {d.memoCount > 0 ? (
                      <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center justify-center gap-1 border border-orange-100 inline-flex">
                        <ClipboardList size={10} /> {d.memoCount}
                      </span>
                    ) : (
                      <span className="text-gray-200">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

const SupplierOrderView = ({ products }: { products: Product[] }) => {
  const grouped = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    products.filter(p => p.active).forEach(p => {
      const supplier = p.orderTo || '未設定';
      if (!groups[supplier]) groups[supplier] = [];
      groups[supplier].push(p);
    });
    return groups;
  }, [products]);

  return (
    <div className="space-y-6">
       {Object.keys(grouped).map(supplier => (
         <Card key={supplier} title={`発注先: ${supplier}`}>
           <table className="w-full text-left">
             <thead>
               <tr className="border-b">
                 <th className="py-2"></th>
                 <th className="py-2">コード</th>
                 <th className="py-2">商品名</th>
                 <th className="py-2">原価</th>
               </tr>
             </thead>
             <tbody>
               {grouped[supplier].map(p => (
                 <tr key={p.code} className="border-b">
                   <td className="py-2"><input type="checkbox" /></td>
                   <td className="py-2 font-mono text-xs">{p.code}</td>
                   <td className="py-2 font-bold">{p.name}</td>
                   <td className="py-2">¥{p.cost.toLocaleString()}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </Card>
       ))}
    </div>
  );
};

const MasterView = ({ products, setProducts, showNotification }: any) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'order'>('list');

  const defaultProduct: Product = {
    code: '',
    name: '',
    category: 'カラー剤',
    supplier: '',
    orderDestination: '',
    capacity: '',
    unit: '本',
    cost: 0,
    minNecessary: 0,
    orderTo: '事務所',
    usageType: '消耗品',
    targetStores: STORES.map(s => s.id),
    active: true
  };

  const handleImport = () => {
    try {
      const lines = importText.split('\n');
      const newImportedProducts: Product[] = [];
      let headerIndices: any = {};

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return; // Skip empty lines

        // Detect separator (Tab or Comma)
        const separator = trimmedLine.includes('\t') ? '\t' : ',';
        const cols = trimmedLine.split(separator).map(c => c.trim().replace(/^"|"$/g, ''));

        // Header detection: check if any cell contains the keywords
        const isHeaderRow = cols.some(c => c.includes('商品名') || c.includes('原価') || c.includes('仕入先'));
        
        if (isHeaderRow && Object.keys(headerIndices).length === 0) {
          const lowerCols = cols.map(c => c.replace(/\s+/g, ''));
          headerIndices = {
            code: lowerCols.findIndex(c => c.includes('コード')),
            name: lowerCols.findIndex(c => c.includes('商品名') || c.includes('商品名（省略表記）')),
            supplier: lowerCols.findIndex(c => c.includes('仕入先')),
            capacity: lowerCols.findIndex(c => c.includes('容量')),
            cost: lowerCols.findIndex(c => c.includes('原価')),
            order: lowerCols.findIndex(c => c.includes('発注先')),
            category: lowerCols.findIndex(c => c.includes('分類')),
          };
          return; // Skip the header row itself
        }

        // If headers not yet found, skip until we find them or assume first line if no header
        if (Object.keys(headerIndices).length === 0) return;

        const getVal = (idx: number) => (idx !== -1 && cols[idx]) ? cols[idx] : '';
        const nameVal = getVal(headerIndices.name);
        if (!nameVal) return; // Skip lines without a name

        const codeVal = getVal(headerIndices.code);
        const p: Product = {
          code: codeVal || Math.random().toString(10).substr(2, 6),
          supplier: getVal(headerIndices.supplier),
          name: nameVal,
          capacity: getVal(headerIndices.capacity),
          unit: '本',
          cost: parseInt(getVal(headerIndices.cost).replace(/[^\d]/g, '')) || 0,
          minNecessary: 0,
          orderTo: getVal(headerIndices.order) || '事務所',
          orderDestination: getVal(headerIndices.order),
          category: getVal(headerIndices.category) || 'その他',
          usageType: '消耗品',
          targetStores: STORES.map(s => s.id),
          active: true
        };
        newImportedProducts.push(p);
      });

      if (newImportedProducts.length === 0) {
        showNotification('有効なデータが見つかりませんでした。ヘッダー（項目名）が含まれているか確認してください。', 'error');
        return;
      }

      const merged = [...products];
      newImportedProducts.forEach(newP => {
        const idx = merged.findIndex(p => p.code === newP.code);
        if (idx >= 0) merged[idx] = newP;
        else merged.push(newP);
      });

      setProducts(merged);
      storage.saveProducts(merged);
      setIsImporting(false);
      setImportText('');
      showNotification(`${newImportedProducts.length}件の商品を取り込みました`);
    } catch (e) {
      console.error(e);
      showNotification('インポート中にエラーが発生しました。データの形式を確認してください。', 'error');
    }
  };

  const handleSave = (p: Product) => {
    let newProducts;
    if (editingProduct && !isAdding) {
      newProducts = products.map((item: Product) => item.code === p.code ? p : item);
    } else {
      if (products.find((item: Product) => item.code === p.code)) {
        showNotification('商品コードが既に存在します', 'error');
        return;
      }
      newProducts = [...products, p];
    }
    
    setProducts(newProducts);
    storage.saveProducts(newProducts);
    setEditingProduct(null);
    setIsAdding(false);
    showNotification('商品マスターを更新しました');
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    
    const codeToDel = productToDelete;
    const newProducts = products.filter((p: Product) => p.code !== codeToDel);
    
    setProducts(newProducts);
    storage.saveProducts(newProducts);
    
    setProductToDelete(null);
    showNotification('商品を削除しました');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-bold text-gray-800">
          {viewMode === 'list' ? `登録済み商品一覧 (${products.length})` : '発注先別商品確認'}
        </h3>
        <div className="flex gap-2">
          <Button variant={viewMode === 'list' ? 'primary' : 'secondary'} onClick={() => setViewMode('list')}>商品一覧</Button>
          <Button variant={viewMode === 'order' ? 'primary' : 'secondary'} onClick={() => setViewMode('order')}>発注リスト</Button>
          {viewMode === 'list' && (
            <>
              <Button variant="secondary" icon={FileSpreadsheet} onClick={() => setIsImporting(true)}>一括取込</Button>
              <Button icon={Plus} onClick={() => { setIsAdding(true); setEditingProduct(defaultProduct); }}>新規商品を登録</Button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        <Card>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left">
              <thead className="bg-slate-grey/5 text-slate-grey text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-gray-100">コード / 商品名</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100">分類 / 仕入先</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100">容量 / 単位</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100">仕入原価</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {products.map((p: any) => (
                  <tr key={p.code} className="hover:bg-ivory/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-[10px] text-dark-grey font-mono uppercase tracking-widest">{p.code}</p>
                      <p className="font-bold text-slate-grey">{p.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-grey/80">{p.category}</p>
                      <p className="text-xs text-dark-grey">{p.supplier}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-grey">{p.capacity} / {p.unit}</td>
                    <td className="px-6 py-4 font-bold text-slate-grey">¥ {p.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingProduct(p); }}>編集</Button>
                        <Button 
                          variant="ghost" 
                          icon={Trash2} 
                          onClick={() => setProductToDelete(p.code)} 
                          className="text-red-400 hover:text-red-600 hover:bg-red-50" 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <SupplierOrderView products={products} />
      )}

      {/* Import Modal */}
      <AnimatePresence>
        {isImporting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">マスターデータ一括取込</h3>
                <button onClick={() => setIsImporting(false)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-4">
                <div className="bg-ivory p-4 rounded-xl border border-gray-100 text-sm text-slate-grey space-y-2">
                  <p className="font-bold flex items-center gap-2"><CheckCircle2 size={16}/> 取り込み可能な形式</p>
                  <p>Excel等の表から「項目名（ヘッダー）」を含めてコピー＆ペーストしてください。</p>
                  <p className="text-[10px] opacity-60 font-medium">対象項目: コード、仕入先、商品名、容量、原価、発注先、分類</p>
                </div>
                <textarea 
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="ここにデータを貼り付けてください（タブまたはカンマ区切り）"
                  className="w-full h-80 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-grey outline-none text-xs font-mono overflow-y-auto bg-gray-50 leading-relaxed shadow-inner"
                />
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsImporting(false)}>キャンセル</Button>
                <Button icon={CheckCircle2} onClick={handleImport} className="min-w-[120px]">取り込みを実行</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">商品を削除しますか？</h3>
              <p className="text-gray-500 mb-8">
                商品コード: <span className="font-mono font-bold text-gray-700">{productToDelete}</span><br/>
                この操作は取り消せません。
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setProductToDelete(null)} className="flex-1">キャンセル</Button>
                <Button variant="danger" onClick={confirmDelete} className="flex-1">削除する</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{isAdding ? '新規商品登録' : '商品情報の編集'}</h3>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                <Input label="商品コード" disabled={!isAdding} value={editingProduct.code} onChange={(v: string) => setEditingProduct({...editingProduct, code: v})} required />
                <Input label="商品名" value={editingProduct.name} onChange={(v: string) => setEditingProduct({...editingProduct, name: v})} required />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">分類</label>
                  <select 
                    value={editingProduct.category} 
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-grey font-bold text-slate-grey"
                  >
                    <option value="カラー剤">カラー剤</option>
                    <option value="ヘアケア">ヘアケア</option>
                    <option value="スタイリング">スタイリング</option>
                    <option value="パーマ・縮毛">パーマ・縮毛</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <Input label="仕入先" value={editingProduct.supplier} onChange={(v: string) => setEditingProduct({...editingProduct, supplier: v})} />
                <Input label="発注先" value={editingProduct.orderDestination} onChange={(v: string) => setEditingProduct({...editingProduct, orderDestination: v})} />
                <Input label="容量 (例: 80g)" value={editingProduct.capacity} onChange={(v: string) => setEditingProduct({...editingProduct, capacity: v})} />
                <Input label="単位 (例: 本)" value={editingProduct.unit} onChange={(v: string) => setEditingProduct({...editingProduct, unit: v})} />
                <Input label="仕入原価 (税込)" type="number" value={editingProduct.cost} onChange={(v: string) => setEditingProduct({...editingProduct, cost: parseInt(v) || 0})} required />
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setEditingProduct(null)}>キャンセル</Button>
                <Button icon={Save} onClick={() => handleSave(editingProduct)}>保存する</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Helper components
const NavButton = ({ children, icon: Icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-slate-grey text-white shadow-lg shadow-slate-grey/20' 
        : 'text-dark-grey hover:bg-ivory hover:text-slate-grey'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-dark-grey/60 group-hover:text-slate-grey'} />
    <span className="font-bold uppercase tracking-tight text-sm">{children}</span>
    {active && <ChevronRight className="ml-auto opacity-50" size={16} />}
  </button>
);

