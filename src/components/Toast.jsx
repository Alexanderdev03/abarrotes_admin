import React, { useEffect, useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import '../styles/animations.css';

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!message) return null;

    const bgColors = {
        success: 'rgba(22, 163, 74, 0.9)',
        error: 'rgba(220, 38, 38, 0.9)',
        info: 'rgba(37, 99, 235, 0.9)'
    };

    return (
        <div
            className="glass-panel"
            style={{
                position: 'fixed',
                bottom: '80px', // Above bottom nav
                left: '50%',
                transform: `translateX(-50%) ${isVisible ? 'translateY(0)' : 'translateY(20px)'}`,
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.3s ease',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderRadius: '50px',
                backgroundColor: bgColors[type] || bgColors.success,
                color: 'white',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                minWidth: '300px',
                maxWidth: '90vw',
                backdropFilter: 'blur(12px)'
            }}
        >
            <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '4px',
                display: 'flex'
            }}>
                {type === 'error' ? <X size={16} /> : <Check size={16} />}
            </div>
            <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{message}</span>
        </div>
    );
}

