import React from 'react';
import Icons from '../../components/shared/Icons';
import CustomSelect from '../../components/shared/CustomSelect';

export default function AdminOpportunitiesTable({ 
    filteredOpportunities, selectedOpportunities, setSelectedOpportunities, handleSelectOpportunity, 
    opportunitySearch, setOpportunitySearch, opportunityStatusFilter, setOpportunityStatusFilter, 
    handleDeleteOpportunity, handleApproveOpportunity, handleRejectOpportunity, setEditingOpportunity, showToast
}) {
    const exportToCSV = () => {
        if (filteredOpportunities.length === 0) {
            showToast?.("No hay vacantes para exportar", "warning");
            return;
        }
        const headers = ["Titulo", "Empresa", "Categoria", "Estado", "Ubicacion"];
        const rows = filteredOpportunities.map(o => [
            o.title || '',
            o.companyName || 'Empresa Desconocida',
            o.category || '',
            o.approvalStatus || '',
            o.location || ''
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `vacantes_amigoconnect.csv`);
        link.click();
        showToast?.("Lista de vacantes exportada", "success");
    };

    return (
        <>
            <div className="admin-table-actions">
                <div className="table-search-group">
                    <input 
                        type="text" 
                        placeholder="Buscar vacantes..." 
                        className="search-input" 
                        value={opportunitySearch}
                        onChange={(e) => setOpportunitySearch(e.target.value)}
                    />
                    <button className="secondary-action-btn" onClick={exportToCSV}>
                        <Icons.Upload style={{ transform: 'rotate(180deg)', width: 14, height: 14 }} /> Exportar CSV
                    </button>
                </div>
                <div className="table-filters" title="filter-container">
                    <CustomSelect 
                        options={[
                            { value: 'all', label: 'Todos los Estados' },
                            { value: 'approved', label: 'Aprobadas' },
                            { value: 'pending', label: 'Pendientes' },
                            { value: 'rejected', label: 'Rechazadas' }
                        ]}
                        value={opportunityStatusFilter}
                        onChange={(e) => setOpportunityStatusFilter(e.target.value)}
                    />
                </div>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}><input type="checkbox" onChange={(e) => setSelectedOpportunities(e.target.checked ? filteredOpportunities.map(o => o.id) : [])} /></th>
                        <th>Vacante</th>
                        <th>Tipo</th>
                        <th>Categoría/Sector</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOpportunities.map(o => (
                        <tr key={o.id}>
                            <td><input type="checkbox" checked={selectedOpportunities.includes(o.id)} onChange={() => handleSelectOpportunity(o.id)} /></td>
                            <td data-label="Vacante">
                                <div style={{ fontWeight: 600 }}>{o.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Empresa: {o.companyName}</div>
                            </td>
                            <td data-label="Tipo">
                                <span className={`badge ${o.type === 'proyecto' ? 'badge-project' : 'badge-job'}`} style={{ 
                                    background: o.type === 'proyecto' ? 'var(--accent-color)' : 'var(--primary-color)',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem'
                                }}>
                                    {o.type === 'proyecto' ? 'Proyecto' : 'Trabajo'}
                                </span>
                            </td>
                            <td data-label="Categoría/Sector">{o.category || o.sector}</td>
                            <td data-label="Estado">
                                <span className={`badge badge-${o.approvalStatus || 'pending'}`} style={{ textTransform: 'capitalize' }}>
                                    {o.approvalStatus === 'approved' ? 'Aprobada' : o.approvalStatus === 'pending' ? 'Pendiente' : 'Rechazada'}
                                </span>
                            </td>
                            <td data-label="Acciones">
                                <div className="action-btns">
                                    <button 
                                        className={`btn-icon ${o.approvalStatus === 'approved' ? 'active-success' : ''}`} 
                                        title="Aprobar / Desaprobar"
                                        onClick={() => handleApproveOpportunity(o)}
                                    >
                                        <Icons.Check />
                                    </button>
                                    {o.approvalStatus === 'pending' && (
                                        <button 
                                            className="btn-icon delete" 
                                            title="Rechazar"
                                            onClick={() => handleRejectOpportunity(o)}
                                        >
                                            <Icons.X />
                                        </button>
                                    )}
                                    <button 
                                        className="btn-icon" 
                                        title="Editar"
                                        onClick={() => setEditingOpportunity(o)}
                                    >
                                        <Icons.Edit />
                                    </button>
                                    <button className="btn-icon delete" title="Eliminar" onClick={() => handleDeleteOpportunity(o.id)}>
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
