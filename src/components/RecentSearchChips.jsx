import React from 'react';
import { X, Clock } from 'lucide-react';

export function RecentSearchChips({ history, onSelect, onRemove, onClear }) {
    if (!history || history.length === 0) return null;

    return (
        <div className="recent-search-chips" style={{ marginBottom: '1rem' }}>


            <div
                className="no-scrollbar"
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    paddingBottom: '0.25rem'
                }}
            >
                {history.map((term, index) => (
                    <div
                        key={`${term}-${index}`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.35rem 0.75rem',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            border: '1px solid #e5e7eb'
                        }}
                    >
                        <span
                            onClick={() => onSelect(term)}
                            style={{ cursor: 'pointer' }}
                        >
                            {term}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(term);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#e5e7eb',
                                border: 'none',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                                padding: 0,
                                color: '#6b7280'
                            }}
                        >
                            <X size={10} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
