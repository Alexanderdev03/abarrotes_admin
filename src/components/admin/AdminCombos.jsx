import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Search } from 'lucide-react';
import { ProductService } from '../../services/products';

export function AdminCombos() {
    const [combos, setCombos] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        image: '',
        items: [] // { id, name, price, quantity }
    });

    // Product Selection State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const storedCombos = JSON.parse(localStorage.getItem('combos') || '[]');
        setCombos(storedCombos);
        const allProducts = await ProductService.getAllProducts();
        setProducts(allProducts);
    };

    const handleOpenModal = (combo = null) => {
        if (combo) {
            setEditingCombo(combo);
            setFormData(combo);
        } else {
            setEditingCombo(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                originalPrice: '',
                image: '',
                items: []
            });
        }
        setIsModalOpen(true);
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;
        const product = products.find(p => p.id === parseInt(selectedProduct));
        if (!product) return;

        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        };

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setSelectedProduct('');
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateQuantity = (index, delta) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
            return { ...prev, items: newItems };
        });
    };

    const handleSave = () => {
        let updatedCombos;
        if (editingCombo) {
            updatedCombos = combos.map(c => c.id === editingCombo.id ? { ...formData, id: editingCombo.id } : c);
        } else {
            updatedCombos = [...combos, { ...formData, id: Date.now() }];
        }

        setCombos(updatedCombos);
        localStorage.setItem('combos', JSON.stringify(updatedCombos));
        setIsModalOpen(false);
        // Dispatch event for App.jsx to pick up changes if needed, or just rely on reload/state lift
        window.dispatchEvent(new Event('storage'));
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar este combo?')) {
            const updated = combos.filter(c => c.id !== id);
            setCombos(updated);
            localStorage.setItem('combos', JSON.stringify(updated));
        }
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Gestión de Combos</h2>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem',
                        borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500'
                    }}
                >
                    <Plus size={18} />
                    Nuevo Combo
                </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {combos.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No hay combos creados.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {combos.map(combo => (
                            <div key={combo.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ height: '150px', backgroundColor: '#f3f4f6' }}>
                                    {combo.image && <img src={combo.image} alt={combo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{combo.name}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>{combo.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                                                ${Number(combo.originalPrice).toFixed(2)}
                                            </span>
                                            <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '1.1rem' }}>
                                                ${Number(combo.price).toFixed(2)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleOpenModal(combo)} style={{ padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                                            <button onClick={() => handleDelete(combo.id)} style={{ padding: '0.25rem', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', color: '#ef4444' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px',
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{editingCombo ? 'Editar Combo' : 'Nuevo Combo'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nombre del Combo</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Descripción</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Precio Oferta</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Precio Original</label>
                                    <input
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>URL Imagen</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>

                            {/* Product Selector */}
                            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Agregar Productos</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        value={selectedProduct}
                                        onChange={e => setSelectedProduct(e.target.value)}
                                        style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    >
                                        <option value="">Seleccionar producto...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAddItem}
                                        style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0 1rem', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>

                            {/* Selected Items List */}
                            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
                                {formData.items.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                        <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button onClick={() => handleUpdateQuantity(index, -1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #d1d5db', cursor: 'pointer' }}>-</button>
                                            <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => handleUpdateQuantity(index, 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #d1d5db', cursor: 'pointer' }}>+</button>
                                            <button onClick={() => handleRemoveItem(index)} style={{ marginLeft: '0.5rem', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {formData.items.length === 0 && <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No hay productos en el combo.</span>}
                            </div>

                            <button
                                onClick={handleSave}
                                style={{
                                    marginTop: '1rem',
                                    backgroundColor: '#3b82f6', color: 'white', border: 'none',
                                    padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                Guardar Combo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
