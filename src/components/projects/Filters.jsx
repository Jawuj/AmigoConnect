import React from 'react';
import Icons from '../shared/Icons';

export default function Filters({
    activeMainFilter, setActiveMainFilter, mainFilters,
    activeSemester, setActiveSemester, semesters,
    activeStatus, setActiveStatus, statuses,
    activeValidationFilter, setActiveValidationFilter,
    activeCategories, setActiveCategories, projectCategories
}) {
    return (
        <nav className="filter-bar">
            <div className="filter-group">
                <label className="filter-label">Facultad:</label>
                <div className="main-filters-group">
                    {mainFilters.map(filter => (
                        <button
                            key={filter}
                            className={`main-filter-btn ${activeMainFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveMainFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-group">
                <label className="filter-label">Semestre:</label>
                <div className="semester-filter">
                    <select
                        className="semester-select"
                        value={activeSemester}
                        onChange={(e) => setActiveSemester(e.target.value)}
                    >
                        {semesters.map(s => (
                            <option key={s} value={s}>{s === 'Todos' ? 'Todos' : `Semestre ${s}`}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="filter-group">
                <label className="filter-label">Estado:</label>
                <div className="semester-filter">
                    <select
                        className="semester-select"
                        value={activeStatus}
                        onChange={(e) => setActiveStatus(e.target.value)}
                    >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="filter-group">
                <label className="filter-label">Validación:</label>
                <div className="semester-filter">
                    <select
                        value={activeValidationFilter}
                        onChange={(e) => setActiveValidationFilter(e.target.value)}
                        className="semester-select"
                    >
                        <option value="Todos">Todos</option>
                        <option value="Validados">Validados</option>
                        <option value="Pendientes">Pendientes</option>
                    </select>
                </div>
            </div>

            <div className="filter-group" style={{ flexGrow: 1 }}>
                <label className="filter-label">Tecnologías:</label>
                <div className="category-tags">
                    {projectCategories.map(cat => {
                        const isActive = activeCategories.includes(cat);
                        return (
                            <button
                                key={cat}
                                className={`tag ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    if (isActive) {
                                        setActiveCategories(activeCategories.filter(c => c !== cat));
                                    } else {
                                        setActiveCategories([...activeCategories, cat]);
                                    }
                                }}
                            >
                                {isActive && <Icons.Check />} {cat}
                            </button>
                        );
                    })}
                    {activeCategories.length > 0 && (
                        <button className="tag-clear" onClick={() => setActiveCategories([])}>Limpiar</button>
                    )}
                </div>
            </div>
        </nav>
    );
}
