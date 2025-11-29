import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Plus, Minus, CreditCard, Save, RotateCcw, Monitor, X, Printer } from 'lucide-react';
import { ProductService } from '../../services/products';

export function AdminPOS() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ticket, setTicket] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [total, setTotal] = useState(0);
    const searchInputRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchTerm, selectedCategory, products]);

    useEffect(() => {
        calculateTotal();
    }, [ticket]);

    // Focus search on mount
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    const loadData = async () => {
        const allProducts = await ProductService.getAllProducts();
        const allCategories = await ProductService.getAllCategories();
        setProducts(allProducts);
        // Fix: Ensure we only store category names, not full objects
        setCategories(['Todos', ...allCategories.map(c => c.name)]);
    };

    const filterProducts = () => {
        let result = products;
        if (selectedCategory !== 'Todos') {
            result = result.filter(p => p.category === selectedCategory);
        }
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(lowerTerm));
        }
        setFilteredProducts(result);
    };

    const calculateTotal = () => {
        const sum = ticket.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum);
    };

    const addToTicket = (product) => {
        setTicket(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setTicket(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromTicket = (id) => {
        setTicket(prev => prev.filter(item => item.id !== id));
    };

    const clearTicket = () => {
        if (window.confirm('¿Borrar ticket actual?')) {
            setTicket([]);
        }
    };

    const handleCheckout = () => {
        if (ticket.length === 0) return;
        alert(`Cobrar $${total.toFixed(2)} (Simulación)`);
        // Here we would open the payment modal
        setTicket([]);
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
            {/* Left Column: Catalog */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

                {/* Search & Filter Bar */}
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar producto (F2)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', outline: 'none'
                            }}
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ padding: '0 1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer' }}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {/* Product Grid */}
                <div style={{
                    flex: 1, overflowY: 'auto', display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '1rem', paddingBottom: '1rem'
                }}>
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => addToTicket(product)}
                            style={{
                                backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)', cursor: 'pointer',
                                transition: 'transform 0.1s', border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
                        >
                            <div style={{ height: '100px', backgroundColor: '#f3f4f6' }}>
                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '0.75rem' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                <div style={{ color: '#059669', fontWeight: 'bold' }}>${product.price.toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Ticket */}
            <div style={{ width: '380px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Ticket Header */}
                <div style={{ padding: '1rem', backgroundColor: '#1f2937', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Monitor size={20} />
                        <span style={{ fontWeight: '600' }}>Ticket de Venta</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{new Date().toLocaleDateString()}</span>
                </div>

                {/* Ticket Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {ticket.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: '1rem' }}>
                            <Printer size={48} style={{ opacity: 0.2 }} />
                            <p>Ticket vacío</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {ticket.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>${item.price.toFixed(2)} x {item.quantity}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>${(item.price * item.quantity).toFixed(2)}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', borderRadius: '4px', cursor: 'pointer', padding: '2px' }}><Plus size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', borderRadius: '4px', cursor: 'pointer', padding: '2px' }}><Minus size={14} /></button>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); removeFromTicket(item.id); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ticket Footer (Totals & Actions) */}
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <button
                            onClick={clearTicket}
                            style={{
                                padding: '0.75rem', borderRadius: '8px', border: '1px solid #ef4444',
                                backgroundColor: 'white', color: '#ef4444', fontWeight: '600', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <Trash2 size={18} />
                            Cancelar
                        </button>
                        <button
                            style={{
                                padding: '0.75rem', borderRadius: '8px', border: '1px solid #f59e0b',
                                backgroundColor: 'white', color: '#d97706', fontWeight: '600', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <RotateCcw size={18} />
                            Pendiente
                        </button>
                        <button
                            onClick={handleCheckout}
                            style={{
                                gridColumn: '1 / -1',
                                padding: '1rem', borderRadius: '8px', border: 'none',
                                backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            <CreditCard size={24} />
                            COBRAR (F12)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
