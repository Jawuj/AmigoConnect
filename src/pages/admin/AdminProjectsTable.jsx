import React from 'react';
import Icons from '../../components/shared/Icons';
import CustomSelect from '../../components/shared/CustomSelect';

export default function AdminProjectsTable({ 
    filteredProjects, selectedProjects, setSelectedProjects, handleSelectProject, 
    projectSearch, setProjectSearch, projectStatusFilter, setProjectStatusFilter, 
    projectTRLFilter, setProjectTRLFilter, users, setEditingProject, handleAdminDeleteProject,
    handleApproveProject, handleRejectProject, handleToggleValidation, showToast
}) {
    const exportToCSV = () => {
        if (filteredProjects.length === 0) {
            showToast?.("No hay proyectos para exportar", "warning");
            return;
        }
        const headers = ["Titulo", "Categoria", "Estado", "TRL", "Autor", "Validado"];
        const rows = filteredProjects.map(p => [
            p.title || '',
            p.category || '',
            p.status || '',
            p.maturityLevel || '',
            users[p.authorId]?.firstName || 'Desconocido',
            p.isValidated ? 'Si' : 'No'
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `proyectos_amigoconnect.csv`);
        link.click();
        showToast?.("Lista de proyectos exportada", "success");
    };

    return (
        <>
            <div className="admin-table-actions">
                <div className="table-search-group">
                    <input 
                        type="text" 
                        placeholder="Buscar proyectos..." 
                        className="search-input" 
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                    />
                    <button className="secondary-action-btn" onClick={exportToCSV}>
                        <Icons.Upload style={{ transform: 'rotate(180deg)', width: 14, height: 14 }} /> Exportar CSV
                    </button>
                </div>
                <div className="table-filters" title="filter-container">
                    <CustomSelect 
                        options={[
                            { value: 'all', label: 'Todos los Estados' },
                            { value: 'en_desarrollo', label: 'En Desarrollo' },
                            { value: 'terminado', label: 'Terminado' },
                            { value: 'en_produccion', label: 'En Producción' }
                        ]}
                        value={projectStatusFilter}
                        onChange={(e) => setProjectStatusFilter(e.target.value)}
                    />
                    <CustomSelect 
                        options={[
                            { value: 'all', label: 'Nivel TRL (Cualquiera)' },
                            { value: 'Prototipo', label: 'Prototipo' },
                            { value: 'Beta', label: 'Beta' },
                            { value: 'Estable', label: 'Estable' },
                            { value: 'Producción', label: 'Producción' }
                        ]}
                        value={projectTRLFilter}
                        onChange={(e) => setProjectTRLFilter(e.target.value)}
                    />
                </div>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}><input type="checkbox" onChange={(e) => setSelectedProjects(e.target.checked ? filteredProjects.map(p => p.id) : [])} /></th>
                        <th>Proyecto</th>
                        <th>Categoría</th>
                        <th>Estado</th>
                        <th>TRL</th>
                        <th>Validación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProjects.map(p => (
                        <tr key={p.id}>
                            <td><input type="checkbox" checked={selectedProjects.includes(p.id)} onChange={() => handleSelectProject(p.id)} /></td>
                            <td data-label="Proyecto">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                                    {p.isModified && <span className="badge badge-modified">Modificado</span>}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Por: {users[p.authorId]?.firstName || 'Desconocido'}</div>
                            </td>
                            <td data-label="Categoría">{p.category}</td>
                            <td data-label="Estado">{p.status}</td>
                            <td data-label="TRL">{p.maturityLevel}</td>
                            <td data-label="Validación">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: p.isValidated ? '#15803d' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {p.isValidated ? <Icons.Verified /> : <Icons.Clock />} {p.isValidated ? 'Validado' : 'Pendiente'}
                                    </span>
                                    <div className="action-btns" style={{ marginLeft: 'auto' }}>
                                        <button 
                                            className={`btn-icon ${p.approvalStatus === 'approved' ? 'active-success' : ''}`} 
                                            title="Aprobar / Desaprobar"
                                            onClick={() => handleApproveProject(p)}
                                        >
                                            <Icons.Check />
                                        </button>
                                        {p.approvalStatus === 'pending' && (
                                            <button 
                                                className="btn-icon delete" 
                                                title="Rechazar"
                                                onClick={() => handleRejectProject(p)}
                                            >
                                                <Icons.X />
                                            </button>
                                        )}
                                        <button 
                                            className={`btn-icon ${p.isValidated ? 'active-primary' : ''}`} 
                                            title="Validar / Quitar"
                                            onClick={() => handleToggleValidation(p)}
                                        >
                                            <Icons.Shield />
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td data-label="Acciones">
                                <div className="action-btns">
                                    <button className="btn-icon" title="Editar Info" onClick={() => setEditingProject(p)}>
                                        <Icons.Edit />
                                    </button>
                                    <button className="btn-icon delete" title="Eliminar" onClick={() => handleAdminDeleteProject(p.id)}>
                                        <Icons.Trash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
