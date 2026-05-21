import React, { useState } from 'react';
import Icons from '../../components/shared/Icons';
import CustomSelect from '../../components/shared/CustomSelect';

export default function ProfileExperience({ experience = [], isOwnProfile, onAddExp, onRemoveExp }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newExp, setNewExp] = useState({ institucion: '', titulo: '', tipo: 'pregrado', fecha_inicio: '', actualidad: true });

    const handleAdd = () => {
        if (!newExp.institucion || !newExp.titulo) return;
        onAddExp(newExp);
        setIsAdding(false);
        setNewExp({ institucion: '', titulo: '', tipo: 'pregrado', fecha_inicio: '', actualidad: true });
    };

    return (
        <section>
            <h3 className="profile-section-title">
                Experiencia Académica
                {isOwnProfile && !isAdding && (
                    <button onClick={() => setIsAdding(true)} className="add-btn-professional">
                        <Icons.Plus /> Añadir
                    </button>
                )}
            </h3>

            {isAdding && (
                <div className="edit-profile-form" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <input 
                            type="text" 
                            placeholder="Institución (ej: Universidad de...)" 
                            value={newExp.institucion}
                            onChange={e => setNewExp({...newExp, institucion: e.target.value})}
                            style={{ flex: 1, minWidth: '150px' }}
                        />
                        <input 
                            type="text" 
                            placeholder="Título obtenido" 
                            value={newExp.titulo}
                            onChange={e => setNewExp({...newExp, titulo: e.target.value})}
                            style={{ flex: 1, minWidth: '150px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <CustomSelect 
                            name="tipo"
                            value={newExp.tipo}
                            onChange={e => setNewExp({...newExp, tipo: e.target.value})}
                            options={[
                                {value: "pregrado", label: "Pregrado"},
                                {value: "posgrado", label: "Posgrado"},
                                {value: "curso", label: "Curso"},
                                {value: "diplomado", label: "Diplomado"},
                                {value: "certificacion", label: "Certificación"},
                                {value: "seminario", label: "Seminario"}
                            ]}
                            className="variant-sidebar"
                            style={{ flex: 1, minWidth: '150px' }}
                        />
                        <input 
                            type="date" 
                            value={newExp.fecha_inicio}
                            onChange={e => setNewExp({...newExp, fecha_inicio: e.target.value})}
                            style={{ flex: 1, minWidth: '150px' }}
                        />
                        <label className="job-search-label" style={{ flex: 'none', margin: '0 10px' }}>
                            <input 
                                type="checkbox" 
                                checked={newExp.actualidad}
                                onChange={e => setNewExp({...newExp, actualidad: e.target.checked})}
                            />
                            Actualidad
                        </label>
                    </div>
                    <div className="inline-form-actions">
                        <button onClick={handleAdd} className="btn-save">Guardar</button>
                        <button onClick={() => setIsAdding(false)} className="btn-cancel">Cancelar</button>
                    </div>
                </div>
            )}

            <div className="experience-list" style={{ display: 'grid', gap: '15px' }}>
                {experience.map((exp, index) => (
                    <div key={index} className="exp-item">
                        <div>
                            <h4 style={{ margin: '0 0 5px 0' }}>{exp.titulo}</h4>
                            <p style={{ margin: '0', color: 'var(--text-muted, #64748b)', fontSize: '0.9rem' }}>{exp.institucion}</p>
                            <small style={{ color: 'var(--text-muted, #94a3b8)' }}>{exp.tipo} • {exp.fecha_inicio} {exp.actualidad ? '(Actualidad)' : ''}</small>
                        </div>
                        {isOwnProfile && <button onClick={() => onRemoveExp(index)} className="remove-skill-btn"><Icons.X /></button>}
                    </div>
                ))}
            </div>
        </section>
    );
}
