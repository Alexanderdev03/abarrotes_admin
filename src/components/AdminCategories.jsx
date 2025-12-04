import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronRight, FolderPlus, List } from 'lucide-react';
import { ProductService } from '../services/products';
import { ConfirmationModal } from './common/ConfirmationModal';

export function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false,
        confirmText: 'Confirmar'
    });

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const data = await ProductService.getAllCategories();
        // Enforce string IDs for consistency
        setCategories(data.map(c => ({ ...c, id: String(c.id) })));
        setLoading(false);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subcategories?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSave = async (categoryData, renames = []) => {
        try {
            if (editingCategory) {
                await ProductService.updateCategory(String(editingCategory.id), categoryData);

                // Process renames if any
                if (renames.length > 0) {
                    console.log("Processing subcategory renames:", renames);
                    const renamePromises = renames.map(rename =>
                        ProductService.updateProductSubcategory(categoryData.name, rename.oldName, rename.newName)
                    );
                    await Promise.all(renamePromises);
                    alert(`Categoría actualizada y ${renames.length} subcategoría(s) renombrada(s) en los productos.`);
                }
            } else {
                await ProductService.addCategory(categoryData);
            }
            await loadCategories(); // Wait for reload
            setIsFormOpen(false);
            setEditingCategory(null);
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Error al guardar la categoría. Revisa la consola para más detalles.");
        }
    };

    const handleDelete = async (id, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        const category = categories.find(c => String(c.id) === String(id));
        if (!category) return;

        // 1. Check for subcategories
        if (category.subcategories && category.subcategories.length > 0) {
            setModalConfig({
                isOpen: true,
                title: 'No se puede eliminar',
                message: `La categoría "${category.name}" tiene ${category.subcategories.length} subcategorías. Debes eliminarlas primero.`,
                onConfirm: () => { },
                isDanger: false,
                confirmText: 'Entendido',
                cancelText: 'Cerrar'
            });
            return;
        }

        // 2. Check for duplicates (Sibling check)
        const siblingCategory = categories.find(c =>
            c.name.trim().toLowerCase() === category.name.trim().toLowerCase() &&
            String(c.id) !== String(id)
        );

        if (siblingCategory) {
            setModalConfig({
                isOpen: true,
                title: 'Eliminar duplicado',
                message: `Existe otra categoría llamada "${category.name}". ¿Quieres eliminar esta versión (ID: ${id})?`,
                isDanger: true,
                confirmText: 'Eliminar',
                onConfirm: async () => {
                    try {
                        await ProductService.deleteCategory(String(id));
                        loadCategories();
                    } catch (error) {
                        console.error("Error deleting duplicate:", error);
                    }
                }
            });
            return;
        }

        // 3. Check for usage
        try {
            const isUsed = await ProductService.checkCategoryUsage(category.name);

            if (isUsed) {
                setModalConfig({
                    isOpen: true,
                    title: 'No se puede eliminar',
                    message: `La categoría "${category.name}" está siendo usada por productos. Reasigna o elimina los productos primero.`,
                    onConfirm: () => { },
                    isDanger: false,
                    confirmText: 'Entendido'
                });
                return;
            }

            setModalConfig({
                isOpen: true,
                title: '¿Eliminar categoría?',
                message: `¿Estás seguro de eliminar "${category.name}"? Esta acción no se puede deshacer.`,
                isDanger: true,
                confirmText: 'Sí, eliminar',
                onConfirm: async () => {
                    await ProductService.deleteCategory(String(id));
                    loadCategories();
                }
            });
        } catch (error) {
            console.error("Error checking/deleting category:", error);
        }
    };

    const checkSubcategoryUsage = async (categoryName, subcategoryName) => {
        return await ProductService.checkCategoryUsage(categoryName, subcategoryName);
    };

    return (
        <div>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Gestión de Categorías</h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>Administra las categorías y subcategorías de tus productos.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={async () => {
                            setModalConfig({
                                isOpen: true,
                                title: 'Limpiar Duplicados',
                                message: '¿Deseas buscar y eliminar categorías duplicadas?',
                                isDanger: true,
                                confirmText: 'Limpiar',
                                onConfirm: async () => {
                                    setLoading(true);
                                    try {
                                        const count = await ProductService.removeDuplicateCategories();
                                        alert(count > 0 ? `Se eliminaron ${count} duplicados.` : 'No se encontraron duplicados.');
                                        loadCategories();
                                    } catch (error) {
                                        console.error("Error removing duplicates:", error);
                                    }
                                    setLoading(false);
                                }
                            });
                        }}
                        style={{
                            backgroundColor: '#ef4444', color: 'white', border: 'none',
                            padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: '0 2px 5px rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <Trash2 size={20} />
                        Limpiar Duplicados
                    </button>
                    <button
                        onClick={async () => {
                            setModalConfig({
                                isOpen: true,
                                title: 'Restaurar Categorías',
                                message: '¿Restaurar las categorías originales? Esto borrará las actuales.',
                                isDanger: true,
                                confirmText: 'Restaurar',
                                onConfirm: async () => {
                                    setLoading(true);
                                    try {
                                        await ProductService.reseedCategories();
                                        loadCategories();
                                    } catch (error) {
                                        console.error(error);
                                    }
                                    setLoading(false);
                                }
                            });
                        }}
                        style={{
                            backgroundColor: '#f59e0b', color: 'white', border: 'none',
                            padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: '0 2px 5px rgba(245, 158, 11, 0.3)'
                        }}
                    >
                        <FolderPlus size={20} />
                        Restaurar
                    </button>
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
                    {[...new Map(filteredCategories.map(item => [String(item.id), item])).values()].map(category => (
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
                                        onClick={(e) => handleDelete(category.id, e)}
                                        style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {category.subcategories?.map((sub, idx) => (
                                    <span key={`${category.id}-sub-${idx}`} style={{
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
                    checkSubcategoryUsage={checkSubcategoryUsage}
                />
            )}
        </div>
    );
}

function CategoryForm({ category, onClose, onSave, checkSubcategoryUsage }) {
    const [formData, setFormData] = useState({
        name: '',
        color: '#e3f2fd',
        subcategories: [] // Array of { id: string, name: string, isNew: boolean, originalName: string | null }
    });
    const [newSubcategory, setNewSubcategory] = useState('');
    const [editingSubIndex, setEditingSubIndex] = useState(null);
    const [editSubValue, setEditSubValue] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                color: category.color || '#e3f2fd',
                // Map existing subcategories to objects
                subcategories: (category.subcategories || []).map((sub, idx) => ({
                    id: `existing-${idx}`,
                    name: sub,
                    isNew: false,
                    originalName: sub
                }))
            });
        } else {
            setFormData({
                name: '',
                color: '#e3f2fd',
                subcategories: []
            });
        }
    }, [category]);

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaving(true);

        // Extract plain strings for the DB
        const plainSubcategories = formData.subcategories.map(s => s.name);

        // Identify renames: existing items where name changed
        const renames = formData.subcategories
            .filter(s => !s.isNew && s.originalName && s.name !== s.originalName)
            .map(s => ({ oldName: s.originalName, newName: s.name }));

        const dataToSave = {
            name: formData.name,
            color: formData.color,
            subcategories: plainSubcategories
        };

        console.log("Saving category data:", dataToSave);
        console.log("Renames detected:", renames);

        try {
            await onSave(dataToSave, renames);
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            alert("Error al guardar desde el formulario.");
        } finally {
            setIsSaving(false);
        }
    };

    const addSubcategory = () => {
        if (newSubcategory.trim()) {
            setFormData({
                ...formData,
                subcategories: [
                    ...formData.subcategories,
                    {
                        id: `new-${Date.now()}`,
                        name: newSubcategory.trim(),
                        isNew: true,
                        originalName: null
                    }
                ]
            });
            setNewSubcategory('');
        }
    };

    const removeSubcategory = async (index) => {
        const subToRemove = formData.subcategories[index];

        // Only check usage if it's an existing subcategory (not new)
        if (!subToRemove.isNew && category && category.subcategories && category.subcategories.includes(subToRemove.originalName)) {
            try {
                // Check usage using the ORIGINAL name, as that's what's in the DB
                const isUsed = await checkSubcategoryUsage(category.name, subToRemove.originalName);
                if (isUsed) {
                    alert(`No se puede eliminar la subcategoría "${subToRemove.originalName}" porque está en uso por uno o más productos. Cambia la categoría de esos productos primero.`);
                    return;
                }
            } catch (error) {
                console.error("Error checking subcategory usage:", error);
                alert("Error al verificar uso de subcategoría. Intenta de nuevo.");
                return;
            }
        }

        const updated = formData.subcategories.filter((_, i) => i !== index);
        setFormData({ ...formData, subcategories: updated });
    };

    const startEditingSubcategory = (index) => {
        setEditingSubIndex(index);
        setEditSubValue(formData.subcategories[index].name);
    };

    const saveSubcategory = (index) => {
        if (editSubValue.trim() !== '') {
            const updatedSubcategories = [...formData.subcategories];
            updatedSubcategories[index] = {
                ...updatedSubcategories[index],
                name: editSubValue.trim()
            };
            setFormData({ ...formData, subcategories: updatedSubcategories });
        }
        setEditingSubIndex(null);
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
                                <div key={sub.id || idx} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 0.75rem', backgroundColor: '#f3f4f6',
                                    borderRadius: '999px', border: '1px solid #e5e7eb'
                                }}>
                                    {editingSubIndex === idx ? (
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editSubValue}
                                            onChange={(e) => setEditSubValue(e.target.value)}
                                            onBlur={() => saveSubcategory(idx)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    saveSubcategory(idx);
                                                } else if (e.key === 'Escape') {
                                                    setEditingSubIndex(null);
                                                }
                                            }}
                                            style={{
                                                border: 'none', background: 'transparent', outline: 'none',
                                                fontSize: '0.9rem', width: `${Math.max(sub.name.length, 10)}ch`,
                                                minWidth: '60px', color: '#374151'
                                            }}
                                        />
                                    ) : (
                                        <span
                                            onClick={() => startEditingSubcategory(idx)}
                                            style={{ fontSize: '0.9rem', cursor: 'text' }}
                                            title="Click para editar"
                                        >
                                            {sub.name}
                                        </span>
                                    )}
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
                            disabled={isSaving}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', opacity: isSaving ? 0.5 : 1 }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none',
                                backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isSaving ? 0.7 : 1
                            }}
                        >
                            <Save size={18} />
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    );
}

