import React from 'react';
import Icons from '../shared/Icons';

export default function ProjectCard({
    project, userRole, user, profile, users,
    handleProjectClick, handleToggleFavorite, handleApproveProject,
    handleRejectProject, handleToggleValidation, setEditingProject,
    setIsUploadModalOpen, setViewedUserId, setActiveView
}) {
    const projectAuthor = users[project.authorId] || {};
    const isAuthor = user?.uid === project.authorId;

    return (
        <article className="project-card" onClick={() => handleProjectClick(project.id)} style={{
            cursor: 'pointer',
            borderTop: project.approvalStatus === 'pending' ? '4px solid #ff9800' : 'none'
        }}>
            <button
                className={`btn-favorite ${profile?.favorites?.includes(project.id) ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(project.id); }}
                title="Añadir a favoritos"
            >
                {profile?.favorites?.includes(project.id) ? <Icons.StarFilled /> : <Icons.StarEmpty />}
            </button>

            <div
                className="card-banner"
                style={{
                    backgroundImage: project.imageUrl ? `url(${project.imageUrl})` : 'none',
                    backgroundColor: project.imageUrl ? 'transparent' : '#e6b38a',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                <div className="banner-badges">
                    <span className="tag-semester">Semestre {project.semester || 'N/A'}</span>
                    {project.isValidated && <span className="badge-validated">Validado</span>}
                    {project.approvalStatus === 'pending' && <span className="badge-pending">Pendiente</span>}
                    {project.approvalStatus === 'rejected' && <span className="badge-rejected">Rechazado</span>}
                </div>
            </div>
            {/* Acciones de Docente (Control Unificado) */}
            {userRole === 'teacher' && (
                <div className="card-teacher-actions">
                    <button
                        className={`action-dot ${project.approvalStatus === 'approved' ? 'approved' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleApproveProject(project); }}
                        title={project.approvalStatus === 'approved' ? "Desaprobar" : "Aprobar"}
                    >
                        {project.approvalStatus === 'approved' ? <Icons.X /> : <Icons.Check />}
                    </button>
                    {project.approvalStatus === 'pending' && (
                        <button
                            className="action-dot reject"
                            onClick={(e) => { e.stopPropagation(); handleRejectProject(project); }}
                            title="Rechazar"
                        >
                            <Icons.X />
                        </button>
                    )}
                    <button
                        className={`action-dot validate ${project.isValidated ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleToggleValidation(project); }}
                        title={project.isValidated ? "Quitar Validación" : "Validar"}
                    >
                        <Icons.Shield />
                    </button>
                    <button
                        className="action-dot edit"
                        onClick={(e) => { e.stopPropagation(); setEditingProject(project); setIsUploadModalOpen(true); }}
                        title="Editar"
                    >
                        <Icons.Edit />
                    </button>
                </div>
            )}

            {/* Edición (Solo Autor para no solapar con acciones de profe) */}
            {(isAuthor && userRole !== 'teacher') && (
                <button
                    className="edit-card-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                        setIsUploadModalOpen(true);
                    }}
                    title="Editar Proyecto"
                >
                    <Icons.Edit />
                </button>
            )}
            <div className="card-body">
                <h3 className="card-title">{project.title}</h3>
                <p className="card-description">{project.problemSolved || project.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small className="tech-stack">
                        {Array.isArray(project.techStack) ? project.techStack.slice(0, 3).join(', ') : project.techStack}
                    </small>
                    {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="demo-link-small" onClick={(e) => e.stopPropagation()}>Demo
                        </a>
                    )}
                </div>
            </div>
            <div className="card-footer">
                <div className="author-info" onClick={(e) => { e.stopPropagation(); setViewedUserId(project.authorId); setActiveView('profile'); }} style={{ cursor: 'pointer' }}>
                    <div className="author-avatar">
                        {projectAuthor.avatarUrl ? (
                            <img src={projectAuthor.avatarUrl} alt={projectAuthor.name} />
                        ) : (
                            (projectAuthor.name || 'E').charAt(0)
                        )}
                    </div>
                    <div className="author-details">
                        <span className="author-name">{projectAuthor.name || 'Cargando...'}</span>
                        {projectAuthor.program && <small className="author-program">{projectAuthor.program}</small>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    <span title="Vistas" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icons.Eye /> {project.views || 0}
                    </span>
                    <span title="Favoritos" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icons.StarFilled /> {project.favoritesCount || 0}
                    </span>
                    <span className="card-date">{project.status}</span>
                </div>
            </div>
        </article>
    );
}
