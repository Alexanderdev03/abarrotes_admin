import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit, Save, X, Search, Eye } from 'lucide-react';
import { api } from '../services/api';
import { TableSkeleton } from './common/Skeleton';
import { EmptyState } from './common/EmptyState';
import { CustomerProfileModal } from './CustomerProfileModal';

export function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerHistory, setCustomerHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await api.users.getAll();
            setCustomers(data);
        } catch (error) {
            console.error("Error loading customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = async (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
        try {
            const history = await api.users.getHistory(customer.email);
            // Sort by date desc
            history.sort((a, b) => new Date(b.date) - new Date(a.date));
            setCustomerHistory(history);
        } catch (error) {
            console.error("Error loading history:", error);
            setCustomerHistory([]);
        }
    };

    const filteredCustomers = customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Clientes Registrados</h2>

                <div style={{ position: 'relative', minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                            border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none'
                        }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280' }}>Cliente</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280' }}>Contacto</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280' }}>Total Gastado</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={5} columns={4} />
                        ) : filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="4">
                                    <EmptyState
                                        title="No hay clientes"
                                        message={searchTerm ? `No se encontraron clientes para "${searchTerm}"` : "No hay clientes registrados aún."}
                                        icon={User}
                                    />
                                </td>
                            </tr>
                        ) : (
                            currentCustomers.map((customer, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                backgroundColor: '#e0f2fe', color: '#0284c7',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold'
                                            }}>
                                                {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500', color: '#111827' }}>{customer.name || 'Usuario'}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Pedidos: {customer.orders ? customer.orders.length : 0}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Mail size={14} /> {customer.email || 'No email'}
                                            </div>
                                            {customer.phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Phone size={14} /> {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontWeight: 'bold', color: '#111827' }}>
                                            ${(customer.totalSpent || 0).toFixed(2)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => handleViewProfile(customer)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.5rem 1rem', backgroundColor: '#f3f4f6',
                                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                color: '#4f46e5', fontWeight: '500', fontSize: '0.875rem'
                                            }}
                                        >
                                            <Eye size={16} />
                                            Ver Perfil
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && filteredCustomers.length > 0 && (
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredCustomers.length)} de {filteredCustomers.length} clientes
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px',
                                backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                                color: currentPage === 1 ? '#9ca3af' : '#374151',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px',
                                backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <CustomerProfileModal
                    customer={selectedCustomer}
                    orderHistory={customerHistory}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={() => {
                        loadCustomers();
                        // Also reload selected customer to show new data
                        // But since we reload all, we might need to find him again or just close modal?
                        // Better to re-fetch specific customer or just close.
                        // Let's reload all and update selectedCustomer from the new list if possible,
                        // or just close modal to be simple.
                        // Actually, let's keep modal open and update selectedCustomer.
                        // We can fetch the single user again.
                        // For now, let's just reload the list. The modal uses 'customer' prop which is 'selectedCustomer' state.
                        // We need to update 'selectedCustomer' state too.
                        api.users.getAll().then(data => {
                            setCustomers(data);
                            const updated = data.find(c => c.email === selectedCustomer.email);
                            if (updated) setSelectedCustomer(updated);
                        });
                    }}
                />
            )}
        </div>
    );
}

