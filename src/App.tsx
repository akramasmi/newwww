import { useState } from 'react';

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
}

const supplements: Product[] = [
  {
    id: 1,
    name: 'واي بروتين إيزولات',
    category: 'مكملات',
    price: 299,
    oldPrice: 399,
    image: '🥤',
    description: 'بروتين نقي عالي الجودة لبناء العضلات',
    rating: 4.8,
    badge: 'الأكثر مبيعاً',
  },
  {
    id: 2,
    name: 'كرياتين مونوهيدرات',
    category: 'مكملات',
    price: 149,
    oldPrice: 199,
    image: '💪',
    description: 'يزيد القوة والأداء الرياضي بنسبة 20%',
    rating: 4.9,
    badge: 'جديد',
  },
  {
    id: 3,
    name: 'بي سي إيه إيه',
    category: 'مكملات',
    price: 189,
    oldPrice: 249,
    image: '⚡',
    description: 'أحماض أمينية أساسية لتعافي العضلات',
    rating: 4.7,
    badge: '',
  },
  {
    id: 4,
    name: 'بري وركاوت',
    category: 'مكملات',
    price: 179,
    oldPrice: 229,
    image: '🔥',
    description: 'طاقة مركزة قبل التمرين',
    rating: 4.6,
    badge: 'عرض خاص',
  },
];

const equipment: Product[] = [
  {
    id: 5,
    name: 'حزام رفع أثقال',
    category: 'تجهيزات',
    price: 129,
    oldPrice: 179,
    image: '🏋️',
    description: 'حزام جلد طبيعي لحماية الظهر',
    rating: 4.8,
    badge: '',
  },
  {
    id: 6,
    name: 'قفازات تدريب',
    category: 'تجهيزات',
    price: 79,
    oldPrice: 99,
    image: '🧤',
    description: 'قفازات مبطنة لراحة اليدين',
    rating: 4.5,
    badge: 'الأكثر مبيعاً',
  },
  {
    id: 7,
    name: 'حبل قفز احترافي',
    category: 'تجهيزات',
    price: 59,
    oldPrice: 89,
    image: '🤸',
    description: 'حبل قفز سريع للكارديو والإحماء',
    rating: 4.4,
    badge: '',
  },
  {
    id: 8,
    name: 'فوم رولر',
    category: 'تجهيزات',
    price: 99,
    oldPrice: 139,
    image: '🧘',
    description: 'أسطوانة تدليك لاسترخاء العضلات',
    rating: 4.7,
    badge: 'جديد',
  },
];

const allProducts: Product[] = [...supplements, ...equipment];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
      <span className="text-xs text-gray-500 mr-1">({rating})</span>
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center h-48">
        <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{product.image}</span>
        {product.badge && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
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
        <StarRating rating={product.rating} />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">{product.price} ر.س</span>
            <span className="text-sm text-gray-400 line-through">{product.oldPrice} ر.س</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-gradient-to-l from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-200 active:scale-95"
          >
            أضف للسلة
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState('');

  const filteredProducts =
    activeCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    setNotification(`تمت إضافة "${product.name}" إلى السلة`);
    setTimeout(() => setNotification(''), 2000);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
          ✓ {notification}
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">ع</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">عزيمة</h1>
              <p className="text-xs text-gray-500 -mt-1">مكملات وتجهيزات رياضية</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">الرئيسية</a>
            <a href="#products" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">المنتجات</a>
            <a href="#about" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">من نحن</a>
            <a href="#contact" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">تواصل معنا</a>
          </nav>

          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-orange-50 hover:bg-orange-100 text-orange-600 p-3 rounded-xl transition-colors"
          >
            <span className="text-xl">🛒</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)}></div>
          <div className="relative mr-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">🛒 سلة المشتريات</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl">🛒</span>
                  <p className="text-gray-500 mt-4">السلة فارغة</p>
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
                          className="text-red-400 hover:text-red-600 text-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-6 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600 font-medium">المجموع:</span>
                      <span className="text-2xl font-black text-gray-900">{cartTotal} ر.س</span>
                    </div>
                    <button className="w-full bg-gradient-to-l from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all">
                      إتمام الشراء
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <section id="home" className="relative overflow-hidden bg-gradient-to-bl from-gray-900 via-gray-800 to-black text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-orange-500/30">
              🔥 خصومات تصل إلى 40%
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
              <a
                href="#products"
                className="bg-gradient-to-l from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25"
              >
                تسوق الآن
              </a>
              <a
                href="#about"
                className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                اعرف المزيد
              </a>
            </div>
            <div className="flex gap-8 mt-12">
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

      <section className="py-12 bg-white border-b">
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

      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">منتجاتنا</h2>
            <p className="text-gray-500 mt-3">اختر من بين أفضل المكملات والتجهيزات الرياضية</p>
          </div>

          <div className="flex justify-center gap-3 mb-10">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'مكملات', label: '💊 مكملات غذائية' },
              { key: 'تجهيزات', label: '🏋️ تجهيزات رياضية' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeCategory === cat.key
                    ? 'bg-gradient-to-l from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

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
              <p className="text-gray-600 mt-4 leading-relaxed">
                فريقنا من الخبراء الرياضيين مستعد لمساعدتك في اختيار المنتجات المناسبة
                لأهدافك سواء كنت مبتدئاً أو محترفاً.
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

      <section id="contact" className="py-16 bg-gray-900 text-white">
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
              <div key={i} className="bg-gray-800 rounded-2xl p-6 text-center">
                <span className="text-4xl">{contact.icon}</span>
                <h3 className="font-bold text-lg mt-3">{contact.title}</h3>
                <p className="text-gray-400 mt-2">{contact.info}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
