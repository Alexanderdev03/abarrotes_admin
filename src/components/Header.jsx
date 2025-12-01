import React, { useState, useEffect } from 'react';
import { Search, Camera, X } from 'lucide-react';

export function Header({ searchQuery, setSearchQuery, userName, onOpenScanner }) {
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
                            setLocalSearch('');
                            setSearchQuery('');
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
