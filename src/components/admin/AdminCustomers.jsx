import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';

export function AdminCustomers() {
    // Mock data or read from localStorage 'user'
    const [customers, setCustomers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [newPoints, setNewPoints] = useState('');

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('user') || 'null');
        setCustomers(localUser ? [localUser] : []);
    }, []);

    const handleEditPoints = (customer) => {
        setEditingId(customer.email); // Using email as ID for now since we have 1 user
        setNewPoints(customer.wallet || 0);
    };

    const handleSavePoints = (customer) => {
        const updatedUser = { ...customer, wallet: parseInt(newPoints) };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCustomers([updatedUser]);
        setEditingId(null);
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Clientes Registrados</h2>
            </div>

            {customers.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                    No hay clientes registrados aún.
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280' }}>Cliente</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280' }}>Contacto</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280' }}>Puntos</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer, idx) => (
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
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>ID: {idx + 1}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={14} /> {customer.email || 'No email'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Phone size={14} /> {customer.phone || 'No phone'}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {editingId === customer.email ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="number"
                                                value={newPoints}
                                                onChange={(e) => setNewPoints(e.target.value)}
                                                style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                            />
                                            <button onClick={() => handleSavePoints(customer)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'green' }}><Save size={16} /></button>
                                            <button onClick={() => setEditingId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'red' }}><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 'bold', color: '#ea580c' }}>{customer.wallet || 0} pts</span>
                                            <button onClick={() => handleEditPoints(customer)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5 }}>
                                                <Edit size={14} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem', backgroundColor: '#dcfce7', color: '#15803d',
                                        borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'
                                    }}>
                                        Activo
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
