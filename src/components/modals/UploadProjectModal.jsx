import React from 'react';

export default function UploadProjectModal({
    editingProject, setEditingProject, setIsUploadModalOpen,
    handleProjectSubmit, isUploading, projectCategories, statuses, users
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
                        <input type="text" name="title" defaultValue={editingProject?.title} placeholder="Ej: AmigoConnect" required />
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
                        <label>Descripción del Proyecto (Resumen Ejecutivo)</label>
                        <textarea name="problemSolved" rows="3" defaultValue={editingProject?.problemSolved} placeholder="Describe el impacto y valor de tu producto..." required></textarea>
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
                                {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estado del Proyecto</label>
                            <select name="status" defaultValue={editingProject?.status} required>
                                {statuses.filter(s => s !== 'Todos').map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Público Objetivo</label>
                            <input type="text" name="targetAudience" defaultValue={editingProject?.targetAudience} placeholder="Ej: Niños, Empresas..." required />
                        </div>
                        <div className="form-group">
                            <label>Licencia</label>
                            <select name="license" defaultValue={editingProject?.license || "MIT"}>
                                <option value="MIT">MIT</option>
                                <option value="GPL">GPL</option>
                                <option value="Apache">Apache</option>
                                <option value="Propietaria">Propietaria</option>
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
                            <label>Semestre</label>
                            <input type="number" name="semester" min="1" max="10" defaultValue={editingProject?.semester} placeholder="1-10" required />
                        </div>
                        <div className="form-group">
                            <label>Demo URL (Opcional)</label>
                            <input type="url" name="demoUrl" defaultValue={editingProject?.demoUrl} placeholder="https://..." />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Stack Tecnológico (separado por comas)</label>
                        <input type="text" name="techStack" defaultValue={editingProject?.techStack?.join(', ')} placeholder="React, Node.js, Firebase" required />
                    </div>

                    <div className="form-group">
                        <label>Captura del Proyecto {editingProject ? '(Opcional si no cambias)' : '(Imagen)'}</label>
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
                </form>
            </div>
        </div>
    );
}
