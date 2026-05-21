import React, { useState, useEffect } from 'react';
import CustomSelect from '../shared/CustomSelect';
import Icons from '../shared/Icons';

export default function UploadProjectModal({
    editingProject, setEditingProject, setIsUploadModalOpen,
    handleProjectSubmit, handleDeleteProject, isUploading, projectCategories, statuses, users,
    customConfirm, setActiveView
}) {
    const [imagePreview, setImagePreview] = useState(editingProject?.imageUrl || null);

    const handleAttemptClose = async () => {
        const confirmed = await customConfirm(
            '¿Estás seguro de que deseas salir? Los cambios no guardados se perderán.',
            'Sí, salir',
            'Continuar editando'
        );
        if (confirmed) {
            setIsUploadModalOpen(false);
            setEditingProject(null);
        }
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleAttemptClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleOverlayClick = (e) => {
        if (e.target.className === 'modal-overlay') {
            handleAttemptClose();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTermsClick = () => {
        setIsUploadModalOpen(false);
        window.location.hash = 'proyectos';
        setActiveView('terms');
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content premium-modal">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <Icons.Rocket />
                        <h2>{editingProject ? 'Editar Proyecto' : 'Subir Nuevo Proyecto'}</h2>
                    </div>
                    <button className="close-btn" type="button" onClick={handleAttemptClose} title="Cerrar">
                        <Icons.X />
                    </button>
                </div>
                
                <form className="upload-form" onSubmit={handleProjectSubmit}>
                    <section className="modal-section">
                        <h3 className="section-title-modal">Información Básica</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Título del Proyecto / Producto</label>
                                <input type="text" name="title" defaultValue={editingProject?.title} placeholder="Ej: AmigoConnect" required maxLength="200" />
                            </div>
                            <div className="form-group">
                                <label>Slug (ID único)</label>
                                <input type="text" name="slug" defaultValue={editingProject?.slug} placeholder="ej-amigo-connect" required maxLength="200" />
                            </div>
                            <div className="form-group">
                                <label>Sector Económico</label>
                                <CustomSelect name="sector" value={editingProject?.sector || ""} required
                                    options={[
                                        {value: "", label: "Selecciona un sector"},
                                        {value: "Tecnología", label: "Tecnología / Software"},
                                        {value: "Salud", label: "Salud / Bienestar"},
                                        {value: "Educación", label: "Educación / EdTech"},
                                        {value: "Finanzas", label: "Finanzas / FinTech"},
                                        {value: "Social", label: "Impacto Social"}
                                    ]}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="modal-section">
                        <h3 className="section-title-modal">Presentación y Detalle</h3>
                        <div className="form-group">
                            <label>Propuesta de Valor / Problema que Resuelve</label>
                            <input type="text" name="problemSolved" defaultValue={editingProject?.problemSolved} placeholder="¿Qué problema específico solucionas?" required maxLength="500" />
                        </div>
                        <div className="form-group">
                            <label>Resumen Corto (Sobre el proyecto - Aparece en la tarjeta)</label>
                            <input type="text" name="description" defaultValue={editingProject?.description} placeholder="Breve resumen de tu proyecto..." required maxLength="200" />
                        </div>
                        <div className="form-group">
                            <label>Público Objetivo</label>
                            <input type="text" name="targetAudience" defaultValue={editingProject?.targetAudience} placeholder="¿Para quién es este proyecto?" maxLength="200" />
                        </div>
                        <div className="form-group">
                            <label>¿Qué impacto potencial tiene?</label>
                            <textarea name="impactPotential" defaultValue={editingProject?.impactPotential} placeholder="Impacto social, económico o ambiental..." rows="2"></textarea>
                        </div>
                        <div className="form-group">
                            <label>Descripción Completa y Funcionalidad</label>
                            <textarea name="fullDescription" defaultValue={editingProject?.fullDescription} placeholder="Detalles profundos sobre cómo funciona..." rows="4"></textarea>
                        </div>
                    </section>

                    <section className="modal-section">
                        <h3 className="section-title-modal">Especificaciones Técnicas</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Tecnologías Utilizadas (Separadas por coma)</label>
                                <input type="text" name="techStack" defaultValue={Array.isArray(editingProject?.techStack) ? editingProject.techStack.join(', ') : editingProject?.techStack} placeholder="Ej: React, Node.js, Firebase" />
                            </div>
                            <div className="form-group full-width">
                                <label>Arquitectura Técnica (Opcional)</label>
                                <textarea name="techArchitecture" defaultValue={editingProject?.techArchitecture} placeholder="Descripción de la arquitectura, servidores, DB..." rows="2"></textarea>
                            </div>
                            <div className="form-group">
                                <label>Equipo Desarrollador</label>
                                <input type="text" name="team" defaultValue={editingProject?.team} placeholder="Nombres de los integrantes..." />
                            </div>
                            <div className="form-group">
                                <label>Licencia</label>
                                <input type="text" name="license" defaultValue={editingProject?.license} placeholder="Ej: MIT, Apache 2.0, Privada" />
                            </div>
                        </div>
                    </section>

                    <section className="modal-section">
                        <h3 className="section-title-modal">Modelo de Negocio (Opcional)</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tipo de Modelo</label>
                                <input type="text" name="businessModel" defaultValue={editingProject?.businessModel} placeholder="Ej: SaaS, Freemium, Venta Directa" />
                            </div>
                            <div className="form-group">
                                <label>Precio Estimado / Valoración</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input type="number" name="estimatedPrice" defaultValue={editingProject?.estimatedPrice} placeholder="Valor" style={{ flex: 1 }} />
                                    <select name="currency" defaultValue={editingProject?.currency || "COP"} style={{ width: '80px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <option value="COP">COP</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="modal-section">
                        <h3 className="section-title-modal">CLASIFICACIÓN Y ESTADO</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nivel de Madurez (TRL)</label>
                                <CustomSelect name="maturityLevel" value={editingProject?.maturityLevel || "Concepto"} 
                                    options={[
                                        {value: "Concepto", label: "Idea / Concepto"},
                                        {value: "Investigación", label: "Investigación"},
                                        {value: "Prototipo", label: "Prototipo Inicial"},
                                        {value: "Validado", label: "Validado en Entorno"},
                                        {value: "Mercado", label: "Listo para Mercado"}
                                    ]}
                                />
                            </div>
                            <div className="form-group">
                                <label>Estado de Desarrollo</label>
                                <CustomSelect name="status" value={editingProject?.status || "active"} 
                                    options={[
                                        {value: "active", label: "En Desarrollo"},
                                        {value: "completed", label: "Completado"},
                                        {value: "paused", label: "Pausado"}
                                    ]}
                                />
                            </div>
                            <div className="form-group">
                                <label>Facultad / Programa</label>
                                <CustomSelect name="program" value={editingProject?.program || "Tecnología"} 
                                    options={[
                                        {value: "Tecnología", label: "Facultad de Tecnología"},
                                        {value: "Ingeniería", label: "Ingeniería de Sistemas"},
                                        {value: "Diseño", label: "Diseño Gráfico"},
                                        {value: "Administración", label: "Administración de Empresas"}
                                    ]}
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoría</label>
                                <CustomSelect name="category" value={editingProject?.category || "Web"} 
                                    options={[
                                        {value: "Web", label: "Desarrollo Web"},
                                        {value: "Mobile", label: "App Móvil"},
                                        {value: "IoT", label: "Hardware / IoT"},
                                        {value: "AI", label: "Inteligencia Artificial"},
                                        {value: "Other", label: "Otro"}
                                    ]}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="modal-section">
                        <h3 className="section-title-modal">MULTIMEDIA Y LINKS</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>URL del Repositorio (GitHub/GitLab)</label>
                                <input type="url" name="sourceCodeUrl" defaultValue={editingProject?.sourceCodeUrl} placeholder="https://github.com/..." />
                            </div>
                            <div className="form-group">
                                <label>URL de Demo / Deploy</label>
                                <input type="url" name="demoUrl" defaultValue={editingProject?.demoUrl} placeholder="https://mi-proyecto.com" />
                            </div>
                            <div className="form-group">
                                <label>Link de Documentación (PDF/Drive)</label>
                                <input type="url" name="docsUrl" defaultValue={editingProject?.docsUrl} placeholder="https://docs.google.com/..." />
                            </div>
                            <div className="form-group">
                                <label>Video Explicativo (YouTube/Vimeo)</label>
                                <input type="url" name="videoUrl" defaultValue={editingProject?.videoUrl} placeholder="https://youtube.com/watch?v=..." />
                            </div>
                            <div className="form-group full-width">
                                <label>Imagen de Portada</label>
                                <label className="image-upload-area">
                                    <div className="image-upload-wrapper">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="image-preview" />
                                        ) : (
                                            <div className="image-placeholder">
                                                <Icons.Upload />
                                                <span>Subir imagen de portada</span>
                                            </div>
                                        )}
                                        <input type="file" name="image" accept="image/*" required={!editingProject} onChange={handleImageChange} style={{display: 'none'}} />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>

                    <div className="form-group full-width terms-acceptance" style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: 'var(--bg-light, rgba(255,255,255,0.03))', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <input type="checkbox" id="terms" required style={{ width: '20px', height: '20px', margin: 0, cursor: 'pointer' }} />
                        <label htmlFor="terms" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.9 }}>
                            He leído y acepto los <button type="button" onClick={handleTermsClick} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: '700' }}>Términos y Condiciones</button> para la publicación de proyectos.
                        </label>
                    </div>

                    <div className="form-actions-premium">
                        <button type="submit" className="submit-btn premium" disabled={isUploading}>
                            {isUploading ? (
                                <span className="loader-small"></span>
                            ) : (
                                <><Icons.Check />{editingProject ? 'Guardar Cambios' : 'Publicar Proyecto'}</>
                            )}
                        </button>

                        {editingProject && (
                            <button
                                type="button"
                                className="delete-btn-modal"
                                disabled={isUploading}
                                onClick={() => handleDeleteProject(editingProject.id)}
                            >
                                <Icons.Trash />Eliminar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
