import React, { useEffect, useState } from 'react';
import PremiumMotionSlider from './components/PremiumMotionSlider';
import CategoryListingGrid from './components/CategoryListingGrid';
import { SubCategoryItem } from './data/categories';

export type SectionId = 'slider' | 'categories' | 'custom_code_block' | 'products' | 'reels' | 'fraud_and_pnl';

interface ProductItem {
  id: string;
  title: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  imageUrl: string;
  reelUrl: string;
}

interface CartEntry {
  product: ProductItem;
  qty: number;
}

interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  zone: 'inside' | 'outside';
  items: { title: string; qty: number; price: number; buyPrice: number }[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
}

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
}

const STORAGE_KEY = 'bdsmartmall_v5_state';

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    title: 'প্রিমিয়াম কটন পোলো শার্ট',
    category: 'পোলো শার্ট',
    buyingPrice: 420,
    sellingPrice: 790,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    reelUrl: '',
  },
  {
    id: 'p2',
    title: 'সলিড উইন্টার হুডি',
    category: 'সলিড হুডি',
    buyingPrice: 550,
    sellingPrice: 990,
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
    reelUrl: '',
  },
  {
    id: 'p3',
    title: 'রেডিমেড থ্রিপিস কালেকশন',
    category: 'রেডিমেড থ্রিপিস',
    buyingPrice: 720,
    sellingPrice: 1290,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=600&q=80',
    reelUrl: '',
  },
];

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: 'exp_1', title: 'ফেসবুক ও অপারেশনাল খরচ', amount: 650 },
];

const DEFAULT_CUSTOM_HTML = `<div class="bd-custom-promo">
  <h3>🔥 স্পেশাল ফ্ল্যাশ ক্যাম্পেইন</h3>
  <p>ওপেন-বক্স ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে চেক করে পেমেন্ট করুন।</p>
</div>`;

const DEFAULT_CUSTOM_CSS = `.bd-custom-promo {
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(245,158,11,0.18), rgba(56,189,248,0.15));
  border: 1px solid rgba(251,191,36,0.35);
}
.bd-custom-promo h3 { margin: 0 0 6px; color: #fbbf24; }
.bd-custom-promo p { margin: 0; color: #e2e8f0; }
@keyframes bdPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.012); }
}
.bd-motion-card { animation: bdPulse 5s ease-in-out infinite; }`;

const DEFAULT_CUSTOM_JS = `console.log("BDSMARTMALL v5 Active");`;

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const saved = loadSavedState();

  const [isAdmin, setIsAdmin] = useState<boolean>(Boolean(saved?.isAdmin));
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [builderMode, setBuilderMode] = useState<'drag' | 'code'>('drag');
  const [sections, setSections] = useState<SectionId[]>(
    Array.isArray(saved?.sections) && saved.sections.length
      ? saved.sections
      : ['slider', 'categories', 'custom_code_block', 'products', 'reels', 'fraud_and_pnl']
  );
  const [draggedSection, setDraggedSection] = useState<SectionId | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  const [customHtml, setCustomHtml] = useState<string>(saved?.customHtml || DEFAULT_CUSTOM_HTML);
  const [customCss, setCustomCss] = useState<string>(saved?.customCss || DEFAULT_CUSTOM_CSS);
  const [customJs, setCustomJs] = useState<string>(saved?.customJs || DEFAULT_CUSTOM_JS);

  const [products, setProducts] = useState<ProductItem[]>(
    Array.isArray(saved?.products) && saved.products.length ? saved.products : INITIAL_PRODUCTS
  );
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>(
    Array.isArray(saved?.orders) ? saved.orders : []
  );
  const [expensesList, setExpensesList] = useState<ExpenseItem[]>(
    Array.isArray(saved?.expensesList) ? saved.expensesList : INITIAL_EXPENSES
  );
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Add / Edit product form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('সলিড হুডি');
  const [newBuy, setNewBuy] = useState('');
  const [newSell, setNewSell] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newReelUrl, setNewReelUrl] = useState('');

  // Checkout state (single product or cart)
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [directItem, setDirectItem] = useState<CartEntry | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [zone, setZone] = useState<'inside' | 'outside'>('inside');

  // Fraud, CSV, Dropshipping
  const [phone, setPhone] = useState('01712345678');
  const [fraudResult, setFraudResult] = useState<string>('নম্বর লিখে চেক করুন');
  const [csvStatus, setCsvStatus] = useState('');
  const [dropshipProvider, setDropshipProvider] = useState('CJ Dropshipping');
  const [dropshipCost, setDropshipCost] = useState('600');
  const [dropshipMargin, setDropshipMargin] = useState('35');
  const [dropshipStatus, setDropshipStatus] = useState('');

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const deliveryCharge = zone === 'inside' ? 70 : 120;

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isAdmin,
          sections,
          customHtml,
          customCss,
          customJs,
          products,
          orders,
          expensesList,
        })
      );
    } catch {}
  }, [isAdmin, sections, customHtml, customCss, customJs, products, orders, expensesList]);

  useEffect(() => {
    fetch(`${apiBase}/api/layout`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) {
          if (Array.isArray(data.sections) && data.sections.length) setSections(data.sections);
          if (typeof data.customHtml === 'string' && data.customHtml) setCustomHtml(data.customHtml);
          if (typeof data.customCss === 'string' && data.customCss) setCustomCss(data.customCss);
          if (typeof data.customJs === 'string' && data.customJs) setCustomJs(data.customJs);
        }
      })
      .catch(() => {});
  }, [apiBase]);

  const unlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'bd2026') {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPin('');
      setPinError('');
      setStatusMsg('অ্যাডমিন মোড চালু হয়েছে');
    } else {
      setPinError('ভুল পিন (পিন: bd2026)');
    }
  };

  const handleSelectSubCategory = (item: SubCategoryItem, groupTitle: string) => {
    setSelectedSubCategory(item.name);
    setNewCategory(item.name);
    setStatusMsg(`${groupTitle} → ${item.name} (${item.count} আইটেম)`);
  };

  const runCustomJs = () => {
    try {
      const fn = new Function(customJs);
      fn();
      setStatusMsg('Custom JS রান হয়েছে');
    } catch (err) {
      setStatusMsg(`JS ত্রুটি: ${(err as Error).message}`);
    }
  };

  const moveSection = (fromId: SectionId, toId: SectionId) => {
    if (fromId === toId) return;
    setSections((prev) => {
      const copy = [...prev];
      const fromIdx = copy.indexOf(fromId);
      const toIdx = copy.indexOf(toId);
      copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, fromId);
      return copy;
    });
  };

  const saveAllCustomization = async () => {
    try {
      await fetch(`${apiBase}/api/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections, customHtml, customCss, customJs }),
      });
      setStatusMsg('লেআউট ও কাস্টম কোড ব্রাউজার ও সার্ভারে সেভ হয়েছে');
    } catch {
      setStatusMsg('লেআউট ও কাস্টম কোড ব্রাউজারে সেভ হয়েছে');
    }
  };

  const saveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    const buy = Number(newBuy) || 0;
    const sell = Number(newSell) || 0;
    const stock = Number(newStock) || 1;
    if (!newTitle.trim() || sell <= 0) {
      setStatusMsg('পণ্যের নাম ও বিক্রির দাম দিন');
      return;
    }
    const img =
      newImageUrl.trim() ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: newTitle.trim(),
                category: newCategory.trim() || 'General',
                buyingPrice: buy,
                sellingPrice: sell,
                stock,
                imageUrl: img,
                reelUrl: newReelUrl.trim(),
              }
            : p
        )
      );
      setEditingId(null);
      setStatusMsg('প্রোডাক্ট আপডেট হয়েছে');
    } else {
      setProducts((prev) => [
        {
          id: `p_${Date.now()}`,
          title: newTitle.trim(),
          category: newCategory.trim() || 'General',
          buyingPrice: buy,
          sellingPrice: sell,
          stock,
          imageUrl: img,
          reelUrl: newReelUrl.trim(),
        },
        ...prev,
      ]);
      setStatusMsg('নতুন প্রোডাক্ট যুক্ত হয়েছে');
    }
    setNewTitle('');
    setNewBuy('');
    setNewSell('');
    setNewImageUrl('');
    setNewReelUrl('');
  };

  const startEditProduct = (p: ProductItem) => {
    setEditingId(p.id);
    setNewTitle(p.title);
    setNewCategory(p.category);
    setNewBuy(String(p.buyingPrice));
    setNewSell(String(p.sellingPrice));
    setNewStock(String(p.stock));
    setNewImageUrl(p.imageUrl);
    setNewReelUrl(p.reelUrl);
    setStatusMsg(`এডিট করছেন: ${p.title}`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((c) => c.product.id !== id));
    setStatusMsg('প্রোডাক্ট মুছে ফেলা হয়েছে');
  };

  const addToCart = (p: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === p.id);
      if (existing) {
        return prev.map((c) => (c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { product: p, qty: 1 }];
    });
    setStatusMsg(`কার্টে যুক্ত হয়েছে: ${p.title}`);
  };

  const openDirectOrder = (p: ProductItem) => {
    setDirectItem({ product: p, qty: 1 });
    setCheckoutOpen(true);
  };

  const openCartOrder = () => {
    if (!cart.length) return;
    setDirectItem(null);
    setCheckoutOpen(true);
  };

  const activeOrderLines = directItem ? [directItem] : cart;
  const orderSubtotal = activeOrderLines.reduce((sum, entry) => sum + entry.product.sellingPrice * entry.qty, 0);
  const orderBuyTotal = activeOrderLines.reduce((sum, entry) => sum + entry.product.buyingPrice * entry.qty, 0);

  const submitCodOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderLines.length || !customerName.trim() || !customerPhone.trim()) return;
    const total = orderSubtotal + deliveryCharge;
    const newOrder: OrderRecord = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || 'বাংলাদেশ',
      zone,
      items: activeOrderLines.map((c) => ({
        title: c.product.title,
        qty: c.qty,
        price: c.product.sellingPrice,
        buyPrice: c.product.buyingPrice,
      })),
      subtotal: orderSubtotal,
      deliveryFee: deliveryCharge,
      totalAmount: total,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    if (!directItem) {
      setCart([]);
    }
    setDirectItem(null);
    setCheckoutOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setStatusMsg(
      `অর্ডার কনফার্ম (${newOrder.id})! মোট ৳${total} (ওপেন-বক্স COD, ডেলিভারি ৳${deliveryCharge}) | WhatsApp: 01687920860`
    );

    try {
      await fetch(`${apiBase}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newOrder.id,
          customerName: newOrder.customerName,
          customerPhone: newOrder.customerPhone,
          customerAddress: newOrder.customerAddress,
          zone,
          subtotal: orderSubtotal,
          deliveryFee: deliveryCharge,
          totalAmount: total,
          costOfGoods: orderBuyTotal,
          items: newOrder.items,
        }),
      });
    } catch {}
  };

  const updateOrderStatus = (id: string, nextStatus: OrderRecord['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o)));
    setStatusMsg(`অর্ডার ${id} → ${nextStatus}`);
  };

  const addExpenseItem = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(expenseAmount);
    if (!expenseTitle.trim() || amt <= 0) return;
    setExpensesList((prev) => [
      { id: `exp_${Date.now()}`, title: expenseTitle.trim(), amount: amt },
      ...prev,
    ]);
    setExpenseTitle('');
    setExpenseAmount('');
    setStatusMsg('খরচ যুক্ত হয়েছে');
  };

  const deleteExpenseItem = (id: string) => {
    setExpensesList((prev) => prev.filter((x) => x.id !== id));
  };

  const runFraudCheck = async () => {
    const clean = phone.replace(/[^0-9]/g, '');
    try {
      const res = await fetch(`${apiBase}/api/fraud-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      setFraudResult(`স্কোর: ${data.fraudScore}/100 (${data.riskLevel}) — ${data.note}`);
      return;
    } catch {}

    const valid = /^01[3-9][0-9]{8}$/.test(clean);
    const lastDigit = clean.length ? Number(clean[clean.length - 1]) : 5;
    if (!valid) {
      setFraudResult('স্কোর: 25/100 (high) — সঠিক ১১ ডিজিটের BD নম্বর (01XXXXXXXXX) দিন।');
    } else if (lastDigit === 0) {
      setFraudResult('স্কোর: 48/100 (medium) — ডেলিভারি চার্জ অ্যাডভান্স নেওয়া নিরাপদ।');
    } else {
      setFraudResult('স্কোর: 92/100 (low) — ফুল ওপেন-বক্স COD উপযুক্ত।');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean).slice(1);
    const parsed = lines
      .map((line, i) => {
        const [title, buying, selling, stock, category, imageUrl] = line.split(',');
        return {
          id: `csv_${Date.now()}_${i}`,
          title: (title || '').trim(),
          buying_price: Number(buying || 0),
          selling_price: Number(selling || 0),
          stock: Number(stock || 10),
          category: (category || 'General').trim(),
          image_url: (imageUrl || '').trim(),
        };
      })
      .filter((p) => p.title && p.selling_price > 0);

    if (!parsed.length) {
      setCsvStatus('CSV-তে বৈধ (title,buying,selling,stock,category,imageUrl) সারি পাওয়া যায়নি।');
      return;
    }

    setProducts((prev) => [
      ...parsed.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        buyingPrice: c.buying_price,
        sellingPrice: c.selling_price,
        stock: c.stock,
        imageUrl:
          c.image_url ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        reelUrl: '',
      })),
      ...prev,
    ]);
    setCsvStatus(`${parsed.length}টি প্রোডাক্ট ক্যাটালগে যুক্ত হয়েছে।`);

    try {
      await fetch(`${apiBase}/api/products/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: parsed.slice(0, 100) }),
      });
    } catch {}
  };

  const syncDropshipping = async () => {
    const cost = Number(dropshipCost) || 500;
    const margin = Number(dropshipMargin) || 30;
    const syncedSell = Math.round(cost * (1 + margin / 100));

    setProducts((prev) => [
      {
        id: `ds_${Date.now()}`,
        title: `${dropshipProvider} স্যাম্পল আইটেম`,
        category: 'গ্যাজেটস',
        buyingPrice: cost,
        sellingPrice: syncedSell,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        reelUrl: '',
      },
      ...prev,
    ]);
    setDropshipStatus(`${dropshipProvider} (${margin}% মার্জিন) → বিক্রয় দাম ৳${syncedSell} ক্যাটালগে যুক্ত হয়েছে।`);

    try {
      await fetch(`${apiBase}/api/dropshipping/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: dropshipProvider, marginPercent: margin, sampleCost: cost }),
      });
    } catch {}
  };

  const shareProduct = (p: ProductItem) => {
    const shareText = `${p.title} (${p.category}) — ৳${p.sellingPrice} | ওপেন-বক্স COD (ঢাকা ৳70 / বাইরে ৳120) | WhatsApp: 01687920860`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setStatusMsg(`শেয়ার টেক্সট কপি হয়েছে: ${p.title}`);
  };

  const visibleProducts = selectedSubCategory
    ? products.filter((p) => p.category.toLowerCase().includes(selectedSubCategory.toLowerCase()))
    : products;

  // P&L Calculation: if orders exist, include real orders; else show catalog sample calculation
  const deliveredOrAllOrders = orders.length ? orders : [];
  const totalSales = deliveredOrAllOrders.length
    ? deliveredOrAllOrders.reduce((s, o) => s + o.subtotal, 0)
    : products.reduce((s, p) => s + p.sellingPrice, 0);
  const totalCost = deliveredOrAllOrders.length
    ? deliveredOrAllOrders.reduce(
        (s, o) => s + o.items.reduce((is, it) => is + it.buyPrice * it.qty, 0),
        0
      )
    : products.reduce((s, p) => s + p.buyingPrice, 0);
  const totalExpenses = expensesList.reduce((s, x) => s + x.amount, 0);
  const netProfit = totalSales - totalCost - totalExpenses;

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartSubtotal = cart.reduce((s, c) => s + c.product.sellingPrice * c.qty, 0);

  const visibleSections: SectionId[] = isAdmin
    ? sections
    : sections.filter((s) => s !== 'fraud_and_pnl');

  const sectionLabels: Record<SectionId, string> = {
    slider: 'হিরো মোশন গ্রাফিক্স ও স্লাইডার',
    categories: 'প্রোডাক্ট লিস্টিং ক্যাটাগরি (১৩ গ্রুপ)',
    custom_code_block: 'কাস্টম HTML / CSS / JS সেকশন',
    products: 'প্রোডাক্ট কার্ড, অর্ডার ও শেয়ার',
    reels: 'নেটিভ শপেবল রিলস ফিড',
    fraud_and_pnl: 'ফ্রড চেকার, CSV, ড্রপশিপিং ও লাভ-ক্ষতি',
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '18px 14px 72px' }}>
      <style>{customCss}</style>

      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800 }}>BDSMARTMALL</h1>
          <small style={{ color: '#94a3b8' }}>
            ঢাকা ডেলিভারি ৳70 | বাইরে ৳120 | ওপেন-বক্স COD | WhatsApp: 01687920860
          </small>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {cartCount > 0 && (
            <button
              type="button"
              onClick={openCartOrder}
              style={{ padding: '7px 12px', borderRadius: '10px', border: 'none', background: '#f59e0b', color: '#06101d', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
            >
              🛒 কার্ট ({cartCount}) — ৳{cartSubtotal}
            </button>
          )}

          {!isAdmin ? (
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              🔐 অ্যাডমিন স্টুডিও
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setBuilderMode('drag')}
                style={{ padding: '7px 11px', borderRadius: '10px', border: '1px solid #38bdf8', background: builderMode === 'drag' ? '#38bdf8' : 'transparent', color: builderMode === 'drag' ? '#06101d' : '#38bdf8', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                ⠿ ড্র্যাগ-অ্যান্ড-ড্রপ
              </button>
              <button
                type="button"
                onClick={() => setBuilderMode('code')}
                style={{ padding: '7px 11px', borderRadius: '10px', border: '1px solid #c084fc', background: builderMode === 'code' ? '#c084fc' : 'transparent', color: builderMode === 'code' ? '#06101d' : '#c084fc', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                {'</>'} HTML/CSS/JS
              </button>
              <button
                type="button"
                onClick={saveAllCustomization}
                style={{ padding: '7px 12px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#052e16', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                💾 সেভ
              </button>
              <button
                type="button"
                onClick={() => setIsAdmin(false)}
                style={{ padding: '7px 10px', borderRadius: '10px', border: '1px solid #475569', background: 'transparent', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                স্টোর ভিউ
              </button>
            </>
          )}
        </div>
      </header>

      {/* Admin PIN Modal */}
      {showAdminModal && (
        <div style={{ marginBottom: '16px', padding: '14px', borderRadius: '16px', background: '#0b1220', border: '1px solid #38bdf8' }}>
          <form onSubmit={unlockAdmin} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="অ্যাডমিন পিন (bd2026)"
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
            <button type="submit" style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: '#38bdf8', color: '#06101d', fontWeight: 700, cursor: 'pointer' }}>
              লগইন
            </button>
            <button type="button" onClick={() => setShowAdminModal(false)} style={{ padding: '8px 10px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
              বাতিল
            </button>
          </form>
          {pinError && <div style={{ marginTop: '6px', color: '#f87171', fontSize: '0.82rem' }}>{pinError}</div>}
        </div>
      )}

      {statusMsg && (
        <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', color: '#7dd3fc', fontSize: '0.88rem' }}>
          {statusMsg}
        </div>
      )}

      {/* COD Checkout Panel */}
      {checkoutOpen && activeOrderLines.length > 0 && (
        <div style={{ marginBottom: '18px', padding: '16px', borderRadius: '18px', background: '#0b1220', border: '1px solid #22c55e' }}>
          <h3 style={{ marginTop: 0, color: '#4ade80' }}>
            ওপেন-বক্স COD চেকআউট (সাবটোটাল ৳{orderSubtotal} + ডেলিভারি ৳{deliveryCharge})
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '10px' }}>
            আইটেম: {activeOrderLines.map((x) => `${x.product.title} ×${x.qty}`).join(', ')}
          </div>
          <form onSubmit={submitCodOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <input required placeholder="আপনার নাম" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            <input required placeholder="মোবাইল (01XXXXXXXXX)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            <input required placeholder="সম্পূর্ণ ঠিকানা" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            <select value={zone} onChange={(e) => setZone(e.target.value as 'inside' | 'outside')} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
              <option value="inside">ঢাকার ভেতরে (৳70)</option>
              <option value="outside">ঢাকার বাইরে (৳120)</option>
            </select>
            <button type="submit" style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#052e16', fontWeight: 800, cursor: 'pointer' }}>
              অর্ডার কনফার্ম (৳{orderSubtotal + deliveryCharge})
            </button>
            <button type="button" onClick={() => { setCheckoutOpen(false); setDirectItem(null); }} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #475569', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' }}>
              বন্ধ করুন
            </button>
          </form>
        </div>
      )}

      {/* Admin Custom HTML / CSS / JS Editor */}
      {isAdmin && builderMode === 'code' && (
        <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '18px', background: '#0b1220', border: '1px solid rgba(192,132,252,0.4)' }}>
          <h3 style={{ marginTop: 0, color: '#e9d5ff' }}>কাস্টম কোড এডিটর (HTML + CSS + JS)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Custom HTML</label>
              <textarea rows={5} value={customHtml} onChange={(e) => setCustomHtml(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '10px', background: '#070d19', color: '#f8fafc', border: '1px solid #334155', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Custom CSS</label>
              <textarea rows={5} value={customCss} onChange={(e) => setCustomCss(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '10px', background: '#070d19', color: '#7dd3fc', border: '1px solid #334155', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Custom JavaScript</label>
              <textarea rows={5} value={customJs} onChange={(e) => setCustomJs(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '10px', background: '#070d19', color: '#fde047', border: '1px solid #334155', fontFamily: 'monospace' }} />
              <button type="button" onClick={runCustomJs} style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#eab308', color: '#06101d', fontWeight: 700, cursor: 'pointer' }}>
                ▶ JS রান করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {visibleSections.map((secId, idx) => (
          <section
            key={secId}
            draggable={isAdmin && builderMode === 'drag'}
            onDragStart={() => setDraggedSection(secId)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedSection) moveSection(draggedSection, secId);
              setDraggedSection(null);
            }}
            style={{
              border: isAdmin && builderMode === 'drag' ? '1px dashed rgba(56,189,248,0.55)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '15px',
              background: 'rgba(15,23,42,0.75)',
            }}
          >
            {isAdmin && builderMode === 'drag' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.84rem', color: '#7dd3fc' }}>
                <span>⠿ {sectionLabels[secId]}</span>
                <span style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" disabled={idx === 0} onClick={() => moveSection(secId, visibleSections[idx - 1])} style={{ cursor: 'pointer' }}>↑</button>
                  <button type="button" disabled={idx === visibleSections.length - 1} onClick={() => moveSection(secId, visibleSections[idx + 1])} style={{ cursor: 'pointer' }}>↓</button>
                </span>
              </div>
            )}

            {secId === 'slider' && <PremiumMotionSlider showAiButton={isAdmin} />}

            {secId === 'categories' && (
              <CategoryListingGrid
                selectedSubCategory={selectedSubCategory}
                onSelectSubCategory={handleSelectSubCategory}
              />
            )}

            {secId === 'custom_code_block' && (
              <div dangerouslySetInnerHTML={{ __html: customHtml }} />
            )}

            {secId === 'products' && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0 }}>
                    প্রোডাক্ট কালেকশন {selectedSubCategory ? `(${selectedSubCategory})` : ''}
                  </h3>
                  {selectedSubCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedSubCategory('')}
                      style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      সব প্রোডাক্ট দেখুন
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <form onSubmit={saveProductForm} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                    <input placeholder="পণ্যের নাম" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input placeholder="ক্যাটাগরি" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input placeholder="ইমেজ URL (https://...)" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input placeholder="রিল URL (ঐচ্ছিক)" value={newReelUrl} onChange={(e) => setNewReelUrl(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input type="number" placeholder="কেনা দাম (৳)" value={newBuy} onChange={(e) => setNewBuy(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input type="number" placeholder="বিক্রির দাম (৳)" value={newSell} onChange={(e) => setNewSell(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input type="number" placeholder="স্টক" value={newStock} onChange={(e) => setNewStock(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <button type="submit" style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#38bdf8', color: '#06101d', fontWeight: 700, cursor: 'pointer' }}>
                      {editingId ? '✓ আপডেট' : '+ যুক্ত করুন'}
                    </button>
                  </form>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
                  {(visibleProducts.length ? visibleProducts : products).map((p) => {
                    const profitPerUnit = p.sellingPrice - p.buyingPrice;
                    return (
                      <div key={p.id} style={{ borderRadius: '16px', overflow: 'hidden', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          style={{ width: '100%', height: '165px', objectFit: 'cover', display: 'block', background: '#0f172a' }}
                        />
                        <div style={{ padding: '14px' }}>
                          <div style={{ fontSize: '0.76rem', color: '#c084fc', marginBottom: '4px' }}>{p.category}</div>
                          <div style={{ fontWeight: 700, fontSize: '1.02rem' }}>{p.title}</div>
                          <div style={{ marginTop: '6px', color: '#38bdf8', fontWeight: 800, fontSize: '1.05rem' }}>৳{p.sellingPrice}</div>
                          {isAdmin && (
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                              কেনা: ৳{p.buyingPrice} | লাভ: <strong style={{ color: profitPerUnit >= 0 ? '#4ade80' : '#f87171' }}>৳{profitPerUnit}</strong> | স্টক: {p.stock}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => openDirectOrder(p)}
                              style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#052e16', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                            >
                              অর্ডার করুন
                            </button>
                            <button
                              type="button"
                              onClick={() => addToCart(p)}
                              style={{ padding: '8px 10px', borderRadius: '10px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                            >
                              + কার্ট
                            </button>
                            <button
                              type="button"
                              onClick={() => shareProduct(p)}
                              style={{ padding: '8px 9px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}
                            >
                              🔗
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditProduct(p)}
                                  style={{ padding: '7px 9px', borderRadius: '8px', border: '1px solid #f59e0b', background: 'transparent', color: '#fbbf24', cursor: 'pointer', fontSize: '0.78rem' }}
                                >
                                  এডিট
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteProduct(p.id)}
                                  style={{ padding: '7px 9px', borderRadius: '8px', border: '1px solid #ef4444', background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem' }}
                                >
                                  ডিলিট
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {secId === 'reels' && (
              <div>
                <h3 style={{ marginTop: 0 }}>🎬 শপেবল রিলস</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
                  {products.map((p) => (
                    <div key={`reel_${p.id}`} style={{ borderRadius: '16px', overflow: 'hidden', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.76rem', color: '#a855f7' }}>
                            {p.reelUrl ? p.reelUrl : 'শপেবল প্রোডাক্ট রিল'}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{p.title}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDirectOrder(p)}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#06101d', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          ৳{p.sellingPrice}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && secId === 'fraud_and_pnl' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  {/* Fraud & Delivery */}
                  <div style={{ padding: '16px', borderRadius: '16px', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ marginTop: 0 }}>🛡️ ফ্রড চেকার ও ডেলিভারি চার্জ</h4>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                      <button type="button" onClick={runFraudCheck} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#06101d', fontWeight: 700, cursor: 'pointer' }}>চেক</button>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '10px' }}>{fraudResult}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setZone('inside')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #38bdf8', background: zone === 'inside' ? '#38bdf8' : 'transparent', color: zone === 'inside' ? '#06101d' : '#fff', cursor: 'pointer' }}>ঢাকা (৳70)</button>
                      <button type="button" onClick={() => setZone('outside')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #38bdf8', background: zone === 'outside' ? '#38bdf8' : 'transparent', color: zone === 'outside' ? '#06101d' : '#fff', cursor: 'pointer' }}>বাইরে (৳120)</button>
                    </div>
                  </div>

                  {/* CSV & Dropshipping */}
                  <div style={{ padding: '16px', borderRadius: '16px', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ marginTop: 0 }}>📦 CSV বাল্ক ও ড্রপশিপিং সিঙ্ক</h4>
                    <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} style={{ fontSize: '0.8rem', marginBottom: '8px', width: '100%' }} />
                    {csvStatus && <div style={{ fontSize: '0.8rem', color: '#4ade80', marginBottom: '8px' }}>{csvStatus}</div>}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <input value={dropshipProvider} onChange={(e) => setDropshipProvider(e.target.value)} style={{ flex: 1, minWidth: '100px', padding: '6px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '0.8rem' }} />
                      <input type="number" value={dropshipCost} onChange={(e) => setDropshipCost(e.target.value)} placeholder="কস্ট" style={{ width: '72px', padding: '6px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '0.8rem' }} />
                      <input type="number" value={dropshipMargin} onChange={(e) => setDropshipMargin(e.target.value)} placeholder="%" style={{ width: '58px', padding: '6px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '0.8rem' }} />
                    </div>
                    <button type="button" onClick={syncDropshipping} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#a855f7', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                      🔄 সিঙ্ক ও ক্যাটালগে যোগ
                    </button>
                    {dropshipStatus && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#e9d5ff' }}>{dropshipStatus}</div>}
                  </div>

                  {/* P&L + Expense Adder */}
                  <div style={{ padding: '16px', borderRadius: '16px', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ marginTop: 0 }}>📊 লাভ-ক্ষতি (P&L) ও খরচ</h4>
                    <div style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>
                      <div>মোট বিক্রয়: <strong>৳{totalSales}</strong></div>
                      <div>মোট কেনা দাম: <strong>৳{totalCost}</strong></div>
                      <div>মোট খরচ: <strong>৳{totalExpenses}</strong></div>
                      <div style={{ marginTop: '6px', fontSize: '1.05rem', color: netProfit >= 0 ? '#4ade80' : '#f87171', fontWeight: 800 }}>
                        {netProfit >= 0 ? `নেট লাভ: ৳${netProfit}` : `নেট ক্ষতি: ৳${Math.abs(netProfit)}`}
                      </div>
                    </div>
                    <form onSubmit={addExpenseItem} style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <input value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} placeholder="খরচের বিবরণ" style={{ flex: 1, minWidth: '100px', padding: '6px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '0.8rem' }} />
                      <input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="টাকা" style={{ width: '74px', padding: '6px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '0.8rem' }} />
                      <button type="submit" style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#052e16', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>+ খরচ</button>
                    </form>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {expensesList.map((ex) => (
                        <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1' }}>
                          <span>{ex.title}: ৳{ex.amount}</span>
                          <button type="button" onClick={() => deleteExpenseItem(ex.id)} style={{ border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                <div style={{ padding: '16px', borderRadius: '16px', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ marginTop: 0 }}>🧾 সাম্প্রতিক অর্ডারসমূহ ({orders.length})</h4>
                  {!orders.length ? (
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>এখনো কোনো নতুন অর্ডার জমা হয়নি। কোনো প্রোডাক্টে "অর্ডার করুন" চাপলে এখানে দেখাবে।</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {orders.map((o) => (
                        <div key={o.id} style={{ padding: '10px 12px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontSize: '0.85rem' }}>
                            <strong>{o.id}</strong> — {o.customerName} ({o.customerPhone}) | ৳{o.totalAmount} ({o.zone === 'inside' ? 'ঢাকা ৳70' : 'বাইরে ৳120'})
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{o.customerAddress} — {o.items.map((i) => `${i.title} ×${i.qty}`).join(', ')}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '999px', background: 'rgba(56,189,248,0.15)', color: '#7dd3fc' }}>{o.status}</span>
                            <button type="button" onClick={() => updateOrderStatus(o.id, 'confirmed')} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#38bdf8', color: '#06101d', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>কনফার্ম</button>
                            <button type="button" onClick={() => updateOrderStatus(o.id, 'delivered')} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#22c55e', color: '#052e16', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>ডেলিভারড</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
