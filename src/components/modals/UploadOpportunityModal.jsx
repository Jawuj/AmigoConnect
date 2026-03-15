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
                        <label>URL de la Vacante (Opcional)</label>
                        <input type="url" name="urlVacante" placeholder="https://mi-empresa.com/vacante-xyz" />
                    </div>
                    <div className="form-group">
                        <label>Descripción de la Vacante</label>
                        <textarea name="description" rows="4" placeholder="Describe las responsabilidades..." required></textarea>
                    </div>
                    <div className="form-group">
                        <label>Requisitos Académicos (Opcional)</label>
                        <textarea name="academicReq" rows="2" placeholder="Ej: Estudiante de últimos semestres, recién egresado..."></textarea>
                    </div>
                    <div className="form-group">
                        <label>Requisitos Técnicos (separados por coma)</label>
                        <input type="text" name="techReq" placeholder="Ej: React, Node.js, SQL" />
                    </div>
                    <div className="form-group">
                        <label>Beneficios (Opcional)</label>
                        <textarea name="benefits" rows="2" placeholder="Ej: Medicina prepagada, gimnasio, equipo..."></textarea>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Modalidad</label>
                            <select name="modality" required>
                                <option value="remoto">Remoto</option>
                                <option value="presencial">Presencial</option>
                                <option value="hibrido">Híbrido</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tipo</label>
                            <select name="type" required>
                                <option value="practica">Práctica</option>
                                <option value="empleo">Empleo</option>
                                <option value="proyecto">Proyecto</option>
                                <option value="pasantia">Pasantía</option>
                                <option value="voluntariado">Voluntariado</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Salario Mínimo</label>
                            <input type="number" step="0.01" name="salaryMin" placeholder="Ej: 2000000" />
                        </div>
                        <div className="form-group">
                            <label>Salario Máximo</label>
                            <input type="number" step="0.01" name="salaryMax" placeholder="Ej: 3500000" />
                        </div>
                        <div className="form-group">
                            <label>Moneda</label>
                            <select name="currency" defaultValue="COP">
                                <option value="COP">COP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Ubicación</label>
                            <input type="text" name="location" placeholder="Ciudad o Remoto" required />
                        </div>
                        <div className="form-group">
                            <label>Fecha de Cierre (Opcional)</label>
                            <input type="date" name="deadline" />
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
