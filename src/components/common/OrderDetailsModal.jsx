import React from 'react';
import { X, Package, MapPin, CreditCard, User, Calendar } from 'lucide-react';

export function OrderDetailsModal({ order, onClose }) {
    if (!order) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="animate-scale-in" style={{
                backgroundColor: 'white',
                width: '100%',
                maxWidth: '600px',
                borderRadius: '16px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Pedido #{order.id}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', color: '#6b7280', fontSize: '0.9rem' }}>
                            <Calendar size={14} />
                            {new Date(order.date).toLocaleString()}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                        <X size={24} color="#6b7280" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    {/* Customer Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>
                                <User size={16} />
                                Cliente
                            </div>
                            <div style={{ color: '#6b7280' }}>{order.customerName || 'Cliente Invitado'}</div>
                        </div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>
                                <CreditCard size={16} />
                                Método de Pago
                            </div>
                            <div style={{ color: '#6b7280' }}>
                                {order.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}
                            </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>
                                <MapPin size={16} />
                                Dirección de Entrega
                            </div>
                            <div style={{ color: '#6b7280' }}>{order.address || 'Recoger en tienda'}</div>
                        </div>
                    </div>

                    {/* Items List */}
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={20} />
                        Productos
                    </h3>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#6b7280' }}>Producto</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280' }}>Cant.</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right', color: '#6b7280' }}>Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: idx < order.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ fontWeight: '500', color: '#374151' }}>{item.name}</div>
                                            {item.isBulkSelection && (
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                    Peso: {item.cartQuantity} {item.cartUnit}
                                                </div>
                                            )}
                                            {item.notes && (
                                                <div style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                                    Nota: {item.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            {item.isBulkSelection ? '1' : item.quantity}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>
                                            ${(item.totalPrice || (item.price * item.quantity)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                                <tr>
                                    <td colSpan="2" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Subtotal</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                                        ${(order.subtotal || order.total).toFixed(2)}
                                    </td>
                                </tr>
                                {order.coupon && (
                                    <tr>
                                        <td colSpan="2" style={{ padding: '0.75rem', textAlign: 'right', color: '#2e7d32' }}>
                                            Cupón ({order.coupon.code})
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#2e7d32' }}>
                                            -${order.discountAmount ? order.discountAmount.toFixed(2) : order.coupon.discount.toFixed(2)}
                                        </td>
                                    </tr>
                                )}
                                {order.pointsUsed > 0 && (
                                    <tr>
                                        <td colSpan="2" style={{ padding: '0.75rem', textAlign: 'right', color: '#e65100' }}>
                                            Puntos Usados ({order.pointsUsed})
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#e65100' }}>
                                            -${(order.pointsUsed * 0.10).toFixed(2)}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="2" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>Total</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                                        ${order.total.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
