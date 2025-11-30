import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Apple, Milk, SprayCan, ChevronRight, Trash2, Plus, Minus, Dog, Pill, Croissant, Baby, Package, Clock, CheckCircle, ArrowUpDown, Heart, Search, MapPin, Share2 } from 'lucide-react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetails } from './components/ProductDetails';
import { BarcodeScanner } from './components/BarcodeScanner';
import { CheckoutModal } from './components/CheckoutModal';
import { OffersCarousel } from './components/OffersCarousel';
import { LoginModal } from './components/LoginModal';
import { Toast } from './components/Toast';
import { Flyer } from './components/Flyer';
import { StoreMap } from './components/StoreMap';
import { FlashSale } from './components/FlashSale';
import { ComboSection } from './components/ComboSection';

import { AdminRouter } from './components/admin/AdminRouter';
import { Account } from './components/Account';
import { ProductSkeleton } from './components/ProductSkeleton';
import { api } from './services/api';
import { CombosGrid } from './components/CombosGrid';
import { HomeView } from './components/HomeView';

const iconMap = {
  ShoppingBasket, Apple, Milk, SprayCan, Dog, Pill, Croissant, Baby
};

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const allProducts = await api.products.getAll();
      const allCategories = await api.products.getCategories();
      setProducts(allProducts);
      setCategories(allCategories);
      setIsDataLoaded(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);





  const [activeTab, setActiveTab] = useState('home');
  const [adminView, setAdminView] = useState('dashboard');
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
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isScanning, setIsScanning] = useState(false);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedLists, setSavedLists] = useState(() => {
    const saved = localStorage.getItem('savedLists');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [flyingItem, setFlyingItem] = useState(null);
  const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }
  const [cartAnimating, setCartAnimating] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20); // Initial load count
  const [isSavingList, setIsSavingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Reload data when switching to home tab to ensure freshness
  useEffect(() => {
    if (activeTab === 'home') {
      loadData();
    }
  }, [activeTab]);


  // Simulate initial loading - REMOVED as we now have real async loading
  // useEffect(() => {
  //   const timer = setTimeout(() => setIsLoading(false), 1500);
  //   return () => clearTimeout(timer);
  // }, []);

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

  useEffect(() => {
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
  }, [savedLists]);

  // Update cart items when products change (e.g. price updates from Admin)
  useEffect(() => {
    if (products.length > 0 && cart.length > 0) {
      setCart(prevCart => {
        const updatedCart = prevCart.map(cartItem => {
          const latestProduct = products.find(p => p.id === cartItem.id);
          if (latestProduct) {
            // Update price and other details, keep quantity
            return {
              ...cartItem,
              price: latestProduct.price,
              name: latestProduct.name, // In case name changed
              image: latestProduct.image,
              originalPrice: latestProduct.originalPrice
            };
          }
          return cartItem;
        });

        // Check if any changes actually happened to avoid unnecessary re-renders/saves
        const hasChanges = JSON.stringify(updatedCart) !== JSON.stringify(prevCart);
        return hasChanges ? updatedCart : prevCart;
      });
    }
  }, [products]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLogin = (name) => {
    if (name) {
      const role = name.toLowerCase() === 'admin' ? 'admin' : 'client';
      const userData = { name, email: 'cliente@ejemplo.com', wallet: 0, role };
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

    // Trigger cart shake animation
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 400);

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

  const handleAddCombo = (combo) => {
    setCart(prev => {
      let newCart = [...prev];
      combo.items.forEach(item => {
        const existingIndex = newCart.findIndex(i => i.id === item.id);
        if (existingIndex >= 0) {
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + item.quantity
          };
        } else {
          // We need an image for the cart, use combo image as fallback if not in item
          newCart.push({ ...item, image: combo.image });
        }
      });
      return newCart;
    });
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 400);
    showToast(`¡Combo ${combo.name} agregado!`);
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



  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory(null); // Reset subcategory when category changes
    setSearchQuery('');
    setActiveTab('home');
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
  };

  const handleScan = (product) => {
    setIsScanning(false);
    if (product) {
      addToCart(product);
      showToast(`¡${product.name} agregado al carrito!`);
    } else {
      showToast('Producto no encontrado', 'error');
    }
  };

  const placeOrder = () => {
    if (!user) {
      showToast('Inicia sesión para continuar', 'error');
      return;
    }
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const startSaveList = () => {
    if (cart.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }
    setIsSavingList(true);
    setNewListName('');
  };

  const confirmSaveList = () => {
    if (!newListName.trim()) {
      showToast('Ingresa un nombre para la lista', 'error');
      return;
    }
    const newList = {
      id: Date.now(),
      name: newListName,
      items: [...cart],
      date: new Date().toLocaleDateString()
    };
    setSavedLists([...savedLists, newList]);
    showToast('Lista guardada correctamente');
    setIsSavingList(false);
  };

  const cancelSaveList = () => {
    setIsSavingList(false);
    setNewListName('');
  };

  const loadList = (list) => {
    setCart([...list.items]);
    showToast('Lista cargada al carrito');
  };

  const deleteList = (listId) => {
    setSavedLists(savedLists.filter(l => l.id !== listId));
    showToast('Lista eliminada');
  };

  const handleConfirmOrder = (details) => {
    const newOrder = {
      id: Math.floor(Math.random() * 1000000),
      date: new Date().toLocaleDateString(),
      items: [...cart],
      total: Math.max(0, cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) - (pointsToUse * 0.1)), // 1 point = $0.10
      pointsUsed: pointsToUse,
      status: 'En camino'
    };


    // Calculate points earned
    // Calculate points earned
    const pointsEarned = cart.reduce((acc, item) => acc + ((item.bonusPoints || 0) * item.quantity), 0);

    setUser(currentUser => {
      let updatedUser = { ...currentUser };
      let userUpdated = false;

      // Handle Coupon Consumption
      if (details.coupon) {
        // Filter by ID if available to remove specific coupon instance, otherwise by code
        const updatedCoupons = (currentUser.coupons || []).filter(c => {
          if (details.coupon.id && c.id) return c.id !== details.coupon.id;
          return c.code !== details.coupon.code;
        });
        updatedUser = { ...updatedUser, coupons: updatedCoupons };
        userUpdated = true;
      }

      // Handle Points Earned
      if (pointsEarned > 0) {
        updatedUser = { ...updatedUser, wallet: (updatedUser.wallet || 0) + pointsEarned };
        userUpdated = true;
        // Move toast outside or use effect, but for now it's fine here as side effect of event
      }

      if (userUpdated) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return currentUser;
    });

    if (pointsEarned > 0) {
      showToast(`¡Ganaste ${pointsEarned} puntos!`);
    }

    // Save to Firebase
    showToast('Guardando pedido en la nube...', 'info');
    OrderService.createOrder(newOrder)
      .then(id => {
        console.log("Order saved to Firebase with ID:", id);
        showToast('¡Pedido guardado en la nube!', 'success');
      })
      .catch(err => {
        console.error("Failed to save order to Firebase:", err);
        showToast('Error al guardar en la nube', 'error');
      });

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

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = pointsToUse * 0.1; // 1 point = $0.10
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const totalSavings = cart.reduce((acc, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return acc + ((item.originalPrice - item.price) * item.quantity);
    }
    return acc;
  }, 0);

  const handleShareCart = () => {
    if (cart.length === 0) return;

    const itemsList = cart.map(item => `- ${item.name} x${item.quantity}`).join('\n');
    const message = `¡Hola! Necesito comprar esto:\n\n${itemsList}\n\nTotal estimado: $${cartTotal.toFixed(2)}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
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

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesSubcategory = selectedSubcategory ? product.subcategory === selectedSubcategory : true;
      return matchesSearch && matchesCategory && matchesSubcategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0;
    });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // Cart calculations moved up

  // Best Sellers (Mock - just take first 4 products)
  const bestSellers = products.slice(0, 4);

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'home') {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSearchQuery('');
    }
  }

  // History API handling for Product Modal
  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    window.history.pushState({ modalOpen: true }, '', '#producto');
  };

  const handleCloseProduct = () => {
    // Check if we have a history state to go back to, otherwise just close
    if (window.history.state && window.history.state.modalOpen) {
      window.history.back();
    } else {
      setSelectedProduct(null);
    }
  };

  useEffect(() => {
    // Check URL hash on mount to set initial tab
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'producto') {
      setActiveTab(hash);
    }

    const handlePopState = (event) => {
      // Handle Modal Closing
      if (selectedProduct) {
        setSelectedProduct(null);
        return; // Stop here if we just closed a modal
      }

      // Handle Tab Navigation
      if (event.state && event.state.section) {
        setActiveTab(event.state.section);
      } else {
        // If no state or no section, we assume we are back at Home
        setActiveTab('home');
        // Also clear filters if we go back to home base
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setSearchQuery('');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedProduct]); // Add selectedProduct dependency to ensure we have fresh state

  function handleTabChange(tab) {
    if (tab === 'home') {
      if (activeTab !== 'home') {
        // If we are not on home, try to go back in history to reach home
        // This assumes the user navigated from Home -> Tab.
        // If they went Home -> Tab A -> Tab B, going back once might go to Tab A.
        // For simplicity and "Home Base" behavior, we might want to just reset.
        // But the requirement says: "Si el usuario toca el botón de 'Inicio' manualmente, usa history.back()"

        // We need to be careful. If we just push 'home', we build a stack.
        // If we use back(), we might exit if the stack is empty (unlikely if we came from home).

        // Let's check if we have state. If we have state.section, we are deep.
        if (window.history.state && window.history.state.section) {
          window.history.back();
        } else {
          // Fallback if we are somehow on a tab but without state (e.g. direct load)
          setActiveTab('home');
          // Clear URL hash
          window.history.replaceState(null, '', ' ');
        }
      } else {
        // Already on home, maybe clear filters
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setSearchQuery('');
      }
    } else {
      // Navigate to a new tab
      setActiveTab(tab);
      window.history.pushState({ section: tab }, '', `#${tab}`);
    }
  }

  if (!isDataLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos...</div>;
  }

  if (!user) {
    return <LoginModal onLogin={handleLogin} />;
  }

  if (activeTab === 'admin') {
    return (
      <AdminRouter
        activeView={adminView}
        onViewChange={setAdminView}
        onLogout={() => setActiveTab('home')}
        onExit={() => setActiveTab('home')}
      />
    );
  }

  return (
    <div className="app-container">
      {isScanning && <BarcodeScanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userName={user ? user.name : null}
        onOpenScanner={() => setIsScanning(true)}
        products={products}
        onProductSelect={handleOpenProduct}
      />

      <main style={{ padding: '1rem', paddingBottom: '80px', paddingTop: '90px', flex: 1 }}>
        {activeTab === 'home' && (
          <HomeView
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            searchQuery={searchQuery}
            filteredProducts={filteredProducts}
            visibleProducts={visibleProducts}
            isLoading={isLoading}
            visibleCount={visibleCount}
            setVisibleCount={setVisibleCount}
            handleCategoryClick={handleCategoryClick}
            setSelectedSubcategory={setSelectedSubcategory}
            handleTabChange={handleTabChange}
            addToCart={addToCart}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            handleOpenProduct={handleOpenProduct}
            clearFilters={clearFilters}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            bestSellers={bestSellers}
            handleAddCombo={handleAddCombo}
          />
        )}

        {activeTab === 'combos' && (
          <CombosGrid onAddCombo={handleAddCombo} onBack={() => handleTabChange('home')} />
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
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Tu Carrito</h2>
              {cart.length > 0 && !isSavingList && (
                <button
                  onClick={startSaveList}
                  style={{
                    background: 'none',
                    border: '1px solid var(--color-primary)',
                    color: 'var(--color-primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Guardar lista
                </button>
              )}
            </div>

            {/* Save List Input UI */}
            {isSavingList && (
              <div style={{
                marginBottom: '1.5rem',
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
                animation: 'slideDown 0.3s ease-out'
              }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombre de la lista:</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Ej. Despensa Semanal"
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: '1px solid #ccc'
                    }}
                  />
                  <button
                    onClick={confirmSaveList}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={cancelSaveList}
                    style={{
                      backgroundColor: '#f5f5f5',
                      color: '#666',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}



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
                        {item.originalPrice && item.originalPrice > item.price ? (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#999', textDecoration: 'line-through', marginRight: '8px' }}>
                              ${item.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-primary" style={{ fontWeight: 'bold', color: '#d32f2f' }}>
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-primary" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            ${item.price.toFixed(2)}
                          </p>
                        )}

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
                  {totalSavings > 0 && (
                    <div className="flex-between" style={{ marginBottom: '0.5rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>
                      <span>Ahorro Total</span>
                      <span>-${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#666' }}>Envío</span>
                    <span className="text-primary" style={{ fontWeight: 'bold' }}>Por confirmar</span>
                  </div>

                  {/* Points Redemption */}
                  {user.wallet > 0 && (
                    <div style={{ marginTop: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius)' }}>
                      <h4 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Usar Puntos (Saldo: {user.wallet})</h4>
                      <div className="flex-between" style={{ gap: '0.5rem' }}>
                        <input
                          type="range"
                          min="0"
                          max={Math.min(user.wallet, cartTotal * 10)} // Max usage limited by total
                          value={pointsToUse}
                          onChange={(e) => setPointsToUse(parseInt(e.target.value))}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>
                          -${(pointsToUse * 0.1).toFixed(2)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        Usando {pointsToUse} puntos
                      </div>
                    </div>
                  )}

                  <div className="flex-between" style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${finalTotal.toFixed(2)}</span>
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
            {/* Saved Lists Section (Moved to bottom) */}
            {savedLists.length > 0 && (
              <div style={{ marginTop: '2rem', marginBottom: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>Mis Listas Guardadas</h3>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {savedLists.map(list => (
                    <div key={list.id} style={{
                      minWidth: '200px',
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid #eee'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{list.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                        {list.items.length} artículos • {list.date}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => loadList(list)}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => deleteList(list.id)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#ffebee',
                            color: '#d32f2f',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <Account
            user={user}
            orders={orders}
            favorites={favorites}
            onLogout={handleLogout}
            onUpdateUser={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }}
            onToggleFavorite={toggleFavorite}
            onAddToCart={addToCart}
            onProductSelect={handleOpenProduct}
          />
        )}
        {activeTab === 'points' && (
          <div style={{ padding: '1rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Mis Puntos y Cupones</h2>

            {/* Wallet & Loyalty Section */}
            <div style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Monedero Electrónico</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                  {user.wallet || 0} pts
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                  Equivale a ${(user.wallet * 0.10).toFixed(2)} MXN
                </div>
              </div>

              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', bottom: '-30px', left: '-10px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Rewards Center */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Centro de Recompensas 🎁</h3>

              {/* Coupons Exchange */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#666' }}>Canjea tus puntos por cupones</h4>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {[
                    { points: 500, discount: 10, code: 'DESC10' },
                    { points: 1000, discount: 25, code: 'DESC25' },
                    { points: 2000, discount: 50, code: 'DESC50' }
                  ].map((coupon, idx) => (
                    <div key={idx} style={{
                      minWidth: '200px',
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px dashed var(--color-primary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                        ${coupon.discount} MXN
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem' }}>
                        por {coupon.points} puntos
                      </div>
                      <button
                        onClick={() => {
                          if ((user.wallet || 0) >= coupon.points) {
                            const updatedUser = {
                              ...user,
                              wallet: user.wallet - coupon.points,
                              coupons: [...(user.coupons || []), { ...coupon, id: Date.now() }]
                            };
                            setUser(updatedUser);
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            showToast(`¡Cupón de $${coupon.discount} canjeado!`);
                          } else {
                            showToast('Puntos insuficientes', 'error');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: (user.wallet || 0) >= coupon.points ? 'var(--color-primary)' : '#ccc',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: (user.wallet || 0) >= coupon.points ? 'pointer' : 'not-allowed',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        Canjear
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Coupons */}
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#666' }}>Mis Cupones Activos</h4>
                {(!user.coupons || user.coupons.length === 0) ? (
                  <p style={{ fontSize: '0.9rem', color: '#999', fontStyle: 'italic' }}>No tienes cupones activos.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {user.coupons.map((coupon, idx) => (
                      <div key={idx} className="flex-between" style={{
                        backgroundColor: '#fff3e0',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        borderLeft: '4px solid #ff9800'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#e65100' }}>Cupón ${coupon.discount} MXN</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>Código: {coupon.code}</div>
                        </div>
                        <span style={{ fontSize: '1.5rem' }}>🎟️</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'admin' && (
          <AdminLayout activeView={adminView} onViewChange={setAdminView} onLogout={() => setActiveTab('home')}>
            {adminView === 'dashboard' && <AdminPanel />}
            {adminView === 'products' && <AdminProducts />}
            {adminView === 'categories' && <AdminCategories />}
            {adminView === 'orders' && <AdminOrders />}
            {adminView === 'customers' && <AdminCustomers />}
            {adminView === 'promos' && <AdminPromotions />}
            {adminView === 'combos' && <AdminCombos />}
            {adminView === 'pos' && <AdminPOS />}
            {adminView === 'content' && <AdminContent />}
            {adminView === 'settings' && <AdminSettings />}
          </AdminLayout>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} cartCount={cartCount} isAnimating={cartAnimating} user={user} />

      {/* Product Details Modal */}
      {
        selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            products={products}
            onClose={handleCloseProduct}
            onAdd={addToCart}
            isFavorite={favorites.some(fav => fav.id === selectedProduct.id)}
            onToggleFavorite={() => toggleFavorite(selectedProduct)}
            onProductSelect={handleOpenProduct}
          />
        )
      }

      {/* Barcode Scanner */}
      {
        isScanning && (
          <BarcodeScanner
            onClose={() => setIsScanning(false)}
            onScan={handleScan}
          />
        )
      }

      {/* Checkout Modal */}
      {
        showCheckout && (
          <CheckoutModal
            onClose={() => setShowCheckout(false)}
            onConfirm={handleConfirmOrder}
            total={cartTotal}
          />
        )
      }

      {/* Fly to Cart Animation */}
      {
        flyingItem && (
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
        )
      }

      {/* Toast Notification */}
      {
        toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )
      }

      {/* Store Map Modal */}
      {
        showMap && (
          <StoreMap onClose={() => setShowMap(false)} />
        )
      }
      {/* Barcode Scanner Overlay */}
      {isScanning && (
        <BarcodeScanner
          onClose={() => setIsScanning(false)}
          onScan={handleScan}
        />
      )}
    </div >
  );
}

export default App;
