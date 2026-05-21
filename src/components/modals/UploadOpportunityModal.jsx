import React, { useState } from 'react';
import CustomSelect from '../shared/CustomSelect';

export default function UploadOpportunityModal({
    setIsOppModalOpen, handleOppSubmit, oppModalType = 'job', editingOpportunity
}) {
    const sectorOptions = ["Salud", "Bancos", "Tecnología", "Educación", "Energía", "Manufactura", "Comercio"];
    const initialSectors = editingOpportunity?.sector 
        ? editingOpportunity.sector.split(',').map(s => s.trim()) 
        : [];
    const knownSectors = initialSectors.filter(s => sectorOptions.includes(s));
    const unknownSectors = initialSectors.filter(s => !sectorOptions.includes(s));

    const [selectedSectors, setSelectedSectors] = useState(knownSectors);
    const [showOtherSector, setShowOtherSector] = useState(unknownSectors.length > 0);
    const [otherSectorValue, setOtherSectorValue] = useState(unknownSectors.join(', '));
    const [modality, setModality] = useState(editingOpportunity?.modality || "");
    const [currency, setCurrency] = useState(editingOpportunity?.currency || "COP");

    const toggleSector = (sector) => {
        if (selectedSectors.includes(sector)) {
            setSelectedSectors(selectedSectors.filter(s => s !== sector));
        } else {
            setSelectedSectors([...selectedSectors, sector]);
        }
    };

    const onFormSubmit = (e) => {
        e.preventDefault();
        // Construct the final sector string/array if it's a project
        if (oppModalType === 'project') {
            const finalSectors = [...selectedSectors];
            if (showOtherSector && otherSectorValue) {
                finalSectors.push(otherSectorValue);
            }
            // Inject sector into the form data manually or via a hidden input
            const sectorInput = document.createElement('input');
            sectorInput.type = 'hidden';
            sectorInput.name = 'sector';
            sectorInput.value = finalSectors.join(', ');
            e.target.appendChild(sectorInput);
        }
        handleOppSubmit(e);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{editingOpportunity ? 'Editar Vacante' : (oppModalType === 'project' ? 'Publicar Vacante de Proyecto' : 'Publicar Nueva Oportunidad de Trabajo')}</h2>
                    <button className="close-btn" onClick={() => setIsOppModalOpen(false)}>×</button>
                </div>
                <form className="upload-form" onSubmit={onFormSubmit}>
                    <input type="hidden" name="type" value={oppModalType === 'project' ? 'proyecto' : 'empleo'} />
                    
                    <div className="form-group">
                        <label>{oppModalType === 'project' ? 'Título del Proyecto / Vacante' : 'Cargo / Título'}</label>
                        <input type="text" name="title" placeholder={oppModalType === 'project' ? "Ej: Consultoría en Ciberseguridad" : "Ej: Desarrollador Backend Junior"} defaultValue={editingOpportunity?.title} required />
                    </div>

                    {oppModalType !== 'project' && (
                        <div className="form-group">
                            <label>URL de la Vacante (Opcional)</label>
                            <input type="url" name="urlVacante" placeholder="https://mi-empresa.com/vacante-xyz" defaultValue={editingOpportunity?.urlVacante} />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Descripción {oppModalType === 'project' ? 'del Proyecto y lo que se busca' : 'de la Vacante'}</label>
                        <textarea name="description" rows="4" placeholder={oppModalType === 'project' ? "Detalla el proyecto y los entregables..." : "Describe las responsabilidades..."} defaultValue={editingOpportunity?.description} required></textarea>
                    </div>

                    {oppModalType === 'project' ? (
                        <>
                            <div className="form-group">
                                <label>Sector(es) Relacionado(s)</label>
                                <div className="sector-checkboxes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                    {sectorOptions.map(sector => (
                                        <label key={sector} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSectors.includes(sector)}
                                                onChange={() => toggleSector(sector)}
                                            />
                                            {sector}
                                        </label>
                                    ))}
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={showOtherSector}
                                            onChange={() => setShowOtherSector(!showOtherSector)}
                                        />
                                        Otro
                                    </label>
                                </div>
                                {showOtherSector && (
                                    <input 
                                        type="text" 
                                        placeholder="Escribe tu propio sector" 
                                        value={otherSectorValue}
                                        onChange={(e) => setOtherSectorValue(e.target.value)}
                                        style={{ marginTop: '5px' }}
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label>Contacto del Responsable</label>
                                <input type="text" name="contact" placeholder="Ej: Juan Pérez - juan@empresa.com" defaultValue={editingOpportunity?.contact} required />
                            </div>

                            <div className="form-group">
                                <label>Presupuesto Estimado</label>
                                <input type="text" name="budget" placeholder="Ej: $5.000.000 - $8.000.000 o Presupuesto Abierto" defaultValue={editingOpportunity?.budget} required />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Requisitos Académicos (Opcional)</label>
                                <textarea name="academicReq" rows="2" placeholder="Ej: Estudiante de últimos semestres, recién egresado..." defaultValue={editingOpportunity?.academicReq}></textarea>
                            </div>
                            <div className="form-group">
                                <label>Requisitos Técnicos (separados por coma)</label>
                                <input type="text" name="techReq" placeholder="Ej: React, Node.js, SQL" defaultValue={editingOpportunity?.techReq ? editingOpportunity.techReq.join(', ') : ''} />
                            </div>
                            <div className="form-group">
                                <label>Beneficios (Opcional)</label>
                                <textarea name="benefits" rows="2" placeholder="Ej: Medicina prepagada, gimnasio, equipo..." defaultValue={editingOpportunity?.benefits}></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Modalidad</label>
                                    <CustomSelect name="modality" value={modality} onChange={(e) => setModality(e.target.value)} required
                                        options={[
                                            {value: "", label: "Seleccionar..."},
                                            {value: "remoto", label: "Remoto"},
                                            {value: "presencial", label: "Presencial"},
                                            {value: "hibrido", label: "Híbrido"}
                                        ]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ubicación</label>
                                    <input type="text" name="location" placeholder="Ciudad o Remoto" defaultValue={editingOpportunity?.location} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Salario Mínimo (Opcional)</label>
                                    <input type="number" step="0.01" name="salaryMin" placeholder="Ej: 2000000" defaultValue={editingOpportunity?.salaryMin} />
                                </div>
                                <div className="form-group">
                                    <label>Salario Máximo (Opcional)</label>
                                    <input type="number" step="0.01" name="salaryMax" placeholder="Ej: 3500000" defaultValue={editingOpportunity?.salaryMax} />
                                </div>
                                <div className="form-group">
                                    <label>Moneda</label>
                                    <CustomSelect name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}
                                        options={[
                                            {value: "COP", label: "COP"},
                                            {value: "USD", label: "USD"},
                                            {value: "EUR", label: "EUR"}
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha de Cierre (Opcional)</label>
                                    <input type="date" name="deadline" defaultValue={editingOpportunity?.deadline} />
                                </div>
                                <div className="form-group">
                                    <label>Contacto para Aplicar</label>
                                    <input type="text" name="contact" placeholder="Ej: reclutamiento@claro.com" defaultValue={editingOpportunity?.contact} required />
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
                        {editingOpportunity ? 'Guardar Cambios' : (oppModalType === 'project' ? 'Publicar Proyecto' : 'Publicar Vacante')}
                    </button>
                </form>
            </div>
        </div>
    );
}
