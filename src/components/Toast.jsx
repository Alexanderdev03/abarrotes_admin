import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        info: <Info size={20} />
    };

    const colors = {
        success: '#4caf50',
        error: '#f44336',
        info: '#2196f3'
    };

    return (
        <div style={{
            position: 'fixed',
            top: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            animation: 'slideDown 0.3s ease-out',
            minWidth: '300px',
            justifyContent: 'center'
        }}>
            <span style={{ color: colors[type] }}>{icons[type]}</span>
            <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{message}</span>
        </div>
    );
}
