import React, { useState, useEffect } from 'react';
import { Clock, Package, Truck, CheckCircle, Search, Eye } from 'lucide-react';
import { OrderService } from '../../services/orders';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

const STATUS_COLUMNS = [
    { id: 'pending', label: 'Pendiente', icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { id: 'preparing', label: 'Preparando', icon: Package, color: '#3b82f6', bg: '#dbeafe' },
    { id: 'shipping', label: 'En Camino', icon: Truck, color: '#8b5cf6', bg: '#ede9fe' },
    { id: 'delivered', label: 'Entregado', icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
];

export function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draggedOrder, setDraggedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        const data = await OrderService.getOrders();
        // Ensure orders have a status, default to 'pending'
        const normalized = data.map(o => ({ ...o, status: o.status || 'pending' }));
        setOrders(normalized);
        setLoading(false);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        await OrderService.updateStatus(orderId, newStatus);
    };

    const onDragStart = (e, order) => {
        setDraggedOrder(order);
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = (e, status) => {
        e.preventDefault();
        if (draggedOrder && draggedOrder.status !== status) {
            handleStatusChange(draggedOrder.id, status);
        }
        setDraggedOrder(null);
    };

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchTerm) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Tablero de Pedidos</h2>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        Arrastra las tarjetas para cambiar el estado
                    </div>
                </div>

                <div style={{ position: 'relative', minWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Buscar por ID o Cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                            border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', height: '100%' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: '1', minWidth: '280px', backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '1rem' }}>
                            <Skeleton height="40px" style={{ marginBottom: '1rem' }} />
                            <Skeleton height="120px" style={{ marginBottom: '1rem' }} />
                            <Skeleton height="120px" style={{ marginBottom: '1rem' }} />
                        </div>
                    ))}
                </div>
            ) : filteredOrders.length === 0 && searchTerm ? (
                <EmptyState
                    title="No se encontraron pedidos"
                    message={`No hay resultados para "${searchTerm}"`}
                />
            ) : (
                <div style={{
                    display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', height: '100%'
                }}>
                    {STATUS_COLUMNS.map(column => (
                        <div
                            key={column.id}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, column.id)}
                            style={{
                                flex: '1', minWidth: '280px', backgroundColor: '#f3f4f6',
                                borderRadius: '12px', display: 'flex', flexDirection: 'column'
                            }}
                        >
                            {/* Column Header */}
                            <div style={{
                                padding: '1rem', borderBottom: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                backgroundColor: 'white', borderRadius: '12px 12px 0 0'
                            }}>
                                <div style={{
                                    padding: '0.25rem', borderRadius: '6px', backgroundColor: column.bg, color: column.color
                                }}>
                                    <column.icon size={18} />
                                </div>
                                <span style={{ fontWeight: '600', color: '#374151' }}>{column.label}</span>
                                <span style={{
                                    marginLeft: 'auto', backgroundColor: '#e5e7eb', padding: '0.1rem 0.5rem',
                                    borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'
                                }}>
                                    {filteredOrders.filter(o => o.status === column.id).length}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filteredOrders.filter(o => o.status === column.id).map(order => (
                                    <div
                                        key={order.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, order)}
                                        style={{
                                            backgroundColor: 'white', padding: '1rem', borderRadius: '8px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'grab',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>#{String(order.id).slice(0, 8)}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#374151' }}>Total: <strong>${order.total.toFixed(2)}</strong></div>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{order.items.length} productos</div>
                                            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: order.deliveryMethod === 'pickup' ? '#d97706' : '#059669', fontWeight: '500' }}>
                                                {order.deliveryMethod === 'pickup' ? '🏪 Recoger en Tienda' : '🚚 Envío a Domicilio'}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                {order.customerName || 'Cliente'}
                                            </div>
                                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#3b82f6' }}>
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredOrders.filter(o => o.status === column.id).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.9rem', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
                                        Sin pedidos
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
