import React from 'react';

export default function UploadOpportunityModal({
    setIsOppModalOpen, handleOppSubmit
}) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Publicar Nueva Oportunidad</h2>
                    <button className="close-btn" onClick={() => setIsOppModalOpen(false)}>×</button>
                </div>
                <form className="upload-form" onSubmit={handleOppSubmit}>
                    <div className="form-group">
                        <label>Cargo / Título</label>
                        <input type="text" name="title" placeholder="Ej: Desarrollador Backend Junior" required />
                    </div>
                    <div className="form-group">
                        <label>Descripción de la Vacante</label>
                        <textarea name="description" rows="4" placeholder="Describe los requisitos y responsabilidades..." required></textarea>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Modalidad</label>
                            <select name="modality" required>
                                <option value="Remoto">Remoto</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tipo</label>
                            <select name="type" required>
                                <option value="Tiempo Completo">Tiempo Completo</option>
                                <option value="Práctica / Pasantía">Práctica / Pasantía</option>
                                <option value="Medio Tiempo">Medio Tiempo</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Salario Sugerido</label>
                            <input type="text" name="salary" placeholder="Ej: 2.5M - 3.5M" required />
                        </div>
                        <div className="form-group">
                            <label>Ubicación</label>
                            <input type="text" name="location" placeholder="Ciudad o Remoto" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contacto para Aplicar (Email o Link)</label>
                        <input type="text" name="contact" placeholder="Ej: reclutamiento@claro.com" required />
                    </div>
                    <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>Publicar Vacante</button>
                </form>
            </div>
        </div>
    );
}
