import React from 'react';
import { Heart, Plus } from 'lucide-react';

export function ProductCard({ product, onAdd, isFavorite, onToggleFavorite, onClick, priority = false }) {
    return (
        <div
            onClick={onClick}
            className="animate-scale-in"
            style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius)',
                padding: '0.75rem',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                cursor: 'pointer',
                overflow: 'hidden'
            }}
        >
            {/* Badges */}
            <div style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
                zIndex: 10
            }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite();
                    }}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isFavorite ? 'var(--color-accent)' : '#999',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>
            </div>

            {product.originalPrice && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '-32px',
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    padding: '4px 30px',
                    transform: 'rotate(45deg)',
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    OFERTA
                </div>
            )}

            {/* Image */}
            <div style={{
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '140px'
            }}>
                <img
                    src={product.image}
                    alt={product.name}
                    loading={priority ? "eager" : "lazy"}
                    width="100%"
                    height="140"
                    style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain'
                    }}
                />
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    lineHeight: '1.2',
                    color: '#333',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {product.name}
                </h3>

                {product.originalPrice && (
                    <div style={{
                        fontSize: '0.8rem',
                        color: '#999',
                        textDecoration: 'line-through',
                        marginBottom: '2px'
                    }}>
                        De: ${product.originalPrice.toFixed(2)}
                    </div>
                )}

                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    color: 'var(--color-primary)',
                    marginBottom: '0.25rem'
                }}>
                    ${product.price.toFixed(2)}
                </div>

                {product.bonusPoints && (
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#e65100',
                        fontWeight: 'bold',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span>+{product.bonusPoints} Puntos</span>
                    </div>
                )}

                <button
                    className="btn-add"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd(product);
                    }}
                    style={{ marginTop: 'auto' }}
                >
                    <Plus size={16} style={{ marginRight: '4px', strokeWidth: 3 }} />
                    Agregar
                </button>
            </div>
        </div>
    );
}
