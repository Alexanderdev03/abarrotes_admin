import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { ProductForm } from './ProductForm';
import { TableSkeleton } from './common/Skeleton';
import { EmptyState } from './common/EmptyState';
import { ConfirmationModal } from './common/ConfirmationModal';

export function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Confirmation Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar'
    });

    // Client-Side Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        loadCategories();
        loadProducts();
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, stockFilter]);

    const loadCategories = async () => {
        const cats = await api.products.getCategories();
        setCategories(cats.map(c => ({ ...c, id: String(c.id) })));
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const allProducts = await api.products.getAll();
            // Sort by creation date desc
            allProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            // Ensure IDs are strings
            setProducts(allProducts.map(p => ({ ...p, id: String(p.id) })));
        } catch (error) {
            console.error("Error loading products:", error);
            alert("Error al cargar productos.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (id, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setModalConfig({
            isOpen: true,
            title: '¿Eliminar producto?',
            message: '¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.',
            isDanger: true,
            confirmText: 'Sí, eliminar',
            onConfirm: async () => {
                await api.products.delete(id);
                loadProducts();
            }
        });
    };

    const handleSave = async (productData) => {
        try {
            if (editingProduct) {
                await api.products.update(String(editingProduct.id), productData);
            } else {
                await api.products.add(productData);
            }
            setIsModalOpen(false);
            loadProducts(); // Reload to refresh list
        } catch (error) {
            alert('Error al guardar el producto');
            console.error(error);
        }
    };

    // Filter Logic
    const getFilteredProducts = () => {
        let filtered = products;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(lowerTerm));
        }

        if (selectedCategory) {
            filtered = filtered.filter(p => String(p.category) === String(selectedCategory));
        }

        if (stockFilter !== 'all') {
            filtered = filtered.filter(p => {
                const stock = Number(p.stock || 0);
                if (stockFilter === 'low') return stock < 10 && stock > 0;
                if (stockFilter === 'out') return stock === 0;
                return true;
            });
        }

        return filtered;
    };

    const filteredProducts = getFilteredProducts();
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
            />

            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Productos</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => {
                            setModalConfig({
                                isOpen: true,
                                title: '⚠️ ELIMINAR TODO EL INVENTARIO',
                                message: 'Esto eliminará TODOS los productos permanentemente. Las categorías se mantendrán. ¿Estás seguro?',
                                isDanger: true,
                                confirmText: 'SÍ, ELIMINAR TODO',
                                onConfirm: () => {
                                    // Timeout to allow the first modal to close properly before opening the second one
                                    setTimeout(() => {
                                        setModalConfig({
                                            isOpen: true,
                                            title: '¿DE VERDAD?',
                                            message: 'Esta es tu última oportunidad. Esta acción es IRREVERSIBLE.',
                                            isDanger: true,
                                            confirmText: 'ESTOY SEGURO',
                                            onConfirm: async () => {
                                                setLoading(true);
                                                try {
                                                    await api.products.deleteAllProducts();
                                                    alert('Inventario limpiado correctamente.');
                                                    loadProducts();
                                                } catch (error) {
                                                    console.error(error);
                                                    alert('Error al limpiar productos');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        });
                                    }, 200);
                                }
                            });
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                            backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap'
                        }}
                    >
                        <Trash2 size={18} />
                        Eliminar Todo
                    </button>
                    <button
                        onClick={handleCreate}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                            backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap'
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
                    {[...new Map(categories.map(item => [String(item.id), item])).values()].map(cat => (
                        <option key={String(cat.id)} value={String(cat.id)}>{cat.name}</option>
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
                    <option value="low">Stock Bajo (&lt; 10)</option>
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
                        ) : paginatedProducts.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <EmptyState
                                        title="No se encontraron productos"
                                        description="Intenta ajustar los filtros de búsqueda"
                                    />
                                </td>
                            </tr>
                        ) : (
                            paginatedProducts.map((product, index) => (
                                <tr key={`${product.id}-${index}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
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
                                            <div style={{ fontWeight: '500', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {product.name}
                                                {(product.stock || 0) < 10 && (product.stock || 0) > 0 && (
                                                    <span title="Stock Bajo" style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                                                        <AlertTriangle size={16} />
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                {categories.find(c => String(c.id) === String(product.category))?.name || product.category}
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
                                            backgroundColor: (product.stock || 0) === 0 ? '#fee2e2' : (product.stock || 0) < 10 ? '#fef3c7' : '#d1fae5',
                                            color: (product.stock || 0) === 0 ? '#991b1b' : (product.stock || 0) < 10 ? '#92400e' : '#065f46',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            {(product.stock || 0) === 0 ? 'Agotado' : (product.stock || 0) < 10 ? `Bajo (${product.stock})` : `En Stock (${product.stock})`}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(product);
                                                }}
                                                style={{ padding: '0.5rem', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(product.id, e)}
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
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                        color: currentPage === 1 ? '#9ca3af' : '#374151',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Anterior
                </button>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Página {currentPage} de {totalPages || 1} ({filteredProducts.length} productos)
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading || totalPages === 0}
                    style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                        color: currentPage === totalPages ? '#9ca3af' : '#374151',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
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

