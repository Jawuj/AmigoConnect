import React, { useState } from 'react';
import Icons from '../components/shared/Icons';
import { db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";

export default function ProfilePage({
    user, profile, setProfile, users, viewedUserId,
    projects, handleProjectClick
}) {
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const program = formData.get('program');
        const semester = formData.get('semester');
        const github = formData.get('github');
        const academicAverage = formData.get('academicAverage');
        const technicalSkills = formData.get('technicalSkills')?.split(',').map(s => s.trim()) || [];
        const softSkills = formData.get('softSkills')?.split(',').map(s => s.trim()) || [];

        try {
            const updatedProfile = {
                ...profile,
                name,
                program,
                semester,
                github,
                academicAverage,
                technicalSkills,
                softSkills
            };
            await setDoc(doc(db, "users", user.uid), updatedProfile);
            setProfile(updatedProfile);
            setIsEditingProfile(false);
            alert("Perfil actualizado!");
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            alert("Error al guardar cambios");
        }
    };

    const isOwnProfile = !viewedUserId || viewedUserId === user?.uid;
    const displayProfile = isOwnProfile ? profile : (users[viewedUserId] || {});

    return (
        <div className="profile-view">
            <div className="profile-header-card">
                <div className="profile-info-main">
                    <div className="profile-avatar-large">
                        {displayProfile?.avatarUrl ? (
                            <img src={displayProfile.avatarUrl} alt="Yo" />
                        ) : (
                            <div className="author-avatar" style={{ width: '100%', height: '100%', fontSize: '3rem' }}>
                                {((displayProfile?.name || (!isOwnProfile ? 'U' : user?.displayName)) || 'U').charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="profile-details-text">
                        {(isOwnProfile && isEditingProfile) ? (
                            <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                                <div className="form-group-inline">
                                    <input type="text" name="name" defaultValue={displayProfile?.name || user?.displayName} placeholder="Nombre" required />
                                    <input type="number" step="0.1" name="academicAverage" defaultValue={displayProfile?.academicAverage} placeholder="Promedio Académico" />
                                </div>
                                <div className="form-row">
                                    <input type="text" name="program" defaultValue={displayProfile?.program} placeholder="Carrera" required />
                                    <input type="number" name="semester" defaultValue={displayProfile?.semester} placeholder="Semestre" required />
                                </div>
                                <input type="text" name="technicalSkills" defaultValue={displayProfile?.technicalSkills?.join(', ')} placeholder="Habilidades Técnicas (separadas por coma)" />
                                <input type="text" name="softSkills" defaultValue={displayProfile?.softSkills?.join(', ')} placeholder="Habilidades Blandas (separadas por coma)" />
                                <input type="text" name="github" defaultValue={displayProfile?.github} placeholder="Link de Github" />
                                <div className="form-actions-inline">
                                    <button type="submit" className="primary-action-btn"><Icons.Check /> Guardar Perfil Profesional</button>
                                    <button type="button" className="secondary-action-btn" onClick={() => setIsEditingProfile(false)}>Cancelar</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h1>{displayProfile?.name || (!isOwnProfile ? '' : user?.displayName)}</h1>
                                <div className="profile-subtext">
                                    {displayProfile?.program && <span><Icons.School /> {displayProfile?.program} {displayProfile?.semester ? `• Semestre ${displayProfile.semester}` : ''}</span>}
                                    {displayProfile?.academicAverage && <span className="badge-gpa">Promedio: {displayProfile.academicAverage}</span>}
                                    {(isOwnProfile || displayProfile?.mail) && <span><Icons.Mail /> {displayProfile?.mail || (isOwnProfile ? user?.email : '')}</span>}
                                    {displayProfile?.github && (
                                        <a href={displayProfile.github.startsWith('http') ? displayProfile.github : `https://github.com/${displayProfile.github}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                                            <Icons.Github /> Perfil Github
                                        </a>
                                    )}
                                </div>

                                {(displayProfile?.technicalSkills?.length > 0 || displayProfile?.softSkills?.length > 0) && (
                                    <div className="profile-skills-summary">
                                        {displayProfile?.technicalSkills?.slice(0, 5).map(s => <span key={s} className="skill-chip">{s}</span>)}
                                        {displayProfile?.technicalSkills?.length > 5 && <span className="skill-chip more">+{displayProfile.technicalSkills.length - 5}</span>}
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

            <div className="profile-sections-grid">
                {(!isOwnProfile || displayProfile?.role === 'teacher' || displayProfile?.resumeUrl) && (
                    <section>
                        <h3 className="profile-section-title">
                            {displayProfile?.role === 'teacher' ? 'Información Profesional' : 'Hoja de Vida'}
                        </h3>
                        <div className="resume-upload-section">
                            {displayProfile?.role === 'teacher' ? (
                                <div className="teacher-info-card">
                                    {displayProfile?.program && <p><strong>Docente de la facultad:</strong> {displayProfile?.program}</p>}
                                    {(displayProfile?.mail || isOwnProfile) && <p><strong>Contacto:</strong> {displayProfile?.mail || (isOwnProfile ? user?.email : '')}</p>}
                                    {displayProfile?.github && (
                                        <a href={displayProfile.github} target="_blank" rel="noopener noreferrer" className="resume-link">
                                            <Icons.External /> Perfil Profesional
                                        </a>
                                    )}
                                </div>
                            ) : displayProfile?.resumeUrl ? (
                                <div>
                                    <p>✅ Hoja de vida {isOwnProfile ? 'cargada correctamente' : 'disponible'}.</p>
                                    <a href={displayProfile.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
                                        <Icons.External /> Ver documento {isOwnProfile ? 'actual' : ''}
                                    </a>
                                </div>
                            ) : (
                                isOwnProfile && (
                                    <div>
                                        <p>Aún no has subido tu hoja de vida.</p>
                                        <button className="secondary-action-btn" style={{ maxWidth: '200px', margin: '10px auto' }} onClick={() => alert("Próximamente: Subir PDF")}>
                                            <Icons.Upload /> Subir PDF
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                )}

                <section>
                    <h3 className="profile-section-title">
                        {displayProfile?.role === 'teacher'
                            ? `Proyectos Validados por ${isOwnProfile ? 'mí' : displayProfile.name?.split(' ')[0]}`
                            : `${isOwnProfile ? 'Mis Proyectos' : `Proyectos de ${displayProfile?.name?.split(' ')[0]}`} (${projects.filter(p => p.authorId === (isOwnProfile ? user.uid : viewedUserId)).length})`}
                    </h3>
                    <div className="project-grid">
                        {projects
                            .filter(p => displayProfile?.role === 'teacher' ? p.validatedBy === (isOwnProfile ? user.uid : viewedUserId) : p.authorId === (isOwnProfile ? user.uid : viewedUserId))
                            .map(project => (
                                <article key={project.id} className="project-card" onClick={() => handleProjectClick(project.id)} style={{ cursor: 'pointer' }}>
                                    <div className="card-banner" style={{ backgroundImage: `url(${project.imageUrl})`, backgroundSize: 'cover' }}>
                                        <div className="banner-badges">
                                            <span className="tag-semester">Semestre {project.semester}</span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <h3 className="card-title">{project.title}</h3>
                                        <small className="tech-stack">{Array.isArray(project.techStack) ? project.techStack.slice(0, 2).join(', ') : project.techStack}</small>
                                    </div>
                                </article>
                            ))}
                        {projects.filter(p => displayProfile?.role === 'teacher' ? p.validatedBy === (isOwnProfile ? user.uid : viewedUserId) : p.authorId === (isOwnProfile ? user.uid : viewedUserId)).length === 0 && (
                            <p>{displayProfile?.role === 'teacher' ? (isOwnProfile ? 'Aún no has validado proyectos.' : 'Aún no ha validado proyectos.') : (isOwnProfile ? 'Aún no has publicado proyectos.' : 'Aún no ha publicado proyectos.')}</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
