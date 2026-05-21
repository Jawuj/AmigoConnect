import React from 'react';
import Icons from '../../components/shared/Icons';

export default function AdminStats({ stats, onStatClick }) {
    return (
        <div className="admin-stats-grid">
            <div className="admin-stat-card clickable" onClick={() => onStatClick('users')}>
                <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}><Icons.Users /></div>
                <div className="stat-info">
                    <h3>{stats.totalUsers}</h3>
                    <p>Usuarios Totales</p>
                </div>
            </div>
            <div className="admin-stat-card clickable" onClick={() => onStatClick('projects')}>
                <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}><Icons.Briefcase /></div>
                <div className="stat-info">
                    <h3>{stats.totalProjects}</h3>
                    <p>Proyectos Activos</p>
                </div>
            </div>
            <div className="admin-stat-card clickable" onClick={() => onStatClick('opportunities')}>
                <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}><Icons.FileText /></div>
                <div className="stat-info">
                    <h3>{stats.totalOpportunities}</h3>
                    <p>Vacantes / Oportunidades</p>
                </div>
            </div>
            <div className="admin-stat-card clickable" onClick={() => onStatClick('validated')}>
                <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}><Icons.CheckCircle /></div>
                <div className="stat-info">
                    <h3>{stats.validatedProjects}</h3>
                    <p>Validados Institucionalmente</p>
                </div>
            </div>
            <div className="admin-stat-card clickable" onClick={() => onStatClick('pending')}>
                <div className="stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}><Icons.AlertTriangle /></div>
                <div className="stat-info">
                    <h3>{stats.pendingApprovals}</h3>
                    <p>Pendientes de Revisión</p>
                </div>
            </div>
        </div>
    );
}
