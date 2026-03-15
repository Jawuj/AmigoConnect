import React from 'react';
import Filters from '../components/projects/Filters';
import ProjectList from '../components/projects/ProjectList';
import Icons from '../components/shared/Icons';

export default function DashboardPage({
    title = "Explorar Proyectos",
    hideTabs = false,
    activeMainFilter, setActiveMainFilter, mainFilters,
    activeSemester, setActiveSemester, semesters,
    activeStatus, setActiveStatus, statuses,
    activeValidationFilter, setActiveValidationFilter,
    activeCategories, setActiveCategories, projectCategories,
    activeProjectTab, setActiveProjectTab,
    projects, userRole, user, profile, users,
    handleProjectClick, handleToggleFavorite, handleApproveProject,
    handleRejectProject, handleToggleValidation, setEditingProject,
    setIsUploadModalOpen, setViewedUserId, setActiveView, resetFilters
}) {
    return (
        <>
            <Filters
                activeMainFilter={activeMainFilter} setActiveMainFilter={setActiveMainFilter} mainFilters={mainFilters}
                activeSemester={activeSemester} setActiveSemester={setActiveSemester} semesters={semesters}
                activeStatus={activeStatus} setActiveStatus={setActiveStatus} statuses={statuses}
                activeValidationFilter={activeValidationFilter} setActiveValidationFilter={setActiveValidationFilter}
                activeCategories={activeCategories} setActiveCategories={setActiveCategories} projectCategories={projectCategories}
            />
            <main className="main-content">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    {!hideTabs && (
                        <div className="view-tabs">
                            <button
                                className={`view-tab ${activeProjectTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveProjectTab('all')}
                            >Todos</button>
                            <button
                                className={`view-tab ${activeProjectTab === 'favorites' ? 'active' : ''}`}
                                onClick={() => setActiveProjectTab('favorites')}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >Mis Favoritos <Icons.StarFilled /></button>
                        </div>
                    )}
                </div>

                <ProjectList
                    projects={projects}
                    activeMainFilter={activeMainFilter}
                    activeSemester={activeSemester}
                    activeStatus={activeStatus}
                    activeCategories={activeCategories}
                    activeValidationFilter={activeValidationFilter}
                    activeProjectTab={activeProjectTab}
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
                    resetFilters={resetFilters}
                />
            </main>
        </>
    );
}
