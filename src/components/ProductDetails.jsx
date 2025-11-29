import React from 'react';
import { X, Heart, ShoppingCart, Star, ChevronRight } from 'lucide-react';
export function ProductDetails({ product, products, onClose, onAdd, isFavorite, onToggleFavorite, onProductSelect }) {
    if (!product) return null;

    // Mock description based on category
    const getDescription = (category) => {
        const descriptions = {
            'Abarrotes': 'Producto esencial para tu despensa. Calidad garantizada y el mejor sabor para tus comidas diarias.',
            'Frutas y Verduras': 'Fresco y seleccionado cuidadosamente. Directo del campo a tu mesa para asegurar la mejor nutrición.',
            'Lácteos': 'Rico en calcio y vitaminas. Mantener en refrigeración para conservar su frescura.',
            'Limpieza': 'Efectividad comprobada contra la suciedad. Tu hogar brillará con este producto de alta calidad.',
            'Mascotas': 'Lo mejor para tu compañero fiel. Ingredientes balanceados para su salud y energía.',
            'Farmacia': 'Alivio efectivo y rápido. Lea las instrucciones de uso. Consulte a su médico.',
            'Panadería': 'Horneado diariamente con los mejores ingredientes. Suavidad y sabor irresistible.',
            'Bebés': 'Cuidado delicado para lo que más amas. Hipoalergénico y seguro para tu bebé.'
        };
        return descriptions[product.category] || 'Producto de alta calidad disponible en Mi Bodeguita.';
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            zIndex: 2000,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header with Close Button */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} color="#333" />
                </button>

                <button
                    onClick={onToggleFavorite}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        color: isFavorite ? 'var(--color-accent)' : '#999'
                    }}
                >
                    <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Product Image */}
            <div style={{
                width: '100%',
                height: '40vh',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {product.originalPrice && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '-32px',
                        backgroundColor: 'var(--color-accent)',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        padding: '6px 40px',
                        transform: 'rotate(45deg)',
                        zIndex: 10,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px'
                    }}>
                        OFERTA
                    </div>
                )}
                <img
                    src={product.image}
                    alt={product.name}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                    }}
                />
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                padding: '1.5rem',
                backgroundColor: 'white',
                borderTopLeftRadius: '2rem',
                borderTopRightRadius: '2rem',
                marginTop: '-2rem',
                position: 'relative',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
            }}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-primary)',
                        fontWeight: 'bold',
                        backgroundColor: '#e8f5e9',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem'
                    }}>
                        {product.category}
                    </span>
                </div>

                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '0.5rem',
                    lineHeight: 1.2
                }}>
                    {product.name}
                </h1>



                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Descripción</h3>
                    <p style={{ color: '#666', lineHeight: 1.6 }}>
                        {getDescription(product.category)}
                    </p>
                </div>

            </div>

            {/* Related Products */}
            <div style={{ padding: '0 1.5rem 6rem 1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#333' }}>También te podría interesar</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {products
                        .filter(p => p.category === product.category && p.id !== product.id)
                        .slice(0, 4)
                        .map(related => (
                            <div
                                key={related.id}
                                onClick={() => {
                                    if (onProductSelect) {
                                        onProductSelect(related);
                                    }
                                }}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '0.75rem',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {related.originalPrice && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '-30px',
                                        backgroundColor: 'var(--color-accent)',
                                        color: 'white',
                                        fontSize: '0.6rem',
                                        fontWeight: 'bold',
                                        padding: '3px 30px',
                                        transform: 'rotate(45deg)',
                                        zIndex: 10,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        OFERTA
                                    </div>
                                )}
                                <img src={related.image} alt={related.name} style={{ width: '100%', height: '80px', objectFit: 'contain' }} />
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{related.name}</p>
                                    <div>
                                        {related.originalPrice && related.originalPrice > related.price && (
                                            <span style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'line-through', marginRight: '6px' }}>
                                                ${related.originalPrice.toFixed(2)}
                                            </span>
                                        )}
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                            ${related.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: '1rem',
                backgroundColor: 'white',
                borderTop: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
                zIndex: 2001
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', color: '#999', textDecoration: product.originalPrice ? 'line-through' : 'none' }}>
                        {product.originalPrice ? `$${product.originalPrice.toFixed(2)}` : ''}
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        ${product.price.toFixed(2)}
                    </span>
                </div>

                <button
                    className="btn-add"
                    onClick={(e) => {
                        onAdd(product, e);
                        onClose();
                    }}
                    style={{
                        width: 'auto',
                        marginTop: 0,
                        padding: '0.75rem 2rem',
                        fontSize: '1rem',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                    }}
                >
                    <ShoppingCart size={20} />
                    Agregar
                </button>
            </div>
        </div>
    );
}
