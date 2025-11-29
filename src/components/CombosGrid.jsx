import React from 'react';
import { Plus, ArrowLeft } from 'lucide-react';

export function CombosGrid({ onAddCombo, onBack }) {
    const [combos, setCombos] = React.useState([]);

    React.useEffect(() => {
        const storedCombos = JSON.parse(localStorage.getItem('combos') || '[]');
        if (storedCombos.length > 0) {
            setCombos(storedCombos);
        } else {
            // Fallback to defaults if empty (same as ComboSection)
            const defaultCombos = [
                {
                    id: 'combo-1',
                    name: 'Pack Desayuno',
                    description: 'Cereal + Leche + Café',
                    price: 85.00,
                    originalPrice: 110.00,
                    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=300&q=80',
                    items: [
                        { id: 'c-1-1', name: 'Cereal Maíz', price: 35, quantity: 1 },
                        { id: 'c-1-2', name: 'Leche Entera', price: 25, quantity: 1 },
                        { id: 'c-1-3', name: 'Café Soluble', price: 50, quantity: 1 }
                    ]
                },
                {
                    id: 'combo-2',
                    name: 'Pack Limpieza',
                    description: 'Detergente + Suavizante + Cloro',
                    price: 120.00,
                    originalPrice: 155.00,
                    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80',
                    items: [
                        { id: 'c-2-1', name: 'Detergente 1kg', price: 45, quantity: 1 },
                        { id: 'c-2-2', name: 'Suavizante 1L', price: 35, quantity: 1 },
                        { id: 'c-2-3', name: 'Cloro 2L', price: 20, quantity: 1 }
                    ]
                },
                {
                    id: 'combo-3',
                    name: 'Pack Fiesta',
                    description: 'Refrescos + Papas + Vasos',
                    price: 150.00,
                    originalPrice: 190.00,
                    image: 'https://images.unsplash.com/photo-1530103862676-de3c9a59af38?auto=format&fit=crop&w=300&q=80',
                    items: [
                        { id: 'c-3-1', name: 'Refresco Cola 3L', price: 40, quantity: 2 },
                        { id: 'c-3-2', name: 'Papas Fritas', price: 45, quantity: 2 },
                        { id: 'c-3-3', name: 'Vasos Desechables', price: 20, quantity: 1 }
                    ]
                }
            ];
            setCombos(defaultCombos);
        }
    }, []);

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={onBack}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginLeft: '-0.5rem' }}
                >
                    <ArrowLeft size={24} color="var(--color-primary)" />
                </button>
                <h2 style={{ margin: 0 }}>Todos los Combos 💰</h2>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '1rem'
            }}>
                {combos.map(combo => (
                    <div key={combo.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid #eee',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                            <img
                                src={combo.image}
                                alt={combo.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                backgroundColor: '#d32f2f',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                            }}>
                                -${(combo.originalPrice - combo.price).toFixed(0)}
                            </div>
                        </div>

                        <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{combo.name}</h4>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#666', flex: 1 }}>{combo.description}</p>

                            <div style={{ marginTop: 'auto' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                        ${combo.price.toFixed(2)}
                                    </span>
                                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8rem' }}>
                                        ${combo.originalPrice.toFixed(2)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => onAddCombo(combo)}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#333',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.5rem',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    <Plus size={16} />
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
