import React from 'react';

export default function ProfileProjects({ 
    projects = [], isOwnProfile, viewedUserId, user, displayProfile, handleProjectClick 
}) {
    const isTeacher = displayProfile?.role === 'teacher';
    const filteredProjects = projects.filter(p => 
        isTeacher ? p.validatedBy === displayProfile?.uid 
                  : p.authorId === displayProfile?.uid
    );

    return (
        <section>
            <h3 className="profile-section-title">
                {isTeacher
                    ? `Proyectos Validados por ${isOwnProfile ? 'mí' : displayProfile.firstName}`
                    : `${isOwnProfile ? 'Mis Proyectos' : `Proyectos de ${displayProfile?.firstName}`} (${filteredProjects.length})`}
            </h3>
            <div className="project-grid">
                {filteredProjects.map(project => (
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
                {filteredProjects.length === 0 && (
                    <p>{isTeacher ? (isOwnProfile ? 'Aún no has validado proyectos.' : 'Aún no ha validado proyectos.') : (isOwnProfile ? 'Aún no has publicado proyectos.' : 'Aún no ha publicado proyectos.')}</p>
                )}
            </div>
        </section>
    );
}
