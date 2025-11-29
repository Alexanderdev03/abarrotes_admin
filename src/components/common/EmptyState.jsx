import React from 'react';
import { PackageOpen } from 'lucide-react';

export function EmptyState({
    title = 'No hay datos',
    message = 'No se encontró información para mostrar.',
    icon: Icon = PackageOpen,
    actionLabel,
    onAction
}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#6b7280'
        }}>
            <div style={{
                backgroundColor: '#f3f4f6',
                padding: '1.5rem',
                borderRadius: '50%',
                marginBottom: '1.5rem'
            }}>
                <Icon size={48} color="#9ca3af" />
            </div>
            <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#111827'
            }}>
                {title}
            </h3>
            <p style={{
                margin: '0 0 1.5rem 0',
                maxWidth: '400px'
            }}>
                {message}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
