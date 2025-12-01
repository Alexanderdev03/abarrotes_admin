import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext();

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load cart", e);
            return [];
        }
    });

    const [selectedBulkProduct, setSelectedBulkProduct] = useState(null);
    const [isCartAnimating, setIsCartAnimating] = useState(false);

    // Persist cart
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

    const cartTotal = useMemo(() =>
        cart.reduce((acc, item) => acc + (item.isBulkSelection ? item.totalPrice : (item.price * item.quantity)), 0),
        [cart]);

    const addToCart = (product, quantity = 1) => {
        // Check for bulk product logic
        if (product.category === 'Frutas y Verduras' || product.averageWeight || product.isBulk) {
            setSelectedBulkProduct(product);
            return;
        }

        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.id === product.id && !item.isBulkSelection);
            if (existingItemIndex >= 0) {
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + quantity
                };
                return newCart;
            } else {
                return [...prevCart, { ...product, quantity }];
            }
        });
        triggerAnimation();
    };

    const addBulkToCart = (productWithBulkData) => {
        const cartItem = {
            ...productWithBulkData,
            id: `${productWithBulkData.id}-${Date.now()}`,
            // Ensure these are set from the passed object
            cartQuantity: productWithBulkData.cartQuantity,
            cartUnit: productWithBulkData.cartUnit,
            notes: productWithBulkData.notes,
            totalPrice: productWithBulkData.totalPrice,
            quantity: 1,
            isBulkSelection: true,
            name: `${productWithBulkData.name} (${productWithBulkData.cartQuantity} ${productWithBulkData.cartUnit})`
        };

        setCart(prev => [...prev, cartItem]);
        setSelectedBulkProduct(null);
        triggerAnimation();
    };

    const addComboToCart = (combo) => {
        const comboItem = {
            ...combo,
            id: `${combo.id}-${Date.now()}`,
            quantity: 1,
            isCombo: true
        };
        setCart(prev => [...prev, comboItem]);
        triggerAnimation();
    };

    const removeFromCart = (productId, index) => {
        // If index is provided, remove by index (safe for duplicate IDs if any, or bulk items)
        // If only ID, remove all instances? Usually remove by index is safest for this cart structure.
        if (typeof index === 'number') {
            setCart(prev => prev.filter((_, i) => i !== index));
        } else {
            setCart(prev => prev.filter(item => item.id !== productId));
        }
    };

    const updateQuantity = (index, delta) => {
        setCart(prev => {
            const newCart = [...prev];
            const item = newCart[index];
            const newQuantity = Math.max(1, item.quantity + delta);
            newCart[index] = { ...item, quantity: newQuantity };
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const triggerAnimation = () => {
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 300);
    };

    const closeBulkModal = () => {
        setSelectedBulkProduct(null);
    };

    const value = {
        cart,
        setCart, // Expose for complex cases like reorder or load list
        cartCount,
        cartTotal,
        addToCart,
        addBulkToCart,
        addComboToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        selectedBulkProduct,
        closeBulkModal,
        isCartAnimating
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
