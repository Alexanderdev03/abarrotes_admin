import React from 'react';

export function Skeleton({ width, height, borderRadius = '4px', style = {} }) {
    return (
        <div
            className="skeleton"
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius: borderRadius,
                ...style
            }}
        ></div>
    );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <>
            {Array(rows).fill(0).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {Array(columns).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '1rem 1.5rem' }}>
                            <Skeleton height="20px" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
