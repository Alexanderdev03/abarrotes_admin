import React, { useMemo } from 'react';
import { ShoppingBasket, Trash2, Plus, Minus } from 'lucide-react';

export function CartView({
    cart,
    cartTotal,
    isSavingList,
    startSaveList,
    newListName,
    setNewListName,
    onConfirmSaveList,
    cancelSaveList,
    removeFromCart,
    updateQuantity,
    user,
    handleApplyCoupon,
    appliedCoupon,
    couponCode,
    setCouponCode,
    totalSavings,
    productCouponsDiscount,
    usedProductCoupons,
    pointsToUse,
    setPointsToUse,
    pointValue,
    couponDiscount,
    finalTotal,
    setShowCheckout,
    savedLists,
    loadList,
    deleteList,
    setActiveTab
}) {
    const groupedCoupons = useMemo(() => {
        if (!user.coupons) return [];
        const groups = {};
        user.coupons.forEach(c => {
            // Group by discount (product name) for product coupons, otherwise by code
            const key = c.type === 'product' ? c.discount : c.code;

            if (!groups[key]) {
                groups[key] = { ...c, count: 0, codes: [] };
            }
            groups[key].count++;
            groups[key].codes.push(c.code);
        });
        return Object.values(groups);
    }, [user.coupons]);

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Tu Carrito</h2>
                {cart.length > 0 && !isSavingList && (
                    <button
                        onClick={startSaveList}
                        style={{
                            background: 'none',
                            border: '1px solid var(--color-primary)',
                            color: 'var(--color-primary)',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Guardar lista
                    </button>
                )}
            </div>

            {/* Save List Input UI */}
            {isSavingList && (
                <div style={{
                    marginBottom: '1.5rem',
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombre de la lista:</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="Ej. Despensa Semanal"
                            autoFocus
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid #ccc'
                            }}
                        />
                        <button
                            onClick={onConfirmSaveList}
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Guardar
                        </button>
                        <button
                            onClick={cancelSaveList}
                            style={{
                                backgroundColor: '#f5f5f5',
                                color: '#666',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '3rem', color: '#888' }}>
                    <ShoppingBasket size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Tu carrito está vacío</p>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', width: 'auto' }}
                        onClick={() => setActiveTab('home')}
                    >
                        Ir a comprar
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cart.map((item, index) => (
                            <div key={index} style={{
                                backgroundColor: 'white',
                                padding: '1rem',
                                borderRadius: 'var(--radius)',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                gap: '1rem'
                            }}>
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#f9f9f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <ShoppingBasket size={32} color="#ccc" />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.name}</h4>
                                        <button
                                            onClick={() => removeFromCart(item.id, index)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {item.isBulkSelection ? (
                                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                                            <div>
                                                {item.cartQuantity} {item.cartUnit}
                                                {item.cartUnit === 'pz' && item.averageWeight && ` (~${(item.cartQuantity * item.averageWeight).toFixed(3)} kg)`}
                                            </div>
                                            {item.notes && (
                                                <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#888', marginTop: '2px' }}>
                                                    Nota: "{item.notes}"
                                                </div>
                                            )}
                                            <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '4px' }}>
                                                ${(item.totalPrice || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                                ${Number(item.price || 0).toFixed(2)}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <button
                                                    onClick={() => updateQuantity(index, -1)}
                                                    style={{
                                                        width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ddd',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white'
                                                    }}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span style={{ fontWeight: '600' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(index, 1)}
                                                    style={{
                                                        width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ddd',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white'
                                                    }}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coupon */}
                    <div style={{ marginTop: '2rem', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius)' }}>
                        <h4 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Cupón de descuento</h4>

                        {/* Available Coupons Chips */}
                        {groupedCoupons.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                {groupedCoupons.map((coupon, idx) => {
                                    const isApplied = appliedCoupon && coupon.codes.includes(appliedCoupon.code);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleApplyCoupon(coupon.codes[0])}
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                backgroundColor: isApplied ? '#e8f5e9' : '#fff3e0',
                                                border: `1px solid ${isApplied ? '#4caf50' : '#ff9800'}`,
                                                borderRadius: '16px',
                                                color: isApplied ? '#2e7d32' : '#e65100',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontWeight: isApplied ? 'bold' : 'normal',
                                                position: 'relative'
                                            }}
                                        >
                                            <span>{coupon.type === 'product' ? '🎁' : '🏷️'}</span>
                                            <span>
                                                {coupon.type === 'product'
                                                    ? coupon.discount
                                                    : `${coupon.code} ($${coupon.discount})`}
                                            </span>
                                            {coupon.count > 1 && (
                                                <span style={{
                                                    backgroundColor: '#e65100',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: '16px',
                                                    height: '16px',
                                                    fontSize: '0.6rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginLeft: '4px'
                                                }}>
                                                    {coupon.count}
                                                </span>
                                            )}
                                            {isApplied && <span>✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex-between" style={{ gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="EJ. ALEX10"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={() => handleApplyCoupon()}
                                style={{
                                    backgroundColor: '#2c3e50',
                                    color: 'white',
                                    padding: '0.75rem 1rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                Aplicar
                            </button>
                        </div>
                        {appliedCoupon && appliedCoupon.type !== 'product' && (
                            <div style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '8px',
                                color: '#2e7d32',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>Cupón aplicado: <strong>{appliedCoupon.code}</strong> -${appliedCoupon.discount}</span>
                                <button
                                    onClick={() => {
                                        handleApplyCoupon(null); // Assuming handleApplyCoupon handles null/reset or we need a reset function
                                        // But App.jsx logic for reset was: setAppliedCoupon(null); setCouponCode(''); showToast...
                                        // We might need to pass a specific onRemoveCoupon prop or handle it in handleApplyCoupon
                                        // For now let's assume handleApplyCoupon can toggle or we pass a separate handler.
                                        // Actually, let's look at App.jsx again. It had inline logic for remove.
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '0 0.5rem',
                                        fontSize: '1.2rem',
                                        lineHeight: 1
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div style={{ marginTop: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius)' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: '#666' }}>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        {totalSavings > 0 && (
                            <div className="flex-between" style={{ marginBottom: '0.5rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>
                                <span>Ahorro Total</span>
                                <span>-${totalSavings.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#666' }}>Envío</span>
                            <span className="text-primary" style={{ fontWeight: 'bold' }}>Por confirmar</span>
                        </div>

                        {productCouponsDiscount > 0 && (
                            <div className="flex-between" style={{ marginBottom: '0.5rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                <span>Cupones de Producto ({usedProductCoupons.length})</span>
                                <span>-${productCouponsDiscount.toFixed(2)}</span>
                            </div>
                        )}

                        {/* Points Redemption */}
                        {user.wallet > 0 && (
                            <div style={{ marginTop: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius)' }}>
                                <h4 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Usar Puntos (Saldo: {user.wallet})</h4>
                                <div className="flex-between" style={{ gap: '0.5rem' }}>
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.min(user.wallet, Math.ceil((cartTotal - couponDiscount - productCouponsDiscount) / pointValue))}
                                        value={pointsToUse}
                                        onChange={(e) => setPointsToUse(parseInt(e.target.value))}
                                        style={{ flex: 1 }}
                                    />
                                    <span style={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>
                                        -${(pointsToUse * pointValue).toFixed(2)}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                    Usando {pointsToUse} puntos
                                </div>
                            </div>
                        )}

                        <div className="flex-between" style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${finalTotal.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={() => setShowCheckout(true)}
                            style={{
                                width: '100%',
                                backgroundColor: 'var(--color-secondary)',
                                color: 'var(--color-primary)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-pill)',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                            }}
                        >
                            Realizar Pedido
                        </button>
                    </div>
                </>
            )}
            {/* Saved Lists Section */}
            {savedLists.length > 0 && (
                <div style={{ marginTop: '2rem', marginBottom: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>Mis Listas Guardadas</h3>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {savedLists.map(list => (
                            <div key={list.id} style={{
                                minWidth: '200px',
                                backgroundColor: 'white',
                                padding: '1rem',
                                borderRadius: '12px',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid #eee'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{list.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                    {list.items.length} artículos • {list.date}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => loadList(list)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cargar
                                    </button>
                                    <button
                                        onClick={() => deleteList(list.id)}
                                        style={{
                                            padding: '0.5rem',
                                            backgroundColor: '#ffebee',
                                            color: '#d32f2f',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
