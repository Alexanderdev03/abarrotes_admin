import React, { useRef } from 'react';
import { Save, Bell, Shield, Smartphone, Database, Upload, Download } from 'lucide-react';

export function AdminSettings() {
    const fileInputRef = useRef(null);

    const handleBackup = () => {
        const data = {
            products: JSON.parse(localStorage.getItem('products') || '[]'),
            categories: JSON.parse(localStorage.getItem('categories') || '[]'),
            orders: JSON.parse(localStorage.getItem('orders') || '[]'),
            user: JSON.parse(localStorage.getItem('user') || 'null'),
            adminCoupons: JSON.parse(localStorage.getItem('adminCoupons') || '[]'),
            flashSaleId: localStorage.getItem('flashSaleId')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `backup_abarrotes_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
                if (data.categories) localStorage.setItem('categories', JSON.stringify(data.categories));
                if (data.orders) localStorage.setItem('orders', JSON.stringify(data.orders));
                if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
                if (data.adminCoupons) localStorage.setItem('adminCoupons', JSON.stringify(data.adminCoupons));
                if (data.flashSaleId) localStorage.setItem('flashSaleId', data.flashSaleId);

                alert('Base de datos restaurada con éxito. La página se recargará.');
                window.location.reload();
            } catch (error) {
                alert('Error al leer el archivo de respaldo.');
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* General Settings */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>Configuración General</h3>

                <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Nombre de la Tienda</label>
                        <input
                            type="text"
                            defaultValue="Abarrotes Alex"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Teléfono de Contacto (WhatsApp)</label>
                        <input
                            type="text"
                            defaultValue="9821041154"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Dirección del Local</label>
                        <input
                            type="text"
                            defaultValue="Calle Principal #123, Col. Centro"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <button style={{
                        marginTop: '1rem',
                        backgroundColor: '#3b82f6', color: 'white', border: 'none',
                        padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content'
                    }}>
                        <Save size={18} />
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Notifications & Security */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Bell size={20} color="#f59e0b" />
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Notificaciones</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked />
                            <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Alertas de nuevos pedidos</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked />
                            <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Alertas de stock bajo</span>
                        </label>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Shield size={20} color="#10b981" />
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Seguridad</h3>
                    </div>
                    <button style={{
                        width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px',
                        backgroundColor: 'white', color: '#374151', fontWeight: '500', cursor: 'pointer'
                    }}>
                        Cambiar Contraseña de Admin
                    </button>
                </div>
            </div>

            {/* Database Management */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Database size={20} color="#6366f1" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Gestión de Base de Datos</h3>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Realiza copias de seguridad de tus productos, pedidos y clientes, o restaura datos desde un archivo anterior.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleBackup}
                        style={{
                            backgroundColor: '#f3f4f6', color: '#1f2937', border: '1px solid #d1d5db',
                            padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <Download size={18} />
                        Descargar Respaldo (JSON)
                    </button>

                    <button
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            backgroundColor: '#6366f1', color: 'white', border: 'none',
                            padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <Upload size={18} />
                        Restaurar Base de Datos
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleRestore}
                        accept=".json"
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
}
