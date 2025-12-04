import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Loader } from 'lucide-react';
import { api } from '../services/api';

export function ProductForm({ product, onClose, onSave, categories }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        originalPrice: '',
        category: '',
        subcategory: '',
        image: '',
        description: '',
        stock: 'In Stock',
        points: '',
        isBulk: false,
        averageWeight: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price || '',
                originalPrice: product.originalPrice || '',
                category: product.category || '',
                subcategory: product.subcategory || '',
                image: product.image || '',
                description: product.description || '',
                stock: product.stock || 'In Stock',
                points: product.bonusPoints || '', // Map bonusPoints to points field
                isBulk: product.isBulk || false,
                averageWeight: product.averageWeight || '',
                bulkSuggestions: product.bulkSuggestions || ''
            });
        }
    }, [product]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            bonusPoints: formData.points ? parseInt(formData.points) : 0, // Save as bonusPoints
            isBulk: formData.isBulk,
            averageWeight: formData.averageWeight ? parseFloat(formData.averageWeight) : null,
            bulkSuggestions: formData.bulkSuggestions || null
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            try {
                // Create a promise that rejects after 30 seconds
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Tiempo de espera agotado. Verifica tu conexión.')), 30000)
                );

                // Race between upload and timeout
                const url = await Promise.race([
                    api.storage.upload(file),
                    timeoutPromise
                ]);

                console.log("Imagen subida con éxito. URL:", url);

                if (!url) {
                    throw new Error("La subida finalizó pero no se recibió una URL válida.");
                }

                setFormData(prev => {
                    console.log("Actualizando formData con imagen:", url);
                    return { ...prev, image: url };
                });
            } catch (error) {
                console.error("Error en handleImageUpload:", error);
                alert(`Error al subir la imagen: ${error.message || "Error desconocido"}`);
            } finally {
                setUploading(false);
            }
        }
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
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
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

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Precio Actual ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                Precio Original ($) <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>(Opcional)</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.originalPrice}
                                onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                placeholder="Ej. 50.00"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="isBulk"
                            checked={formData.isBulk}
                            onChange={e => setFormData({ ...formData, isBulk: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <label htmlFor="isBulk" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                            Venta a Granel (Precio por Kg)
                        </label>
                    </div>

                    {formData.isBulk && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                    Peso Promedio por Pieza (Kg) <span style={{ fontWeight: 'normal', color: '#666' }}>(Opcional, para venta por pieza)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={formData.averageWeight}
                                    onChange={e => setFormData({ ...formData, averageWeight: e.target.value })}
                                    placeholder="Ej. 0.300"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                    Sugerencias de Peso (Kg, separadas por coma)
                                </label>
                                <input
                                    type="text"
                                    value={formData.bulkSuggestions || ''}
                                    onChange={e => setFormData({ ...formData, bulkSuggestions: e.target.value })}
                                    placeholder="Ej. 0.100, 0.250, 0.500, 1.0"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                                <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                                    Define los botones de peso rápido que verá el cliente.
                                </span>
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                Categoría <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>(Opcional)</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            >
                                <option value="">Sin Categoría (Pruebas)</option>
                                {[...new Map(categories.map(item => [String(item.id), item])).values()].map(cat => (
                                    <option key={String(cat.id)} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Puntos</label>
                            <input
                                type="number"
                                value={formData.points}
                                onChange={e => setFormData({ ...formData, points: e.target.value })}
                                placeholder="Ej. 10"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Subcategoría</label>
                        <select
                            value={formData.subcategory}
                            onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                            disabled={!formData.category}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: !formData.category ? '#f3f4f6' : 'white' }}
                        >
                            <option value="">Seleccionar...</option>
                            {formData.category && categories.find(c => c.name === formData.category || c.id === formData.category)?.subcategories?.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Stock Disponible</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.stock === 'In Stock' ? '' : formData.stock}
                            onChange={e => setFormData({ ...formData, stock: e.target.value ? parseInt(e.target.value) : 0 })}
                            placeholder="Cantidad en inventario (ej. 50)"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                            Dejar vacío o en 0 para marcar como "Agotado" si no es 'In Stock'.
                        </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Imagen del Producto</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '0.5rem' }}
                                />
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="O pega una URL directa..."
                                    disabled={uploading}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                                />
                            </div>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '6px', backgroundColor: '#f3f4f6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                border: '1px solid #e5e7eb', position: 'relative'
                            }}>
                                {uploading ? (
                                    <Loader size={24} className="animate-spin" color="#3b82f6" />
                                ) : formData.image ? (
                                    <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <ImageIcon size={24} color="#9ca3af" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Descripción</label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none',
                                backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: uploading ? 0.7 : 1
                            }}
                        >
                            {uploading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                            {uploading ? 'Subiendo...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}

