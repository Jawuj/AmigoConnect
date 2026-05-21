import React from 'react';
import Icons from '../shared/Icons';

export default function UserCard({ user, onClick }) {
    return (
        <article className="user-card" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="user-card-header">
                <div className="user-card-avatar">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.firstName} />
                    ) : (
                        <span>{(user.firstName || 'U').charAt(0)}</span>
                    )}
                </div>
                <div className="user-card-badges">
                    <span className={`badge-role ${user.role}`}>{user.role === 'student' ? 'Estudiante' : (user.role === 'graduate' ? 'Egresado' : user.role)}</span>
                    {user.availableForJob && <span className="badge-available">En búsqueda</span>}
                </div>
            </div>
            
            <div className="user-card-body">
                <h3 className="user-name">{user.firstName} {user.lastName}</h3>
                <p className="user-program"><Icons.School style={{ width: 14 }} /> {user.program || 'Sin programa'}</p>
                {user.semester && <p className="user-semester">Semestre {user.semester}</p>}
                
                {user.technicalSkills && user.technicalSkills.length > 0 && (
                    <div className="user-skills">
                        {user.technicalSkills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill.nombre || skill.name || (typeof skill === 'string' ? skill : 'Habilidad')}</span>
                        ))}
                        {user.technicalSkills.length > 3 && <span className="skill-tag more">+{user.technicalSkills.length - 3}</span>}
                    </div>
                )}
            </div>
            
            <div className="user-card-footer">
                <div className="user-stats">
                    <span title="Ciudad"><Icons.MapPin style={{ width: 14 }} /> {user.city || 'Medellín'}</span>
                    <span title="Proyectos"><Icons.Briefcase style={{ width: 14 }} /> {user.projectCount || 0} Proyectos</span>
                </div>
                <button className="view-profile-btn">Ver Perfil</button>
            </div>
        </article>
    );
}
