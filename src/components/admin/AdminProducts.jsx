import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { ProductForm } from './ProductForm';
import { TableSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Server-Side Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState('all');

    // Pagination State
    const [lastVisible, setLastVisible] = useState(null);
    const [pageStack, setPageStack] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [isFirstPage, setIsFirstPage] = useState(true);
    const [currentStartCursor, setCurrentStartCursor] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadCategories();
        loadProducts();
    }, []);

    // Reload when filters change (reset pagination)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            resetAndLoad();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCategory, stockFilter]);

    const loadCategories = async () => {
        const cats = await api.products.getCategories();
        setCategories(cats);
    };

    const resetAndLoad = () => {
        setLastVisible(null);
        setPageStack([]);
        setIsFirstPage(true);
        setCurrentStartCursor(null);
        loadProducts(null);
    };

    const loadProducts = async (startAfterDoc = null) => {
        setLoading(true);
        try {
            const result = await api.products.getProductsPaginated({
                limitPerPage: 10,
                lastVisible: startAfterDoc,
                searchTerm,
                category: selectedCategory,
                stockFilter
            });

            setProducts(result.products);
            setLastVisible(result.lastVisible);
            setHasMore(result.hasMore);
        } catch (error) {
            console.error("Error loading products:", error);
            alert("Error al cargar productos. Intenta simplificar los filtros.");
        } finally {
            setLoading(false);
        }
    };

    const onNext = () => {
        if (!lastVisible) return;
        setPageStack(prev => [...prev, currentStartCursor]);
        setCurrentStartCursor(lastVisible);
        loadProducts(lastVisible);
        setIsFirstPage(false);
    };

    const onPrevious = () => {
        if (pageStack.length === 0) return;
        const prevCursor = pageStack[pageStack.length - 1];
        const newStack = pageStack.slice(0, -1);

        setPageStack(newStack);
        setCurrentStartCursor(prevCursor);
        loadProducts(prevCursor);
        if (newStack.length === 0) setIsFirstPage(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            await api.products.delete(id);
            resetAndLoad();
        }
    };

    const handleSave = async (productData) => {
        try {
            if (editingProduct) {
                await api.products.update(editingProduct.id, productData);
            } else {
                await api.products.add(productData);
            }
            setIsModalOpen(false);
            resetAndLoad();
        } catch (error) {
            alert('Error al guardar el producto');
            console.error(error);
        }
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Productos</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleCreate}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                            backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.875rem'
                        }}
                    >
                        <Plus size={18} />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                            border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none'
                        }}
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                        padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minWidth: '150px'
                    }}
                >
                    <option value="">Todas las Categorías</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    style={{
                        padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minWidth: '150px'
                    }}
                >
                    <option value="all">Todos los Stocks</option>
                    <option value="low">Stock Bajo (&lt; 5)</option>
                    <option value="out">Sin Stock</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Producto</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Categoría</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Precio</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Stock</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableSkeleton columns={5} rows={5} />
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <EmptyState
                                        title="No se encontraron productos"
                                        description="Intenta ajustar los filtros de búsqueda"
                                    />
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ImageIcon size={20} color="#9ca3af" />
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '500', color: '#111827' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                {categories.find(c => c.id === product.category)?.name || product.category}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#6b7280' }}>
                                        ${parseFloat(product.price).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            backgroundColor: (product.stock || 0) === 0 ? '#fee2e2' : (product.stock || 0) < 5 ? '#fef3c7' : '#d1fae5',
                                            color: (product.stock || 0) === 0 ? '#991b1b' : (product.stock || 0) < 5 ? '#92400e' : '#065f46'
                                        }}>
                                            {(product.stock || 0) === 0 ? 'Agotado' : (product.stock || 0) < 5 ? `Bajo (${product.stock})` : `In Stock (${product.stock})`}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                style={{ padding: '0.5rem', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                style={{ padding: '0.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={onPrevious}
                    disabled={isFirstPage || loading}
                    style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: isFirstPage ? '#f3f4f6' : 'white',
                        color: isFirstPage ? '#9ca3af' : '#374151',
                        cursor: isFirstPage ? 'not-allowed' : 'pointer'
                    }}
                >
                    Anterior
                </button>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {loading ? 'Cargando...' : `Mostrando ${products.length} productos`}
                </span>
                <button
                    onClick={onNext}
                    disabled={!hasMore || loading}
                    style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: !hasMore ? '#f3f4f6' : 'white',
                        color: !hasMore ? '#9ca3af' : '#374151',
                        cursor: !hasMore ? 'not-allowed' : 'pointer'
                    }}
                >
                    Siguiente
                </button>
            </div>

            {isModalOpen && (
                <ProductForm
                    product={editingProduct}
                    categories={categories}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
