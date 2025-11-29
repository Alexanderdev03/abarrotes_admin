import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { ProductService } from '../../services/products';
import { ProductForm } from './ProductForm';
import { TableSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, stockFilter]);

    const loadData = async () => {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
            ProductService.getAllProducts(),
            ProductService.getAllCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
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
            await ProductService.deleteProduct(id);
            loadData();
        }
    };

    const handleSave = async (productData) => {
        try {
            if (editingProduct) {
                await ProductService.updateProduct(editingProduct.id, productData);
            } else {
                await ProductService.addProduct(productData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            alert('Error al guardar el producto');
            console.error(error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === '' || p.category === selectedCategory || (categories.find(c => c.id === p.category)?.name === selectedCategory)) &&
        (stockFilter === 'all' ||
            (stockFilter === 'low' && (p.stock || 0) < 5) ||
            (stockFilter === 'out' && (p.stock || 0) === 0))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Productos</h2>
                <button
                    onClick={handleCreate}
                    style={{
                        backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem',
                        borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500'
                    }}
                >
                    <Plus size={18} />
                    Nuevo Producto
                </button>
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
                        padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none',
                        minWidth: '150px'
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
                        padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none',
                        minWidth: '150px'
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
                            <TableSkeleton rows={5} columns={5} />
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <EmptyState
                                        title="No hay productos"
                                        message="No se encontraron productos con los filtros seleccionados."
                                        actionLabel="Crear Producto"
                                        onAction={handleCreate}
                                    />
                                </td>
                            </tr>
                        ) : (
                            currentProducts.map(product => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f3f4f6', flexShrink: 0 }}>
                                            {product.image ? (
                                                <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={20} color="#9ca3af" /></div>
                                            )}
                                        </div>
                                        <span style={{ fontWeight: '500', color: '#111827' }}>{product.name}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>
                                        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#e5e7eb', borderRadius: '999px', fontSize: '0.85rem' }}>
                                            {categories.find(c => c.id === product.category)?.name || product.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: '#111827' }}>${product.price}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>
                                        <span style={{
                                            color: (product.stock || 0) < 5 ? '#ef4444' : '#059669',
                                            fontWeight: '500',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}>
                                            {product.stock || 0}
                                            {(product.stock || 0) < 5 && <span style={{ fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Bajo</span>}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
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

            {/* Pagination */}
            {filteredProducts.length > 0 && (
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredProducts.length)} de {filteredProducts.length} productos
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px',
                                backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                                color: currentPage === 1 ? '#9ca3af' : '#374151',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px',
                                backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {/* Product Form Modal */}
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
