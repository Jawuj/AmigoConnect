import React, { useState, useMemo } from 'react';
import Icons from '../components/shared/Icons';
import OpportunityCard from '../components/opportunities/OpportunityCard';
import CustomSelect from '../components/shared/CustomSelect';

export default function OpportunitiesPage({
    opportunities, profile, userRole, user,
    setIsOppModalOpen, setOppModalType, handleToggleFavorite, handleDeleteOpportunity,
    handleApproveOpportunity, handleRejectOpportunity
}) {
    const [activeOppTab, setActiveOppTab] = useState('all');
    const [selectedModality, setSelectedModality] = useState('Todas');
    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedSector, setSelectedSector] = useState('Todos');
    const [showAllJobs, setShowAllJobs] = useState(false);
    const [showAllProjects, setShowAllProjects] = useState(false);

    const isFavorite = (id) => profile?.favorites?.includes(id);

    const visibleOpps = useMemo(() => {
        return opportunities.filter(o => {
            const matchFavorites = activeOppTab === 'all' || (activeOppTab === 'favorites' && isFavorite(o.id));
            if (!matchFavorites) return false;

            if (userRole === 'teacher') return true;
            if (user?.uid === o.companyId || (userRole === 'company' && profile?.uid === o.companyId)) return true;
            if (o.approvalStatus === 'approved') return true;
            return false;
        });
    }, [opportunities, activeOppTab, profile?.favorites, profile?.uid, userRole, user?.uid]);

    const filteredOpps = useMemo(() => {
        return visibleOpps.filter(o => {
            const matchModality = selectedModality === 'Todas' || 
                (o.modality || '').toLowerCase() === selectedModality.toLowerCase();

            const matchType = selectedType === 'Todos' || 
                (o.type || '').toLowerCase() === selectedType.toLowerCase();

            const matchSector = selectedSector === 'Todos' || 
                (o.sector || '').toLowerCase().includes(selectedSector.toLowerCase());

            return matchModality && matchType && matchSector;
        });
    }, [visibleOpps, selectedModality, selectedType, selectedSector]);

    const jobs = filteredOpps.filter(o => o.type !== 'proyecto');
    const projectOpps = filteredOpps.filter(o => o.type === 'proyecto');

    const jobsToShow = showAllJobs ? jobs : jobs.slice(0, 10);
    const projectsToShow = showAllProjects ? projectOpps : projectOpps.slice(0, 10);

    return (
        <div className="opportunities-view main-content view-fade-in">
            <div className="section-header" style={{ marginBottom: '30px' }}>
                <div>
                    <h2 className="section-title">Oportunidades y Proyectos</h2>
                    <p className="section-subtitle">Explora vacantes de empleo y proyectos colaborativos</p>
                </div>
                <div className="users-count-premium">
                    <span className="count-dot"></span>
                    <Icons.Briefcase size={16} />
                    <strong>{filteredOpps.length}</strong>
                    <span>{filteredOpps.length === 1 ? 'Oportunidad encontrada' : 'Oportunidades encontradas'}</span>
                </div>
            </div>

            <div className="header-actions-row" style={{ marginBottom: '20px' }}>
                <div className="view-tabs">
                    <button
                        className={`view-tab ${activeOppTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveOppTab('all')}
                    >Todas</button>
                    <button
                        className={`view-tab ${activeOppTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveOppTab('favorites')}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >Mis Favoritas </button>
                </div>
                {userRole === 'company' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="primary-action-btn" onClick={() => { setOppModalType('job'); setIsOppModalOpen(true); }}>
                            <Icons.Plus /> Publicar Trabajo
                        </button>
                        <button className="primary-action-btn" style={{ background: 'var(--accent-color)' }} onClick={() => { setOppModalType('project'); setIsOppModalOpen(true); }}>
                            <Icons.Plus /> Publicar Proyecto
                        </button>
                    </div>
                )}
            </div>

            <div className="filters-container-premium" style={{ marginBottom: '30px' }}>
                <div className="secondary-filters-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="filter-item-wrapper">
                        <label className="filter-label-minimal"><Icons.Filter size={14} /> Modalidad</label>
                        <CustomSelect 
                            value={selectedModality}
                            onChange={(e) => setSelectedModality(e.target.value)}
                            options={[
                                { value: 'Todas', label: 'Todas las Modalidades' },
                                { value: 'remoto', label: 'Remoto' },
                                { value: 'hibrido', label: 'Híbrido' },
                                { value: 'presencial', label: 'Presencial' }
                            ]}
                            placeholder="Todas las Modalidades"
                        />
                    </div>

                    <div className="filter-item-wrapper">
                        <label className="filter-label-minimal"><Icons.Clock size={14} /> Tipo</label>
                        <CustomSelect 
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            options={[
                                { value: 'Todos', label: 'Todos los Tipos' },
                                { value: 'empleo', label: 'Empleo' },
                                { value: 'proyecto', label: 'Proyecto Colaborativo' },
                                { value: 'practica', label: 'Práctica' }
                            ]}
                            placeholder="Todos los Tipos"
                        />
                    </div>

                    <div className="filter-item-wrapper">
                        <label className="filter-label-minimal"><Icons.Cpu size={14} /> Sector</label>
                        <CustomSelect 
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                            options={[
                                { value: 'Todos', label: 'Todos los Sectores' },
                                { value: 'Tecnología', label: 'Tecnología' },
                                { value: 'Investigación', label: 'Investigación' },
                                { value: 'Diseño', label: 'Diseño' },
                                { value: 'Negocios', label: 'Negocios' }
                            ]}
                            placeholder="Todos los Sectores"
                        />
                    </div>

                    {(selectedModality !== 'Todas' || selectedType !== 'Todos' || selectedSector !== 'Todos') && (
                        <div className="reset-filters-wrapper">
                            <button className="reset-filters-btn-premium" onClick={() => {
                                setSelectedModality('Todas');
                                setSelectedType('Todos');
                                setSelectedSector('Todos');
                            }}>
                                <Icons.X size={14} />
                                Limpiar Filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="opportunities-sections">
                <section className="opp-section">
                    <h3 className="carousel-title" style={{ margin: '20px 0 15px' }}>Vacantes para Trabajo</h3>
                    <div className="opps-grid">
                        {jobs.length === 0 ? (
                            <div className="empty-state">
                                <p>No hay vacantes de trabajo disponibles.</p>
                            </div>
                        ) : (
                            jobsToShow.map(opp => (
                                <OpportunityCard
                                    key={opp.id}
                                    opp={opp}
                                    profile={profile}
                                    userRole={userRole}
                                    user={user}
                                    handleToggleFavorite={handleToggleFavorite}
                                    handleDeleteOpportunity={handleDeleteOpportunity}
                                    handleApproveOpportunity={handleApproveOpportunity}
                                    handleRejectOpportunity={handleRejectOpportunity}
                                />
                            ))
                        )}
                    </div>
                    {jobs.length > 10 && (
                        <div className="show-more-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
                            <button 
                                className="secondary-action-btn" 
                                onClick={() => setShowAllJobs(!showAllJobs)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '20px', fontWeight: 600 }}
                            >
                                {showAllJobs ? (
                                    <>
                                        <Icons.ChevronUp size={16} /> Mostrar menos
                                    </>
                                ) : (
                                    <>
                                        <Icons.ChevronDown size={16} /> Mostrar más ({jobs.length - 10} más)
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </section>

                <section className="opp-section" style={{ marginTop: '40px' }}>
                    <h3 className="carousel-title" style={{ margin: '20px 0 15px' }}>Vacantes para Proyectos</h3>
                    <div className="opps-grid">
                        {projectOpps.length === 0 ? (
                            <div className="empty-state">
                                <p>No hay vacantes de proyectos disponibles.</p>
                            </div>
                        ) : (
                            projectsToShow.map(opp => (
                                <OpportunityCard
                                    key={opp.id}
                                    opp={opp}
                                    profile={profile}
                                    userRole={userRole}
                                    user={user}
                                    handleToggleFavorite={handleToggleFavorite}
                                    handleDeleteOpportunity={handleDeleteOpportunity}
                                    handleApproveOpportunity={handleApproveOpportunity}
                                    handleRejectOpportunity={handleRejectOpportunity}
                                />
                            ))
                        )}
                    </div>
                    {projectOpps.length > 10 && (
                        <div className="show-more-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
                            <button 
                                className="secondary-action-btn" 
                                onClick={() => setShowAllProjects(!showAllProjects)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '20px', fontWeight: 600 }}
                            >
                                {showAllProjects ? (
                                    <>
                                        <Icons.ChevronUp size={16} /> Mostrar menos
                                    </>
                                ) : (
                                    <>
                                        <Icons.ChevronDown size={16} /> Mostrar más ({projectOpps.length - 10} más)
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
