import React from 'react';
import Icons from '../../components/shared/Icons';
import CustomSelect from '../../components/shared/CustomSelect';

export default function ProfileHeader({ 
    displayProfile, isOwnProfile, isEditingProfile, setIsEditingProfile, 
    handleUpdateProfile, user, userRole 
}) {
    return (
        <div className="profile-header-card">
            <div className="profile-info-main">
                <div className="profile-avatar-large">
                    {displayProfile?.avatarUrl ? (
                        <img src={displayProfile.avatarUrl} alt="Yo" />
                    ) : (
                        <div className="author-avatar" style={{ width: '100%', height: '100%', fontSize: '3rem' }}>
                            {(displayProfile?.firstName || (!isOwnProfile ? 'U' : user?.displayName))?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>
                <div className="profile-details-text">
                    {(isOwnProfile && isEditingProfile) ? (
                        <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                            {displayProfile?.role === 'company' ? (
                                <>
                                    <div className="form-row">
                                        <input type="text" name="firstName" defaultValue={displayProfile?.firstName} placeholder="Nombre de la Empresa" required style={{ flex: 1 }} />
                                        <input type="email" name="contactMail" defaultValue={displayProfile?.contactMail || displayProfile?.mail || ""} placeholder="Correo de Contacto" required style={{ flex: 1 }} />
                                        <input type="hidden" name="lastName" value="" />
                                        <input type="hidden" name="program" value="" />
                                        <input type="hidden" name="semester" value="" />
                                        <input type="hidden" name="academicAverage" value="" />
                                        <input type="hidden" name="github" value="" />
                                        <input type="hidden" name="availableForInternship" value="false" />
                                        <input type="hidden" name="availableForJob" value="false" />
                                    </div>
                                    <div className="form-row" style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            Sector de la Empresa
                                            <CustomSelect 
                                                name="sector"
                                                value={displayProfile?.sector || "Tecnología"}
                                                options={[
                                                    { value: "Tecnología", label: "Tecnología" },
                                                    { value: "Salud", label: "Salud" },
                                                    { value: "Educación", label: "Educación" },
                                                    { value: "Bancos", label: "Bancos y Finanzas" },
                                                    { value: "Energía", label: "Energía" },
                                                    { value: "Manufactura", label: "Manufactura" },
                                                    { value: "Comercio", label: "Comercio" },
                                                    { value: "Otro", label: "Otro" }
                                                ]}
                                            />
                                        </label>
                                    </div>
                                </>
                            ) : displayProfile?.role === 'admin' ? (
                                <>
                                    <div className="form-group-inline">
                                        <input type="text" name="firstName" defaultValue={displayProfile?.firstName} placeholder="Nombres" required />
                                        <input type="text" name="lastName" defaultValue={displayProfile?.lastName} placeholder="Apellidos" required />
                                        <input type="hidden" name="program" value="" />
                                        <input type="hidden" name="semester" value="" />
                                        <input type="hidden" name="academicAverage" value="" />
                                        <input type="hidden" name="github" value="" />
                                        <input type="hidden" name="availableForInternship" value="false" />
                                        <input type="hidden" name="availableForJob" value="false" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group-inline">
                                        <input type="text" name="firstName" defaultValue={displayProfile?.firstName} placeholder="Nombres" required />
                                        <input type="text" name="lastName" defaultValue={displayProfile?.lastName} placeholder="Apellidos" required />
                                        <input type="number" step="0.1" name="academicAverage" defaultValue={displayProfile?.academicAverage} placeholder="Promedio" />
                                    </div>
                                    <div className="form-row">
                                        <input type="text" name="program" defaultValue={displayProfile?.program} placeholder="Carrera" required />
                                        <input type="number" name="semester" defaultValue={displayProfile?.semester} placeholder="Semestre" required />
                                    </div>
                                </>
                            )}
                            <textarea name="biography" rows="3" defaultValue={displayProfile?.biography} placeholder="Biografía breve"></textarea>
                            <div className="form-row">
                                <input type="tel" name="phone" defaultValue={displayProfile?.phone} placeholder="Teléfono" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }} />
                                <input type="url" name="linkedin" defaultValue={displayProfile?.linkedin} placeholder="LinkedIn URL" />
                            </div>
                            <div className="form-row">
                                <input type="text" name="city" defaultValue={displayProfile?.city} placeholder="Ciudad (Ej: Medellín)" />
                                <input type="text" name="country" defaultValue={displayProfile?.country} placeholder="País" />
                            </div>
                            {displayProfile?.role !== 'company' && displayProfile?.role !== 'admin' && (
                                <div className="form-row" style={{ marginBottom: '15px' }}>
                                    <label className="job-search-label">
                                        <input type="checkbox" name="availableForInternship" value="true" defaultChecked={displayProfile?.availableForInternship} />
                                        Busco prácticas profesionales
                                    </label>
                                    <label className="job-search-label">
                                        <input type="checkbox" name="availableForJob" value="true" defaultChecked={displayProfile?.availableForJob} />
                                        Busco empleo a tiempo completo
                                    </label>
                                </div>
                            )}
                            <div className="form-row">
                                {displayProfile?.role !== 'company' && displayProfile?.role !== 'admin' && (
                                    <input type="url" name="github" defaultValue={displayProfile?.github} placeholder="GitHub URL" />
                                )}
                                <input type="url" name="portfolioWeb" defaultValue={displayProfile?.portfolioWeb} placeholder="Portafolio Web URL" />
                            </div>
                            <div className="form-actions-inline">
                                <button type="submit" className="primary-action-btn"><Icons.Check /> Guardar Perfil Profesional</button>
                                <button type="button" className="secondary-action-btn" onClick={() => setIsEditingProfile(false)}>Cancelar</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h1>
                                {displayProfile?.role === 'company'
                                    ? (displayProfile?.firstName || 'Empresa')
                                    : (displayProfile?.firstName
                                        ? `${displayProfile.firstName} ${displayProfile.lastName || ''}`
                                        : (!isOwnProfile ? '' : user?.displayName))}
                            </h1>
                            <div className="profile-subtext">
                                {displayProfile?.role === 'company' ? (
                                    <>
                                        <span><Icons.Briefcase /> Sector: {displayProfile?.sector || 'No especificado'}</span>
                                        <span><Icons.Mail /> {displayProfile?.contactMail || displayProfile?.mail || displayProfile?.email}</span>
                                        {displayProfile?.phone && <span><Icons.Phone /> {displayProfile?.phone}</span>}
                                    </>
                                ) : displayProfile?.role === 'admin' ? (
                                    <>
                                        <span><Icons.Shield /> Rol: Administrador</span>
                                        <span><Icons.Mail /> {displayProfile?.mail || displayProfile?.email || (isOwnProfile ? user?.email : '')}</span>
                                        {displayProfile?.phone && <span><Icons.Phone /> {displayProfile?.phone}</span>}
                                    </>
                                ) : (
                                    <>
                                        {displayProfile?.program && <span><Icons.School /> {displayProfile?.program} {displayProfile?.semester ? `• Semestre ${displayProfile.semester}` : ''}</span>}
                                        {((isOwnProfile || userRole === 'admin') && displayProfile?.academicAverage) && <span><Icons.Award /> Promedio: {displayProfile.academicAverage}</span>}
                                        {(isOwnProfile || (userRole === 'admin' && (displayProfile?.mail || (isOwnProfile ? user?.email : '')))) && 
                                            <span><Icons.Mail /> {displayProfile?.mail || (isOwnProfile ? user?.email : '')}</span>
                                        }
                                        {((isOwnProfile || userRole === 'admin') && displayProfile?.phone) && <span><Icons.Phone /> {displayProfile?.phone}</span>}
                                    </>
                                )}
                                {(displayProfile?.city || displayProfile?.country) && <span><Icons.MapPin /> {[displayProfile.city, displayProfile.country].filter(Boolean).join(', ')}</span>}
                            </div>

                            {displayProfile?.role !== 'company' && displayProfile?.role !== 'admin' && (displayProfile?.availableForInternship || displayProfile?.availableForJob) && (
                                <div className="availability-badges" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                    {displayProfile.availableForInternship && <span className="availability-badge internship"><Icons.Briefcase /> Buscando Prácticas</span>}
                                    {displayProfile.availableForJob && <span className="availability-badge job"><Icons.Briefcase /> Buscando Empleo</span>}
                                </div>
                            )}

                            {displayProfile?.biography && <p className="profile-bio">{displayProfile.biography}</p>}

                            <div className="profile-links">
                                {displayProfile?.linkedin && (
                                    <a href={displayProfile.linkedin.startsWith('http') ? displayProfile.linkedin : `https://linkedin.com/in/${displayProfile.linkedin}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                                        <Icons.Linkedin /> LinkedIn
                                    </a>
                                )}
                                {displayProfile?.role !== 'company' && displayProfile?.role !== 'admin' && displayProfile?.github && (
                                    <a href={displayProfile.github.startsWith('http') ? displayProfile.github : `https://github.com/${displayProfile.github}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                                        <Icons.Github /> GitHub
                                    </a>
                                )}
                                {displayProfile?.portfolioWeb && (
                                    <a href={displayProfile.portfolioWeb.startsWith('http') ? displayProfile.portfolioWeb : `https://${displayProfile.portfolioWeb}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                                        <Icons.Rocket /> Portafolio
                                    </a>
                                )}
                            </div>

                            {!isOwnProfile && (
                                <div className="contact-action-area" style={{ marginTop: '20px', flexWrap: 'wrap' }}>
                                    {(displayProfile?.contactMail || displayProfile?.mail || displayProfile?.email) && (
                                        <a 
                                            href={`mailto:${displayProfile?.contactMail || displayProfile?.mail || displayProfile?.email}`} 
                                            className="primary-action-btn" 
                                            style={{ display: 'inline-flex', width: 'auto', padding: '10px 25px' }}
                                        >
                                            <Icons.Mail /> Contáctame por Correo
                                        </a>
                                    )}
                                    {displayProfile?.phone && (
                                        <div className="contact-phone-box">
                                            <Icons.Phone /> {displayProfile.phone}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {(isOwnProfile && !isEditingProfile) && (
                <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}>
                    <Icons.Edit /> Editar Perfil
                </button>
            )}
        </div>
    );
}
