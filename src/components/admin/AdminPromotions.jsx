import React, { useState, useEffect } from 'react';
import { Save, Tag, Zap, Trash2, Plus } from 'lucide-react';
import { ProductService } from '../../services/products';

export function AdminPromotions() {
    const [products, setProducts] = useState([]);
    const [flashSaleId, setFlashSaleId] = useState(localStorage.getItem('flashSaleId') || '');
    const [coupons, setCoupons] = useState(() => JSON.parse(localStorage.getItem('adminCoupons') || '[]'));
    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', points: '' });

    useEffect(() => {
        ProductService.getAllProducts().then(setProducts);
    }, []);

    const handleSaveFlashSale = () => {
        localStorage.setItem('flashSaleId', flashSaleId);
        // Dispatch event to notify other components if needed, or just rely on reload
        window.dispatchEvent(new Event('storage'));
        alert('Oferta relámpago actualizada');
    };

    const handleAddCoupon = (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount) return;

        const updated = [...coupons, {
            ...newCoupon,
            id: Date.now(),
            discount: Number(newCoupon.discount),
            points: Number(newCoupon.points) || 0
        }];
        setCoupons(updated);
        localStorage.setItem('adminCoupons', JSON.stringify(updated));
        setNewCoupon({ code: '', discount: '', points: '' });
    };

    const handleDeleteCoupon = (id) => {
        const updated = coupons.filter(c => c.id !== id);
        setCoupons(updated);
        localStorage.setItem('adminCoupons', JSON.stringify(updated));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Flash Sale Section */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={20} fill="orange" color="orange" />
                    Configurar Oferta Relámpago
                </h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Selecciona el producto que aparecerá en el banner de "Oferta Relámpago" en la pantalla principal.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={flashSaleId}
                        onChange={(e) => setFlashSaleId(e.target.value)}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    >
                        <option value="">-- Seleccionar Producto --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleSaveFlashSale}
                        style={{
                            backgroundColor: '#3b82f6', color: 'white', border: 'none',
                            padding: '0 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <Save size={18} />
                        Guardar
                    </button>
                </div>
            </div>

            {/* Coupons Section */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={20} color="#10b981" />
                    Cupones de Descuento
                </h3>

                {/* Add Coupon Form */}
                <form onSubmit={handleAddCoupon} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Código del Cupón</label>
                        <input
                            type="text"
                            placeholder="EJ: VERANO2024"
                            value={newCoupon.code}
                            onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div style={{ width: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Descuento ($)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newCoupon.discount}
                            onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div style={{ width: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Costo en Puntos</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={newCoupon.points}
                            onChange={e => setNewCoupon({ ...newCoupon, points: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#10b981', color: 'white', border: 'none',
                            padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', height: '46px'
                        }}
                    >
                        <Plus size={18} />
                        Agregar
                    </button>
                </form>

                {/* Coupons List */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6b7280' }}>CÓDIGO</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6b7280' }}>DESCUENTO</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6b7280' }}>COSTO (PTS)</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6b7280', textAlign: 'right' }}>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                        No hay cupones activos
                                    </td>
                                </tr>
                            ) : (
                                coupons.map(coupon => (
                                    <tr key={coupon.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>{coupon.code}</td>
                                        <td style={{ padding: '1rem', color: '#059669', fontWeight: 'bold' }}>${coupon.discount.toFixed(2)}</td>
                                        <td style={{ padding: '1rem', color: '#ea580c', fontWeight: 'bold' }}>{coupon.points || 0} pts</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon.id)}
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
