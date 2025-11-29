import React, { useState } from 'react';
import { X, CreditCard, Banknote, MapPin, Clock } from 'lucide-react';

export function CheckoutModal({ onClose, onConfirm, total }) {
    const [savedAddresses, setSavedAddresses] = useState(() => {
        const saved = localStorage.getItem('addresses');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    const [showAddressForm, setShowAddressForm] = useState(savedAddresses.length === 0);
    const [newAddress, setNewAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery', 'pickup'
    const [deliverySchedule, setDeliverySchedule] = useState('asap'); // 'asap', 'morning', 'afternoon'
    const [isProcessing, setIsProcessing] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    const handleSaveAddress = () => {
        if (!newAddress.trim()) return;
        const updated = [...savedAddresses, newAddress];
        setSavedAddresses(updated);
        localStorage.setItem('addresses', JSON.stringify(updated));
        setNewAddress('');
        setShowAddressForm(false);
        setSelectedAddressIndex(updated.length - 1);
    };

    const handleApplyCoupon = () => {
        setCouponError('');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userCoupons = user.coupons || [];

        const validCoupon = userCoupons.find(c => c.code === couponCode);

        if (validCoupon) {
            setAppliedCoupon(validCoupon);
            setCouponCode('');
        } else {
            setCouponError('Cupón inválido o no encontrado');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const receiverName = formData.get('receiverName');

        let finalAddress = '';
        if (showAddressForm) {
            if (!newAddress.trim()) return;
            finalAddress = newAddress;
            if (savedAddresses.length === 0) {
                const updated = [newAddress];
                setSavedAddresses(updated);
                localStorage.setItem('addresses', JSON.stringify(updated));
            }
        } else {
            finalAddress = savedAddresses[selectedAddressIndex];
        }

        setIsProcessing(true);
        setTimeout(() => {
            onConfirm({
                receiverName,
                deliveryMethod,
                address: deliveryMethod === 'delivery' ? finalAddress : 'Recoger en Tienda',
                paymentMethod,
                deliverySchedule,
                coupon: appliedCoupon // Pass the applied coupon
            });
            setIsProcessing(false);
        }, 1500);
    };

    // Calculate totals
    const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalPayable = Math.max(0, total - couponDiscount);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius)',
                width: '100%',
                maxWidth: '400px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-md)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} color="#666" />
                </button>

                <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Finalizar Compra</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                            Nombre de quien recibe
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Tu nombre completo"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                            name="receiverName" // Added name attribute for easier testing
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                            Método de Entrega
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setDeliveryMethod('delivery')}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${deliveryMethod === 'delivery' ? 'var(--color-primary)' : '#eee'}`,
                                    backgroundColor: deliveryMethod === 'delivery' ? '#e8f5e9' : 'white',
                                    color: deliveryMethod === 'delivery' ? 'var(--color-primary)' : '#666',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                🚚 Envío a Domicilio
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeliveryMethod('pickup')}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${deliveryMethod === 'pickup' ? 'var(--color-primary)' : '#eee'}`,
                                    backgroundColor: deliveryMethod === 'pickup' ? '#e8f5e9' : 'white',
                                    color: deliveryMethod === 'pickup' ? 'var(--color-primary)' : '#666',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                🏪 Recoger en Tienda
                            </button>
                        </div>

                        {deliveryMethod === 'delivery' && (
                            <>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                                    <MapPin size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                    Dirección de Entrega
                                </label>

                                {!showAddressForm && savedAddresses.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        {savedAddresses.map((addr, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                marginBottom: '0.5rem',
                                                padding: '0.5rem',
                                                border: selectedAddressIndex === index ? '1px solid var(--color-primary)' : '1px solid #eee',
                                                borderRadius: '8px',
                                                backgroundColor: selectedAddressIndex === index ? '#e8f5e9' : 'white',
                                                cursor: 'pointer'
                                            }}
                                                onClick={() => setSelectedAddressIndex(index)}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddressIndex === index}
                                                    onChange={() => setSelectedAddressIndex(index)}
                                                    style={{ marginTop: '4px', marginRight: '8px' }}
                                                />
                                                <span style={{ fontSize: '0.9rem', color: '#555' }}>{addr}</span>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressForm(true)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--color-primary)',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                marginTop: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            + Agregar nueva dirección
                                        </button>
                                    </div>
                                )}

                                {showAddressForm && (
                                    <div style={{ animation: 'fadeIn 0.3s' }}>
                                        <textarea
                                            required={showAddressForm}
                                            value={newAddress}
                                            onChange={(e) => setNewAddress(e.target.value)}
                                            placeholder="Calle, Número, Colonia..."
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid #ddd',
                                                fontFamily: 'inherit',
                                                resize: 'none',
                                                height: '80px',
                                                marginBottom: '0.5rem'
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                type="button"
                                                onClick={handleSaveAddress}
                                                disabled={!newAddress.trim()}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    backgroundColor: '#333',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                Guardar Dirección
                                            </button>
                                            {savedAddresses.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddressForm(false)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'none',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                            <Clock size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                            Horario de Entrega
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            {[
                                { id: 'asap', label: 'Lo antes posible' },
                                { id: 'morning', label: 'Mañana (10-12)' },
                                { id: 'afternoon', label: 'Tarde (14-16)' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setDeliverySchedule(option.id)}
                                    style={{
                                        padding: '0.75rem 0.25rem',
                                        borderRadius: '8px',
                                        border: `1px solid ${deliverySchedule === option.id ? 'var(--color-primary)' : '#eee'}`,
                                        backgroundColor: deliverySchedule === option.id ? '#e8f5e9' : 'white',
                                        color: deliverySchedule === option.id ? 'var(--color-primary)' : '#666',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                            Método de Pago
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${paymentMethod === 'cash' ? 'var(--color-primary)' : '#eee'}`,
                                    backgroundColor: paymentMethod === 'cash' ? '#e8f5e9' : 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Banknote size={24} color={paymentMethod === 'cash' ? 'var(--color-primary)' : '#666'} />
                                <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Efectivo</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${paymentMethod === 'card' ? 'var(--color-primary)' : '#eee'}`,
                                    backgroundColor: paymentMethod === 'card' ? '#e8f5e9' : 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <CreditCard size={24} color={paymentMethod === 'card' ? 'var(--color-primary)' : '#666'} />
                                <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Tarjeta</span>
                            </button>
                        </div>
                    </div>

                    {/* Coupon Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cupón de Descuento</label>

                        {/* Available Coupons Chips */}
                        {(() => {
                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                            const userCoupons = user.coupons || [];
                            if (userCoupons.length > 0) {
                                return (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                        {userCoupons.map((coupon, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setCouponCode(coupon.code);
                                                    setAppliedCoupon(coupon);
                                                    setCouponError('');
                                                }}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    backgroundColor: '#fff3e0',
                                                    border: '1px solid #ff9800',
                                                    borderRadius: '16px',
                                                    color: '#e65100',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <span>🏷️</span>
                                                <span>{coupon.code} (${coupon.discount})</span>
                                            </button>
                                        ))}
                                    </div>
                                );
                            }
                            return (
                                <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                                    No tienes cupones activos. Ve a tu Perfil para canjear puntos.
                                </div>
                            );
                        })()}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="Ingresa tu código"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    textTransform: 'uppercase'
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleApplyCoupon}
                                style={{
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#333',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Aplicar
                            </button>
                        </div>
                        {couponError && <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '0.25rem' }}>{couponError}</p>}

                        {appliedCoupon && (
                            <div className="flex-between" style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '8px',
                                color: '#2e7d32',
                                fontSize: '0.9rem'
                            }}>
                                <span>Cupón aplicado: {appliedCoupon.code}</span>
                                <span style={{ fontWeight: 'bold' }}>-${appliedCoupon.discount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    <div style={{
                        borderTop: '1px solid #eee',
                        paddingTop: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem', color: '#666' }}>
                            <span>Subtotal (con puntos aplicados)</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        {appliedCoupon && (
                            <div className="flex-between" style={{ marginBottom: '0.5rem', color: '#2e7d32' }}>
                                <span>Descuento Cupón</span>
                                <span>-${appliedCoupon.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex-between" style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            <span>Total a Pagar</span>
                            <span style={{ color: 'var(--color-primary)' }}>${finalPayable.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing || (deliveryMethod === 'delivery' && showAddressForm && !newAddress.trim())}
                        className="btn-add"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            opacity: isProcessing ? 0.7 : 1,
                            cursor: isProcessing ? 'wait' : 'pointer'
                        }}
                    >
                        {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
                    </button>
                </form>
            </div>
        </div>
    );
}
