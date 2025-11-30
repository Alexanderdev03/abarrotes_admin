import React, { useState } from 'react';
import {
    LayoutDashboard, Package, ShoppingBag, Users, Tag,
    Image, Settings, LogOut, Menu, X, Layers, Monitor, List, Store
} from 'lucide-react';

export function AdminLayout({ children, activeView, onViewChange, onLogout, onExit }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'pos', icon: Monitor, label: 'Caja (POS)' },
        { id: 'products', icon: Package, label: 'Productos' },
        { id: 'categories', icon: List, label: 'Categorías' },
        { id: 'orders', icon: ShoppingBag, label: 'Pedidos' },
        { id: 'customers', icon: Users, label: 'Clientes' },
        { id: 'promos', icon: Tag, label: 'Promociones' },
        { id: 'combos', icon: Layers, label: 'Combos' },
        { id: 'content', icon: Image, label: 'Contenido' },
        { id: 'settings', icon: Settings, label: 'Configuración' },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Sidebar */}
            <aside style={{
                width: isSidebarOpen ? '260px' : '0',
                backgroundColor: '#1f2937',
                color: 'white',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '32px', height: '32px', backgroundColor: '#3b82f6',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1.2rem'
                    }}>A</div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Admin Panel</span>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                marginBottom: '0.5rem',
                                backgroundColor: activeView === item.id ? '#374151' : 'transparent',
                                color: activeView === item.id ? '#60a5fa' : '#9ca3af',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            <item.icon size={20} />
                            <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid #374151' }}>
                    <button
                        onClick={onExit}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: 'transparent',
                            color: '#10b981',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <Store size={20} />
                        <span>Volver a la Tienda</span>
                    </button>
                    <button
                        onClick={onLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <header style={{
                    height: '64px',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.5rem'
                }}>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}
                    >
                        {isSidebarOpen ? <Menu size={24} /> : <Menu size={24} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>Admin User</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>admin@abarrotes.com</div>
                        </div>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Users size={20} color="#6b7280" />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
