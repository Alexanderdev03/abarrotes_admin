import React from 'react';
import { ShoppingBasket, ArrowUpDown } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { OffersCarousel } from './OffersCarousel';
import { FlashSale } from './FlashSale';
import { ComboSection } from './ComboSection';
import { Flyer } from './Flyer';

const iconMap = {
    ShoppingBasket
};

export function HomeView({
    categories,
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    filteredProducts,
    filteredCategories,
    visibleProducts,
    isLoading,
    visibleCount,
    setVisibleCount,
    handleCategoryClick,
    setSelectedSubcategory,
    handleTabChange,
    addToCart,
    favorites,
    toggleFavorite,
    handleOpenProduct,
    clearFilters,
    sortOrder,
    setSortOrder,
    bestSellers,
    handleAddCombo
}) {
    return (
        <>
            {/* Categories Grid - Horizontal Scroll */}
            {!selectedCategory && !searchQuery && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Departamentos</h3>
                        <button onClick={() => handleTabChange('categories')} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>Ver todos</button>
                    </div>
                    <div
                        className="no-scrollbar"
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            overflowX: 'auto',
                            paddingBottom: '0.5rem',
                            scrollSnapType: 'x mandatory'
                        }}
                    >
                        {categories.map((cat, index) => {
                            const Icon = iconMap[cat.icon] || ShoppingBasket;
                            return (
                                <div key={`${cat.id}-${index}`} onClick={() => handleCategoryClick(cat.name)} style={{ cursor: 'pointer', minWidth: '80px', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        backgroundColor: cat.color,
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '0.5rem',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <Icon size={24} color="var(--color-primary-dark)" />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '500', color: '#555', textAlign: 'center', lineHeight: '1.1' }}>{cat.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Subcategories Pills */}
            {selectedCategory && (
                <div style={{ marginBottom: '1.5rem', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '0.5rem' }} className="no-scrollbar">
                    <button
                        onClick={() => setSelectedSubcategory(null)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: !selectedSubcategory ? 'var(--color-primary)' : '#f0f0f0',
                            color: !selectedSubcategory ? 'white' : '#666',
                            marginRight: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Todo
                    </button>
                    {categories.find(c => c.name === selectedCategory)?.subcategories?.map(sub => (
                        <button
                            key={sub}
                            onClick={() => setSelectedSubcategory(sub)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: 'none',
                                backgroundColor: selectedSubcategory === sub ? 'var(--color-primary)' : '#f0f0f0',
                                color: selectedSubcategory === sub ? 'white' : '#666',
                                marginRight: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            )}

            {/* Offers Banner - Only show on main home view */}
            {!selectedCategory && !searchQuery && (
                <>
                    <OffersCarousel />

                    {/* Best Sellers Section */}
                    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <h3>Más Vendidos 🔥</h3>
                        </div>
                        <div className="best-sellers-scroll">
                            {bestSellers.map(product => (
                                <div key={product.id} style={{ width: '160px' }}>
                                    <ProductCard
                                        product={product}
                                        onAdd={addToCart}
                                        isFavorite={favorites.some(fav => fav.id === product.id)}
                                        onToggleFavorite={() => toggleFavorite(product)}
                                        onClick={() => handleOpenProduct(product)}
                                        priority={true}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Sections */}
                    <FlashSale onAdd={addToCart} />
                    <ComboSection onAddCombo={handleAddCombo} onSeeAll={() => handleTabChange('combos')} />
                    <div style={{ marginTop: '2rem' }}>
                        <Flyer />
                    </div>
                </>
            )}

            {/* Product Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>
                    {selectedCategory ? selectedCategory : (searchQuery ? 'Resultados' : 'Recomendados')}
                </h3>
                <button
                    onClick={() => setSortOrder(prev => {
                        if (prev === null) return 'asc';
                        if (prev === 'asc') return 'desc';
                        return null;
                    })}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: '1px solid #ddd',
                        borderRadius: '20px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        color: sortOrder ? 'var(--color-primary)' : '#666',
                        borderColor: sortOrder ? 'var(--color-primary)' : '#ddd'
                    }}
                >
                    <ArrowUpDown size={16} />
                    {sortOrder === 'asc' ? 'Menor Precio' : sortOrder === 'desc' ? 'Mayor Precio' : 'Ordenar'}
                </button>
            </div>

            {/* Matching Categories Results */}
            {searchQuery && filteredCategories && filteredCategories.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Departamentos encontrados:</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {filteredCategories.map((cat, index) => {
                            const Icon = iconMap[cat.icon] || ShoppingBasket;
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        boxShadow: 'var(--shadow-sm)',
                                        cursor: 'pointer',
                                        border: '1px solid #eee'
                                    }}
                                >
                                    <div style={{
                                        backgroundColor: cat.color || '#eee',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon size={16} color="var(--color-primary-dark)" />
                                    </div>
                                    <span style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{cat.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    <p>No se encontraron productos.</p>
                    <button
                        onClick={clearFilters}
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', width: 'auto' }}
                    >
                        Ver todos los productos
                    </button>
                </div>
            ) : (
                <>
                    {/* Product Grid */}
                    <div className="grid-2" style={{ marginBottom: '2rem' }}>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, idx) => (
                                <ProductSkeleton key={idx} />
                            ))
                        ) : (
                            visibleProducts.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAdd={addToCart}
                                    isFavorite={favorites.some(fav => fav.id === product.id)}
                                    onToggleFavorite={() => toggleFavorite(product)}
                                    onClick={() => handleOpenProduct(product)}
                                    priority={index < 4}
                                />
                            ))
                        )}
                    </div>

                    {/* Load More Button */}
                    {visibleCount < filteredProducts.length && (
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <button
                                onClick={() => setVisibleCount(prev => prev + 20)}
                                style={{
                                    padding: '0.75rem 2rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '20px',
                                    color: '#666',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                Ver más productos ({filteredProducts.length - visibleCount} restantes)
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
