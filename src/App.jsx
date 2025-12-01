import React, { useState, useEffect, useMemo } from 'react';
import { createFuseInstance, processSearchQuery } from './utils/searchUtils';
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
import { BulkProductModal } from './components/BulkProductModal';

import { AdminRouter } from './components/admin/AdminRouter';
import { Account } from './components/Account';
import { ProductSkeleton } from './components/ProductSkeleton';
import { api } from './services/api';
import { CombosGrid } from './components/CombosGrid';
import { HomeView } from './components/HomeView';
import { seedCategories } from './utils/seedCategories';
import { AuthProvider, useAuth } from './context/auth.jsx';

import { CartProvider, useCart } from './context/cart.jsx';
import { CartView } from './components/CartView';
import { PointsView } from './components/PointsView';
import { OrderService } from './services/orders';
import { OrderSuccessModal } from './components/OrderSuccessModal';

const iconMap = {
  ShoppingBasket, Apple, Milk, SprayCan, Dog, Pill, Croissant, Baby
};

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [pointValue, setPointValue] = useState(0.10);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});
  const [rewardProducts, setRewardProducts] = useState([]);

  const loadData = async () => {
    try {
      const { ContentService } = await import('./services/content');
      const [productsData, categoriesData, settingsData, couponsData, rewardsData] = await Promise.all([
        api.products.getAll(),
        api.products.getCategories(),
        ContentService.getSettings(),
        ContentService.getCoupons(),
        ContentService.getRewardProducts()
      ]);

      if (settingsData) {
        setStoreSettings(settingsData);
        if (settingsData.pointValue) {
          setPointValue(Number(settingsData.pointValue));
        }
      }

      // Deduplicate products by ID to prevent key collisions
      const uniqueProducts = Array.from(new Map(productsData.map(item => [item.id, item])).values());

      // Deduplicate categories by ID
      const uniqueCategories = Array.from(new Map(categoriesData.map(item => [item.id, item])).values());

      setProducts(uniqueProducts);
      setCategories(uniqueCategories);
      setAvailableCoupons(couponsData || []);
      setRewardProducts(rewardsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast('Error al cargar datos', 'error');
    } finally {
      setIsDataLoaded(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);





  const [activeTab, setActiveTab] = useState('home');
  const [adminView, setAdminView] = useState('dashboard');

  const {
    cart,
    setCart,
    cartTotal,
    cartCount,
    addToCart,
    addBulkToCart,
    addComboToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    selectedBulkProduct,
    closeBulkModal,
    isCartAnimating
  } = useCart();

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const { user, logout, setUser } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved Lists State
  const [savedLists, setSavedLists] = useState(() => {
    const saved = localStorage.getItem('savedLists');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSavingList, setIsSavingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [showCheckout, setShowCheckout] = useState(false);
  const [flyingItem, setFlyingItem] = useState(null);
  const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }

  const [pointsToUse, setPointsToUse] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20); // Initial load count

  // Coupon State (Global for Cart and Checkout)
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Order Success Modal State
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);


  // Reload data when switching to home tab to ensure freshness
  useEffect(() => {
    if (activeTab === 'home' || activeTab === 'points') {
      loadData();
    }
  }, [activeTab]);

  // Persist orders to localStorage
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // ... (rest of the file)

  const handleApplyCoupon = (codeToApply = couponCode) => {
    const code = codeToApply.toUpperCase();
    const userCoupons = user.coupons || [];
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');

    // Check user coupons first
    let validCoupon = userCoupons.find(c => c.code === code);

    // If not found, check global admin coupons
    if (!validCoupon) {
      validCoupon = adminCoupons.find(c => c.code === code);
    }

    if (validCoupon) {
      setAppliedCoupon(validCoupon);
      setCouponCode(code); // Ensure input reflects applied code
      showToast(`Cupón aplicado: ${code}`, 'success');
    } else {
      showToast('Cupón inválido o no encontrado', 'error');
      setAppliedCoupon(null);
    }
  };

  const handleConfirmOrder = (details) => {
    // ... (rest of function)
    const couponDiscount = details.coupon ? details.coupon.discount : 0;
    const subtotal = cart.reduce((acc, item) => acc + (item.isBulkSelection ? item.totalPrice : (item.price * item.quantity)), 0);
    const total = Math.max(0, subtotal - (pointsToUse * pointValue) - couponDiscount);

    const newOrder = {
      id: Math.floor(Math.random() * 1000000),
      date: new Date().toLocaleDateString(),
      items: [...cart],
      total: total,
      subtotal: subtotal,
      pointsUsed: pointsToUse,
      coupon: details.coupon || null,
      discountAmount: couponDiscount,
      status: 'En camino'
    };


    // Calculate points earned
    // Calculate points earned
    const pointsEarned = cart.reduce((acc, item) => acc + ((item.bonusPoints || 0) * item.quantity), 0);

    setUser(currentUser => {
      let updatedUser = { ...currentUser };
      let userUpdated = false;

      // Handle Coupon Consumption
      let updatedCoupons = currentUser.coupons || [];

      // Remove general applied coupon
      if (details.coupon) {
        updatedCoupons = updatedCoupons.filter(c => {
          if (details.coupon.id && c.id) return c.id !== details.coupon.id;
          return c.code !== details.coupon.code;
        });
        userUpdated = true;
      }

      // Remove used product coupons
      if (usedProductCoupons.length > 0) {
        const usedIds = new Set(usedProductCoupons.map(c => c.id));
        updatedCoupons = updatedCoupons.filter(c => !usedIds.has(c.id));
        userUpdated = true;
      }

      if (userUpdated) {
        updatedUser = { ...updatedUser, coupons: updatedCoupons };
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
    // setActiveTab('profile'); // Removed redirect to profile
    // showToast('¡Pedido realizado con éxito!'); // Removed toast
    setLastOrder(newOrder);
    setShowOrderSuccess(true);

    // WhatsApp Integration
    const storeSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    const phoneNumber = storeSettings.whatsappNumber || "529821041154";

    const itemsList = newOrder.items.map(item => {
      let desc = `- ${item.name}`;
      if (item.isBulkSelection) {
        desc += ` (${item.cartQuantity} ${item.cartUnit})`;
        if (item.notes) desc += ` [Nota: ${item.notes}]`;
        desc += ` ($${item.totalPrice.toFixed(2)})`;
      } else {
        desc += ` x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`;
      }
      return desc;
    }).join('\n');

    const message = `¡Hola! Quiero realizar un pedido en Abarrotes Alex.\n\n*Pedido #${newOrder.id}*\n\n*Productos:*\n${itemsList}\n\n*Total: $${newOrder.total.toFixed(2)}*\n\n*Dirección de Entrega:*\n${details.address}\n\n*Método de Pago:*\n${details.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Use window.location.href for mobile to ensure it opens the app
    // or window.open for desktop. 
    // For now, let's try window.open but if it fails/blocks, user might need to allow popups.
    // Better yet, let's use a direct link click simulation or just window.open which usually works on mobile.
    window.open(whatsappUrl, '_blank');
  };

  // Calculate Product Coupons Discount and Identify Used Coupons
  const { productCouponsDiscount, usedProductCoupons } = useMemo(() => {
    let discount = 0;
    let usedCoupons = [];
    const userCoupons = user?.coupons || [];

    cart.forEach(item => {
      // Find all coupons for this product
      const productCoupons = userCoupons.filter(c =>
        c.type === 'product' &&
        (c.code.includes(`PROD-${item.id}-`) || c.discount === item.name) // Match by ID pattern or Name
      );

      if (productCoupons.length > 0) {
        // Determine how many to use
        const quantityToDiscount = Math.min(productCoupons.length, item.quantity);

        // Calculate discount value (assuming full price discount for "Free Product" coupons)
        // If coupon has a specific value, use that. For now, assuming free product.
        // We can check if coupon has 'value' property, otherwise use item.price.
        // Based on previous code: discount: product.name (so it's a free product)

        discount += quantityToDiscount * item.price;

        // Mark coupons as used
        usedCoupons = [...usedCoupons, ...productCoupons.slice(0, quantityToDiscount)];
      }
    });

    return { productCouponsDiscount: discount, usedProductCoupons: usedCoupons };
  }, [cart, user?.coupons]);

  // Cart calculations moved to Context
  const discountAmount = pointsToUse * pointValue;
  const couponDiscount = appliedCoupon ? (appliedCoupon.type === 'product' ? 0 : appliedCoupon.discount) : 0;

  // Update finalTotal to include product coupons discount
  // Ensure we don't go below zero
  const finalTotal = Math.max(0, cartTotal - discountAmount - couponDiscount - productCouponsDiscount);

  const totalSavings = cart.reduce((acc, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return acc + ((item.originalPrice - item.price) * item.quantity);
    }
    return acc;
  }, 0) + productCouponsDiscount; // Add product coupons to total savings

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

  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Search Filter (Global - Overrides Category)
    // 1. Search Filter (Global - Overrides Category)
    if (searchQuery) {
      const processedQuery = processSearchQuery(searchQuery);
      const fuse = createFuseInstance(products);

      const searchResults = fuse.search(processedQuery);
      result = searchResults.map(r => r.item);
    } else {
      // Only apply category filter if no search query
      if (selectedCategory) {
        result = result.filter(product => product.category === selectedCategory);
      }
      if (selectedSubcategory) {
        result = result.filter(product => product.subcategory === selectedSubcategory);
      }
    }

    // 4. Sorting
    return [...result].sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortOrder]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return [];
    const processedQuery = processSearchQuery(searchQuery).toLowerCase();
    return categories.filter(cat => cat.name.toLowerCase().includes(processedQuery));
  }, [categories, searchQuery]);

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

  const handleLogout = () => {
    logout();
    setActiveTab('home');
    showToast('Sesión cerrada correctamente');
  };

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
    if (hash) {
      if (hash.startsWith('categoria-')) {
        const catName = decodeURIComponent(hash.replace('categoria-', ''));
        setSelectedCategory(catName);
        setActiveTab('home');
      } else if (['cart', 'admin', 'profile', 'categories', 'combos'].includes(hash)) {
        setActiveTab(hash);
      } else {
        // Default to home for unknown hashes or 'producto'
        setActiveTab('home');
      }
    }

    const handlePopState = (event) => {
      // Handle Modal Closing
      if (selectedProduct) {
        setSelectedProduct(null);
        return; // Stop here if we just closed a modal
      }

      // Handle Category Navigation
      if (event.state && event.state.view === 'categoria') {
        setSelectedCategory(event.state.nombre);
        setActiveTab('home');
        return;
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

  // addToCart moved to Context

  // handleBulkAddToCart moved to Context

  // handleAddCombo moved to Context

  // removeFromCart moved to Context

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory(null);
    setSearchQuery('');
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const exists = prev.some(p => p.id === product.id);
      let newFavorites;
      if (exists) {
        newFavorites = prev.filter(p => p.id !== product.id);
        showToast('Eliminado de favoritos');
      } else {
        newFavorites = [...prev, product];
        showToast('Agregado a favoritos');
      }
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // List Management Functions
  const startSaveList = () => {
    setIsSavingList(true);
    setListName('');
  };

  const saveList = () => {
    if (!listName.trim()) {
      showToast('Ingresa un nombre para la lista', 'error');
      return;
    }

    const newList = {
      id: Date.now(),
      name: listName,
      items: cart,
      date: new Date().toLocaleDateString()
    };

    const updatedLists = [...savedLists, newList];
    setSavedLists(updatedLists);
    localStorage.setItem('savedLists', JSON.stringify(updatedLists));

    setIsSavingList(false);
    showToast('Lista guardada correctamente');
  };

  const cancelSaveList = () => {
    setIsSavingList(false);
    setListName('');
  };

  const deleteList = (id) => {
    const updatedLists = savedLists.filter(l => l.id !== id);
    setSavedLists(updatedLists);
    localStorage.setItem('savedLists', JSON.stringify(updatedLists));
    showToast('Lista eliminada');
  };

  const loadList = (list) => {
    if (cart.length > 0) {
      if (!window.confirm('¿Reemplazar el carrito actual con esta lista?')) return;
    }
    setCart(list.items);
    showToast('Lista cargada al carrito');
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    setSortOrder(null);
  };

  if (!isDataLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos...</div>;
  }

  if (!user) {
    return <LoginModal />;
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
      {selectedBulkProduct && (
        <BulkProductModal
          product={selectedBulkProduct}
          onClose={closeBulkModal}
          onAdd={addBulkToCart}
        />
      )}
      {isScanning && <BarcodeScanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userName={user ? user.name : null}
        onOpenScanner={() => setIsScanning(true)}
        products={products}
        categories={categories}
        onCategorySelect={handleCategoryClick}
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
            filteredCategories={filteredCategories}
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
            handleAddCombo={addComboToCart}
          />
        )}

        {activeTab === 'combos' && (
          <CombosGrid onAddCombo={addComboToCart} onBack={() => handleTabChange('home')} />
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
          <CartView
            cart={cart}
            cartTotal={cartTotal}
            isSavingList={isSavingList}
            startSaveList={startSaveList}
            newListName={newListName}
            setNewListName={setNewListName}
            onConfirmSaveList={saveList}
            cancelSaveList={cancelSaveList}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            user={user}
            handleApplyCoupon={handleApplyCoupon}
            appliedCoupon={appliedCoupon}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            totalSavings={totalSavings}
            productCouponsDiscount={productCouponsDiscount}
            usedProductCoupons={usedProductCoupons}
            pointsToUse={pointsToUse}
            setPointsToUse={setPointsToUse}
            pointValue={pointValue}
            couponDiscount={couponDiscount}
            finalTotal={finalTotal}
            setShowCheckout={setShowCheckout}
            savedLists={savedLists}
            loadList={loadList}
            deleteList={deleteList}
            setActiveTab={setActiveTab}
          />
        )}

        {
          activeTab === 'profile' && (
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
          )
        }
        {activeTab === 'points' && (
          <PointsView
            user={user}
            pointValue={pointValue}
            rewardProducts={rewardProducts}
            availableCoupons={availableCoupons}
            onUpdateUser={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }}
            showToast={showToast}
          />
        )}
        {
          activeTab === 'admin' && (
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
          )
        }
      </main >

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} cartCount={cartCount} isAnimating={isCartAnimating} user={user} />

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
            total={finalTotal}
            onClose={() => setShowCheckout(false)}
            onConfirm={handleConfirmOrder}
            deliveryCost={storeSettings.deliveryCost || 15}
            initialCoupon={appliedCoupon}
          />
        )
      }

      {/* Order Success Modal */}
      {
        showOrderSuccess && lastOrder && (
          <OrderSuccessModal
            order={lastOrder}
            onClose={() => {
              setShowOrderSuccess(false);
              setLastOrder(null);
              setSearchQuery(''); // Clear search query
              setActiveTab('home'); // Redirect to home after closing success modal
            }}
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
            duration={200}
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
      {
        isScanning && (
          <BarcodeScanner
            onClose={() => setIsScanning(false)}
            onScan={handleScan}
          />
        )
      }
    </div >
  );
}

function AppWrapper() {
  return (
    <CartProvider>
      <App />
    </CartProvider>
  );
}

export default AppWrapper;
