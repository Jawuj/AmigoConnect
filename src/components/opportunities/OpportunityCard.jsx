import React from 'react';
import Icons from '../shared/Icons';
import { db } from "../../firebase";
import { updateDoc, doc } from "firebase/firestore";

export default function OpportunityCard({
    opp, profile, userRole, user,
    handleToggleFavorite
}) {
    return (
        <article className={`opp-card ${opp.approvalStatus === 'pending' ? 'pending' : ''}`}>
            <button
                className={`btn-favorite-opp ${profile?.favorites?.includes(opp.id) ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(opp.id); }}
                title="Añadir a favoritos"
            >
                {profile?.favorites?.includes(opp.id) ? <Icons.StarFilled /> : <Icons.StarEmpty />}
            </button>
            <div className="opp-header">
                <div className="company-logo-small">
                    {opp.companyLogo ? <img src={opp.companyLogo} alt={opp.company} /> : opp.company?.charAt(0)}
                </div>
                <div>
                    <h3 className="opp-title">{opp.title}</h3>
                    <span className="opp-company">{opp.company}</span>
                </div>
            </div>
            <div className="opp-body">
                <p>{opp.description}</p>
                {opp.academicReq && <p className="text-sm mt-2"><strong>Req. Académicos:</strong> {opp.academicReq}</p>}
                {Array.isArray(opp.techReq) && opp.techReq.length > 0 && (
                    <p className="text-sm mt-1"><strong>Skills:</strong> {opp.techReq.join(', ')}</p>
                )}
                {opp.benefits && <p className="text-sm mt-1"><strong>Beneficios:</strong> <span style={{ color: '#10b981' }}>{opp.benefits}</span></p>}
                
                <div className="opp-tags" style={{ marginTop: '10px' }}>
                    <span className="opp-tag">{opp.modality}</span>
                    <span className="opp-tag">{opp.type}</span>
                    <span className="opp-tag">
                        {opp.salaryMin ? `${opp.salaryMin}${opp.salaryMax ? ` - ${opp.salaryMax}` : ''} ${opp.currency}` : opp.salary || 'A convenir'}
                    </span>
                    {opp.deadline && <span className="opp-tag alert" style={{ background: '#fef08a', color: '#854d0e' }}>Cierra: {opp.deadline}</span>}
                </div>
            </div>
            <div className="opp-footer">
                <div className="opp-contact-info">
                    <Icons.Mail /> <span>{opp.contact}</span>
                </div>
                {userRole === 'student' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {opp.urlVacante && (
                            <button className="secondary-action-btn" onClick={() => window.open(opp.urlVacante, '_blank', 'noopener,noreferrer')}>
                                Ver Oferta
                            </button>
                        )}
                        <button className="primary-action-btn" onClick={() => window.open(opp.contact.startsWith('http') ? opp.contact : `mailto:${opp.contact}`)}>
                            Aplicar
                        </button>
                    </div>
                )}

                {/* Validación de Vacantes (Docente/Coordinador) */}
                {userRole === 'teacher' && (
                    <div className="card-teacher-actions" style={{ position: 'relative', background: 'transparent', boxShadow: 'none' }}>
                        <button
                            className={`action-dot ${opp.approvalStatus === 'approved' ? 'approved' : ''}`}
                            onClick={async (e) => {
                                e.stopPropagation();
                                const isCurrentlyApproved = opp.approvalStatus === 'approved';
                                try {
                                    await updateDoc(doc(db, "opportunities", opp.id), {
                                        approvalStatus: isCurrentlyApproved ? 'pending' : 'approved'
                                    });
                                    alert(isCurrentlyApproved ? "Vacante desaprobada" : "Vacante aprobada");
                                } catch (error) {
                                    console.error("Error updating opp", error);
                                }
                            }}
                            title={opp.approvalStatus === 'approved' ? 'Desaprobar Publicación' : 'Aprobar Publicación'}
                        >
                            {opp.approvalStatus === 'approved' ? <Icons.X /> : <Icons.Check />}
                        </button>
                        {opp.approvalStatus === 'pending' && (
                            <button className="action-dot reject" onClick={async (e) => {
                                e.stopPropagation();
                                const reason = prompt("Motivo del rechazo:");
                                if (reason) {
                                    try {
                                        await updateDoc(doc(db, "opportunities", opp.id), { approvalStatus: 'rejected' });
                                        alert("Vacante rechazada");
                                    } catch (error) {
                                        console.error("Error rejecting opp", error);
                                    }
                                }
                            }} title="Rechazar">
                                <Icons.X />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
