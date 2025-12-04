import React, { useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { BulkProductModal } from '../components/BulkProductModal';
import { useCart } from '../context/cart';
import { useAuth } from '../context/auth';

export const MainLayout = ({
    searchQuery,
    setSearchQuery,
    isScanning,
    setIsScanning,
    handleScan,
    products,
    categories,
    handleCategoryClick,
    handleOpenProduct,
    clearFilters,
    showToast,
    addToHistory // New prop
}) => {
    const { user } = useAuth();
    const {
        selectedBulkProduct,
        closeBulkModal,
        addBulkToCart,
        addToCart,
        cartCount,
        isCartAnimating
    } = useCart();

    const location = useLocation();
    const navigate = useNavigate();

    // Clear search when location changes (except when going to home)
    useEffect(() => {
        if (location.pathname !== '/' && searchQuery) {
            setSearchQuery('');
        }
    }, [location.pathname]);

    // Determine active tab based on path
    let activeTab = 'home';
    if (location.pathname === '/cart') activeTab = 'cart';
    else if (location.pathname === '/points') activeTab = 'points';
    else if (location.pathname === '/combos') activeTab = 'combos';
    else if (location.pathname === '/categories') activeTab = 'categories';
    else if (location.pathname === '/profile') activeTab = 'profile';
    else if (location.pathname.startsWith('/admin')) activeTab = 'admin';

    const handleTabChange = useCallback((tab) => {
        if (tab === 'home') {
            if (clearFilters) clearFilters();
            navigate('/');
        } else if (tab === 'admin') {
            navigate('/admin');
        } else {
            navigate(`/${tab}`);
        }
    }, [clearFilters, navigate]);

    const handleSearchInput = useCallback((query) => {
        setSearchQuery(query);
        if (query && location.pathname !== '/') {
            navigate('/');
        }
        // Debounce or wait for enter could be better, but for now we rely on user action
        // Actually, we should add to history when user "submits" or after a delay?
        // Let's add it when they hit enter or select a suggestion. 
        // Since this is just input change, we might not want to add every keystroke.
        // We'll handle addToHistory in Header's onSearchSubmit if possible, or here if we had a submit event.
        // For now, let's assume Header calls a submit handler.
    }, [setSearchQuery, location.pathname, navigate]);

    // New handler for explicit search submission (e.g. Enter key)
    const handleSearchSubmit = useCallback((query) => {
        if (query && addToHistory) {
            addToHistory(query);
        }
        if (location.pathname !== '/') {
            navigate('/');
        }
    }, [addToHistory, location.pathname, navigate]);

    return (
        <div className="app-container">
            {selectedBulkProduct && (
                <BulkProductModal
                    product={selectedBulkProduct}
                    onClose={closeBulkModal}
                    onAdd={addBulkToCart}
                />
            )}

            {isScanning && (
                <BarcodeScanner
                    onScan={handleScan}
                    onClose={() => setIsScanning(false)}
                />
            )}

            <Header
                searchQuery={searchQuery}
                setSearchQuery={handleSearchInput}
                onSearchSubmit={handleSearchSubmit} // Pass submit handler
                userName={user ? user.name : null}
                onOpenScanner={() => setIsScanning(true)}
                products={products}
                categories={categories}
                onCategorySelect={handleCategoryClick}
                onProductSelect={handleOpenProduct}
                addToCart={addToCart}
                showToast={showToast}
            />

            <main style={{ padding: '1rem', paddingBottom: '100px', paddingTop: '90px', flex: 1 }}>
                <div key={location.pathname} className="animate-page-enter">
                    <Outlet />
                </div>
            </main>

            <BottomNav
                activeTab={activeTab}
                onTabChange={handleTabChange}
                cartCount={cartCount}
                isAnimating={isCartAnimating}
                user={user}
            />
        </div>
    );
};
