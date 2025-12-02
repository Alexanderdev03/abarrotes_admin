import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ProductActionModal } from './components/ProductActionModal';
import { CheckoutModal } from './components/CheckoutModal';
import { LoginModal } from './components/LoginModal';
import { Toast } from './components/Toast';
import { StoreMap } from './components/StoreMap';
// Lazy loaded components
const AdminRouter = React.lazy(() => import('./components/admin/AdminRouter').then(module => ({ default: module.AdminRouter })));
const Account = React.lazy(() => import('./components/Account').then(module => ({ default: module.Account })));
const CombosGrid = React.lazy(() => import('./components/CombosGrid').then(module => ({ default: module.CombosGrid })));
const CategoriesView = React.lazy(() => import('./components/CategoriesView').then(module => ({ default: module.CategoriesView })));
const CartView = React.lazy(() => import('./components/CartView').then(module => ({ default: module.CartView })));
const PointsView = React.lazy(() => import('./components/PointsView').then(module => ({ default: module.PointsView })));

import { HomeView } from './components/HomeView';
import { AuthProvider, useAuth } from './context/auth.jsx';
import { CartProvider, useCart } from './context/cart.jsx';

import { OrderService } from './services/orders';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { MainLayout } from './layouts/MainLayout';
import { useAppData } from './hooks/useAppData';
import { useProductSearch } from './hooks/useProductSearch';

function App() {
  // Custom Hooks
  const {
    products,
    categories,
    isDataLoaded,
    isLoading,
    pointValue,
    availableCoupons,
    storeSettings,
    rewardProducts
  } = useAppData();

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    sortOrder,
    setSortOrder,
    visibleCount,
    setVisibleCount,
    filteredProducts,
    filteredCategories,
    visibleProducts,
    clearFilters
  } = useProductSearch(products, categories);

  // Cart Context
  const {
    cart,
    setCart,
    cartTotal,
    addToCart,
    addComboToCart,
    removeFromCart,
    updateQuantity
  } = useCart();

  // Auth Context
  const { user, logout, setUser } = useAuth();

  // Local State
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
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
  const [listName, setListName] = useState('');

  const [showCheckout, setShowCheckout] = useState(false);
  const [flyingItem, setFlyingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Handlers
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApplyCoupon = (codeToApply = couponCode) => {
    const code = codeToApply.toUpperCase();
    const userCoupons = user.coupons || [];
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');

    let validCoupon = userCoupons.find(c => c.code === code);
    if (!validCoupon) {
      validCoupon = adminCoupons.find(c => c.code === code);
    }

    if (validCoupon) {
      setAppliedCoupon(validCoupon);
      setCouponCode(code);
      showToast(`Cupón aplicado: ${code}`, 'success');
    } else {
      showToast('Cupón inválido o no encontrado', 'error');
      setAppliedCoupon(null);
    }
  };

  const { productCouponsDiscount, usedProductCoupons } = useMemo(() => {
    let discount = 0;
    let usedCoupons = [];
    const userCoupons = user?.coupons || [];

    cart.forEach(item => {
      const productCoupons = userCoupons.filter(c =>
        c.type === 'product' &&
        (c.code.includes(`PROD-${item.id}-`) || c.discount === item.name)
      );

      if (productCoupons.length > 0) {
        const quantityToDiscount = Math.min(productCoupons.length, item.quantity);
        discount += quantityToDiscount * item.price;
        usedCoupons = [...usedCoupons, ...productCoupons.slice(0, quantityToDiscount)];
      }
    });

    return { productCouponsDiscount: discount, usedProductCoupons: usedCoupons };
  }, [cart, user?.coupons]);

  const discountAmount = pointsToUse * pointValue;
  const couponDiscount = appliedCoupon ? (appliedCoupon.type === 'product' ? 0 : appliedCoupon.discount) : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount - couponDiscount - productCouponsDiscount);

  const totalSavings = cart.reduce((acc, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return acc + ((item.originalPrice - item.price) * item.quantity);
    }
    return acc;
  }, 0) + productCouponsDiscount;

  const handleConfirmOrder = (details) => {
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

    const pointsPercentage = storeSettings.pointsPercentage || 1.5;
    const pointsEarned = cart.reduce((acc, item) => {
      if (item.bonusPoints && item.bonusPoints > 0) {
        return acc + (item.bonusPoints * item.quantity);
      }
      const itemTotal = item.isBulkSelection ? item.totalPrice : (item.price * item.quantity);
      return acc + (itemTotal * (pointsPercentage / 100));
    }, 0);

    setUser(currentUser => {
      let updatedUser = { ...currentUser };
      let userUpdated = false;
      let updatedCoupons = currentUser.coupons || [];

      if (details.coupon) {
        updatedCoupons = updatedCoupons.filter(c => {
          if (details.coupon.id && c.id) return c.id !== details.coupon.id;
          return c.code !== details.coupon.code;
        });
        userUpdated = true;
      }

      if (usedProductCoupons.length > 0) {
        const usedIds = new Set(usedProductCoupons.map(c => c.id));
        updatedCoupons = updatedCoupons.filter(c => !usedIds.has(c.id));
        userUpdated = true;
      }

      if (userUpdated) {
        updatedUser = { ...updatedUser, coupons: updatedCoupons };
      }

      if (pointsEarned > 0) {
        const currentWallet = parseFloat(updatedUser.wallet || 0);
        updatedUser = { ...updatedUser, wallet: Number((currentWallet + pointsEarned).toFixed(2)) };
        userUpdated = true;
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
    setLastOrder(newOrder);
    setShowOrderSuccess(true);

    const savedSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    const phoneNumber = savedSettings.whatsappNumber || "529821041154";

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

    try {
      window.open(whatsappUrl, '_blank');
    } catch (e) {
      console.error("Error opening WhatsApp:", e);
      window.location.href = whatsappUrl;
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory(null);
    setSearchQuery('');
    navigate('/');
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

  const handleLogout = () => {
    logout();
    navigate('/');
    showToast('Sesión cerrada correctamente');
  };

  const handleScan = (code) => {
    const product = products.find(p => p.barcode === code || p.id === code);
    if (product) {
      addToCart(product);
      showToast(`Agregado: ${product.name}`);
    } else {
      showToast('Producto no encontrado', 'error');
    }
  };

  const bestSellers = products.slice(0, 4);

  if (!isDataLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos...</div>;
  }

  if (!user) {
    return <LoginModal />;
  }

  return (
    <>
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <Routes>
          <Route path="/" element={
            <MainLayout
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isScanning={isScanning}
              setIsScanning={setIsScanning}
              handleScan={handleScan}
              products={products}
              categories={categories}
              handleCategoryClick={handleCategoryClick}
              handleOpenProduct={setSelectedProduct}
              clearFilters={clearFilters}
            />
          }>
            <Route index element={
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
                handleTabChange={(tab) => {
                  if (tab === 'categories') navigate('/categories');
                  else if (tab === 'combos') navigate('/combos');
                  else navigate('/' + tab);
                }}
                addToCart={addToCart}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                handleOpenProduct={setSelectedProduct}
                clearFilters={clearFilters}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                bestSellers={bestSellers}
                handleAddCombo={addComboToCart}
              />
            } />
            <Route path="cart" element={
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
                setActiveTab={(tab) => navigate('/' + tab)}
              />
            } />
            <Route path="points" element={
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
            } />
            <Route path="combos" element={
              <CombosGrid onAddCombo={addComboToCart} onBack={() => navigate('/')} />
            } />
            <Route path="categories" element={
              <CategoriesView
                filteredCategories={filteredCategories}
                handleCategoryClick={handleCategoryClick}
                searchQuery={searchQuery}
                filteredProducts={filteredProducts}
                addToCart={addToCart}
                handleOpenProduct={setSelectedProduct}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            } />
            <Route path="profile" element={
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
                onProductSelect={setSelectedProduct}
                onNavigateToAdmin={() => navigate('/admin')}
              />
            } />
          </Route>

          <Route path="/admin/*" element={<AdminRouter />} />
        </Routes>
      </Suspense>

      {/* Global Modals */}
      {selectedProduct && (
        <ProductActionModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
          products={products}
          onProductSelect={setSelectedProduct}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          total={finalTotal}
          onClose={() => setShowCheckout(false)}
          onConfirm={handleConfirmOrder}
          deliveryCost={storeSettings.deliveryCost || 15}
          initialCoupon={appliedCoupon}
        />
      )}

      {showOrderSuccess && lastOrder && (
        <OrderSuccessModal
          order={lastOrder}
          onClose={() => {
            setShowOrderSuccess(false);
            setLastOrder(null);
            setSearchQuery('');
            navigate('/');
          }}
        />
      )}

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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={2000}
        />
      )}

      {showMap && (
        <StoreMap onClose={() => setShowMap(false)} />
      )}
    </>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <App />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default AppWrapper;
