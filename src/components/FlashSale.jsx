import React, { useState, useEffect, memo } from 'react';
import { Timer, Zap } from 'lucide-react';
import { ProductService } from '../services/products';

const CountdownTimer = memo(() => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            const difference = endOfDay.getTime() - now.getTime();

            if (difference > 0) {
                return {
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return { hours: 0, minutes: 0, seconds: 0 };
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '0.5rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            fontSize: '1.1rem'
        }}>
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
    );
});

export function FlashSale({ onAdd }) {
    const [isVisible, setIsVisible] = useState(true);
    const [flashProduct, setFlashProduct] = useState(null);

    useEffect(() => {
        const loadFlashProduct = async () => {
            try {
                const flashId = localStorage.getItem('flashSaleId');
                const products = await ProductService.getAllProducts();

                let product = null;
                if (flashId) {
                    product = products.find(p => String(p.id) === String(flashId));
                }

                // Fallback to first product if no flash sale set or product not found
                if (!product && products.length > 0) {
                    product = products[0];
                }

                if (product) {
                    setFlashProduct({
                        ...product,
                        originalPrice: product.originalPrice || (product.price * 1.2) // Mock original price if missing
                    });
                }
            } catch (error) {
                console.error("Error loading flash product", error);
            }
        };

        loadFlashProduct();

        // Listen for updates from Admin Panel
        const handleStorageChange = () => loadFlashProduct();
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    if (!isVisible || !flashProduct) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #ff9800 0%, #f44336 100%)',
            borderRadius: '12px',
            padding: '1rem',
            color: 'white',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
            }} />

            <div className="flex-between" style={{ marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Zap size={20} fill="yellow" color="yellow" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Pasillo Sorpresa
                        </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>¡Oferta relámpago! Termina en:</p>
                </div>

                <CountdownTimer />
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '0.75rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
            }}>
                <img
                    src={flashProduct.image}
                    alt={flashProduct.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                />

                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#333', fontSize: '1rem' }}>{flashProduct.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '1.2rem' }}>${flashProduct.price.toFixed(2)}</span>
                        <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '0.9rem' }}>${flashProduct.originalPrice.toFixed(2)}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px', marginBottom: '0.5rem' }}>
                        <div style={{ width: '85%', height: '100%', backgroundColor: '#f44336', borderRadius: '3px' }} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#666' }}>¡Quedan pocas unidades!</p>
                </div>

                <button
                    onClick={() => onAdd(flashProduct)}
                    style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(244, 67, 54, 0.4)'
                    }}
                >
                    <Zap size={20} />
                </button>
            </div>
        </div>
    );
}
