import React, { useState } from 'react';
import Icons from '../../components/shared/Icons';
import CustomSelect from '../../components/shared/CustomSelect';

export default function ProfileSkills({ technicalSkills = [], isOwnProfile, onAddSkill, onRemoveSkill }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newSkill, setNewSkill] = useState({ nombre: '', categoria: 'frontend', nivel: 'basico' });

    const handleAdd = () => {
        if (!newSkill.nombre) return;
        onAddSkill(newSkill);
        setIsAdding(false);
        setNewSkill({ nombre: '', categoria: 'frontend', nivel: 'basico' });
    };

    return (
        <section>
            <h3 className="profile-section-title">
                Competencias Técnicas
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
                            placeholder="Nombre (ej: React)" 
                            value={newSkill.nombre}
                            onChange={e => setNewSkill({...newSkill, nombre: e.target.value})}
                            style={{ flex: 1, minWidth: '150px' }}
                        />
                        <CustomSelect 
                            name="categoria"
                            value={newSkill.categoria}
                            onChange={e => setNewSkill({...newSkill, categoria: e.target.value})}
                            options={[
                                {value: "frontend", label: "Frontend"},
                                {value: "backend", label: "Backend"},
                                {value: "database", label: "Database"},
                                {value: "mobile", label: "Mobile"},
                                {value: "devops", label: "DevOps"},
                                {value: "cloud", label: "Cloud"},
                                {value: "ai", label: "AI"},
                                {value: "iot", label: "IoT"},
                                {value: "ciberseguridad", label: "Ciberseguridad"},
                                {value: "otros", label: "Otros"}
                            ]}
                            className="variant-sidebar"
                            style={{ flex: 1, minWidth: '150px' }}
                        />
                        <CustomSelect 
                            name="nivel"
                            value={newSkill.nivel}
                            onChange={e => setNewSkill({...newSkill, nivel: e.target.value})}
                            options={[
                                {value: "basico", label: "Básico"},
                                {value: "intermedio", label: "Intermedio"},
                                {value: "avanzado", label: "Avanzado"},
                                {value: "experto", label: "Experto"}
                            ]}
                            className="variant-sidebar"
                            style={{ flex: 1, minWidth: '150px' }}
                        />
                    </div>
                    <div className="inline-form-actions">
                        <button onClick={handleAdd} className="btn-save">Guardar</button>
                        <button onClick={() => setIsAdding(false)} className="btn-cancel">Cancelar</button>
                    </div>
                </div>
            )}

            <div className="skills-detailed-grid" style={{ display: 'grid', gap: '10px' }}>
                {technicalSkills.map((skill, index) => (
                    <div key={index} className="skill-item-detailed">
                        <div>
                            <strong style={{ color: 'var(--text-main, #1e293b)' }}>{skill.nombre}</strong>
                            <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase' }}>{skill.categoria}</span>
                            <span className={`level-badge ${skill.nivel}`} style={{ marginLeft: '8px', fontSize: '0.7rem' }}>{skill.nivel}</span>
                        </div>
                        {isOwnProfile && <button onClick={() => onRemoveSkill(index)} className="remove-skill-btn"><Icons.X /></button>}
                    </div>
                ))}
            </div>
        </section>
    );
}
