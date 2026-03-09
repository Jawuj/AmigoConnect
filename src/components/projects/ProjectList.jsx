import React from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectList({
    projects, activeMainFilter, activeSemester, activeStatus,
    activeCategories, activeValidationFilter, activeProjectTab,
    userRole, user, profile, users,
    handleProjectClick, handleToggleFavorite, handleApproveProject,
    handleRejectProject, handleToggleValidation, setEditingProject,
    setIsUploadModalOpen, setViewedUserId, setActiveView,
    resetFilters
}) {
    const filteredProjects = projects.filter(project => {
        const matchMain = activeMainFilter === 'Todos' || project.mainFilter === activeMainFilter;
        const matchSemester = activeSemester === 'Todos' || String(project.semester) === activeSemester;
        const matchStatus = activeStatus === 'Todos' || project.status === activeStatus;
        const matchCategory = activeCategories.length === 0 || activeCategories.includes(project.category);
        const matchValidation = activeValidationFilter === 'Todos' ||
            (activeValidationFilter === 'Validados' && project.isValidated) ||
            (activeValidationFilter === 'Pendientes' && !project.isValidated);

        const isFavorite = profile?.favorites?.includes(project.id);
        const matchFavorites = activeProjectTab === 'all' || (activeProjectTab === 'favorites' && isFavorite);

        return matchMain && matchSemester && matchStatus && matchCategory && matchValidation && matchFavorites;
    });

    // Visibilidad de Aprobación
    const visibleProjects = filteredProjects.filter(p => {
        if (userRole === 'teacher') return true; // Profesores ven todo
        if (user?.uid === p.authorId) return true; // Autor ve lo suyo
        if (p.approvalStatus === 'approved') return true; // Solo aprobados para el resto
        return false;
    });

    if (visibleProjects.length === 0) {
        return (
            <div className="empty-state">
                <p>No se encontraron proyectos aprobados o disponibles.</p>
                <button className="tag-clear" onClick={resetFilters}>Limpiar Filtros</button>
            </div>
        );
    }

    return (
        <div className="project-grid">
            {visibleProjects.map(project => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    userRole={userRole}
                    user={user}
                    profile={profile}
                    users={users}
                    handleProjectClick={handleProjectClick}
                    handleToggleFavorite={handleToggleFavorite}
                    handleApproveProject={handleApproveProject}
                    handleRejectProject={handleRejectProject}
                    handleToggleValidation={handleToggleValidation}
                    setEditingProject={setEditingProject}
                    setIsUploadModalOpen={setIsUploadModalOpen}
                    setViewedUserId={setViewedUserId}
                    setActiveView={setActiveView}
                />
            ))}
        </div>
    );
}
