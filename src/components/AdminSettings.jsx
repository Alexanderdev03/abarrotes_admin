import React, { useRef, useState, useEffect } from 'react';
import { Save, Bell, Shield, Database, Upload, Download, Clock, Palette, Image as ImageIcon, Trash2, AlertTriangle, Eye } from 'lucide-react';
import { Toast } from './Toast';
import { ContentService } from '../services/content';
import { ProductService } from '../services/products';
import { ConfirmationModal } from './common/ConfirmationModal';

export function AdminSettings() {
    const fileInputRef = useRef(null);
    const [toast, setToast] = useState(null);
    const [settings, setSettings] = useState({
        storeName: 'Abarrotes Alex',
        phone: '9821041154',
        whatsappNumber: '529821041154',
        address: 'Calle Principal #123, Col. Centro',
        deliveryCost: 0,
        logo: null,
        primaryColor: '#004aad',
        secondaryColor: '#ffd700',
        hours: {
            weekdays: '8:00 AM - 9:00 PM',
            weekends: '9:00 AM - 8:00 PM'
        },
        notifications: {
            orders: true,
            stock: true
        },
        visibility: {
            combos: true,
            flashSale: true,
            flyer: true
        }
    });

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false,
        requiresInput: false
    });
    const [confirmInput, setConfirmInput] = useState('');

    useEffect(() => {
        const loadSettings = (savedData) => {
            setSettings(prev => ({
                ...prev,
                ...savedData,
                // Ensure nested objects are merged, not replaced
                notifications: { ...prev.notifications, ...savedData?.notifications },
                visibility: { ...prev.visibility, ...savedData?.visibility },
                hours: { ...prev.hours, ...savedData?.hours }
            }));
        };

        const savedSettings = localStorage.getItem('storeSettings');
        if (savedSettings) {
            loadSettings(JSON.parse(savedSettings));
        } else {
            // Try to load from Firestore if not in local storage
            ContentService.getSettings().then(data => {
                if (data) loadSettings(data);
            });
        }
    }, []);

    const handleChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedChange = (parent, field, value) => {
        setSettings(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            localStorage.setItem('storeSettings', JSON.stringify(settings));

            // Update CSS variables for live preview
            document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
            document.documentElement.style.setProperty('--color-secondary', settings.secondaryColor);

            // Save to Firestore
            await ContentService.saveSettings(settings);

            setToast({ message: 'Configuración guardada y sincronizada', type: 'success' });
        } catch (error) {
            console.error("Error saving settings:", error);
            setToast({ message: 'Guardado localmente, pero falló la sincronización', type: 'warning' });
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('logo', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackup = () => {
        const data = {
            products: JSON.parse(localStorage.getItem('products') || '[]'),
            categories: JSON.parse(localStorage.getItem('categories') || '[]'),
            orders: JSON.parse(localStorage.getItem('orders') || '[]'),
            user: JSON.parse(localStorage.getItem('user') || 'null'),
            adminCoupons: JSON.parse(localStorage.getItem('adminCoupons') || '[]'),
            flashSaleId: localStorage.getItem('flashSaleId'),
            storeSettings: settings
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `backup_abarrotes_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ message: 'Respaldo descargado correctamente', type: 'success' });
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
                if (data.storeSettings) {
                    localStorage.setItem('storeSettings', JSON.stringify(data.storeSettings));
                    setSettings(data.storeSettings);
                }

                alert('Base de datos restaurada con éxito. La página se recargará.');
                window.location.reload();
            } catch (error) {
                setToast({ message: 'Error al leer el archivo de respaldo', type: 'error' });
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    const handleResetDatabase = () => {
        setModalConfig({
            isOpen: true,
            title: '¿Resetear Base de Datos?',
            message: 'Esta acción eliminará TODOS los productos, categorías, pedidos y banners. La tienda quedará completamente vacía. Escribe "BORRAR TODO" para confirmar.',
            isDanger: true,
            requiresInput: true,
            onConfirm: async () => {
                if (confirmInput !== 'BORRAR TODO') {
                    alert('Código de confirmación incorrecto.');
                    return;
                }
                try {
                    setToast({ message: 'Reseteando base de datos...', type: 'info' });
                    // Dynamic imports to avoid circular dependencies
                    const { ProductService } = await import('../services/products');
                    const { OrderService } = await import('../services/orders');
                    const { ContentService } = await import('../services/content');

                    await Promise.all([
                        ProductService.deleteAllProducts(),
                        ProductService.deleteAllCategories(),
                        OrderService.deleteAllOrders(),
                        // Delete all banners too
                        ContentService.getBanners().then(banners =>
                            Promise.all(banners.map(b => ContentService.deleteBanner(b.id)))
                        )
                    ]);

                    alert('Base de datos reseteada correctamente. La página se recargará.');
                    window.location.reload();
                } catch (error) {
                    console.error(error);
                    setToast({ message: 'Error al resetear la base de datos', type: 'error' });
                }
            }
        });
        setConfirmInput('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
            >
                {modalConfig.requiresInput && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', color: '#991b1b' }}>
                            Escribe "BORRAR TODO" para confirmar:
                        </label>
                        <input
                            type="text"
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                            placeholder="BORRAR TODO"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ef4444' }}
                        />
                    </div>
                )}
            </ConfirmationModal>

            {/* General Settings */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>Configuración General</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Nombre de la Tienda</label>
                            <input
                                type="text"
                                value={settings.storeName}
                                onChange={(e) => handleChange('storeName', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Teléfono de Contacto</label>
                            <input
                                type="text"
                                value={settings.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Número de WhatsApp (Pedidos)</label>
                            <input
                                type="text"
                                value={settings.whatsappNumber || ''}
                                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                                placeholder="Ej: 529811234567"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            />
                            <small style={{ color: '#6b7280' }}>Incluye el código de país (52 para México) sin espacios.</small>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Dirección</label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Costo de Envío Base ($)</label>
                            <input
                                type="number"
                                value={settings.deliveryCost || 0}
                                onChange={(e) => handleChange('deliveryCost', parseFloat(e.target.value))}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Valor del Punto ($ MXN)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.pointValue || 0.10}
                                onChange={(e) => handleChange('pointValue', parseFloat(e.target.value))}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            />
                            <small style={{ color: '#6b7280' }}>Ej: 0.10 significa que 10 puntos = $1.00</small>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>% Puntos por Compra</label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.pointsPercentage || 1.5}
                                onChange={(e) => handleChange('pointsPercentage', parseFloat(e.target.value))}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            />
                            <small style={{ color: '#6b7280' }}>Porcentaje del total que se convierte en puntos (Default: 1.5%)</small>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Logo de la Tienda</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '12px',
                                    backgroundColor: '#f3f4f6', overflow: 'hidden',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px dashed #d1d5db'
                                }}>
                                    {settings.logo ? (
                                        <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <ImageIcon size={24} color="#9ca3af" />
                                    )}
                                </div>
                                <label style={{
                                    cursor: 'pointer', backgroundColor: '#e5e7eb', padding: '0.5rem 1rem',
                                    borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500'
                                }}>
                                    Subir Logo
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Colores de Marca</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Principal</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={settings.primaryColor}
                                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{settings.primaryColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Secundario</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={settings.secondaryColor}
                                            onChange={(e) => handleChange('secondaryColor', e.target.value)}
                                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{settings.secondaryColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Clock size={18} color="#4b5563" />
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Horarios de Atención</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Lunes a Viernes</label>
                        <input
                            type="text"
                            value={settings.hours.weekdays}
                            onChange={(e) => handleNestedChange('hours', 'weekdays', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Sábados y Domingos</label>
                        <input
                            type="text"
                            value={settings.hours.weekends}
                            onChange={(e) => handleNestedChange('hours', 'weekends', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                </div>
            </div>



            {/* Visibility Settings */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Eye size={20} color="#8b5cf6" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Visibilidad de Secciones</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                        <input
                            type="checkbox"
                            checked={settings.visibility?.combos ?? true}
                            onChange={(e) => handleNestedChange('visibility', 'combos', e.target.checked)}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>Mostrar Combos</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                        <input
                            type="checkbox"
                            checked={settings.visibility?.flashSale ?? true}
                            onChange={(e) => handleNestedChange('visibility', 'flashSale', e.target.checked)}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>Mostrar Pasillo Sorpresa</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                        <input
                            type="checkbox"
                            checked={settings.visibility?.flyer ?? true}
                            onChange={(e) => handleNestedChange('visibility', 'flyer', e.target.checked)}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>Mostrar Folleto</span>
                    </label>
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
                            <input
                                type="checkbox"
                                checked={settings.notifications.orders}
                                onChange={(e) => handleNestedChange('notifications', 'orders', e.target.checked)}
                            />
                            <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Alertas de nuevos pedidos</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.notifications.stock}
                                onChange={(e) => handleNestedChange('notifications', 'stock', e.target.checked)}
                            />
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

            <button
                onClick={handleSave}
                style={{
                    marginTop: '1rem',
                    backgroundColor: '#3b82f6', color: 'white', border: 'none',
                    padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content',
                    alignSelf: 'flex-end'
                }}
            >
                <Save size={18} />
                Guardar Cambios
            </button>

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

            {/* Danger Zone */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid #fee2e2', paddingTop: '2rem' }}>
                <h3 style={{ color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} />
                    Zona de Peligro
                </h3>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b' }}>Resetear Base de Datos</h4>
                    <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Esta acción eliminará <strong>TODOS</strong> los productos, categorías, pedidos y banners.
                        La tienda quedará completamente vacía. Esta acción no se puede deshacer.
                    </p>



                    <button
                        onClick={handleResetDatabase}
                        style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Trash2 size={18} />
                        Borrar Todo y Resetear
                    </button>
                </div>
            </div>
        </div>
    );
}

