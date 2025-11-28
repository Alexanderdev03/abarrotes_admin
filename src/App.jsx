import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Apple, Milk, SprayCan, ChevronRight, Trash2, Plus, Minus, Dog, Pill, Croissant, Baby, Package, Clock, CheckCircle, ArrowUpDown, Heart, Search, MapPin } from 'lucide-react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetails } from './components/ProductDetails';
import { BarcodeScanner } from './components/BarcodeScanner';
import { CheckoutModal } from './components/CheckoutModal';
import { OffersCarousel } from './components/OffersCarousel';
import { LoginModal } from './components/LoginModal';
import { Toast } from './components/Toast';
import { products, categories } from './data/products';

const iconMap = {
  Apple, Milk, SprayCan, Dog, Pill, Croissant, Baby
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isScanning, setIsScanning] = useState(false);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [flyingItem, setFlyingItem] = useState(null);
  const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLogin = (name) => {
    if (name) {
      const userData = { name, email: 'cliente@ejemplo.com' };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      showToast(`¡Bienvenido, ${name}!`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setOrders([]);
    setCart([]);
    setFavorites([]);
    setActiveTab('home');
    showToast('Sesión cerrada correctamente', 'info');
  };

  const addToCart = (product, event) => {
    // Trigger animation if event is provided
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setFlyingItem({
        image: product.image,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });

      // Reset flying item after animation
      setTimeout(() => setFlyingItem(null), 800);
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        showToast(`Cantidad actualizada: ${product.name}`);
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      showToast(`${product.name} agregado al carrito`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Producto eliminado del carrito', 'info');
  };

  const updateQuantity = (productId, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        showToast('Eliminado de favoritos', 'info');
        return prev.filter(item => item.id !== product.id);
      }
      showToast('Agregado a favoritos');
      return [...prev, product];
    });
  };

  const handleScan = (code) => {
    // Mock scan logic
    const product = products.find(p => p.id === parseInt(code) || p.name.toLowerCase().includes('leche')); // Mock match
    if (product) {
      addToCart(product);
      setIsScanning(false);
      showToast('¡Producto escaneado y agregado!');
    } else {
      showToast('Producto no encontrado', 'error');
      setIsScanning(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    setActiveTab('home');
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const placeOrder = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const handleConfirmOrder = (details) => {
    const newOrder = {
      id: Math.floor(Math.random() * 1000000),
      date: new Date().toLocaleDateString(),
      items: [...cart],
      total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      status: 'En camino'
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setShowCheckout(false);
    setActiveTab('profile'); // Redirect to profile to see the order
    showToast('¡Pedido realizado con éxito!');

    // WhatsApp Integration
    const phoneNumber = "9821041154"; // Replace with real number
    const itemsList = newOrder.items.map(item => `- ${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`).join('\n');
    const message = `¡Hola! Quiero realizar un pedido en Abarrotes Alex.\n\n*Pedido #${newOrder.id}*\n\n*Productos:*\n${itemsList}\n\n*Total: $${newOrder.total.toFixed(2)}*\n\n*Dirección de Entrega:*\n${details.address}\n\n*Método de Pago:*\n${details.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleReorder = (order) => {
    setCart(prev => {
      let newCart = [...prev];
      order.items.forEach(orderItem => {
        const existingIndex = newCart.findIndex(item => item.id === orderItem.id);
        if (existingIndex >= 0) {
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + orderItem.quantity
          };
        } else {
          newCart.push({ ...orderItem });
        }
      });
      return newCart;
    });
    setActiveTab('cart');
    showToast('¡Productos agregados al carrito!');
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0;
    });

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setSelectedCategory(null);
      setSearchQuery('');
    }
  };

  if (!user) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userName={user}
        onOpenScanner={() => setIsScanning(true)}
        products={products}
        onProductSelect={setSelectedProduct}
      />

      <main style={{ padding: '1rem', paddingBottom: '80px', paddingTop: '90px', flex: 1 }}>
        {activeTab === 'home' && (
          <>
            {/* Filter Status - Simplified */}
            {(selectedCategory || searchQuery) && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#e8f5e9',
                color: 'var(--color-primary-dark)',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                {selectedCategory ? `Categoría: ${selectedCategory}` : 'Resultados de búsqueda'}
              </div>
            )}

            {/* Departments Scroller - Only show if no category selected */}
            {!selectedCategory && !searchQuery && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <h3>Departamentos</h3>
                </div>
                <div className="hide-scrollbar" style={{
                  display: 'flex',
                  gap: '1rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem'
                }}>
                  {categories.map(category => {
                    const Icon = iconMap[category.icon] || ShoppingBasket;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.name)}
                        style={{
                          minWidth: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: category.color || '#fff3e0',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#333'
                        }}>
                          <Icon size={28} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Offers Banner - Only show on main home view */}
            {!selectedCategory && !searchQuery && (
              <OffersCarousel />
            )}

            {/* Product Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>
                {selectedCategory ? selectedCategory : (searchQuery ? 'Resultados' : 'Recomendados')}
              </h3>
              <button
                onClick={() => setSortOrder(prev => {
                  if (prev === null) return 'asc';
                  if (prev === 'asc') return 'desc';
                  return null;
                })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: sortOrder ? 'var(--color-primary)' : '#666',
                  borderColor: sortOrder ? 'var(--color-primary)' : '#ddd'
                }}
              >
                <ArrowUpDown size={16} />
                {sortOrder === 'asc' ? 'Menor Precio' : sortOrder === 'desc' ? 'Mayor Precio' : 'Ordenar'}
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>No se encontraron productos.</p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                  style={{ marginTop: '1rem', width: 'auto' }}
                >
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <div className="grid-2">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={addToCart}
                    isFavorite={favorites.some(fav => fav.id === product.id)}
                    onToggleFavorite={() => toggleFavorite(product)}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'categories' && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Todos los Departamentos</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              {categories.map(category => {
                const Icon = iconMap[category.icon] || ShoppingBasket;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                    style={{
                      backgroundColor: 'white',
                      padding: '1.5rem',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)'
                    }}>
                      <Icon size={24} />
                    </div>
                    <span style={{ fontWeight: '600', color: '#333' }}>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Tu Carrito</h2>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '3rem', color: '#888' }}>
                <ShoppingBasket size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Tu carrito está vacío</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '1rem', width: 'auto' }}
                  onClick={() => setActiveTab('home')}
                >
                  Ir a comprar
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      gap: '1rem'
                    }}>
                      <div style={{ width: '80px', height: '80px', backgroundColor: '#f9f9f9', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} style={{ color: '#999' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-primary" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          ${item.price.toFixed(2)}
                        </p>

                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          padding: '2px'
                        }}>
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{ padding: '4px 8px' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ padding: '0 8px', fontWeight: '600', fontSize: '0.9rem' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            style={{ padding: '4px 8px' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div style={{ marginTop: '2rem', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius)' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Cupón de descuento</h4>
                  <div className="flex-between" style={{ gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="EJ. ALEX10"
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button style={{
                      backgroundColor: '#2c3e50',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ marginTop: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius)' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#666' }}>Envío</span>
                    <span className="text-primary" style={{ fontWeight: 'bold' }}>Por confirmar</span>
                  </div>
                  <div className="flex-between" style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${cartTotal.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={placeOrder}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-secondary)',
                      color: 'var(--color-primary)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    Realizar Pedido
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ padding: '1rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Mi Cuenta</h2>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Mis Datos 👤</h3>

              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', marginBottom: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Nombre</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        const updatedUser = { ...user, name: newName };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Direcciones Guardadas</label>
                  {(() => {
                    const savedAddresses = JSON.parse(localStorage.getItem('addresses') || '[]');
                    if (savedAddresses.length === 0) return <p style={{ fontSize: '0.9rem', color: '#999', fontStyle: 'italic' }}>No hay direcciones guardadas.</p>;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {savedAddresses.map((addr, idx) => (
                          <div key={idx} className="flex-between" style={{
                            padding: '0.75rem',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <MapPin size={16} color="#666" />
                              <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr}</span>
                            </div>
                            <button
                              onClick={() => {
                                const newAddresses = savedAddresses.filter((_, i) => i !== idx);
                                localStorage.setItem('addresses', JSON.stringify(newAddresses));
                                // Force re-render (hacky but works for simple localStorage sync in this scope)
                                setActiveTab('profile');
                                showToast('Dirección eliminada', 'info');
                              }}
                              style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Mis Favoritos ❤️</h3>
              {favorites.length === 0 ? (
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: 'var(--radius)',
                  textAlign: 'center',
                  border: '1px dashed #ddd'
                }}>
                  <Heart size={48} color="#ddd" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: '#666', marginBottom: '1rem' }}>Guarda lo que te guste para después.</p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="btn btn-primary"
                    style={{ width: 'auto' }}
                  >
                    Explorar productos
                  </button>
                </div>
              ) : (
                <div className="grid-2">
                  {favorites.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={addToCart}
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(product)}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: '#666' }}>Historial de Pedidos</h3>
              {orders.length === 0 ? (
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: 'var(--radius)',
                  textAlign: 'center',
                  border: '1px dashed #ddd'
                }}>
                  <Package size={48} color="#ddd" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: '#666' }}>Aún no has realizado pedidos.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Package size={20} color="var(--color-primary)" />
                          <span style={{ fontWeight: 'bold' }}>Pedido #{order.id}</span>
                        </div>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{order.date}</span>
                      </div>

                      <div style={{ marginBottom: '0.75rem', paddingLeft: '28px' }}>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                          {order.items.length} productos • ${order.total.toFixed(2)}
                        </p>
                      </div>

                      {/* Expanded Details */}
                      {expandedOrderId === order.id && (
                        <div style={{
                          marginTop: '0.5rem',
                          marginBottom: '1rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px dashed #eee',
                          animation: 'fadeIn 0.3s'
                        }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                              <img src={item.image} alt="" style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#f5f5f5' }} />
                              <div style={{ flex: 1, fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: '500' }}>{item.name}</div>
                                <div style={{ color: '#666' }}>x{item.quantity}</div>
                              </div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex-between" style={{
                        backgroundColor: '#f5f5f5',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2e7d32' }}>
                          <Clock size={16} />
                          <span style={{ fontWeight: '500' }}>{order.status}</span>
                        </div>
                        <button
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          {expandedOrderId === order.id ? 'Ocultar detalles' : 'Ver detalles'}
                        </button>
                      </div>

                      <button
                        onClick={() => handleReorder(order)}
                        style={{
                          width: '100%',
                          marginTop: '0.75rem',
                          padding: '0.75rem',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <ShoppingBasket size={18} />
                        Volver a pedir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '2rem'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} cartCount={cartCount} />

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
          isFavorite={favorites.some(fav => fav.id === selectedProduct.id)}
          onToggleFavorite={() => toggleFavorite(selectedProduct)}
          onProductSelect={setSelectedProduct}
        />
      )}

      {/* Barcode Scanner */}
      {isScanning && (
        <BarcodeScanner
          onClose={() => setIsScanning(false)}
          onScan={handleScan}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onConfirm={handleConfirmOrder}
          total={cartTotal}
        />
      )}

      {/* Fly to Cart Animation */}
      {flyingItem && (
        <img
          src={flyingItem.image}
          alt=""
          style={{
            position: 'fixed',
            left: flyingItem.x,
            top: flyingItem.y,
            width: '50px',
            height: '50px',
            objectFit: 'contain',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9999,
            animation: 'flyToCart 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards'
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
