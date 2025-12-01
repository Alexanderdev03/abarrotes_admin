import React from 'react';

export function ProductSkeleton() {
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton-img"></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>

                <div style={{ marginTop: 'auto' }}>
                    <div className="skeleton skeleton-text-sm" style={{ width: '40%', marginBottom: '0.5rem' }}></div>
                    <div className="skeleton skeleton-btn"></div>
                </div>
            </div>
        </div>
    );
}
