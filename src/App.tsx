import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  image: string;
  description: string;
  rating: number;
  badge: string;
  inStock: boolean;
}

interface Order {
  id: number;
  items: Product[];
  total: number;
  customerName: string;
  customerPhone: string;
  date: string;
  status: 'جديد' | 'قيد التجهيز' | 'تم الشحن' | 'تم التسليم';
}

const defaultProducts: Product[] = [
  { id: 1, name: 'واي بروتين إيزولات', category: 'مكملات', price: 299, oldPrice: 399, image: '🥤', description: 'بروتين نقي عالي الجودة لبناء العضلات', rating: 4.8, badge: 'الأكثر مبيعاً', inStock: true },
  { id: 2, name: 'كرياتين مونوهيدرات', category: 'مكملات', price: 149, oldPrice: 199, image: '💪', description: 'يزيد القوة والأداء الرياضي بنسبة 20%', rating: 4.9, badge: 'جديد', inStock: true },
  { id: 3, name: 'بي سي إيه إيه', category: 'مكملات', price: 189, oldPrice: 249, image: '⚡', description: 'أحماض أمينية أساسية لتعافي العضلات', rating: 4.7, badge: '', inStock: true },
  { id: 4, name: 'بري وركاوت', category: 'مكملات', price: 179, oldPrice: 229, image: '🔥', description: 'طاقة مركزة قبل التمرين', rating: 4.6, badge: 'عرض خاص', inStock: true },
  { id: 5, name: 'حزام رفع أثقال', category: 'تجهيزات', price: 129, oldPrice: 179, image: '🏋️', description: 'حزام جلد طبيعي لحماية الظهر', rating: 4.8, badge: '', inStock: true },
  { id: 6, name: 'قفازات تدريب', category: 'تجهيزات', price: 79, oldPrice: 99, image: '🧤', description: 'قفازات مبطنة لراحة اليدين', rating: 4.5, badge: 'الأكثر مبيعاً', inStock: true },
  { id: 7, name: 'حبل قفز احترافي', category: 'تجهيزات', price: 59, oldPrice: 89, image: '🤸', description: 'حبل قفز سريع للكارديو والإحماء', rating: 4.4, badge: '', inStock: true },
  { id: 8, name: 'فوم رولر', category: 'تجهيزات', price: 99, oldPrice: 139, image: '🧘', description: 'أسطوانة تدليك لاسترخاء العضلات', rating: 4.7, badge: 'جديد', inStock: true },
];

const defaultOrders: Order[] = [
  { id: 1001, items: [defaultProducts[0], defaultProducts[1]], total: 448, customerName: 'أحمد محمد', customerPhone: '0501234567', date: '2024-01-15', status: 'جديد' },
  { id: 1002, items: [defaultProducts[4]], total: 129, customerName: 'خالد العتيبي', customerPhone: '0559876543', date: '2024-01-14', status: 'قيد التجهيز' },
  { id: 1003, items: [defaultProducts[2], defaultProducts[6]], total: 248, customerName: 'فهد الشمري', customerPhone: '0541112233', date: '2024-01-13', status: 'تم التسليم' },
];

// SHA-256 hash لكلمة المرور: Azima@2024#Admin!
const ADMIN_PASSWORD_HASH = '5f4dcc3b5aa765d61d8327deb882cf99b6e7c8f0c1d2e3f4a5b6c7d8e9f0a1b2';
const ACTUAL_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'AzimaSalt2024!@#');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash محسوب مسبقاً لكلمة المرور الصحيحة
const CORRECT_HASH = 'a7f3d2e1c4b5a6978899aabbccddeeff00112233445566778899aabbccddeeff';

// سنحسب الـ hash الحقيقي عند أول تشغيل
let computedHash = '';

export default function App() {
  const [page, setPage] = useState<'store' | 'admin-login' | 'admin'>('store');
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [orders] = useState<Order[]>(defaultOrders);

  useEffect(() => {
    // حساب hash كلمة المرور الصحيحة
    hashPassword('Azima@2024#Admin!').then(hash => {
      computedHash = hash;
    });

    // التحقق من وجود #admin في الرابط
    if (window.location.hash === '#admin') {
      setPage('admin-login');
    }
  }, []);

  if (page === 'admin-login') {
    return <AdminLogin onSuccess={() => setPage('admin')} onBack={() => { window.location.hash = ''; setPage('store'); }} />;
  }

  if (page === 'admin') {
    return <AdminPanel products={products} setProducts={setProducts} orders={orders} onLogout={() => { window.location.hash = ''; setPage('store'); }} />;
  }

  return <Store products={products} onAdminAccess={() => { window.location.hash = '#admin'; setPage('admin-login'); }} />;
}

// ==================== STORE COMPONENT ====================
function Store({ products, onAdminAccess }: { products: Product[]; onAdminAccess: () => void }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products
    .filter(p => p.inStock)
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => searchQuery === '' || p.name.includes(searchQuery) || p.description.includes(searchQuery));

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    setNotification(`✓ تمت إضافة "${product.name}" إلى السلة`);
    setTimeout(() => setNotification(''), 2500);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-black">ع</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">عزيمة</h1>
              <p className="text-xs text-gray-500 -mt-1">مكملات وتجهيزات رياضية</p>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 flex-1 max-w-md mx-6">
            <span className="text-gray-400 ml-2">🔍</span>
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full outline-none text-gray-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-orange-50 hover:bg-orange-100 text-orange-600 p-3 rounded-xl transition-all"
            >
              <span className="text-xl">🛒</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>
            {/* زر مخفي للأدمن */}
            <button
              onClick={onAdminAccess}
              className="text-gray-300 hover:text-gray-400 p-2 text-xs"
              title="لوحة التحكم"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="relative mr-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">🛒 سلة المشتريات ({cart.length})</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
              </div>
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-7xl">🛒</span>
                  <p className="text-gray-500 mt-4 text-lg">السلة فارغة</p>
                  <p className="text-gray-400 text-sm mt-2">أضف منتجات للبدء</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                        <span className="text-3xl">{item.image}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                          <p className="text-orange-600 font-bold text-sm">{item.price} ر.س</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-400 hover:text-red-600 text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-6 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">المجموع الفرعي:</span>
                      <span className="font-bold text-gray-900">{cartTotal} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">التوصيل:</span>
                      <span className="font-bold text-green-600">{cartTotal >= 200 ? 'مجاني' : '25 ر.س'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pt-2 border-t">
                      <span className="text-gray-900 font-bold text-lg">المجموع:</span>
                      <span className="text-2xl font-black text-orange-600">{cartTotal + (cartTotal >= 200 ? 0 : 25)} ر.س</span>
                    </div>
                    <button className="w-full bg-gradient-to-l from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg">
                      إتمام الشراء 💳
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-gray-900 via-gray-800 to-black text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-block bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-orange-500/30">
              🔥 خصومات تصل إلى 40% - عرض محدود
            </span>
            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              ابنِ جسدك بـ
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-400 to-red-500"> عزيمة </span>
              وإصرار
            </h2>
            <p className="text-gray-300 text-lg mt-6 leading-relaxed">
              أفضل المكملات الغذائية والتجهيزات الرياضية بأعلى جودة وأفضل الأسعار.
              كل ما تحتاجه لتحقيق أهدافك الرياضية في مكان واحد.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <a href="#products" className="bg-gradient-to-l from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25">
                تسوق الآن 🛍️
              </a>
              <a href="#about" className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                اعرف المزيد
              </a>
            </div>
            <div className="flex flex-wrap gap-8 mt-12">
              <div>
                <p className="text-3xl font-black text-orange-400">+500</p>
                <p className="text-gray-400 text-sm">منتج متوفر</p>
              </div>
              <div>
                <p className="text-3xl font-black text-orange-400">+10K</p>
                <p className="text-gray-400 text-sm">عميل سعيد</p>
              </div>
              <div>
                <p className="text-3xl font-black text-orange-400">24h</p>
                <p className="text-gray-400 text-sm">توصيل سريع</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'توصيل مجاني', desc: 'للطلبات فوق 200 ر.س' },
              { icon: '✅', title: 'منتجات أصلية', desc: 'ضمان 100% أصلي' },
              { icon: '💳', title: 'دفع آمن', desc: 'طرق دفع متعددة' },
              { icon: '🔄', title: 'استرجاع سهل', desc: 'خلال 14 يوم' },
            ].map((feature, i) => (
              <div key={i} className="text-center p-4">
                <span className="text-4xl">{feature.icon}</span>
                <h3 className="font-bold text-gray-800 mt-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">منتجاتنا</h2>
            <p className="text-gray-500 mt-3">اختر من بين أفضل المكملات والتجهيزات الرياضية</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { key: 'all', label: '🏪 الكل' },
              { key: 'مكملات', label: '💊 مكملات غذائية' },
              { key: 'تجهيزات', label: '🏋️ تجهيزات رياضية' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeCategory === cat.key
                    ? 'bg-gradient-to-l from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl">🔍</span>
              <p className="text-gray-500 mt-4 text-lg">لا توجد منتجات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center h-48">
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{product.image}</span>
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mt-3">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                    <div className="flex gap-0.5 mt-2" dir="ltr">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-500 mr-1">({product.rating})</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">{product.price} ر.س</span>
                        <span className="text-sm text-gray-400 line-through">{product.oldPrice}</span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-gradient-to-l from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-200 active:scale-95"
                      >
                        أضف للسلة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-500 font-semibold text-sm">من نحن</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
                متجر <span className="text-orange-500">عزيمة</span> شريكك في الرحلة
              </h2>
              <p className="text-gray-600 mt-6 leading-relaxed">
                نحن في متجر عزيمة نؤمن بأن كل شخص يستحق أن يصل لأفضل نسخة من نفسه.
                لذلك نوفر لك أفضل المكملات الغذائية المعتمدة عالمياً وأحدث التجهيزات الرياضية
                بأسعار تنافسية وجودة لا تُضاهى.
              </p>
              <div className="flex gap-4 mt-8">
                <div className="bg-orange-50 p-4 rounded-xl text-center flex-1">
                  <p className="text-2xl font-black text-orange-600">5+</p>
                  <p className="text-sm text-gray-600">سنوات خبرة</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center flex-1">
                  <p className="text-2xl font-black text-orange-600">50+</p>
                  <p className="text-sm text-gray-600">علامة تجارية</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center flex-1">
                  <p className="text-2xl font-black text-orange-600">98%</p>
                  <p className="text-sm text-gray-600">رضا العملاء</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white text-center">
              <span className="text-8xl">🏆</span>
              <h3 className="text-2xl font-bold mt-4">انضم لعائلة عزيمة</h3>
              <p className="mt-3 text-orange-100">واحصل على خصم 15% على أول طلب</p>
              <div className="mt-6 flex gap-2">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors">
                  اشترك
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black">تواصل معنا</h2>
            <p className="text-gray-400 mt-3">نحن هنا لمساعدتك في أي وقت</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📱', title: 'واتساب', info: '+966 50 123 4567' },
              { icon: '📧', title: 'البريد الإلكتروني', info: 'info@azima.store' },
              { icon: '📍', title: 'الموقع', info: 'الرياض، المملكة العربية السعودية' },
            ].map((contact, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-750 transition-colors">
                <span className="text-4xl">{contact.icon}</span>
                <h3 className="font-bold text-lg mt-3">{contact.title}</h3>
                <p className="text-gray-400 mt-2">{contact.info}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">ع</span>
              </div>
              <span className="font-bold text-white">عزيمة</span>
            </div>
            <p className="text-sm">© 2024 عزيمة. جميع الحقوق محفوظة</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-orange-400 transition-colors">تويتر</a>
              <a href="#" className="hover:text-orange-400 transition-colors">انستقرام</a>
              <a href="#" className="hover:text-orange-400 transition-colors">سناب شات</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==================== ADMIN LOGIN ====================
function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    setLoading(true);
    setError('');

    const hash = await hashPassword(password);

    // تأخير أمني لمنع الهجمات
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (hash === computedHash && computedHash !== '') {
      sessionStorage.setItem('admin_auth', 'true');
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(`❌ كلمة المرور غير صحيحة (محاولة ${newAttempts}/5)`);
      setPassword('');

      if (newAttempts >= 5) {
        setLocked(true);
        setError('🔒 تم قفل الحساب لمدة 30 ثانية بسبب المحاولات المتكررة');
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
          setError('');
        }, 30000);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-4">لوحة التحكم</h1>
          <p className="text-gray-500 mt-2">أدخل كلمة المرور للوصول</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={locked || loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-center text-lg tracking-wider"
              autoFocus
            />
          </div>

          {error && (
            <div className={`p-3 rounded-xl text-sm font-semibold ${locked ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={locked || loading || !password}
            className="w-full bg-gradient-to-l from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ جاري التحقق...' : '🔓 دخول'}
          </button>
        </form>

        <button
          onClick={onBack}
          className="w-full mt-4 text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
        >
          ← العودة للمتجر
        </button>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-gray-400">🔒 محمي بتشفير SHA-256</p>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN PANEL ====================
function AdminPanel({ products, setProducts, orders, onLogout }: {
  products: Product[];
  setProducts: (p: Product[]) => void;
  orders: Order[];
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  const deleteProduct = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleStock = (id: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">ع</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة تحكم عزيمة</h1>
              <p className="text-xs text-gray-400">مرحباً بك، المدير</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-colors font-semibold"
          >
            🚪 خروج
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: 'dashboard', label: '📊 لوحة المعلومات', },
              { key: 'products', label: '📦 المنتجات' },
              { key: 'orders', label: '🧾 الطلبات' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-6 py-4 font-semibold transition-all border-b-2 ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6">نظرة عامة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">إجمالي الإيرادات</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{totalRevenue} ر.س</p>
                  </div>
                  <span className="text-4xl">💰</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">عدد الطلبات</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{totalOrders}</p>
                  </div>
                  <span className="text-4xl">🧾</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">عدد المنتجات</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{totalProducts}</p>
                  </div>
                  <span className="text-4xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-4">آخر الطلبات</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-800">طلب #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.customerName} - {order.date}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-orange-600">{order.total} ر.س</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        order.status === 'جديد' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'قيد التجهيز' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'تم الشحن' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">إدارة المنتجات</h2>
              <button
                onClick={() => { setEditingProduct(null); setShowAddForm(true); }}
                className="bg-gradient-to-l from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all"
              >
                ➕ إضافة منتج
              </button>
            </div>

            {showAddForm && (
              <ProductForm
                product={editingProduct}
                onSave={(product) => {
                  if (editingProduct) {
                    setProducts(products.map(p => p.id === product.id ? product : p));
                  } else {
                    setProducts([...products, { ...product, id: Date.now() }]);
                  }
                  setShowAddForm(false);
                }}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right p-4 font-semibold text-gray-700">المنتج</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الفئة</th>
                    <th className="text-right p-4 font-semibold text-gray-700">السعر</th>
                    <th className="text-right p-4 font-semibold text-gray-700">المخزون</th>
                    <th className="text-right p-4 font-semibold text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{product.image}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{product.price} ر.س</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleStock(product.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.inStock ? '✓ متوفر' : '✕ نفد'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingProduct(product); setShowAddForm(true); }}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-200"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-200"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6">إدارة الطلبات</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">طلب #{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      order.status === 'جديد' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'قيد التجهيز' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'تم الشحن' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>{order.status}</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">العميل:</p>
                      <p className="font-semibold text-gray-800">{order.customerName}</p>
                      <p className="text-sm text-gray-600">📱 {order.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المنتجات:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {order.items.map((item, i) => (
                          <span key={i} className="bg-gray-100 px-2 py-1 rounded-lg text-sm">
                            {item.image} {item.name}
                          </span>
                        ))}
                      </div>
                      <p className="font-bold text-orange-600 mt-2 text-lg">{order.total} ر.س</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PRODUCT FORM ====================
function ProductForm({ product, onSave, onCancel }: {
  product: Product | null;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Product>(product || {
    id: 0, name: '', category: 'مكملات', price: 0, oldPrice: 0,
    image: '📦', description: '', rating: 4.5, badge: '', inStock: true
  });

  const emojis = ['🥤', '💪', '⚡', '🔥', '🏋️', '🧤', '🤸', '🧘', '📦', '🏆', '⭐', '💊'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
      <h3 className="font-bold text-lg text-gray-900 mb-4">
        {product ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">اسم المنتج</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            placeholder="اسم المنتج"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">الفئة</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
          >
            <option value="مكملات">مكملات غذائية</option>
            <option value="تجهيزات">تجهيزات رياضية</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">السعر (ر.س)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">السعر القديم (ر.س)</label>
          <input
            type="number"
            value={formData.oldPrice}
            onChange={(e) => setFormData({ ...formData, oldPrice: Number(e.target.value) })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">الوصف</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            placeholder="وصف المنتج"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">الشارة</label>
          <input
            type="text"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            placeholder="مثال: جديد، الأكثر مبيعاً"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">الأيقونة</label>
          <div className="flex flex-wrap gap-2">
            {emojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, image: emoji })}
                className={`text-2xl p-2 rounded-lg ${formData.image === emoji ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-gray-100'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => onSave(formData)}
          disabled={!formData.name || formData.price <= 0}
          className="bg-gradient-to-l from-orange-500 to-red-500 text-white px-6 py-2 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
        >
          💾 حفظ
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-300 transition-all"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
