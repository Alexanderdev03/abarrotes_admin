import React, { useState, useEffect, useRef } from 'react';
import { Image, Upload, Plus, Trash2, Link as LinkIcon, Palette, Type, Save } from 'lucide-react';
import { ConfirmationModal } from './common/ConfirmationModal';

export function AdminContent() {
    const [banners, setBanners] = useState([]);
    const [flyers, setFlyers] = useState([]);
    const [editingBanner, setEditingBanner] = useState(null);

    // Banner Form State
    const [newBannerTitle, setNewBannerTitle] = useState('');
    const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
    const [newBannerColor, setNewBannerColor] = useState('#3b82f6');
    const [newBannerTextColor, setNewBannerTextColor] = useState('#ffffff');
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const bannerFileInputRef = useRef(null);
    const flyerFileInputRef = useRef(null);

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

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const { ContentService } = await import('../services/content');
            const [bannersData, flyersData] = await Promise.all([
                ContentService.getBanners(),
                ContentService.getFlyers()
            ]);
            setBanners(bannersData);
            setFlyers(flyersData);
        } catch (error) {
            console.error("Error loading content:", error);
        }
    };

    const handleEditBanner = (banner) => {
        setEditingBanner(banner);
        setNewBannerTitle(banner.title || '');
        setNewBannerSubtitle(banner.subtitle || '');
        setNewBannerColor(banner.color || '#3b82f6');
        setNewBannerTextColor(banner.textColor || '#ffffff');
        setBannerImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingBanner(null);
        setNewBannerTitle('');
        setNewBannerSubtitle('');
        setNewBannerColor('#3b82f6');
        setNewBannerTextColor('#ffffff');
        setBannerImageFile(null);
        if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();

        // Validation: Need at least a title or an image
        if (!newBannerTitle && !bannerImageFile && !editingBanner?.imageUrl) {
            alert('Debes agregar al menos un título o una imagen.');
            return;
        }

        setIsUploading(true);

        try {
            const { ContentService } = await import('../services/content');
            const { StorageService } = await import('../services/storage');

            let imageUrl = editingBanner?.imageUrl || '';
            if (bannerImageFile) {
                imageUrl = await StorageService.uploadFile(bannerImageFile, 'banners');
            }

            const bannerData = {
                title: newBannerTitle,
                subtitle: newBannerSubtitle,
                color: newBannerColor,
                textColor: newBannerTextColor,
                imageUrl: imageUrl,
                updatedAt: new Date().toISOString()
            };

            if (editingBanner) {
                await ContentService.updateBanner(editingBanner.id, bannerData);
                alert('Banner actualizado correctamente');
            } else {
                await ContentService.addBanner({
                    ...bannerData,
                    createdAt: new Date().toISOString()
                });
                alert('Banner agregado correctamente');
            }

            // Reset Form
            handleCancelEdit();
            loadContent();
        } catch (error) {
            console.error(error);
            alert('Error al guardar el banner');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteBanner = (id, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setModalConfig({
            isOpen: true,
            title: '¿Eliminar banner?',
            message: '¿Estás seguro de eliminar este banner? Esta acción no se puede deshacer.',
            isDanger: true,
            confirmText: 'Sí, eliminar',
            onConfirm: async () => {
                try {
                    const { ContentService } = await import('../services/content');
                    await ContentService.deleteBanner(id);
                    loadContent();
                    if (editingBanner && editingBanner.id === id) {
                        handleCancelEdit();
                    }
                } catch (error) {
                    alert('Error al eliminar el banner');
                }
            }
        });
    };

    const handleFlyerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { ContentService } = await import('../services/content');
            const { StorageService } = await import('../services/storage');

            const imageUrl = await StorageService.uploadFile(file, 'flyers');
            await ContentService.addFlyer({ imageUrl, createdAt: new Date().toISOString() });

            loadContent();
            alert('Página de folleto agregada correctamente');
        } catch (error) {
            console.error(error);
            alert('Error al subir el folleto');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteFlyer = (id) => {
        setModalConfig({
            isOpen: true,
            title: '¿Eliminar página?',
            message: '¿Estás seguro de eliminar esta página del folleto?',
            isDanger: true,
            confirmText: 'Sí, eliminar',
            onConfirm: async () => {
                try {
                    const { ContentService } = await import('../services/content');
                    await ContentService.deleteFlyer(id);
                    loadContent();
                } catch (error) {
                    alert('Error al eliminar el folleto');
                }
            }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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

            {/* Banners Section */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Banners Principales</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Personaliza el carrusel de inicio. Puedes usar imágenes o colores sólidos con texto.
                    </p>
                </div>

                {/* Add Banner Form */}
                <form onSubmit={handleAddBanner} style={{
                    backgroundColor: '#f9fafb',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>
                            {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
                        </h4>
                        {editingBanner && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                                Cancelar Edición
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        {/* Title & Subtitle */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Título</label>
                            <input
                                type="text"
                                placeholder="Ej. Martes de Frescura"
                                value={newBannerTitle}
                                onChange={e => setNewBannerTitle(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Subtítulo</label>
                            <input
                                type="text"
                                placeholder="Ej. Frutas y Verduras al 2x1"
                                value={newBannerSubtitle}
                                onChange={e => setNewBannerSubtitle(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />
                        </div>

                        {/* Colors */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Fondo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={newBannerColor}
                                        onChange={e => setNewBannerColor(e.target.value)}
                                        style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{newBannerColor}</span>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Texto</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={newBannerTextColor}
                                        onChange={e => setNewBannerTextColor(e.target.value)}
                                        style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{newBannerTextColor}</span>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Imagen (Opcional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={bannerFileInputRef}
                                onChange={e => setBannerImageFile(e.target.files[0])}
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.9rem' }}
                            />
                            <small style={{ color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                                {editingBanner?.imageUrl ? 'Deja vacío para mantener la imagen actual.' : 'Si subes una imagen, el color de fondo se usará mientras carga.'}
                            </small>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            disabled={isUploading}
                            style={{
                                backgroundColor: isUploading ? '#9ca3af' : (editingBanner ? '#f59e0b' : '#3b82f6'),
                                color: 'white', border: 'none',
                                padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: isUploading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            {isUploading ? 'Guardando...' : (
                                <>
                                    {editingBanner ? <Save size={18} /> : <Plus size={18} />}
                                    {editingBanner ? 'Actualizar Banner' : 'Agregar Banner'}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Banners List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {banners.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
                            No hay banners activos.
                        </div>
                    ) : (
                        banners.map((banner) => (
                            <div key={banner.id} style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: 'var(--shadow-sm)',
                                opacity: editingBanner?.id === banner.id ? 0.6 : 1,
                                pointerEvents: editingBanner?.id === banner.id ? 'none' : 'auto'
                            }}>
                                <div style={{
                                    height: '140px',
                                    backgroundColor: banner.color || '#f3f4f6',
                                    color: banner.textColor || 'white',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    padding: '1.5rem'
                                }}>
                                    {banner.imageUrl && (
                                        <img
                                            src={banner.imageUrl}
                                            alt={banner.title}
                                            style={{
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                objectFit: 'cover', opacity: banner.title ? 0.6 : 1
                                            }}
                                        />
                                    )}
                                    <div style={{ position: 'relative', zIndex: 1, textShadow: banner.imageUrl ? '0 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{banner.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{banner.subtitle}</p>
                                    </div>

                                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditBanner(banner); }}
                                            style={{
                                                backgroundColor: 'rgba(255,255,255,0.9)', color: '#3b82f6',
                                                border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                            title="Editar"
                                        >
                                            <Palette size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteBanner(banner.id, e)}
                                            style={{
                                                backgroundColor: 'rgba(255,255,255,0.9)', color: '#ef4444',
                                                border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Flyer Section */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>Folleto Digital</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Sube las imágenes de tu folleto. Se mostrarán en orden.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {/* Upload New */}
                    <div
                        onClick={() => flyerFileInputRef.current.click()}
                        style={{
                            border: '2px dashed #d1d5db',
                            borderRadius: '12px',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '250px'
                        }}
                    >
                        <input
                            type="file"
                            ref={flyerFileInputRef}
                            onChange={handleFlyerUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={isUploading}
                        />
                        <Upload size={32} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: '#4b5563', fontWeight: '600', fontSize: '0.9rem' }}>
                            {isUploading ? 'Subiendo...' : 'Agregar Página'}
                        </p>
                    </div>

                    {/* Existing Flyers */}
                    {flyers.map((flyerItem) => (
                        <div key={flyerItem.id} style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid #e5e7eb',
                            position: 'relative',
                            height: '250px',
                            backgroundColor: '#f3f4f6'
                        }}>
                            <img
                                src={flyerItem.imageUrl}
                                alt="Folleto"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                            <button
                                onClick={() => handleDeleteFlyer(flyerItem.id)}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    color: '#ef4444',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title="Eliminar página"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

