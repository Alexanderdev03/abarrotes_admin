import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const defaultOffers = [
    {
        id: 1,
        title: "Martes de Frescura",
        subtitle: "Frutas y Verduras al 2x1",
        color: "#4CAF50", // Green
        textColor: "white"
    },
    {
        id: 2,
        title: "Limpieza Total",
        subtitle: "30% de descuento en Detergentes",
        color: "#2196F3", // Blue
        textColor: "white"
    },
    {
        id: 3,
        title: "Panadería Recién Hecha",
        subtitle: "¡El mejor pan dulce de la ciudad!",
        color: "#FF9800", // Orange
        textColor: "white"
    },
    {
        id: 4,
        title: "Envío GRATIS",
        subtitle: "En compras mayores a $299",
        color: "#E91E63", // Pink
        textColor: "white"
    }
];

export function OffersCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [offers, setOffers] = useState(defaultOffers);

    useEffect(() => {
        const loadBanners = async () => {
            try {
                // Import dynamically to avoid circular dependencies if any, though not expected here
                const { ContentService } = await import('../services/content');
                const remoteBanners = await ContentService.getBanners();

                if (remoteBanners.length > 0) {
                    setOffers(remoteBanners);
                } else {
                    setOffers(defaultOffers);
                }
            } catch (error) {
                console.error("Failed to load banners", error);
                setOffers(defaultOffers);
            }
        };

        loadBanners();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % offers.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [offers.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % offers.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '160px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-md)'
        }}>
            {offers.map((offer, index) => (
                <div
                    key={offer.id}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: offer.imageUrl ? '#000' : offer.color,
                        color: offer.textColor || 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '2rem',
                        transition: 'transform 0.5s ease-in-out',
                        transform: `translateX(${(index - currentIndex) * 100}%)`,
                    }}
                >
                    {offer.imageUrl ? (
                        <>
                            <img
                                src={offer.imageUrl}
                                alt={offer.title}
                                loading={index === 0 ? "eager" : "lazy"}
                                fetchPriority={index === 0 ? "high" : "auto"}
                                style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    objectFit: 'cover', opacity: 0.6
                                }}
                            />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                    {offer.title}
                                </h2>
                                {offer.subtitle && (
                                    <p style={{ fontSize: '1.1rem', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                        {offer.subtitle}
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{offer.title}</h2>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>{offer.subtitle}</p>
                        </>
                    )}
                </div>
            ))}

            {/* Controls */}
            <button
                onClick={prevSlide}
                style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    zIndex: 2
                }}
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={nextSlide}
                style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    zIndex: 2
                }}
            >
                <ChevronRight size={20} />
            </button>

            {/* Indicators */}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 2
            }}>
                {offers.map((_, index) => (
                    <div
                        key={index}
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                            transition: 'background-color 0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
