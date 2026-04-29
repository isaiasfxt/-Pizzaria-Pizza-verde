/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  X, 
  ChevronLeft, 
  ArrowRight, 
  Check, 
  Trash2, 
  Pizza, 
  Coffee, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  CreditCard,
  Settings
} from 'lucide-react';
import { Product, CartItem, Category } from './types.ts';
import { INITIAL_PRODUCTS, PIZZARIA_CONFIG, COLORS } from './constants.ts';

// --- Utility Functions ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const generateWhatsAppUrl = (name: string, phone: string, address: string, paymentMethod: string, items: CartItem[], total: number) => {
  const itemsText = items.map(item => `- ${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ''}${item.extras?.length ? ` (Extras: ${item.extras.map(e => e.name).join(', ')})` : ''}`).join('\n');
  
  const text = `Novo Pedido 🍕\nNome: ${name}\nTelefone: ${phone}\nEndereço: ${address}\n\nPedido:\n${itemsText}\n\nTotal: ${formatCurrency(total)}\n\nForma de pagamento: ${paymentMethod}`;
  
  return `https://wa.me/${PIZZARIA_CONFIG.phone}?text=${encodeURIComponent(text)}`;
};

type Screen = 'HOME' | 'MENU' | 'CART' | 'CHECKOUT' | 'ADMIN';

// --- Components ---

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size: string | undefined, selectedExtras: { name: string; price: number }[], observation: string) => void;
}

function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(product.sizes?.[2] || ''); // Default to G if available
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; price: number }[]>([]);
  const [observation, setObservation] = useState('');

  const toggleExtra = (extra: { name: string; price: number }) => {
    setSelectedExtras(prev =>
      prev.find(e => e.name === extra.name)
        ? prev.filter(e => e.name !== extra.name)
        : [...prev, extra]
    );
  };

  const extrasTotal = selectedExtras.reduce((acc, e) => acc + e.price, 0);
  const total = (product.price + extrasTotal) * quantity;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <div className="relative h-2/5 flex-shrink-0">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute top-12 left-6 right-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-3 bg-black/20 backdrop-blur-md text-white rounded-2xl hover:bg-black/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-32">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">{product.name}</h2>
            <p className="text-slate-500 mt-2 leading-relaxed">{product.description}</p>
          </div>
          <div className="bg-primary-light text-primary py-2 px-4 rounded-xl font-bold text-xl">
            {formatCurrency(total)}
          </div>
        </div>

        {product.sizes && (
          <div className="mt-8">
            <h3 className="font-bold text-lg mb-3">Tamanho</h3>
            <div className="flex gap-3">
              {product.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-5 rounded-2xl font-black text-lg flex items-center justify-center transition-all border-2 ${
                    size === s
                      ? 'bg-primary text-white ring-4 ring-primary/20 border-primary shadow-lg shadow-primary/20'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.extras && product.extras.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-lg mb-3">Extras Opcionais</h3>
            <div className="space-y-3">
              {product.extras.map(extra => (
                <button
                  key={extra.name}
                  onClick={() => toggleExtra(extra)}
                  className={`w-full p-5 bg-white border-2 rounded-2xl flex items-center justify-between active:scale-[0.99] transition-all ${
                    selectedExtras.find(e => e.name === extra.name) ? 'border-primary bg-primary-light/30' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedExtras.find(e => e.name === extra.name) ? 'bg-primary border-primary' : 'border-slate-300'
                    }`}>
                      {selectedExtras.find(e => e.name === extra.name) && <Check size={16} className="text-white" />}
                    </div>
                    <span className="font-bold text-slate-700">{extra.name}</span>
                  </div>
                  <span className="text-primary font-black">{formatCurrency(extra.price)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="font-bold text-lg mb-3">Observações</h3>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Ex: Tirar cebola, pouco molho..."
            className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl h-32 focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none font-medium"
          />
        </div>

        <div className="mt-8 flex items-center justify-between p-2 bg-slate-200 rounded-3xl w-48 mx-auto shadow-inner">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center text-slate-800 active:scale-90 border border-slate-100"
          >
            <Minus size={24} />
          </button>
          <span className="font-black text-2xl w-10 text-center text-slate-900">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-12 bg-primary text-white shadow-lg shadow-primary/30 rounded-2xl flex items-center justify-center active:scale-90"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 pb-12 z-10">
        <button
          onClick={() => onAddToCart(product, quantity, size, selectedExtras, observation)}
          className="w-full py-6 bg-primary text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/40 active:scale-[0.98] transition-transform border-b-4 border-primary-dark"
        >
          Adicionar ao Carrinho
          <span className="text-white/60 font-normal">|</span>
          <span>{formatCurrency(total)}</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<Category>('pizzas_tradicionais');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'Pix' as 'Money' | 'Pix' | 'Card',
  });

  // Persist cart
  useEffect(() => {
    const savedCart = localStorage.getItem('pizza-verde-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pizza-verde-cart', JSON.stringify(cart));
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cart]);

  const addToCart = (product: Product, quantity: number, size: string | undefined, selectedExtras: { name: string; price: number }[] = [], observation: string = '') => {
    const extrasTotal = selectedExtras.reduce((acc, e) => acc + e.price, 0);
    const itemPrice = (product.price + extrasTotal) * quantity;
    
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size,
      extras: selectedExtras,
      observation,
      totalPrice: itemPrice,
    };
    
    setCart(prev => [...prev, newItem]);
    setSelectedProduct(null);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        const unitPrice = item.totalPrice / item.quantity;
        return {
          ...item,
          quantity: newQty,
          totalPrice: unitPrice * newQty
        };
      }
      return item;
    }));
  };

  const handleFinishOrder = () => {
    const url = generateWhatsAppUrl(formData.name, formData.phone, formData.address, formData.paymentMethod, cart, cartTotal);
    window.open(url, '_blank');
    // Optionally clear cart? User might want to keep it if they didn't actually send.
  };

  // --- Screens ---

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-screen pb-20"
    >
      <div className="p-6 pt-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Pizza className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Pizza Verde</h1>
        </div>
        <button 
          onClick={() => setCurrentScreen('ADMIN')}
          className="p-2 text-slate-400 hover:text-primary transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="px-6 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-black h-48 flex items-center p-8">
          <div className="relative z-10 w-2/3">
            <span className="text-primary font-bold text-sm tracking-widest uppercase">Oferta do Dia</span>
            <h2 className="text-white text-3xl font-bold mt-1">Combo Calabresa + Refri</h2>
            <p className="text-slate-400 mt-2">Peça agora e economize 15%</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400&auto=format&fit=crop" 
            alt="Pizza" 
            className="absolute right-[-40px] top-4 w-56 h-56 object-cover rounded-full rotate-12 opacity-80"
          />
        </div>
      </div>

      <div className="px-6 space-y-4">
        <h3 className="font-bold text-xl">Destaques</h3>
        <div className="grid grid-cols-2 gap-4">
          {products.slice(0, 4).map(product => (
            <div 
              key={product.id}
              onClick={() => {
                setSelectedProduct(product);
              }}
              className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-95 transition-transform cursor-pointer"
            >
              <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-2xl" />
              <div>
                <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                <p className="text-primary font-bold mt-1">{formatCurrency(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto px-6 pt-12 pb-6">
        <button 
          onClick={() => setCurrentScreen('MENU')}
          className="w-full py-6 bg-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/40 active:scale-[0.98] transition-transform border-b-4 border-primary-dark"
        >
          Fazer Pedido
          <ArrowRight size={22} />
        </button>
      </div>
    </motion.div>
  );

  const renderMenu = () => {
    const categories: { id: Category; label: string; icon: any }[] = [
      { id: 'pizzas_tradicionais', label: 'Tradicionais', icon: Pizza },
      { id: 'pizzas_especiais', label: 'Especiais', icon: Check },
      { id: 'bebidas', label: 'Bebidas', icon: Coffee },
      { id: 'combos', label: 'Combos', icon: Package },
    ];

    const filteredItems = products.filter(p => p.category === selectedCategory);

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-screen pb-24"
      >
        <div className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md px-6 pt-12 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setCurrentScreen('HOME')}
              className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">Nosso Cardápio</h2>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all border-2 ${
                  selectedCategory === cat.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 border-primary' 
                  : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <cat.icon size={18} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 space-y-4 pt-2">
          {filteredItems.map(item => (
            <motion.div 
              layout
              key={item.id}
              onClick={() => setSelectedProduct(item)}
              className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl flex-shrink-0" />
              <div className="flex flex-col justify-center flex-1">
                <h4 className="font-bold text-lg">{item.name}</h4>
                <p className="text-slate-500 text-xs line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-primary font-black text-lg">{formatCurrency(item.price)}</p>
                  <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                    <Plus size={24} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating Cart Bar */}
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-24 left-6 right-6 z-30"
          >
            <button 
              onClick={() => setCurrentScreen('CART')}
              className="w-full bg-primary text-white p-4 rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-between border-b-4 border-primary-dark active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Ver Carrinho</p>
                  <p className="font-black text-lg">{cart.length} {cart.length === 1 ? 'Item' : 'Itens'}</p>
                </div>
              </div>
              <p className="font-black text-xl">{formatCurrency(cartTotal)}</p>
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  };



  const renderCart = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen pb-32"
    >
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setCurrentScreen('MENU')}
            className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Carrinho</h2>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-12 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold">Seu carrinho está vazio</h3>
          <p className="text-slate-400 mt-2">Adicione algumas pizzas deliciosas para começar!</p>
          <button 
            onClick={() => setCurrentScreen('MENU')}
            className="mt-8 px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 border-b-4 border-primary-dark"
          >
            Ver Cardápio
          </button>
        </div>
      ) : (
        <div className="px-6 space-y-6">
          {cart.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                <img 
                  src={products.find(p => p.id === item.productId)?.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold leading-tight">{item.name}</h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {item.size ? `${item.size} • ` : ''}
                      {formatCurrency(item.totalPrice / item.quantity)} cada
                    </p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {item.extras && item.extras.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                    + {item.extras.map(e => e.name).join(', ')}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-600 active:scale-90"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(item.totalPrice)}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4">
             <div className="flex justify-between text-slate-500">
               <span>Subtotal</span>
               <span>{formatCurrency(cartTotal)}</span>
             </div>
             <div className="flex justify-between text-slate-500">
               <span>Taxa de Entrega</span>
               <span>{formatCurrency(PIZZARIA_CONFIG.deliveryFee)}</span>
             </div>
             <div className="h-px bg-slate-100" />
             <div className="flex justify-between items-center">
               <span className="font-bold text-xl">Total</span>
               <span className="font-black text-2xl text-primary">{formatCurrency(cartTotal + PIZZARIA_CONFIG.deliveryFee)}</span>
             </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 pb-12 z-10">
          <button 
             onClick={() => setCurrentScreen('CHECKOUT')}
             className="w-full py-6 bg-primary text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/40 active:scale-[0.98] transition-transform border-b-4 border-primary-dark"
          >
            Finalizar Pedido
            <ArrowRight size={24} />
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderCheckout = () => {
    const isFormValid = formData.name && formData.phone && formData.address;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col min-h-screen pb-32"
      >
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setCurrentScreen('CART')}
              className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">Finalização</h2>
          </div>
        </div>

        <div className="px-6 space-y-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <User size={18} className="text-primary" />
              Seus Dados
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Como devemos te chamar?" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Telefone / WhatsApp</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Endereço de Entrega
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Rua, Número e Bairro</label>
              <textarea 
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: Rua das Flores, 123 - Apt 42 - Centro" 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all h-24 resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Pagamento
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['Pix', 'Money', 'Card'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => setFormData({ ...formData, paymentMethod: method })}
                  className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold transition-all border ${
                    formData.paymentMethod === method 
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' 
                    : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="text-xs">{method === 'Pix' ? 'Pix' : method === 'Money' ? 'Dinheiro' : 'Cartão'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 pb-12 z-10">
          <button 
             disabled={!isFormValid}
             onClick={handleFinishOrder}
             className={`w-full py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] border-b-4 ${
               isFormValid 
               ? 'bg-[#25D366] text-white shadow-green-600/40 border-[#128C7E]' 
               : 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300'
             }`}
          >
            Enviar via WhatsApp
            <ArrowRight size={24} />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderAdmin = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen p-6 pt-12"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setCurrentScreen('HOME')}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Administração (Mock)</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold mb-4">Gerenciar Produtos</h3>
          <p className="text-slate-400 text-sm mb-6">Aqui você poderia editar o cardápio em tempo real. Implementação simplificada para demonstração.</p>
          
          <div className="space-y-4">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-primary text-xs font-bold">{formatCurrency(p.price)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-white text-slate-400 rounded-lg border border-slate-200">
                    <Settings size={16} />
                  </button>
                  <button className="p-2 bg-white text-red-400 rounded-lg border border-slate-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2">
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-2xl shadow-black/10">
      <AnimatePresence mode="wait">
        {currentScreen === 'HOME' && renderHome()}
        {currentScreen === 'MENU' && renderMenu()}
        {currentScreen === 'CART' && renderCart()}
        {currentScreen === 'CHECKOUT' && renderCheckout()}
        {currentScreen === 'ADMIN' && renderAdmin()}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAddToCart={addToCart} 
          />
        )}
      </AnimatePresence>

      {/* Persistent Navigation Bar (Optional, can be hidden on detail screens) */}
      {!selectedProduct && currentScreen !== 'CHECKOUT' && currentScreen !== 'ADMIN' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-3 pb-8 flex items-center justify-between z-40">
          <NavButton 
            active={currentScreen === 'HOME'} 
            onClick={() => setCurrentScreen('HOME')} 
            icon={Pizza} 
            label="Início" 
          />
          <NavButton 
            active={currentScreen === 'MENU'} 
            onClick={() => setCurrentScreen('MENU')} 
            icon={Package} 
            label="Menu" 
          />
          <div className="relative">
            <NavButton 
              active={currentScreen === 'CART'} 
              onClick={() => setCurrentScreen('CART')} 
              icon={ShoppingCart} 
              label="Carrinho" 
            />
            {cart.length > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white text-[12px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg z-50 shadow-red-600/30"
              >
                {cart.length}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-primary scale-110' : 'text-slate-400'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-primary text-white shadow-md shadow-primary/20' : ''}`}>
        <Icon size={26} />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
    </button>
  );
}

