import React, { useState, useEffect } from 'react';
import { Save, Tag, Zap, Trash2, Plus, Edit, Gift } from 'lucide-react';
import { ProductService } from '../../services/products';
import { ConfirmationModal } from '../ConfirmationModal';

export function AdminPromotions() {
    const [products, setProducts] = useState([]);
    const [flashSaleId, setFlashSaleId] = useState(localStorage.getItem('flashSaleId') || '');
    const [coupons, setCoupons] = useState([]);
    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', points: '' });
    const [editingCoupon, setEditingCoupon] = useState(null);

    // Reward Products State
    const [rewardProducts, setRewardProducts] = useState([]);
    const [newRewardProduct, setNewRewardProduct] = useState({ name: '', points: '', image: '', originalId: null });

    // Confirmation Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const prods = await ProductService.getAllProducts();
            setProducts(prods.map(p => ({ ...p, id: String(p.id) })));

            const { ContentService } = await import('../../services/content');
            const couponsData = await ContentService.getCoupons();
            setCoupons(couponsData);

            const rewardsData = await ContentService.getRewardProducts();
            setRewardProducts(rewardsData);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const handleSaveFlashSale = () => {
        localStorage.setItem('flashSaleId', flashSaleId);
        // Dispatch event to notify other components if needed, or just rely on reload
        window.dispatchEvent(new Event('storage'));
        alert('Oferta relámpago actualizada');
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount) return;

        try {
            const { ContentService } = await import('../../services/content');
            const couponData = {
                code: newCoupon.code,
                discount: Number(newCoupon.discount),
                points: Number(newCoupon.points) || 0
            };

            if (editingCoupon) {
                await ContentService.updateCoupon(editingCoupon.id, couponData);
                setEditingCoupon(null);
                alert('Cupón actualizado correctamente');
            } else {
                await ContentService.addCoupon({
                    ...couponData,
                    createdAt: new Date().toISOString()
                });
                alert('Cupón agregado correctamente');
            }

            loadData();
            setNewCoupon({ code: '', discount: '', points: '' });
        } catch (error) {
            console.error(error);
            alert('Error al guardar el cupón');
        }
    };

    const handleEditCoupon = (coupon) => {
        setEditingCoupon(coupon);
        setNewCoupon({
            code: coupon.code,
            discount: coupon.discount,
            points: coupon.points || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingCoupon(null);
        setNewCoupon({ code: '', discount: '', points: '' });
    };

    const handleDeleteCoupon = (id, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setModalConfig({
            isOpen: true,
            title: '¿Eliminar cupón?',
            message: '¿Estás seguro de eliminar este cupón? Esta acción no se puede deshacer.',
            isDanger: true,
            confirmText: 'Sí, eliminar',
            onConfirm: async () => {
                try {
                    const { ContentService } = await import('../../services/content');
                    await ContentService.deleteCoupon(id);
                    loadData();
                    if (editingCoupon && editingCoupon.id === id) {
                        handleCancelEdit();
                    }
                } catch (error) {
                    alert('Error al eliminar el cupón');
                }
            }
        });
    };

    const handleAddRewardProduct = async (e) => {
        e.preventDefault();
        if (!newRewardProduct.name || !newRewardProduct.points) return;

        try {
            const { ContentService } = await import('../../services/content');
            await ContentService.addRewardProduct({
                name: newRewardProduct.name,
                points: Number(newRewardProduct.points),
                image: newRewardProduct.image || 'https://via.placeholder.com/150',
                originalId: newRewardProduct.originalId || null
            });
            alert('Producto de recompensa agregado');
            setNewRewardProduct({ name: '', points: '', image: '', originalId: null });
            loadData();
        } catch (error) {
            console.error(error);
            alert('Error al agregar producto');
        }
    };

    const handleDeleteRewardProduct = (id) => {
        setModalConfig({
            isOpen: true,
            title: '¿Eliminar producto?',
            message: '¿Estás seguro de eliminar este producto de recompensa?',
            isDanger: true,
            confirmText: 'Sí, eliminar',
            onConfirm: async () => {
                try {
                    const { ContentService } = await import('../../services/content');
                    await ContentService.deleteRewardProduct(id);
                    loadData();
                } catch (error) {
                    alert('Error al eliminar producto');
                }
            }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
            />

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

                {/* Add/Edit Coupon Form */}
                <form onSubmit={handleAddCoupon} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {editingCoupon && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                style={{
                                    backgroundColor: '#9ca3af', color: 'white', border: 'none',
                                    padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                                    height: '46px'
                                }}
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            type="submit"
                            style={{
                                backgroundColor: editingCoupon ? '#f59e0b' : '#10b981', color: 'white', border: 'none',
                                padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', height: '46px'
                            }}
                        >
                            {editingCoupon ? <Save size={18} /> : <Plus size={18} />}
                            {editingCoupon ? 'Actualizar' : 'Agregar'}
                        </button>
                    </div>
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
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                        No hay cupones activos
                                    </td>
                                </tr>
                            ) : (
                                coupons.map(coupon => (
                                    <tr key={coupon.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: editingCoupon?.id === coupon.id ? '#fff7ed' : 'transparent' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>{coupon.code}</td>
                                        <td style={{ padding: '1rem', color: '#059669', fontWeight: 'bold' }}>${coupon.discount.toFixed(2)}</td>
                                        <td style={{ padding: '1rem', color: '#ea580c', fontWeight: 'bold' }}>{coupon.points || 0} pts</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditCoupon(coupon);
                                                    }}
                                                    style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteCoupon(coupon.id, e)}
                                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Reward Products Section */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gift size={20} color="#8b5cf6" />
                    Productos de Recompensa
                </h3>

                {/* Add Reward Product Form */}
                <form onSubmit={handleAddRewardProduct} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Seleccionar Producto</label>
                        <select
                            value={newRewardProduct.name}
                            onChange={e => {
                                const selectedProduct = products.find(p => p.name === e.target.value);
                                if (selectedProduct) {
                                    setNewRewardProduct({
                                        ...newRewardProduct,
                                        name: selectedProduct.name,
                                        image: selectedProduct.image,
                                        originalId: selectedProduct.id // Store original ID for reference
                                    });
                                } else {
                                    setNewRewardProduct({ ...newRewardProduct, name: e.target.value });
                                }
                            }}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        >
                            <option value="">-- Seleccionar --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ width: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Costo en Puntos</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={newRewardProduct.points}
                            onChange={e => setNewRewardProduct({ ...newRewardProduct, points: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>URL de Imagen</label>
                        <input
                            type="text"
                            placeholder="https://..."
                            value={newRewardProduct.image}
                            onChange={e => setNewRewardProduct({ ...newRewardProduct, image: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#8b5cf6', color: 'white', border: 'none',
                            padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', height: '46px'
                        }}
                    >
                        <Plus size={18} />
                        Agregar
                    </button>
                </form>

                {/* Reward Products List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {rewardProducts.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', padding: '2rem', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '8px' }}>
                            No hay productos de recompensa configurados
                        </div>
                    ) : (
                        rewardProducts.map(product => (
                            <div key={product.id} style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                                <button
                                    onClick={() => handleDeleteRewardProduct(product.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: '#fee2e2',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '0.5rem' }}
                                />
                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{product.name}</h4>
                                <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{product.points} pts</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
