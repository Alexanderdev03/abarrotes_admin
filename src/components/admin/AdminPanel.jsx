import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, ShoppingBag, DollarSign, TrendingUp,
    AlertTriangle, Package, Calendar, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { OrderService } from '../../services/orders';

export function AdminPanel() {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        activeCustomers: 0,
        averageOrderValue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Load data in parallel
            const [orders, products] = await Promise.all([
                api.orders.getAll(), // Consider pagination here for future scalability
                api.products.getAll()
            ]);

            // Calculate stats using useMemo-like logic (but inside async function)
            // In a real large-scale app, these calculations should be done on the backend (e.g., Firebase Functions)

            const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
            const totalOrders = orders.length;
            const uniqueCustomers = new Set(orders.map(o => o.customerEmail || o.id)).size;
            const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

            setStats({
                totalSales,
                totalOrders,
                activeCustomers: uniqueCustomers,
                averageOrderValue
            });

            // Recent Orders (Last 5)
            const sortedOrders = [...orders].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
            setRecentOrders(sortedOrders.slice(0, 5));

            // Top Products Calculation
            const productSales = {};
            orders.forEach(order => {
                if (order.items) {
                    order.items.forEach(item => {
                        if (!productSales[item.id]) {
                            productSales[item.id] = {
                                ...item,
                                salesCount: 0,
                                revenue: 0
                            };
                        }
                        productSales[item.id].salesCount += (item.quantity || 0);
                        productSales[item.id].revenue += (item.price * item.quantity || 0);
                    });
                }
            });

            const sortedProducts = Object.values(productSales)
                .sort((a, b) => b.salesCount - a.salesCount)
                .slice(0, 5);
            setTopProducts(sortedProducts);

            // Low Stock Products
            const lowStock = products.filter(p => p.stock !== undefined && p.stock < 10);
            setLowStockProducts(lowStock);

        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando dashboard...</div>;
    }

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>Dashboard</h2>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Ventas Totales"
                    value={`$${stats.totalSales.toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="Pedidos Totales"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="blue"
                />
                <StatCard
                    title="Clientes Activos"
                    value={stats.activeCustomers}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="Ticket Promedio"
                    value={`$${stats.averageOrderValue.toFixed(2)}`}
                    icon={TrendingUp}
                    color="orange"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Orders */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>Pedidos Recientes</h3>
                        <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Ver todos</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentOrders.map(order => (
                            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                                <div>
                                    <div style={{ fontWeight: '500', color: '#111827' }}>Pedido #{order.id}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        {order.date instanceof Date ? order.date.toLocaleDateString() : new Date(order.date).toLocaleDateString()} • {order.items?.length || 0} items
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '600', color: '#111827' }}>${order.total?.toFixed(2)}</div>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        backgroundColor: order.status === 'Completado' ? '#d1fae5' : '#fef3c7',
                                        color: order.status === 'Completado' ? '#065f46' : '#92400e'
                                    }}>
                                        {order.status || 'Pendiente'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <AlertTriangle size={20} color="#ef4444" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>Alerta de Stock Bajo</h3>
                    </div>
                    {lowStockProducts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {lowStockProducts.slice(0, 5).map(product => (
                                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={product.image} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '500' }}>Stock: {product.stock}</div>
                                    </div>
                                    <button style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', background: 'none', cursor: 'pointer' }}>
                                        Reabastecer
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>Todo en orden</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    const colors = {
        green: { bg: '#dcfce7', text: '#166534' },
        blue: { bg: '#dbeafe', text: '#1e40af' },
        purple: { bg: '#f3e8ff', text: '#6b21a8' },
        orange: { bg: '#ffedd5', text: '#9a3412' }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                backgroundColor: colors[color].bg, color: colors[color].text,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={24} />
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>{title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{value}</div>
            </div>
        </div>
    );
}
