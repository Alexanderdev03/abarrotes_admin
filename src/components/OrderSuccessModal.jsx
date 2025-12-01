import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, ShoppingBag } from 'lucide-react';

export function OrderSuccessModal({ order, onClose }) {
    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 4000 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    if (!order) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 3500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <CheckCircle size={48} color="#2e7d32" strokeWidth={3} />
                </div>

                <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '800',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem'
                }}>
                    ¡Pedido Exitoso!
                </h2>

                <p style={{
                    color: '#666',
                    fontSize: '1rem',
                    marginBottom: '2rem'
                }}>
                    Tu pedido ha sido recibido correctamente.
                </p>

                <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    textAlign: 'left'
                }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: '#666' }}>Pedido #</span>
                        <span style={{ fontWeight: 'bold' }}>{order.id}</span>
                    </div>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: '#666' }}>Total</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                            ${order.total.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex-between">
                        <span style={{ color: '#666' }}>Estado</span>
                        <span style={{
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            En camino
                        </span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '16px',
                        border: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                >
                    <ShoppingBag size={20} />
                    Seguir Comprando
                </button>
            </div>
            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
