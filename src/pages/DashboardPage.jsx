import React, { useMemo, useEffect } from 'react';
import ProjectCard from '../components/projects/ProjectCard';
import Icons from '../components/shared/Icons';

export default function DashboardPage({
    projects, searchQuery, activeMainFilter, activeCategories, activeSemester, activeStatus,
    handleProjectClick, handleToggleFavorite, profile, user, userRole, handleEditProject,
    users = {}, setEditingProject, setIsUploadModalOpen, setViewedUserId, setActiveView,
    handleApproveProject, handleRejectProject, handleToggleValidation,
    title = "Explorar Proyectos", hideHero = false, viewMode
}) {
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchSearch = !searchQuery ||
                p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.techStack?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchMain = activeMainFilter === 'Todos' || p.faculty === activeMainFilter;
            const matchCategory = !activeCategories || activeCategories.length === 0 || activeCategories.includes(p.category);
            const matchSemester = activeSemester === 'Todos' || p.semester === activeSemester;
            const matchStatus = activeStatus === 'Todos' || p.status === activeStatus;

            return matchSearch && matchMain && matchCategory && matchSemester && matchStatus;
        }).filter(p => {
            if (userRole === 'teacher' || userRole === 'admin') return true;
            if (user?.uid === p.authorId) return true;
            if (p.approvalStatus === 'approved') return true;
            return false;
        });
    }, [projects, searchQuery, activeMainFilter, activeCategories, activeSemester, activeStatus, user, userRole]);

    // Find featured project (most favorites or views)
    const featuredProject = useMemo(() => {
        if (filteredProjects.length === 0) return null;
        return [...filteredProjects].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
    }, [filteredProjects]);

    // Group projects by category for carousels
    const categories = useMemo(() => {
        if (projects.length === 0) return [];
        const uniqueCats = [...new Set(projects.map(p => p.category))].filter(Boolean);
        // Ordenarlos para que coincidan con el orden definido si es posible, o alfabéticamente
        return uniqueCats.sort();
    }, [projects]);

    const projectsByCategory = useMemo(() => {
        const groups = {};

        // Favorites group
        const favorites = filteredProjects.filter(p => profile?.favorites?.includes(p.id));
        if (favorites.length > 0) groups['Mis Favoritos'] = favorites;

        categories.forEach(cat => {
            const catProjects = filteredProjects.filter(p => p.category === cat && p.id !== featuredProject?.id);
            if (catProjects.length > 0) groups[cat] = catProjects;
        });
        // Also a "Most Popular" group
        groups['Tendencias'] = [...filteredProjects]
            .filter(p => p.id !== featuredProject?.id)
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 10);
        return groups;
    }, [filteredProjects, featuredProject, profile, categories]);

    const carouselOrder = useMemo(() => {
        const order = [];
        if (projectsByCategory['Mis Favoritos']) order.push('Mis Favoritos');
        order.push('Tendencias');
        categories.forEach(cat => {
            if (projectsByCategory[cat] && projectsByCategory[cat].length > 0) order.push(cat);
        });
        return order;
    }, [projectsByCategory]);

    const [expandedSections, setExpandedSections] = React.useState({});

    const toggleSection = (title) => {
        setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
    };

    // renderCarousel: carrusel en desktop, grid expandible en móvil
    const renderCarousel = (title, items) => {
        if (items.length === 0) return null;

        const carouselId = `carousel-${title.replace(/\s+/g, '-').toLowerCase()}`;
        const isExpanded = expandedSections[title];
        const PREVIEW_COUNT = 4;

        const scroll = (direction) => {
            const track = document.getElementById(carouselId);
            if (!track) return;
            const scrollAmount = track.offsetWidth * 0.8;
            track.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        };

        return (
            <div className="carousel-container" key={title}>
                <div className="carousel-header">
                    <h3 className="carousel-title">{title}</h3>
                    {/* Botón Ver todos / Ver menos — solo en móvil */}
                    <button
                        className="carousel-see-all-btn mobile-only-flex"
                        onClick={() => toggleSection(title)}
                    >
                        {isExpanded ? 'Ver menos' : `Ver todos (${items.length})`}
                        {isExpanded
                            ? <Icons.ChevronUp size={14} />
                            : <Icons.ChevronDown size={14} />}
                    </button>
                </div>

                {/* ── DESKTOP: carrusel o grid basado en viewMode ── */}
                <div className="carousel-relative-wrapper hide-on-mobile">
                    {viewMode === 'carousel' ? (
                        <>
                            <div className="carousel-edge-blur left"></div>
                            <button className="nav-btn-extreme prev" onClick={() => scroll('left')} aria-label="Anterior">
                                <Icons.ChevronLeft />
                            </button>

                            <div className="carousel-track" id={carouselId}>
                                {items.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        handleProjectClick={handleProjectClick}
                                        handleToggleFavorite={handleToggleFavorite}
                                        isFavorite={profile?.favorites?.includes(project.id)}
                                        user={user}
                                        userRole={userRole}
                                        users={users}
                                        profile={profile}
                                        handleApproveProject={handleApproveProject}
                                        handleRejectProject={handleRejectProject}
                                        handleToggleValidation={handleToggleValidation}
                                        setEditingProject={handleEditProject}
                                        setIsUploadModalOpen={setIsUploadModalOpen}
                                        setViewedUserId={setViewedUserId}
                                        setActiveView={setActiveView}
                                    />
                                ))}
                            </div>

                            <button className="nav-btn-extreme next" onClick={() => scroll('right')} aria-label="Siguiente">
                                <Icons.ChevronRight />
                            </button>
                            <div className="carousel-edge-blur right"></div>
                        </>
                    ) : (
                        <div className="project-grid">
                            {items.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    handleProjectClick={handleProjectClick}
                                    handleToggleFavorite={handleToggleFavorite}
                                    isFavorite={profile?.favorites?.includes(project.id)}
                                    user={user}
                                    userRole={userRole}
                                    users={users}
                                    profile={profile}
                                    handleApproveProject={handleApproveProject}
                                    handleRejectProject={handleRejectProject}
                                    handleToggleValidation={handleToggleValidation}
                                    setEditingProject={handleEditProject}
                                    setIsUploadModalOpen={setIsUploadModalOpen}
                                    setViewedUserId={setViewedUserId}
                                    setActiveView={setActiveView}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── MÓVIL: grid expandible sin scroll horizontal ── */}
                <div className="mobile-section-grid mobile-only-block">
                    <div className="project-grid mobile-grid-preview">
                        {(isExpanded ? items : items.slice(0, PREVIEW_COUNT)).map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                handleProjectClick={handleProjectClick}
                                handleToggleFavorite={handleToggleFavorite}
                                isFavorite={profile?.favorites?.includes(project.id)}
                                user={user}
                                userRole={userRole}
                                users={users}
                                profile={profile}
                                handleApproveProject={handleApproveProject}
                                handleRejectProject={handleRejectProject}
                                handleToggleValidation={handleToggleValidation}
                                setEditingProject={handleEditProject}
                                setIsUploadModalOpen={setIsUploadModalOpen}
                                setViewedUserId={setViewedUserId}
                                setActiveView={setActiveView}
                            />
                        ))}
                    </div>

                    {items.length > PREVIEW_COUNT && (
                        <button
                            className="carousel-expand-btn"
                            onClick={() => toggleSection(title)}
                        >
                            {isExpanded
                                ? <><Icons.ChevronUp size={16} /> Mostrar menos</>
                                : <><Icons.ChevronDown size={16} /> Ver todos los {items.length} proyectos de "{title}"</>
                            }
                        </button>
                    )}
                </div>
            </div>
        );
    };


    return (
        <div className="dashboard-view main-content view-fade-in">
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
            </div>

            {searchQuery ? (
                <div className="search-results">
                    <div className="project-grid">
                        {filteredProjects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                handleProjectClick={handleProjectClick}
                                handleToggleFavorite={handleToggleFavorite}
                                profile={profile}
                                user={user}
                                userRole={userRole}
                                users={users}
                                handleApproveProject={handleApproveProject}
                                handleRejectProject={handleRejectProject}
                                handleToggleValidation={handleToggleValidation}
                                setEditingProject={handleEditProject}
                                setIsUploadModalOpen={setIsUploadModalOpen}
                                setViewedUserId={setViewedUserId}
                                setActiveView={setActiveView}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {featuredProject && !hideHero && (
                        <section
                            className="featured-hero"
                            style={{ backgroundImage: `url(${featuredProject.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072'})` }}
                        >
                            <div className="hero-overlay"></div>
                            <div className="hero-content">
                                <span className="hero-badge">PROYECTO DESTACADO</span>
                                <h1>{featuredProject.title}</h1>
                                <p>{featuredProject.problemSolved || featuredProject.description}</p>
                                <div className="hero-actions">
                                    <button className="hero-btn primary" onClick={() => handleProjectClick(featuredProject.id)}>
                                        <Icons.External /> Ver Detalles
                                    </button>
                                    <button
                                        className={`hero-btn secondary ${profile?.favorites?.includes(featuredProject.id) ? 'active' : ''}`}
                                        onClick={() => handleToggleFavorite(featuredProject.id)}
                                    >
                                        <Icons.StarEmpty /> Guardar
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                    {carouselOrder.map(title => renderCarousel(title, projectsByCategory[title]))}
                </>
            )}

            {filteredProjects.length === 0 && (
                <div className="empty-state">
                    <Icons.Search />
                    <p>No se encontraron proyectos que coincidan con los filtros.</p>
                </div>
            )}
        </div>
    );
}
