import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { VoiceSearch } from './VoiceSearch';

export function Header({ searchQuery, setSearchQuery, onSearchSubmit, userName, onOpenScanner, products, addToCart, showToast }) {
    const [localSearch, setLocalSearch] = useState(searchQuery);

    // Sync local state if external searchQuery changes (e.g. clearing filter)
    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    // Debounce search update
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchQuery) {
                setSearchQuery(localSearch);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, setSearchQuery, searchQuery]);

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
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.target.blur(); // Hide keyboard on mobile
                            if (onSearchSubmit) {
                                onSearchSubmit(localSearch);
                            }
                        }
                    }}
                    style={{
                        width: '100%',
                        padding: '0.75rem 4rem 0.75rem 2.5rem', // Adjusted padding
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        fontSize: '0.95rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                />

                <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setLocalSearch('');
                                setSearchQuery('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px'
                            }}
                        >
                            <X size={16} color="#999" />
                        </button>
                    )}

                    <VoiceSearch
                        onSearch={React.useCallback((term) => {
                            import('../services/smartSearch').then(({ SmartSearchService }) => {
                                const result = SmartSearchService.parseCommand(term, products || []);

                                if (result.type === 'addToCart') {
                                    if (result.items.length > 0) {
                                        let message = 'Agregado: ';
                                        result.items.forEach((item, index) => {
                                            // Add to cart multiple times based on quantity
                                            for (let i = 0; i < item.quantity; i++) {
                                                addToCart(item.product);
                                            }
                                            message += `${item.quantity} ${item.product.name}${index < result.items.length - 1 ? ', ' : ''}`;
                                        });

                                        setLocalSearch('');
                                        setSearchQuery('');
                                        if (showToast) {
                                            showToast(message, 'success');
                                        } else {
                                            alert(message); // Fallback
                                        }
                                    } else {
                                        if (showToast) {
                                            showToast('No entendí qué productos agregar. Intenta decir el nombre exacto.', 'error');
                                        } else {
                                            alert('No entendí qué productos agregar. Intenta decir el nombre exacto.');
                                        }
                                    }
                                } else {
                                    setLocalSearch(term);
                                    setSearchQuery(term);
                                }
                            }).catch(err => console.error("Error loading SmartSearchService:", err));
                        }, [products, addToCart, setLocalSearch, setSearchQuery, showToast])}
                    />
                </div>
            </div>
        </header>
    );
}
