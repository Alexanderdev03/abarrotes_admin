import React from 'react';

export function PointsView({
    user,
    pointValue,
    rewardProducts,
    availableCoupons,
    onUpdateUser,
    showToast
}) {
    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Mis Puntos y Cupones</h2>

            {/* Wallet & Loyalty Section */}
            <div style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Monedero Electrónico</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        {user.wallet || 0} pts
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                        Equivale a ${(user.wallet * pointValue).toFixed(2)} MXN
                    </div>
                </div>

                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', bottom: '-30px', left: '-10px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Rewards Center */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Centro de Recompensas 🎁</h3>

                {/* Products Exchange */}
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#666' }}>Canjea tus puntos por productos</h4>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="no-scrollbar">
                        {rewardProducts.length === 0 ? (
                            <div style={{ padding: '1rem', color: '#666', fontStyle: 'italic' }}>No hay productos disponibles para canje.</div>
                        ) : (
                            rewardProducts.map((product) => (
                                <div key={product.id} style={{
                                    minWidth: '160px',
                                    width: '160px',
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '0.75rem',
                                    border: '1px solid #eee',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                                    <h5 style={{ fontSize: '0.85rem', margin: '0 0 0.25rem 0', height: '2.4em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</h5>
                                    <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{product.points} pts</div>
                                    <button
                                        onClick={() => {
                                            if ((user.wallet || 0) >= product.points) {
                                                const updatedUser = {
                                                    ...user,
                                                    wallet: user.wallet - product.points,
                                                    coupons: [...(user.coupons || []), {
                                                        id: Date.now(),
                                                        code: `PROD-${product.id}-${Math.floor(Math.random() * 1000)}`,
                                                        discount: product.name, // Using discount field for product name
                                                        type: 'product', // New type
                                                        points: product.points
                                                    }]
                                                };
                                                onUpdateUser(updatedUser);
                                                showToast(`¡Canjeaste ${product.name}!`);
                                            } else {
                                                showToast('Puntos insuficientes', 'error');
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.4rem',
                                            backgroundColor: (user.wallet || 0) >= product.points ? 'var(--color-primary)' : '#ccc',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '20px',
                                            cursor: (user.wallet || 0) >= product.points ? 'pointer' : 'not-allowed',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Canjear
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Coupons Exchange */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#666' }}>Canjea tus puntos por cupones</h4>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {availableCoupons.filter(c => c.points > 0).length === 0 ? (
                            <div style={{ padding: '1rem', color: '#666', fontStyle: 'italic' }}>No hay cupones canjeables disponibles en este momento.</div>
                        ) : (
                            availableCoupons.filter(c => c.points > 0).map((coupon, idx) => (
                                <div key={idx} style={{
                                    minWidth: '200px',
                                    backgroundColor: 'white',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px dashed var(--color-primary)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                                        ${coupon.discount} MXN
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem' }}>
                                        por {coupon.points} puntos
                                    </div>
                                    <button
                                        onClick={() => {
                                            if ((user.wallet || 0) >= coupon.points) {
                                                const updatedUser = {
                                                    ...user,
                                                    wallet: user.wallet - coupon.points,
                                                    coupons: [...(user.coupons || []), { ...coupon, id: Date.now() }]
                                                };
                                                onUpdateUser(updatedUser);
                                                showToast(`¡Cupón de $${coupon.discount} canjeado!`);
                                            } else {
                                                showToast('Puntos insuficientes', 'error');
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            backgroundColor: (user.wallet || 0) >= coupon.points ? 'var(--color-primary)' : '#ccc',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: (user.wallet || 0) >= coupon.points ? 'pointer' : 'not-allowed',
                                            fontSize: '0.9rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Canjear
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* My Coupons */}
                <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#666' }}>Mis Cupones Activos</h4>
                    {(!user.coupons || user.coupons.length === 0) ? (
                        <p style={{ fontSize: '0.9rem', color: '#999', fontStyle: 'italic' }}>No tienes cupones activos.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {(() => {
                                const groupedCoupons = user.coupons.reduce((acc, coupon) => {
                                    const key = coupon.type === 'product' ? coupon.discount : coupon.code;
                                    if (!acc[key]) {
                                        acc[key] = { ...coupon, count: 0, codes: [] };
                                    }
                                    acc[key].count++;
                                    acc[key].codes.push(coupon.code);
                                    return acc;
                                }, {});

                                return Object.values(groupedCoupons).map((coupon, idx) => (
                                    <div key={idx} className="flex-between" style={{
                                        backgroundColor: '#fff3e0',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #ff9800'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#e65100', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {coupon.type === 'product' ? `Vale por: ${coupon.discount}` : `Cupón $${coupon.discount} MXN`}
                                                {coupon.count > 1 && (
                                                    <span style={{
                                                        backgroundColor: '#e65100',
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        padding: '2px 8px',
                                                        fontSize: '0.7rem'
                                                    }}>
                                                        x{coupon.count}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                {coupon.count > 1
                                                    ? `${coupon.count} cupones disponibles`
                                                    : `Código: ${coupon.code}`
                                                }
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '1.5rem' }}>{coupon.type === 'product' ? '🎁' : '🎟️'}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
