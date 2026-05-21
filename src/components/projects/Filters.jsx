import React, { useState } from 'react';
import Icons from '../shared/Icons';
import CustomSelect from '../shared/CustomSelect';

export default function Filters({
    activeMainFilter, setActiveMainFilter, mainFilters,
    activeSemester, setActiveSemester, semesters,
    activeStatus, setActiveStatus, statuses,
    activeCategories, setActiveCategories, projectCategories,
    activeView, viewMode, setViewMode
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const activeCount = (activeMainFilter !== 'Todos' ? 1 : 0) + 
                       (activeSemester !== 'Todos' ? 1 : 0) + 
                       (activeStatus !== 'Todos' ? 1 : 0) + 
                       activeCategories.length;

    return (
        <>
            <button 
                className="mobile-only mobile-filter-trigger"
                onClick={() => setIsMobileOpen(true)}
            >
                <Icons.Filter size={18} />
                <span>Filtrar contenido</span>
                {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
                <Icons.ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            </button>

            <aside className={`sidebar-filters ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="mobile-only sidebar-mobile-header">
                    <h3>Filtros</h3>
                    <button className="close-sidebar" onClick={() => setIsMobileOpen(false)}>
                        <Icons.X size={24} />
                    </button>
                </div>

                <div className="sidebar-section hide-on-mobile">
                    <h4 className="sidebar-title">Vista</h4>
                    <div className="view-mode-sidebar-toggle">
                        <button 
                            className={`view-sidebar-btn ${viewMode === 'carousel' ? 'active' : ''}`}
                            onClick={() => setViewMode('carousel')}
                        >
                            <Icons.Layout size={18} />
                            Carrusel
                        </button>
                        <button 
                            className={`view-sidebar-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Icons.Grid size={18} />
                            Cuadrícula
                        </button>
                    </div>
                </div>

                <div className="sidebar-section">
                    <h4 className="sidebar-title">Facultad</h4>
                    <div className="sidebar-list">
                        {mainFilters.map(filter => (
                            <button
                                key={filter}
                                className={`sidebar-list-item ${activeMainFilter === filter ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveMainFilter(filter);
                                    // Optionally close on mobile if desired, but industrial standard usually has an 'Apply' button or lets them pick multiple
                                }}
                            >
                                <span className="dot"></span>
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {activeView !== 'users' && (
                    <div className="sidebar-section">
                        <h4 className="sidebar-title">Categorías</h4>
                        <div className="sidebar-chips">
                        {projectCategories.map(cat => {
                            const isActive = activeCategories.includes(cat);
                            return (
                                <button
                                    key={cat}
                                    className={`filter-chip ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        if (isActive) {
                                            setActiveCategories(activeCategories.filter(c => c !== cat));
                                        } else {
                                            setActiveCategories([...activeCategories, cat]);
                                        }
                                    }}
                                >
                                    {cat}
                                    {isActive && <Icons.X size={12} className="chip-close" />}
                                </button>
                            );
                        })}
                    </div>
                    {activeCategories.length > 0 && (
                        <button className="clear-all-btn" onClick={() => setActiveCategories([])}>
                            Limpiar Selección
                        </button>
                        )}
                    </div>
                )}

                {activeView !== 'users' && (
                    <div className="sidebar-section">
                        <h4 className="sidebar-title">Avanzado</h4>
                        <div className="sidebar-dropdowns">
                        <div className="dropdown-group">
                            <label>Semestre</label>
                            <CustomSelect
                                className="variant-sidebar"
                                value={activeSemester}
                                onChange={(e) => setActiveSemester(e.target.value)}
                                options={semesters.map(s => ({ value: s, label: s === 'Todos' ? 'Todos los semestres' : `Semestre ${s}` }))}
                            />
                        </div>
                        <div className="dropdown-group">
                            <label>Estado</label>
                            <CustomSelect
                                className="variant-sidebar"
                                value={activeStatus}
                                onChange={(e) => setActiveStatus(e.target.value)}
                                options={statuses.map(s => ({ value: s, label: s }))}
                            />
                        </div>
                    </div>
                    </div>
                )}

                <div className="mobile-only sidebar-mobile-footer">
                    <button className="apply-btn" onClick={() => setIsMobileOpen(false)}>
                        Aplicar Filtros
                    </button>
                </div>
            </aside>

            {isMobileOpen && <div className="sidebar-overlay mobile-only" onClick={() => setIsMobileOpen(false)}></div>}
        </>
    );
}
