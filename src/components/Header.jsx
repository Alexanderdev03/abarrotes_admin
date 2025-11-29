import React, { useState, useEffect } from 'react';
import { Menu, ShoppingCart, Search, Camera, X } from 'lucide-react';

export function Header({ searchQuery, setSearchQuery, userName, onOpenScanner, products = [], onProductSelect }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (searchQuery.length > 1) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchQuery, products]);

    return (
        <header style={{
            backgroundColor: 'var(--color-primary)',
            padding: '1rem',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 100,
            boxShadow: 'var(--shadow-md)'
        }}>
            <div className="input-group" style={{ position: 'relative' }}>
                <Search
                    size={20}
                    color="#999"
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                />
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                        if (searchQuery.length > 1) setShowSuggestions(true);
                    }}
                    style={{
                        width: '100%',
                        padding: '0.75rem 3rem 0.75rem 2.5rem',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        fontSize: '0.95rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                />
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSuggestions([]);
                        }}
                        style={{
                            position: 'absolute',
                            right: '40px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={16} color="#999" />
                    </button>
                )}
                <button
                    onClick={onOpenScanner}
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Camera size={20} color="#666" />
                </button>


            </div>
        </header>
    );
}
