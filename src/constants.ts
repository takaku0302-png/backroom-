import { User, Store, Product } from './types';

export const STORES: Store[] = [
  { id: 'admin', name: '本部' },
  { id: 'yachiyo', name: '八千代台' },
  { id: 'kitanara', name: '北習志野' },
  { id: 'takane', name: '高根公団' },
  { id: 'futawa', name: '二和向台' },
  { id: 'kamagaya', name: '鎌ヶ谷' },
  { id: 'goko', name: '五香' },
  { id: 'tokiwa', name: '常盤平' },
  { id: 'shinmatsu', name: '新松戸' },
];

export const INITIAL_USERS: User[] = [
  { id: 'admin123', name: '本部', role: 'admin', password: 'admin123' },
  { id: 'yachiyo123', name: '八千代台', role: 'staff', storeId: 'yachiyo', password: 'yachiyo123' },
  { id: 'kita123', name: '北習志野', role: 'staff', storeId: 'kitanara', password: 'kita123' },
  { id: 'takane123', name: '高根公団', role: 'staff', storeId: 'takane', password: 'takane123' },
  { id: 'futawa123', name: '二和向台', role: 'staff', storeId: 'futawa', password: 'futawa123' },
  { id: 'kama123', name: '鎌ヶ谷', role: 'staff', storeId: 'kamagaya', password: 'kama123' },
  { id: 'goko123', name: '五香', role: 'staff', storeId: 'goko', password: 'goko123' },
  { id: 'tokiwa123', name: '常盤平', role: 'staff', storeId: 'tokiwa', password: 'tokiwa123' },
  { id: 'shinmatsu123', name: '新松戸', role: 'staff', storeId: 'shinmatsu', password: 'shinmatsu123' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { code: 'P001', name: 'トステア t/カール&ストレート キーミスト (店販用)', supplier: 'リビック', capacity: '200ml', cost: 1650, minNecessary: 3, orderTo: '事務所', category: 'アウトバストリートメント', active: true },
  { code: 'P002', name: 'トステア T-コレクト SILK架橋エッセンス (営業用)', supplier: 'ダイアナ', capacity: '300ml', cost: 5867, minNecessary: 2, orderTo: '事務所', category: 'トリートメント', active: true },
  { code: 'P003', name: 'ルーチェリッチ カラー剤 (色味関係なし)', supplier: 'インターコスメ', capacity: '90g', cost: 352, minNecessary: 10, orderTo: '事務所', category: 'カラー', active: true },
  { code: 'P004', name: '重炭酸SPA 36錠入り', supplier: 'アートクライム', capacity: '1箱(36錠)', cost: 1848, minNecessary: 2, orderTo: 'タガミ', category: 'トリートメント', active: true },
  { code: 'P005', name: 'コンディショナー モイスト&エアリー', supplier: 'パミロール', capacity: '1', cost: 1595, minNecessary: 2, orderTo: '事務所', category: 'トリートメント', active: true },
  { code: 'P006', name: 'ナノサプリ シャンプー', supplier: 'サニープレイス', capacity: '800ml', cost: 495, minNecessary: 3, orderTo: 'タガミ', category: 'シャンプー', active: true },
  { code: 'P007', name: 'ナノサプリ コンディショナー', supplier: 'サニープレイス', capacity: '800ml', cost: 495, minNecessary: 3, orderTo: 'タガミ', category: 'トリートメント', active: true },
];
