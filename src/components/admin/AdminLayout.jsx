import React, { useState } from 'react';
import {
    Image, Settings, LogOut, Menu, X, Layers, List
} from 'lucide-react';
import { useAuth } from '../../context/auth.jsx';

const ADMIN_EMAIL = 'alexanderdayanperazacasanova@gmail.com';

export function AdminLayout({ children, activeView, onViewChange, onLogout, onExit }) {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    React.useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile && isSidebarOpen) {
                setIsSidebarOpen(false);
            } else if (!mobile && !isSidebarOpen) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!user || user.email !== ADMIN_EMAIL) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                color: '#374151'
            }}>
                <h1 style={{ marginBottom: '1rem' }}>Acceso Denegado</h1>
                <p style={{ marginBottom: '2rem' }}>No tienes permisos para ver esta página.</p>
                <button
                    onClick={onExit}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Volver a la Tienda
                </button>
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'products', icon: Package, label: 'Productos' },
        { id: 'categories', icon: List, label: 'Categorías' },
        { id: 'orders', icon: ShoppingBag, label: 'Pedidos' },
        { id: 'customers', icon: Users, label: 'Clientes' },
        { id: 'promos', icon: Tag, label: 'Promociones' },
        { id: 'combos', icon: Layers, label: 'Combos' },
        { id: 'content', icon: Image, label: 'Contenido' },
        { id: 'settings', icon: Settings, label: 'Configuración' },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', position: 'relative', overflow: 'hidden' }}>
            {/* Mobile Backdrop */}
            {isMobile && isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 40,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: '#1f2937',
                color: 'white',
                transition: 'transform 0.3s ease',
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                position: isMobile ? 'fixed' : 'relative',
                height: '100%',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isMobile && isSidebarOpen ? '4px 0 10px rgba(0,0,0,0.1)' : 'none',
                marginLeft: isMobile ? 0 : (isSidebarOpen ? 0 : '-260px') // Adjust for desktop push
            }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px', backgroundColor: '#3b82f6',
                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '1.2rem'
                        }}>A</div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Admin Panel</span>
                    </div>
                    {isMobile && (
                        <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onViewChange(item.id);
                                if (isMobile) setIsSidebarOpen(false);
                            }}
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
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                {/* Header */}
                <header style={{
                    height: '64px',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.5rem',
                    flexShrink: 0
                }}>
                    <button
                        onClick={toggleSidebar}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}
                    >
                        <Menu size={24} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>{user.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{user.email}</div>
                        </div>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Users size={20} color="#6b7280" />
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '1rem' : '2rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
