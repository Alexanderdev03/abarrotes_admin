import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronRight, FolderPlus, List } from 'lucide-react';
import { ProductService } from '../../services/products';

export function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const data = await ProductService.getAllCategories();
        setCategories(data);
        setLoading(false);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subcategories?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSave = async (categoryData) => {
        if (editingCategory) {
            await ProductService.updateCategory(editingCategory.id, categoryData);
        } else {
            await ProductService.addCategory(categoryData);
        }
        loadCategories();
        setIsFormOpen(false);
        setEditingCategory(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
            await ProductService.deleteCategory(id);
            loadCategories();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Gestión de Categorías</h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>Administra las categorías y subcategorías de tus productos.</p>
                </div>
                <button
                    onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}
                    style={{
                        backgroundColor: '#3b82f6', color: 'white', border: 'none',
                        padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: '0 2px 5px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <Plus size={20} />
                    Nueva Categoría
                </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Buscar categorías o subcategorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%', maxWidth: '400px', padding: '0.75rem 1rem',
                        borderRadius: '8px', border: '1px solid #d1d5db',
                        fontSize: '0.95rem'
                    }}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Cargando categorías...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredCategories.map(category => (
                        <div key={category.id} style={{
                            backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${category.color || '#e5e7eb'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '8px',
                                        backgroundColor: category.color || '#f3f4f6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {/* Icon rendering could be dynamic if we map strings to components */}
                                        <List size={20} color="#374151" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{category.name}</h3>
                                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                            {category.subcategories?.length || 0} subcategorías
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => { setEditingCategory(category); setIsFormOpen(true); }}
                                        style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#f3f4f6', cursor: 'pointer', color: '#3b82f6' }}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {category.subcategories?.map((sub, idx) => (
                                    <span key={idx} style={{
                                        fontSize: '0.8rem', padding: '0.25rem 0.75rem',
                                        backgroundColor: '#f9fafb', borderRadius: '999px',
                                        border: '1px solid #e5e7eb', color: '#4b5563'
                                    }}>
                                        {sub}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <CategoryForm
                    category={editingCategory}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

function CategoryForm({ category, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        color: '#e3f2fd',
        subcategories: []
    });
    const [newSubcategory, setNewSubcategory] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                color: category.color || '#e3f2fd',
                subcategories: category.subcategories || []
            });
        }
    }, [category]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const addSubcategory = () => {
        if (newSubcategory.trim()) {
            setFormData({
                ...formData,
                subcategories: [...formData.subcategories, newSubcategory.trim()]
            });
            setNewSubcategory('');
        }
    };

    const removeSubcategory = (index) => {
        const updated = formData.subcategories.filter((_, i) => i !== index);
        setFormData({ ...formData, subcategories: updated });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px',
                maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                        {category ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#6b7280" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Nombre</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Color de Fondo (Hex)</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                style={{ width: '50px', height: '42px', padding: '0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            />
                            <input
                                type="text"
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Subcategorías</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                value={newSubcategory}
                                onChange={e => setNewSubcategory(e.target.value)}
                                placeholder="Nueva subcategoría..."
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSubcategory();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={addSubcategory}
                                style={{
                                    padding: '0.75rem', borderRadius: '6px', border: 'none',
                                    backgroundColor: '#10b981', color: 'white', cursor: 'pointer'
                                }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {formData.subcategories.map((sub, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 0.75rem', backgroundColor: '#f3f4f6',
                                    borderRadius: '999px', border: '1px solid #e5e7eb'
                                }}>
                                    <span style={{ fontSize: '0.9rem' }}>{sub}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSubcategory(idx)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                                    >
                                        <X size={14} color="#6b7280" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none',
                                backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
