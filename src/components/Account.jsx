import React, { useState } from 'react';
import { ChevronRight, Package, User, MapPin, Mail, Heart, LogOut, ArrowLeft, CheckCircle, Clock, Truck, Home, CreditCard } from 'lucide-react';
import { ProductCard } from './ProductCard';

export function Account({ user, orders, favorites, onLogout, onUpdateUser, onToggleFavorite, onAddToCart, onProductSelect }) {
    const [currentView, setCurrentView] = useState('menu'); // menu, orders, payment, personal, addresses, privacy, favorites
    const [selectedOrder, setSelectedOrder] = useState(null);

    const MenuItem = ({ icon: Icon, title, subtitle, onClick, isLast }) => (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'white',
                borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
                cursor: 'pointer'
            }}
        >
            {Icon && <Icon size={24} style={{ marginRight: '1rem', color: '#333' }} />}
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '1rem', color: '#333' }}>{title}</div>
                {subtitle && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>{subtitle}</div>}
            </div>
            <ChevronRight size={20} color="#ccc" />
        </div>
    );

    const SectionHeader = ({ title, onBack }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: 'white',
            borderBottom: '1px solid #eee',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', marginRight: '1rem', cursor: 'pointer' }}>
                <ArrowLeft size={24} color="#333" />
            </button>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{title}</h2>
        </div>
    );

    if (currentView === 'menu') {
        return (
            <div style={{ backgroundColor: '#f5f5f5', minHeight: '100%' }}>
                {/* Header Blue (Primary) */}
                <div style={{
                    backgroundColor: 'var(--color-primary)',
                    padding: '2rem 1.5rem',
                    color: 'white',
                    marginBottom: '1rem'
                }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                        Mi Cuenta
                    </h1>
                </div>

                <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Pedidos Card */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <MenuItem
                            icon={Package}
                            title="Pedidos"
                            subtitle="Rastrea tus pedidos actuales, inicia una devolución o revisa tus pedidos anteriores."
                            onClick={() => setCurrentView('orders')}
                            isLast={true}
                        />
                    </div>

                    {/* Administrar cuenta Section */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333', marginLeft: '0.5rem' }}>
                            Administrar cuenta
                        </h3>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
                            <MenuItem
                                icon={User}
                                title="Información personal"
                                subtitle="Información de contacto y contraseña"
                                onClick={() => setCurrentView('personal')}
                            />
                            <MenuItem
                                icon={MapPin}
                                title="Direcciones"
                                onClick={() => setCurrentView('addresses')}
                            />
                            <MenuItem
                                icon={Mail}
                                title="Comunicaciones y privacidad"
                                onClick={() => setCurrentView('privacy')}
                                isLast={true}
                            />
                        </div>
                    </div>

                    {/* Tus productos Section */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333', marginLeft: '0.5rem' }}>
                            Tus productos
                        </h3>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
                            <MenuItem
                                icon={Heart}
                                title="Favoritos"
                                subtitle="Administra los que más compras y tus favoritos"
                                onClick={() => setCurrentView('favorites')}
                                isLast={true}
                            />
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        style={{
                            marginTop: '1rem',
                            marginBottom: '2rem',
                            padding: '1rem',
                            backgroundColor: 'white',
                            border: '1px solid #ffcdd2',
                            borderRadius: '12px',
                            color: '#d32f2f',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>

                </div>
            </div>
        );
    }

    // --- Sub-views ---

    if (currentView === 'orders') {
        if (selectedOrder) {
            // Order Details View
            return (
                <div style={{ backgroundColor: '#f5f5f5', minHeight: '100%' }}>
                    <SectionHeader title={`Pedido #${selectedOrder.id}`} onBack={() => setSelectedOrder(null)} />

                    <div style={{ padding: '1rem' }}>
                        {/* Status Timeline */}
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>Envío a domicilio</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>Entregado el {selectedOrder.date}</div>
                            </div>

                            {/* Timeline Visual */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginTop: '2rem', marginBottom: '1rem' }}>
                                {/* Line */}
                                <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', backgroundColor: '#e0e0e0', zIndex: 0 }}></div>
                                <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', backgroundColor: '#2e7d32', zIndex: 0, width: '100%' }}></div>

                                {/* Steps */}
                                {['Recibido', 'Preparando', 'En camino', 'Entrega'].map((step, idx) => (
                                    <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: '#2e7d32',
                                            border: '2px solid white',
                                            boxShadow: '0 0 0 2px #2e7d32'
                                        }}></div>
                                        <span style={{ fontSize: '0.65rem', color: '#666', marginTop: '0.5rem', position: 'absolute', top: '15px', width: '60px', textAlign: 'center' }}>{step}</span>
                                    </div>
                                ))}
                            </div>


                        </div>

                        {/* Address */}
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                            <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>Dirección de entrega</h4>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                <div>{user.name}</div>
                                <div>Calle Principal 123, Centro</div>
                                <div>Campeche, Camp.</div>
                                <div>Tel: 981 123 4567</div>
                            </div>
                        </div>

                        {/* Items */}
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0 }}>{selectedOrder.items.length} artículo{selectedOrder.items.length !== 1 ? 's' : ''}</h4>
                            </div>

                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #eee' : 'none', paddingBottom: idx < selectedOrder.items.length - 1 ? '1rem' : '0' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f9f9f9' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.quantity} pz</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.25rem' }}>${item.price.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => onAddToCart(selectedOrder.items[0])} // Simplified for demo, ideally adds all
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#2e7d32',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    marginTop: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                + Agregar todo
                            </button>
                        </div>

                        {/* Payment Method */}
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                            <h4 style={{ margin: 0, marginBottom: '1rem', fontSize: '1rem' }}>Método de pago</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <CreditCard size={24} color="#666" />
                                <span>Pagar al recibir (Efectivo)</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="flex-between" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span style={{ color: '#666' }}>Subtotal</span>
                                <span>${selectedOrder.total.toFixed(2)}</span>
                            </div>
                            <div className="flex-between" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span style={{ color: '#666' }}>Descuento</span>
                                <span style={{ color: '#2e7d32' }}>-$0.00</span>
                            </div>
                            <div className="flex-between" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span style={{ color: '#666' }}>Costo de entrega</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                <span>Total</span>
                                <span>${selectedOrder.total.toFixed(2)}</span>
                            </div>
                        </div>

                    </div>
                </div>
            );
        }

        // List of Orders
        return (
            <div style={{ backgroundColor: '#f5f5f5', minHeight: '100%' }}>
                <SectionHeader title="Pedidos" onBack={() => setCurrentView('menu')} />
                <div style={{ padding: '1rem' }}>
                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
                            <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>No tienes pedidos realizados aún.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map(order => (
                                <div key={order.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold' }}>Pedido #{order.id}</span>
                                        <span style={{ color: '#666', fontSize: '0.9rem' }}>{order.date}</span>
                                    </div>
                                    <div style={{ color: '#2e7d32', fontWeight: '500', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {order.status}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                        {order.items.length} artículos • Total: ${order.total.toFixed(2)}
                                    </div>

                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            backgroundColor: 'white',
                                            border: '1px solid #ccc',
                                            borderRadius: '20px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Ver detalles
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (currentView === 'personal') {
        return (
            <div style={{ backgroundColor: '#f5f5f5', minHeight: '100%' }}>
                <SectionHeader title="Información personal" onBack={() => setCurrentView('menu')} />
                <div style={{ padding: '1rem' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Datos personales</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Nombre</label>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1rem' }}>{user.name}</span>
                                <button style={{ color: '#666', fontSize: '0.8rem', textDecoration: 'underline', background: 'none', border: 'none' }}>Editar</button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Correo electrónico</label>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1rem' }}>{user.email}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Número telefónico</label>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1rem' }}>+52 (55) 1234 5678</span>
                                <button style={{ color: '#666', fontSize: '0.8rem', textDecoration: 'underline', background: 'none', border: 'none' }}>Editar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (currentView === 'addresses') {
        return (
            <div style={{ backgroundColor: '#f5f5f5', minHeight: '100%' }}>
                <SectionHeader title="Direcciones" onBack={() => setCurrentView('menu')} />
                <div style={{ padding: '1rem' }}>
                    {/* Reuse address logic from App.jsx or just show placeholder for now */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>Aquí aparecerán tus direcciones guardadas.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (currentView === 'favorites') {
        return (
            <div style={{ backgroundColor: '#f5f5f5', minHeight: '100%' }}>
                <SectionHeader title="Favoritos" onBack={() => setCurrentView('menu')} />
                <div style={{ padding: '1rem' }}>
                    {favorites.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
                            <Heart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>No tienes favoritos aún.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {favorites.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAdd={onAddToCart}
                                    isFavorite={true}
                                    onToggleFavorite={() => onToggleFavorite(product)}
                                    onClick={() => onProductSelect(product)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default fallback
    return (
        <div style={{ padding: '1rem' }}>
            <SectionHeader title={currentView} onBack={() => setCurrentView('menu')} />
            <p>Sección en construcción</p>
        </div>
    );
}
