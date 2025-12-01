import React, { useState } from 'react';
import { X, User, ShoppingBag, Calendar, DollarSign, Award, Package, Save, Trash2, Edit2 } from 'lucide-react';
import { UserService } from '../../services/users';

export function CustomerProfileModal({ customer, onClose, orderHistory = [], onUpdate }) {
    const [isEditingWallet, setIsEditingWallet] = useState(false);
    const [walletAmount, setWalletAmount] = useState(customer?.wallet || 0);
    const [updating, setUpdating] = useState(false);

    if (!customer) return null;

    // Calculate metrics
    const totalSpent = orderHistory.reduce((sum, order) => sum + (order.total || 0), 0);
    const lastOrderDate = orderHistory.length > 0
        ? new Date(Math.max(...orderHistory.map(o => new Date(o.date).getTime()))).toLocaleDateString()
        : 'Sin compras';

    // Find favorite product
    const productCounts = {};
    orderHistory.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                productCounts[item.name] = (productCounts[item.name] || 0) + (item.quantity || 1);
            });
        }
    });
    const favoriteProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];

    const handleUpdateWallet = async () => {
        setUpdating(true);
        try {
            await UserService.updateWallet(customer.email, walletAmount);
            setIsEditingWallet(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            alert('Error al actualizar puntos');
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveCoupon = async (couponCode) => {
        if (!confirm(`¿Estás seguro de eliminar el cupón ${couponCode}?`)) return;

        setUpdating(true);
        try {
            await UserService.removeCoupon(customer.email, couponCode);
            if (onUpdate) onUpdate();
        } catch (error) {
            alert('Error al eliminar cupón');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '900px',
                maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ padding: '2rem' }}>
                    {/* Header Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            backgroundColor: '#e0f2fe', color: '#0284c7',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: 'bold'
                        }}>
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>{customer.name || 'Usuario'}</h2>
                            <div style={{ color: '#6b7280', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <span>{customer.email}</span>
                                {customer.phone && <span>• {customer.phone}</span>}
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem', backgroundColor: '#dcfce7', color: '#15803d',
                                    borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600'
                                }}>
                                    Cliente Activo
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {/* Wallet / Points */}
                        <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#0369a1', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <DollarSign size={18} />
                                    <span style={{ fontSize: '0.875rem' }}>Monedero (Puntos)</span>
                                </div>
                                {!isEditingWallet && (
                                    <button onClick={() => setIsEditingWallet(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7' }}>
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                            {isEditingWallet ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        value={walletAmount}
                                        onChange={(e) => setWalletAmount(e.target.value)}
                                        style={{ width: '100%', padding: '0.25rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                    <button onClick={handleUpdateWallet} disabled={updating} style={{ background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                                        <Save size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0c4a6e' }}>
                                    {customer.wallet || 0} pts
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                <ShoppingBag size={18} />
                                <span style={{ fontSize: '0.875rem' }}>Total Pedidos</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                                {orderHistory.length}
                            </div>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                <Calendar size={18} />
                                <span style={{ fontSize: '0.875rem' }}>Última Compra</span>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
                                {lastOrderDate}
                            </div>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9a3412', marginBottom: '0.5rem' }}>
                                <Award size={18} />
                                <span style={{ fontSize: '0.875rem' }}>Producto Favorito</span>
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#9a3412', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {favoriteProduct ? favoriteProduct[0] : 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Coupons List */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '1rem' }}>Cupones Activos</h3>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', maxHeight: '300px', overflowY: 'auto' }}>
                                {customer.coupons && customer.coupons.length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {customer.coupons.map((coupon, idx) => (
                                            <li key={idx} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#111827' }}>{coupon.code}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                        {coupon.type === 'product' ? 'Producto Gratis' : `$${coupon.discount} desc.`}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveCoupon(coupon.code)}
                                                    disabled={updating}
                                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    title="Eliminar cupón"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                                        El cliente no tiene cupones activos.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order History */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '1rem' }}>Historial de Pedidos</h3>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', maxHeight: '300px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <tr>
                                            <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#6b7280' }}>ID</th>
                                            <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#6b7280' }}>Fecha</th>
                                            <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#6b7280' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                                                    Sin pedidos
                                                </td>
                                            </tr>
                                        ) : (
                                            orderHistory.map((order, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#111827' }}>
                                                        #{order.id ? order.id.slice(-6) : idx + 1}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                                        {new Date(order.date).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: '500', color: '#111827' }}>
                                                        ${order.total.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
