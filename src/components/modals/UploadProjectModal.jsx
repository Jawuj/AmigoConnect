import React from 'react';

export default function UploadProjectModal({
    editingProject, setEditingProject, setIsUploadModalOpen,
    handleProjectSubmit, handleDeleteProject, isUploading, projectCategories, statuses, users
}) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{editingProject ? 'Editar Proyecto' : 'Subir Nuevo Proyecto'}</h2>
                    <button className="close-btn" onClick={() => { setIsUploadModalOpen(false); setEditingProject(null); }}>×</button>
                </div>
                <form className="upload-form" onSubmit={handleProjectSubmit}>
                    <div className="form-group">
                        <label>Título del Proyecto/Producto</label>
                        <input type="text" name="title" defaultValue={editingProject?.title} placeholder="Ej: AmigoConnect" required maxLength="200" />
                    </div>

                    <div className="form-group">
                        <label>Slug (Identificador único)</label>
                        <input type="text" name="slug" defaultValue={editingProject?.slug} placeholder="ej-amigo-connect" required maxLength="200" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Sector Económico</label>
                            <select name="sector" defaultValue={editingProject?.sector || ""} required>
                                <option value="">Selecciona un sector</option>
                                <option value="Tecnología">Tecnología / Software</option>
                                <option value="Salud">Salud / Bienestar</option>
                                <option value="Educación">Educación / EdTech</option>
                                <option value="Finanzas">Finanzas / FinTech</option>
                                <option value="Social">Impacto Social</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nivel de Madurez (TRL)</label>
                            <select name="maturityLevel" defaultValue={editingProject?.maturityLevel || "Prototipo"} required>
                                <option value="Prototipo">Prototipo Inicial</option>
                                <option value="Beta">Versión Beta / MVP</option>
                                <option value="Estable">Versión Estable</option>
                                <option value="Producción">En Producción / Mercado</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Descripción Corta</label>
                        <textarea name="shortDescription" rows="2" defaultValue={editingProject?.shortDescription || editingProject?.problemSolved} placeholder="Resumen rápido del proyecto (Max 500 chars)" required maxLength="500"></textarea>
                    </div>

                    <div className="form-group">
                        <label>Descripción Completa</label>
                        <textarea name="fullDescription" rows="5" defaultValue={editingProject?.fullDescription} placeholder="Descripción detallada de todo el producto..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Problema que Resuelve</label>
                        <textarea name="problemSolved" rows="3" defaultValue={editingProject?.problemSolved} placeholder="Describe el impacto y el problema que soluciona tu producto..." required></textarea>
                    </div>

                    <div className="form-group">
                        <label>Potencial de Impacto Institucional/Social</label>
                        <textarea name="impactPotential" rows="2" defaultValue={editingProject?.impactPotential} placeholder="¿Cómo cambia esto el entorno o la comunidad?" required></textarea>
                    </div>

                    <div className="form-group">
                        <label>Facultad / Programa</label>
                        <select name="mainFilter" defaultValue={editingProject?.mainFilter || "Tecnología"} required>
                            <option value="Tecnología">Tecnología</option>
                            <option value="Ingeniería">Ingeniería</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Categoría</label>
                            <select name="category" defaultValue={editingProject?.category} required>
                                <option value="web">Web</option>
                                <option value="mobile">Mobile</option>
                                <option value="escritorio">Escritorio</option>
                                <option value="ia">IA</option>
                                <option value="iot">IoT</option>
                                <option value="cloud">Cloud</option>
                                <option value="blockchain">Blockchain</option>
                                <option value="videojuegos">Videojuegos</option>
                                <option value="otros">Otros</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estado de Desarrollo</label>
                            <select name="status" defaultValue={editingProject?.status || editingProject?.maturityLevel} required>
                                <option value="idea">Idea</option>
                                <option value="en_desarrollo">En Desarrollo</option>
                                <option value="mvp">MVP</option>
                                <option value="terminado">Terminado</option>
                                <option value="en_produccion">En Producción</option>
                                <option value="abandonado">Abandonado</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Público Objetivo</label>
                            <input type="text" name="targetAudience" defaultValue={editingProject?.targetAudience} placeholder="Ej: Niños, Empresas..." required maxLength="200" />
                        </div>
                        <div className="form-group">
                            <label>Licencia</label>
                            <select name="license" defaultValue={editingProject?.license || "Pendiente"}>
                                <option value="Pendiente">Pendiente</option>
                                <option value="apache">Apache</option>
                                <option value="gpl">GPL</option>
                                <option value="proprietary">Propietaria</option>
                                <option value="creative_commons">Creative Commons</option>
                                <option value="otra">Otra</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Arquitectura Técnica</label>
                        <textarea name="techArchitecture" rows="2" defaultValue={editingProject?.techArchitecture} placeholder="Ej: MVC, Microservicios, Serverless..." required></textarea>
                    </div>

                    <div className="form-group">
                        <label>Equipo Desarrollador (Opcional)</label>
                        <input type="text" name="team" defaultValue={editingProject?.team} placeholder="Nombres de los integrantes separados por comas" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Demo URL (Opcional)</label>
                            <input type="url" name="demoUrl" defaultValue={editingProject?.demoUrl} placeholder="https://..." maxLength="500" />
                        </div>
                        <div className="form-group">
                            <label>URL Código Fuente (Opcional)</label>
                            <input type="url" name="sourceCodeUrl" defaultValue={editingProject?.sourceCodeUrl} placeholder="https://github.com/..." maxLength="500" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>URL Documentación (Opcional)</label>
                        <input type="url" name="docsUrl" defaultValue={editingProject?.docsUrl} placeholder="https://..." maxLength="500" />
                    </div>

                    <div className="form-group">
                        <label>Stack Tecnológico (separado por comas)</label>
                        <input type="text" name="techStack" defaultValue={editingProject?.techStack?.join(', ')} placeholder="React, Node.js, Firebase..." />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Video Explicativo URL (Opcional)</label>
                            <input type="url" name="videoUrl" defaultValue={editingProject?.videoUrl} placeholder="https://youtube.com/..." maxLength="500" />
                        </div>
                        <div className="form-group">
                            <label>Precio Estimado (Opcional)</label>
                            <input type="number" step="0.01" name="estimatedPrice" defaultValue={editingProject?.estimatedPrice} placeholder="Ej: 19.99" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Modelo de Negocio (Opcional)</label>
                        <textarea name="businessModel" rows="2" defaultValue={editingProject?.businessModel} placeholder="SaaS, B2B, B2C, Freemium..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Imagen de Portada {editingProject ? '(Opcional si no cambias)' : '(Requerida)'}</label>
                        <input type="file" name="image" accept="image/*" required={!editingProject} />
                    </div>

                    <div className="form-group">
                        <label>Docente Tutor / Supervisor (Asignado)</label>
                        <select name="tutorId" defaultValue={editingProject?.tutorId || ""}>
                            <option value="">Selecciona un tutor para validación</option>
                            {Object.values(users).filter(u => u.role === 'teacher').map(t => (
                                <option key={t.uid} value={t.uid}>{t.name} - {t.program}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isUploading}>
                        {isUploading ? 'Procesando...' : (editingProject ? 'Actualizar y Enviar a Revisión' : 'Publicar y Enviar a Revisión')}
                    </button>

                    {editingProject && (
                        <button
                            type="button"
                            className="submit-btn"
                            style={{ marginTop: '8px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', opacity: isUploading ? 0.5 : 1 }}
                            disabled={isUploading}
                            onClick={() => handleDeleteProject(editingProject)}
                        >
                            🗑️ Eliminar Proyecto Permanentemente
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
