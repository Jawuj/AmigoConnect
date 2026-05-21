import React, { useState, useMemo } from 'react';
import Icons from '../components/shared/Icons';
import AdminStats from './admin/AdminStats';
import AdminUsersTable from './admin/AdminUsersTable';
import AdminProjectsTable from './admin/AdminProjectsTable';
import AdminOpportunitiesTable from './admin/AdminOpportunitiesTable';
import AdminAuditLogs from './admin/AdminAuditLogs';
import AdminCreateCompanyModal from '../components/modals/AdminCreateCompanyModal';
import AdminUserEditModal from '../components/modals/AdminUserEditModal';
import UploadProjectModal from '../components/modals/UploadProjectModal';
import UploadOpportunityModal from '../components/modals/UploadOpportunityModal';
import '../styles/admin.css';
export default function AdminPage({ 
    users, 
    projects, 
    handleAdminUpdateUser, 
    handleAdminDeleteUser, 
    handleAdminUpdateProject, 
    handleAdminDeleteProject,
    handleApproveProject,
    handleRejectProject,
    handleToggleValidation,
    auditLogs = [],
    opportunities = [],
    handleApproveOpportunity,
    handleRejectOpportunity,
    handleDeleteOpportunity,
    handleUpdateOpportunity,
    handleAdminCreateCompany,
    setViewedUserId,
    setActiveView,
    showToast,
    customConfirm
}) {
    const [activeTab, setActiveTab] = useState('users');
    const [userSearch, setUserSearch] = useState('');
    const [projectSearch, setProjectSearch] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [selectedOpportunities, setSelectedOpportunities] = useState([]);
    
    const [opportunitySearch, setOpportunitySearch] = useState('');
    const [opportunityStatusFilter, setOpportunityStatusFilter] = useState('all');
    
    // Edición
    const [editingUser, setEditingUser] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [editingOpportunity, setEditingOpportunity] = useState(null);
    const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Filtros
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [projectStatusFilter, setProjectStatusFilter] = useState('all');
    const [projectTRLFilter, setProjectTRLFilter] = useState('all');

    // Stats
    const stats = useMemo(() => {
        const usersList = Object.values(users);
        return {
            totalUsers: usersList.length,
            totalProjects: projects.length,
            totalOpportunities: opportunities.length,
            validatedProjects: projects.filter(p => p.isValidated).length,
            pendingApprovals: projects.filter(p => p.approvalStatus === 'pending').length + opportunities.filter(o => o.approvalStatus === 'pending').length
        };
    }, [users, projects, opportunities]);

    const handleStatClick = (type) => {
        if (type === 'users') {
            setActiveTab('users');
            setUserRoleFilter('all');
        } else if (type === 'projects') {
            setActiveTab('projects');
            setProjectStatusFilter('all');
        } else if (type === 'opportunities') {
            setActiveTab('opportunities');
            setOpportunityStatusFilter('all');
        } else if (type === 'pending') {
            const pendingProj = projects.filter(p => p.approvalStatus === 'pending').length;
            const pendingOpp = opportunities.filter(o => o.approvalStatus === 'pending').length;
            if (pendingOpp > pendingProj) {
                setActiveTab('opportunities');
                setOpportunityStatusFilter('pending');
            } else {
                setActiveTab('projects');
                setProjectStatusFilter('pending');
            }
        } else if (type === 'validated') {
             setActiveTab('projects');
             setProjectStatusFilter('all');
        }
    };

    const filteredUsers = useMemo(() => {
        return Object.values(users).filter(u => {
            const matchesSearch = ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase().includes(userSearch.toLowerCase());
            const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, userSearch, userRoleFilter]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = (p.title || '').toLowerCase().includes(projectSearch.toLowerCase());
            const matchesStatus = projectStatusFilter === 'all' || p.status === projectStatusFilter;
            const matchesTRL = projectTRLFilter === 'all' || p.maturityLevel === projectTRLFilter;
            return matchesSearch && matchesStatus && matchesTRL;
        });
    }, [projects, projectSearch, projectStatusFilter, projectTRLFilter]);

    const filteredOpportunities = useMemo(() => {
        return opportunities.filter(o => {
            const matchesSearch = (o.title || '').toLowerCase().includes(opportunitySearch.toLowerCase()) || 
                                 (o.companyName || '').toLowerCase().includes(opportunitySearch.toLowerCase());
            const matchesStatus = opportunityStatusFilter === 'all' || o.approvalStatus === opportunityStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [opportunities, opportunitySearch, opportunityStatusFilter]);

    const handleSelectUser = (id) => {
        setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
    };

    const handleSelectProject = (id) => {
        setSelectedProjects(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    };

    const handleSelectOpportunity = (id) => {
        setSelectedOpportunities(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);
    };

    const handleBulkDeleteUsers = async () => {
        if (!selectedUsers.length) return;
        const confirmed = await customConfirm(`¿Estás seguro de que deseas eliminar ${selectedUsers.length} usuarios?`);
        if (confirmed) {
            await Promise.all(selectedUsers.map(uid => handleAdminDeleteUser(uid, true)));
            showToast(`${selectedUsers.length} usuarios eliminados con éxito`, 'success');
            setSelectedUsers([]);
        }
    };

    const handleBulkDeleteProjects = async () => {
        if (!selectedProjects.length) return;
        const confirmed = await customConfirm(`¿Estás seguro de que deseas eliminar ${selectedProjects.length} proyectos?`);
        if (confirmed) {
            await Promise.all(selectedProjects.map(pid => handleAdminDeleteProject(pid, true)));
            showToast(`${selectedProjects.length} proyectos eliminados con éxito`, 'success');
            setSelectedProjects([]);
        }
    };

    const handleBulkDeleteOpportunities = async () => {
        if (!selectedOpportunities.length) return;
        const confirmed = await customConfirm(`¿Estás seguro de que deseas eliminar ${selectedOpportunities.length} vacantes?`);
        if (confirmed) {
            await Promise.all(selectedOpportunities.map(oid => handleDeleteOpportunity(oid, true, true)));
            showToast(`${selectedOpportunities.length} vacantes eliminadas con éxito`, 'success');
            setSelectedOpportunities([]);
        }
    };

    const handleConfirmDeleteUser = async (uid) => {
        const targetUser = users[uid];
        const confirmed = await customConfirm(`¿Estás seguro de que deseas eliminar a ${targetUser?.firstName} ${targetUser?.lastName}?`);
        if (confirmed) {
            await handleAdminDeleteUser(uid);
        }
    };

    const handleConfirmDeleteProject = async (pid) => {
        const targetProj = projects.find(p => p.id === pid);
        const confirmed = await customConfirm(`¿Estás seguro de que deseas eliminar el proyecto "${targetProj?.title}"?`);
        if (confirmed) {
            await handleAdminDeleteProject(pid);
        }
    };

    const handleProjectUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        const formData = new FormData(e.target);
        const data = {};
        formData.forEach((value, key) => {
            if (key !== 'image') data[key] = value;
        });
        
        // Convertir techStack a array
        if (data.techStack) {
            data.techStack = data.techStack.split(',').map(s => s.trim());
        }

        data.isModified = true;

        await handleAdminUpdateProject(editingProject.id, data);
        setIsUploading(false);
        setEditingProject(null);
    };

    const handleOppUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        const formData = new FormData(e.target);
        const data = {};
        formData.forEach((value, key) => {
            if (key !== 'type') {
                data[key] = value;
            }
        });
        
        if (editingOpportunity?.type === 'proyecto') {
            data.sector = formData.get('sector') || "";
        }

        const success = await handleUpdateOpportunity(editingOpportunity.id, data);
        setIsUploading(false);
        if (success) {
            setEditingOpportunity(null);
        }
    };

    return (
        <div className="admin-container view-fade-in">
            <header className="admin-header">
                <div className="admin-title-group">
                    <h1>Panel de Administración</h1>
                    <p>Gestión global de AmigoConnect y auditoría de cambios.</p>
                </div>
                <div className="bulk-actions">
                    {activeTab === 'users' && selectedUsers.length > 0 && (
                        <button className="submit-btn delete-bg" onClick={handleBulkDeleteUsers}>
                            <Icons.Trash /> Eliminar ({selectedUsers.length})
                        </button>
                    )}
                    {activeTab === 'projects' && selectedProjects.length > 0 && (
                        <button className="submit-btn delete-bg" onClick={handleBulkDeleteProjects}>
                            <Icons.Trash /> Eliminar ({selectedProjects.length})
                        </button>
                    )}
                    {activeTab === 'opportunities' && selectedOpportunities.length > 0 && (
                        <button className="submit-btn delete-bg" onClick={handleBulkDeleteOpportunities}>
                            <Icons.Trash /> Eliminar ({selectedOpportunities.length})
                        </button>
                    )}
                </div>
            </header>

            <AdminStats stats={stats} onStatClick={handleStatClick} />

            <nav className="admin-tabs">
                <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    <Icons.Users /> Usuarios
                </button>
                <button className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
                    <Icons.Briefcase /> Proyectos
                </button>
                <button className={`admin-tab ${activeTab === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveTab('opportunities')}>
                    <Icons.Briefcase /> Vacantes
                </button>
                <button className={`admin-tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
                    <Icons.History /> Auditoría
                </button>
            </nav>

            <div className="admin-table-container">
                {activeTab === 'users' && (
                    <AdminUsersTable 
                        filteredUsers={filteredUsers}
                        selectedUsers={selectedUsers}
                        setSelectedUsers={setSelectedUsers}
                        handleSelectUser={handleSelectUser}
                        userSearch={userSearch}
                        setUserSearch={setUserSearch}
                        userRoleFilter={userRoleFilter}
                        setUserRoleFilter={setUserRoleFilter}
                        setEditingUser={setEditingUser}
                        handleAdminDeleteUser={handleConfirmDeleteUser}
                        setViewedUserId={setViewedUserId}
                        setActiveView={setActiveView}
                        onOpenCreateCompany={() => setIsCreateCompanyOpen(true)}
                        showToast={showToast}
                    />
                )}

                {activeTab === 'projects' && (
                    <AdminProjectsTable 
                        filteredProjects={filteredProjects}
                        selectedProjects={selectedProjects}
                        setSelectedProjects={setSelectedProjects}
                        handleSelectProject={handleSelectProject}
                        projectSearch={projectSearch}
                        setProjectSearch={setProjectSearch}
                        projectStatusFilter={projectStatusFilter}
                        setProjectStatusFilter={setProjectStatusFilter}
                        projectTRLFilter={projectTRLFilter}
                        setProjectTRLFilter={setProjectTRLFilter}
                        users={users}
                        setEditingProject={setEditingProject}
                        handleAdminDeleteProject={handleConfirmDeleteProject}
                        handleApproveProject={handleApproveProject}
                        handleRejectProject={handleRejectProject}
                        handleToggleValidation={handleToggleValidation}
                        showToast={showToast}
                    />
                )}

                {activeTab === 'opportunities' && (
                    <AdminOpportunitiesTable 
                        filteredOpportunities={filteredOpportunities}
                        selectedOpportunities={selectedOpportunities}
                        setSelectedOpportunities={setSelectedOpportunities}
                        handleSelectOpportunity={handleSelectOpportunity}
                        opportunitySearch={opportunitySearch}
                        setOpportunitySearch={setOpportunitySearch}
                        opportunityStatusFilter={opportunityStatusFilter}
                        setOpportunityStatusFilter={setOpportunityStatusFilter}
                        handleDeleteOpportunity={handleDeleteOpportunity}
                        handleApproveOpportunity={handleApproveOpportunity}
                        handleRejectOpportunity={handleRejectOpportunity}
                        setEditingOpportunity={setEditingOpportunity}
                        showToast={showToast}
                    />
                )}

                {activeTab === 'logs' && (
                    <AdminAuditLogs auditLogs={auditLogs} showToast={showToast} />
                )}
            </div>

            {editingUser && (
                <AdminUserEditModal 
                    editingUser={editingUser}
                    setEditingUser={setEditingUser}
                    handleAdminUpdateUser={handleAdminUpdateUser}
                    isUpdating={isUploading}
                    customConfirm={customConfirm}
                />
            )}

            {editingProject && (
                <UploadProjectModal 
                    editingProject={editingProject}
                    setEditingProject={setEditingProject}
                    setIsUploadModalOpen={() => setEditingProject(null)}
                    handleProjectSubmit={handleProjectUpdateSubmit}
                    handleDeleteProject={() => handleConfirmDeleteProject(editingProject.id)}
                    isUploading={isUploading}
                    users={users}
                    customConfirm={customConfirm}
                />
            )}

            {editingOpportunity && (
                <UploadOpportunityModal 
                    editingOpportunity={editingOpportunity}
                    setIsOppModalOpen={() => setEditingOpportunity(null)}
                    handleOppSubmit={handleOppUpdateSubmit}
                    oppModalType={editingOpportunity.type === 'proyecto' ? 'project' : 'job'}
                />
            )}

            {isCreateCompanyOpen && (
                <AdminCreateCompanyModal 
                    isOpen={isCreateCompanyOpen}
                    onClose={() => setIsCreateCompanyOpen(false)}
                    onCreateCompany={handleAdminCreateCompany}
                    isSaving={isUploading}
                    customConfirm={customConfirm}
                />
            )}
        </div>
    );
}
