import React from 'react';
import Icons from '../shared/Icons';

export default function OpportunityCard({
    opp, profile, userRole, user,
    handleToggleFavorite, handleDeleteOpportunity,
    handleApproveOpportunity, handleRejectOpportunity
}) {
    return (
        <article className={`opp-card ${opp.approvalStatus === 'pending' ? 'pending' : ''} ${opp.approvalStatus === 'rejected' ? 'rejected' : ''}`}>
            <button
                className={`btn-favorite ${profile?.favorites?.includes(opp.id) ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(opp.id, null, null, 'opportunities'); }}
                title="Añadir a favoritos"
            >
                {profile?.favorites?.includes(opp.id) ? <Icons.StarFilled /> : <Icons.StarEmpty />}
            </button>
            <div className="opp-header">
                <div className="company-logo-small">
                    {opp.companyLogo ? <img src={opp.companyLogo} alt={opp.companyName || opp.company || 'Empresa'} /> : (opp.companyName || opp.company || 'Empresa').charAt(0)}
                </div>
                <div>
                    <h3 className="opp-title">{opp.title}</h3>
                    <span className="opp-company">{opp.companyName || opp.company || 'Empresa'}</span>
                </div>
            </div>
            <div className="opp-body">
                <p className="opp-desc">{opp.description}</p>
                
                {(opp.academicReq || opp.sector || opp.benefits) && (
                    <div className="opp-meta-list">
                        {opp.academicReq && (
                            <div className="opp-meta-item">
                                <Icons.School size={13} />
                                <span>{opp.academicReq}</span>
                            </div>
                        )}
                        {opp.sector && (
                            <div className="opp-meta-item">
                                <Icons.Briefcase size={13} />
                                <span>{opp.sector}</span>
                            </div>
                        )}
                        {opp.benefits && (
                            <div className="opp-meta-item">
                                <Icons.StarEmpty size={13} style={{ color: 'var(--success-color)' }} />
                                <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>{opp.benefits}</span>
                            </div>
                        )}
                    </div>
                )}

                {Array.isArray(opp.techReq) && opp.techReq.length > 0 && (
                    <div className="user-skills" style={{ marginTop: '4px', gap: '4px' }}>
                        {opp.techReq.slice(0, 3).map((skill, i) => (
                            <span key={i} className="skill-tag" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>{skill}</span>
                        ))}
                        {opp.techReq.length > 3 && <span className="skill-tag more" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>+{opp.techReq.length - 3}</span>}
                    </div>
                )}

                <div className="opp-tags">
                    {opp.modality && <span className="opp-tag">{opp.modality}</span>}
                    {opp.type && <span className="opp-tag">{opp.type}</span>}
                    {opp.budget ? (
                        <span className="opp-tag" style={{ background: 'var(--accent-color)', color: 'white' }}>
                            Presupuesto: {opp.budget}
                        </span>
                    ) : (
                        <span className="opp-tag">
                            {opp.salaryMin ? `${opp.salaryMin}${opp.salaryMax ? ` - ${opp.salaryMax}` : ''} ${opp.currency}` : opp.salary || 'A convenir'}
                        </span>
                    )}
                    {opp.deadline && <span className="opp-tag deadline-alert">Cierra: {opp.deadline}</span>}
                </div>
            </div>

            <div className="opp-footer">
                <div className="opp-contact-info">
                    <Icons.Mail /> <span>{(userRole !== 'guest' && userRole !== null) ? opp.contact : 'Inicia sesión para ver el contacto'}</span>
                </div>
                {(userRole === 'student' || userRole === 'graduate') && (
                    <div className="opp-actions">
                        {opp.urlVacante && (
                            <button className="secondary-action-btn" onClick={() => window.open(opp.urlVacante, '_blank', 'noopener,noreferrer')}>
                                Ver Oferta
                            </button>
                        )}
                        <button 
                            className="primary-action-btn" 
                            onClick={() => {
                                const contact = opp.contact || '';
                                if (contact.includes('@')) {
                                    window.location.href = `mailto:${contact}`;
                                } else if (contact.startsWith('http')) {
                                    window.open(contact, '_blank', 'noopener,noreferrer');
                                } else {
                                    window.open(opp.urlVacante || '#', '_blank', 'noopener,noreferrer');
                                }
                            }}
                        >
                            <Icons.Mail /> Contáctame
                        </button>
                    </div>
                )}

                {(user?.uid === opp.companyId || (userRole === 'company' && profile?.uid === opp.companyId)) && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="secondary-action-btn" onClick={() => handleDeleteOpportunity(opp.id)} style={{ color: '#ef4444', borderColor: '#fca5a5', width: '100%' }}>
                            <Icons.X /> Eliminar Vacante
                        </button>
                    </div>
                )}

                {/* Validación de Vacantes (Docente/Administrador) */}
                {(userRole === 'teacher' || userRole === 'admin') && (
                    <div className="card-teacher-actions" style={{ position: 'relative', background: 'transparent', boxShadow: 'none' }}>
                        <button
                            className={`action-dot ${opp.approvalStatus === 'approved' ? 'approved' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleApproveOpportunity(opp);
                            }}
                            title={opp.approvalStatus === 'approved' ? 'Desaprobar Publicación' : 'Aprobar Publicación'}
                        >
                            {opp.approvalStatus === 'approved' ? <Icons.X /> : <Icons.Check />}
                        </button>
                        {opp.approvalStatus === 'pending' && (
                            <button 
                                className="action-dot reject" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectOpportunity(opp);
                                }} 
                                title="Rechazar"
                            >
                                <Icons.X />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
