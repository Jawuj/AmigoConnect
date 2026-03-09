import React from 'react';

export default function ProjectDetailsPage({
    project, author, profile,
    handleToggleFavorite, goToDashboard,
    setViewedUserId, setActiveView, handleProjectClick, projects
}) {
    if (!project) return <p>Proyecto no encontrado</p>;

    return (
        <div className="details-view">
            <nav className="breadcrumb">
                <span onClick={goToDashboard} style={{ cursor: 'pointer' }}>Explorar</span> / <span>Proyecto</span>
            </nav>

            <div className="details-grid">
                <div className="details-main">
                    <img src={project.imageUrl} alt={project.title} className="details-main-image" />
                    <div className="details-content">
                        <div className="details-meta">
                            <span className="details-tag">Semestre {project.semester}</span>
                            <span className="details-tag">{project.category}</span>
                            <span className="details-tag sector">{project.sector}</span>
                            <span className={`status-badge ${project.approvalStatus}`}>
                                {project.approvalStatus?.toUpperCase()}
                            </span>
                        </div>
                        <h1>{project.title}</h1>

                        <div className="author-strip" onClick={() => { setViewedUserId(project.authorId); setActiveView('profile'); }} style={{ cursor: 'pointer' }}>
                            {author?.avatarUrl ? (
                                <img src={author.avatarUrl} alt={author?.name} />
                            ) : (
                                <div className="author-avatar">{(author?.name || 'U').charAt(0)}</div>
                            )}
                            <div>
                                <strong>{author?.name}</strong> • <small>{author?.program}</small>
                            </div>
                        </div>

                        <div className="details-description">
                            <h3>Sobre el proyecto</h3>
                            <p>{project.problemSolved}</p>
                        </div>

                        {project.impactPotential && (
                            <div className="details-description highlight">
                                <h3>Potencial de Impacto</h3>
                                <p>{project.impactPotential}</p>
                            </div>
                        )}

                        {project.techArchitecture && (
                            <div className="details-description">
                                <h3>Arquitectura Técnica</h3>
                                <p>{project.techArchitecture}</p>
                            </div>
                        )}

                        {project.team && (
                            <div className="details-description">
                                <h3>Equipo Desarrollador</h3>
                                <p>{project.team}</p>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="details-sidebar">
                    <div className="sidebar-card">
                        <h3 className="sidebar-title">Detalles del Recurso</h3>
                        <div className="detail-item">
                            <span className="detail-label">Tecnología</span>
                            <span className="detail-value">{Array.isArray(project.techStack) ? project.techStack.join(', ') : project.techStack}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Estado</span>
                            <span className="detail-value">{project.status}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Nivel Madurez (TRL)</span>
                            <span className="detail-value">{project.maturityLevel || 'Inicial'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Licencia</span>
                            <span className="detail-value">{project.license}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Publicado</span>
                            <span className="detail-value">
                                {project.createdAt?.seconds ? new Date(project.createdAt.seconds * 1000).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Marzo 2026'}
                            </span>
                        </div>

                        {project.demoUrl && (
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="primary-action-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                                🚀 Ver Demo Online
                            </a>
                        )}
                        <button
                            className={`secondary-action-btn ${profile?.favorites?.includes(project.id) ? 'active' : ''}`}
                            onClick={() => handleToggleFavorite(project.id)}
                        >
                            {profile?.favorites?.includes(project.id) ? '⭐ Guardado' : '☆ Guardar en Favoritos'}
                        </button>
                    </div>
                </aside>
            </div>

            <div className="more-author-section">
                <h3 className="profile-section-title">Otros proyectos de este autor</h3>
                <div className="project-grid">
                    {projects.filter(p => p.authorId === project.authorId && p.id !== project.id).slice(0, 3).map(p => (
                        <article key={p.id} className="project-card" onClick={() => handleProjectClick(p.id)} style={{ cursor: 'pointer' }}>
                            <div className="card-banner" style={{ backgroundImage: `url(${p.imageUrl})`, backgroundSize: 'cover' }}>
                                <div className="banner-badges">
                                    <span className="tag-semester">Semestre {p.semester}</span>
                                </div>
                            </div>
                            <div className="card-body">
                                <h3 className="card-title">{p.title}</h3>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
