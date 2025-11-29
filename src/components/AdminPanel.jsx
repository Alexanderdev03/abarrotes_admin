import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Users, DollarSign, Download, Calendar, AlertTriangle } from 'lucide-react';
import { ProductService } from '../services/products';
import { OrderService } from '../services/orders';

export function AdminPanel() {
    const [stats, setStats] = useState({
        dailySales: 0,
        weeklySales: 0,
        monthlySales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageTicket: 0,
        lowStockCount: 0,
        last7Days: [],
        zeroMovement: []
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        // Load orders from Firebase
        const orders = await OrderService.getOrders();
        const customers = JSON.parse(localStorage.getItem('user') ? '[1]' : '[]'); // Mock customer count
        const products = await ProductService.getAllProducts();

        // Calculate Stats
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let daily = 0;
        let weekly = 0;
        let monthly = 0;
        const productSales = {};

        // Last 7 Days Chart Data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (6 - i));
            return {
                date: d.toISOString().split('T')[0],
                label: d.toLocaleDateString('es-ES', { weekday: 'short' }),
                amount: 0
            };
        });

        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const orderTotal = parseFloat(order.total) || 0;
            const orderDateStr = orderDate.toISOString().split('T')[0];

            if (orderDate >= startOfDay) daily += orderTotal;
            if (orderDate >= startOfWeek) weekly += orderTotal;
            if (orderDate >= startOfMonth) monthly += orderTotal;

            // Chart Data
            const dayStat = last7Days.find(d => d.date === orderDateStr);
            if (dayStat) dayStat.amount += orderTotal;

            // Count products
            order.items.forEach(item => {
                if (!productSales[item.name]) productSales[item.name] = 0;
                productSales[item.name] += item.quantity;
            });
        });

        // Top Products
        const sortedProducts = Object.entries(productSales)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Zero Movement Products
        const zeroMovement = products.filter(p => !productSales[p.name]);

        // Low Stock
        const lowStock = products.filter(p => {
            if (typeof p.stock === 'string' && !Number.isNaN(Number(p.stock))) {
                return Number(p.stock) < 10;
            }
            return (p.stock || 0) < 10;
        });

        setStats({
            dailySales: daily,
            weeklySales: weekly,
            monthlySales: monthly,
            totalOrders: orders.length,
            totalCustomers: customers.length || 1,
            averageTicket: orders.length > 0 ? (orders.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0) / orders.length) : 0,
            lowStockCount: lowStock.length,
            last7Days,
            zeroMovement
        });

        setRecentOrders(orders.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
        setTopProducts(sortedProducts);
        setLowStockProducts(lowStock.slice(0, 5));
    };

    const exportToExcel = async () => {
        const orders = await OrderService.getOrders();
        if (orders.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Create CSV content
        const headers = ['ID Pedido', 'Fecha', 'Cliente', 'Total', 'Estado', 'Items'];
        const rows = orders.map(order => [
            order.id,
            new Date(order.date).toLocaleString(),
            order.customerName || 'Cliente',
            order.total.toFixed(2),
            order.status || 'pending',
            order.items.map(i => `${i.quantity}x ${i.name}`).join('; ')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ventas_abarrotes_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="flex-between">
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Dashboard</h2>
                <button
                    onClick={exportToExcel}
                    style={{
                        backgroundColor: '#10b981', color: 'white', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <Download size={18} />
                    Exportar Excel
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard icon={DollarSign} label="Ventas Hoy" value={`$${stats.dailySales.toFixed(2)}`} color="#10b981" bg="#d1fae5" />
                <StatCard icon={Calendar} label="Ventas Semanales" value={`$${stats.weeklySales.toFixed(2)}`} color="#3b82f6" bg="#dbeafe" />
                <StatCard icon={TrendingUp} label="Ventas Mensuales" value={`$${stats.monthlySales.toFixed(2)}`} color="#8b5cf6" bg="#ede9fe" />
                <StatCard icon={ShoppingBag} label="Total Pedidos" value={stats.totalOrders} color="#f59e0b" bg="#fef3c7" />
                <StatCard icon={DollarSign} label="Ticket Promedio" value={`$${stats.averageTicket.toFixed(2)}`} color="#ec4899" bg="#fce7f3" />
            </div>

            {lowStockProducts.length > 0 && (
                <div style={{ backgroundColor: '#fff1f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: '#fecdd3', borderRadius: '50%', color: '#e11d48' }}>
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#be123c' }}>Alerta de Stock Bajo</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#be123c' }}>
                            {lowStockProducts.length} productos tienen menos de 10 unidades: {lowStockProducts.map(p => p.name).join(', ')}
                        </p>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Sales Chart */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Ventas de los Últimos 7 Días</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                        {stats.last7Days.map((day, index) => (
                            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${(day.amount / (Math.max(...stats.last7Days.map(d => d.amount)) || 1)) * 150}px`,
                                    backgroundColor: '#3b82f6',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.5s ease',
                                    minHeight: '4px'
                                }}></div>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Zero Movement Products */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#ef4444' }}>Productos Sin Movimiento</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                        {stats.zeroMovement.slice(0, 10).map((product, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                                <span style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>{product.name}</span>
                            </div>
                        ))}
                        {stats.zeroMovement.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '1rem' }}>¡Todo se está vendiendo!</div>
                        )}
                        {stats.zeroMovement.length > 10 && (
                            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                +{stats.zeroMovement.length - 10} productos más
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Recent Orders */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Pedidos Recientes</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', color: '#6b7280' }}>ID</th>
                                    <th style={{ padding: '0.75rem', color: '#6b7280' }}>Cliente</th>
                                    <th style={{ padding: '0.75rem', color: '#6b7280' }}>Total</th>
                                    <th style={{ padding: '0.75rem', color: '#6b7280' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem' }}>#{String(order.id).slice(0, 6)}</td>
                                        <td style={{ padding: '0.75rem' }}>{order.customerName || 'Cliente'}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: '600' }}>${order.total.toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem',
                                                backgroundColor: order.status === 'delivered' ? '#d1fae5' : '#fef3c7',
                                                color: order.status === 'delivered' ? '#065f46' : '#92400e'
                                            }}>
                                                {order.status || 'Pendiente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>No hay pedidos recientes</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Más Vendidos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {topProducts.map((product, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3f4f6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#6b7280'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{product.name}</span>
                                </div>
                                <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{product.count} vendidos</span>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '1rem' }}>Sin datos de ventas</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: bg, color: color }}>
                <Icon size={24} />
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{value}</div>
            </div>
        </div>
    );
}
