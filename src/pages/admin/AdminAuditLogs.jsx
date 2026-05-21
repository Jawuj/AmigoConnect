import React from 'react';
import Icons from '../../components/shared/Icons';

export default function AdminAuditLogs({ auditLogs = [], showToast }) {
    const actionMap = {
        'UPDATE_USER': 'Actualizó el perfil de',
        'DELETE_USER': 'Eliminó al usuario',
        'UPDATE_PROJECT': 'Modificó el proyecto',
        'DELETE_PROJECT': 'Eliminó el proyecto',
        'APPROVE_PROJECT': 'Aprobó el proyecto',
        'REJECT_PROJECT': 'Rechazó el proyecto',
        'VALIDATE_PROJECT': 'Validó el proyecto',
    };

    const getActionLabel = (action) => actionMap[action] || action;

    const formatDetails = (log) => {
        const { action, details } = log;
        if (!details) return "Sin detalles adicionales.";

        switch (action) {
            case 'UPDATE_USER':
                return `Se aplicaron cambios en el perfil de "${details.name || 'N/A'}".`;
            case 'DELETE_USER':
                return `El usuario "${details.name || 'N/A'}" fue removido permanentemente del sistema.`;
            case 'UPDATE_PROJECT':
                return `Se actualizaron los datos del proyecto "${details.title || 'N/A'}".`;
            case 'DELETE_PROJECT':
                return `El proyecto "${details.title || 'N/A'}" fue eliminado por incumplimiento o solicitud.`;
            default:
                return typeof details === 'string' ? details : JSON.stringify(details);
        }
    };

    const varActionColor = (action) => {
        if (action.includes('DELETE')) return '#ef4444';
        if (action.includes('UPDATE')) return '#f39c12';
        if (action.includes('APPROVE') || action.includes('VALIDATE')) return '#10b981';
        return 'var(--primary-color)';
    };

    const exportToCSV = () => {
        if (auditLogs.length === 0) {
            showToast("No hay registros para exportar", "warning");
            return;
        }

        const headers = ["Fecha", "Administrador", "Accion", "ID Destino", "Detalles"];
        const rows = auditLogs.map(log => [
            log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleString() : 'Hace un momento',
            log.adminName || 'Desconocido',
            getActionLabel(log.action),
            log.targetId || 'N/A',
            formatDetails(log).replace(/"/g, '""')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `auditoria_amigoconnect_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Historial exportado correctamente", "success");
    };

    return (
        <div className="logs-list">
            <div className="admin-table-actions" style={{ borderBottom: '1px solid var(--border-color)', padding: '1.25rem' }}>
                <div className="table-search-group" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '32px', height: '32px', fontSize: '1rem' }}>
                            <Icons.History />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Historial de Actividad</h3>
                    </div>
                    <button className="secondary-action-btn" onClick={exportToCSV}>
                        <Icons.Upload style={{ transform: 'rotate(180deg)', width: 14, height: 14 }} /> Exportar a CSV
                    </button>
                </div>
            </div>
            {auditLogs.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Icons.History style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '1.1rem' }}>No hay registros de auditoría en la base de datos.</p>
                </div>
            ) : (
                <div className="audit-items-container">
                    {auditLogs.map(log => (
                        <div key={log.id} className="log-item-premium">
                            <div className="log-indicator" style={{ backgroundColor: varActionColor(log.action) }}></div>
                            <div className="log-content-wrapper">
                                <div className="log-header-top">
                                    <span className="log-admin-name">
                                        <Icons.Users style={{ width: '14px', marginRight: '6px', opacity: 0.7 }} />
                                        {log.adminName}
                                    </span>
                                    <span className="log-timestamp">
                                        <Icons.Clock style={{ width: '12px', marginRight: '4px', opacity: 0.6 }} />
                                        {log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleString() : 'Recientemente'}
                                    </span>
                                </div>
                                <div className="log-body-text">
                                    <span className="log-action-badge" style={{ color: varActionColor(log.action) }}>
                                        {getActionLabel(log.action)}
                                    </span>
                                    <span className="log-main-detail">
                                        {formatDetails(log)}
                                    </span>
                                </div>
                                <div className="log-footer-id">
                                    <strong>ID Referencia:</strong> <code>{log.targetId}</code>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
