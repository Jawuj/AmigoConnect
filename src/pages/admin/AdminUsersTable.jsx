import React from 'react';
import Icons from '../../components/shared/Icons';
import CustomSelect from '../../components/shared/CustomSelect';

export default function AdminUsersTable({ 
    filteredUsers, selectedUsers, setSelectedUsers, handleSelectUser, 
    userSearch, setUserSearch, userRoleFilter, setUserRoleFilter, 
    setEditingUser, handleAdminDeleteUser, setViewedUserId, setActiveView, onOpenCreateCompany, showToast
}) {
    const exportToCSV = () => {
        if (filteredUsers.length === 0) {
            showToast?.("No hay usuarios para exportar", "warning");
            return;
        }
        const headers = ["Nombre", "Apellido", "Correo", "Rol", "Programa", "Semestre"];
        const rows = filteredUsers.map(u => [
            u.firstName || '',
            u.lastName || '',
            u.mail || '',
            u.role || '',
            u.program || 'N/A',
            u.semester || 'N/A'
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `usuarios_amigoconnect.csv`);
        link.click();
        showToast?.("Lista de usuarios exportada", "success");
    };

    return (
        <>
            <div className="admin-table-actions">
                <div className="table-search-group">
                    <input 
                        type="text" 
                        placeholder="Buscar usuarios..." 
                        className="search-input" 
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                    />
                    <button className="secondary-action-btn" onClick={exportToCSV}>
                        <Icons.Upload style={{ transform: 'rotate(180deg)', width: 14, height: 14 }} /> Exportar CSV
                    </button>
                    <button className="submit-btn" onClick={onOpenCreateCompany}>
                        <Icons.Plus style={{ width: 14, height: 14 }} /> Crear Empresa
                    </button>
                </div>
                <div className="table-filters">
                    <CustomSelect 
                        options={[
                            { value: 'all', label: 'Todos los Roles' },
                            { value: 'student', label: 'Estudiantes' },
                            { value: 'graduate', label: 'Egresados' },
                            { value: 'teacher', label: 'Profesores' },
                            { value: 'company', label: 'Empresas' }
                        ]}
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                    />
                </div>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}><input type="checkbox" onChange={(e) => setSelectedUsers(e.target.checked ? filteredUsers.map(u => u.uid) : [])} /></th>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Programa / Entidad</th>
                        <th>Estado / Semestre</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(u => (
                        <tr key={u.uid}>
                            <td><input type="checkbox" checked={selectedUsers.includes(u.uid)} onChange={() => handleSelectUser(u.uid)} /></td>
                            <td data-label="Usuario">
                                <div className="user-cell" onClick={() => { 
                                    if (typeof setViewedUserId === 'function') {
                                        setViewedUserId(u.uid);
                                        setActiveView?.('profile');
                                    } else {
                                        console.error('setViewedUserId is not a function inside AdminUsersTable', setViewedUserId);
                                    }
                                }} style={{ cursor: 'pointer' }}>
                                    <div className="user-avatar">{u.firstName?.charAt(0)}</div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                                            {u.isModified && <span className="badge badge-modified">Modificado</span>}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.mail}</div>
                                    </div>
                                </div>
                            </td>
                            <td data-label="Rol"><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                            <td data-label="Programa">{u.program || 'N/A'}</td>
                            <td data-label="Estado">{u.role === 'student' ? `Semestre ${u.semester}` : (u.role === 'graduate' ? 'Egresado' : 'Activo')}</td>
                            <td data-label="Acciones">
                                <div className="action-btns">
                                    <button className="btn-icon" title="Editar" onClick={() => setEditingUser(u)}>
                                        <Icons.Edit />
                                    </button>
                                    <button className="btn-icon delete" title="Eliminar" onClick={() => handleAdminDeleteUser(u.uid)}>
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
