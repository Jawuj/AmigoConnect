import React, { useEffect } from 'react';
import Icons from '../shared/Icons';
import CustomSelect from '../shared/CustomSelect';

export default function AdminUserEditModal({
    editingUser, setEditingUser, handleAdminUpdateUser, isUpdating, customConfirm
}) {
    if (!editingUser) return null;

    const handleAttemptClose = async () => {
        const confirmed = await customConfirm(
            '¿Estás seguro de que deseas salir? Los cambios no guardados se perderán.',
            'Sí, salir',
            'Continuar editando'
        );
        if (confirmed) setEditingUser(null);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleAttemptClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleOverlayClick = (e) => {
        if (e.target.className === 'modal-overlay') {
            handleAttemptClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            role: formData.get('role'),
            program: formData.get('program'),
            semester: formData.get('semester'),
            isModified: true
        };
        await handleAdminUpdateUser(editingUser.uid, data);
        setEditingUser(null);
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content premium-modal" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <Icons.Users />
                        <h2>Editar Usuario</h2>
                    </div>
                    <button className="close-btn" type="button" onClick={handleAttemptClose} title="Cerrar">
                        <Icons.X />
                    </button>
                </div>
                <form className="upload-form" onSubmit={handleSubmit}>
                    <section className="modal-section">
                        <h3 className="section-title-modal">Datos Personales</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nombre(s)</label>
                                <input type="text" name="firstName" defaultValue={editingUser.firstName} required />
                            </div>
                            <div className="form-group">
                                <label>Apellido(s)</label>
                                <input type="text" name="lastName" defaultValue={editingUser.lastName} required />
                            </div>
                        </div>
                    </section>

                    <section className="modal-section">
                        <h3 className="section-title-modal">Perfil y Rol</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Rol del Sistema</label>
                                <CustomSelect 
                                    name="role" 
                                    value={editingUser.role} 
                                    options={[
                                        { value: 'student', label: 'Estudiante' },
                                        { value: 'graduate', label: 'Egresado' },
                                        { value: 'teacher', label: 'Profesor' },
                                        { value: 'company', label: 'Empresa' },
                                        { value: 'admin', label: 'Administrador' }
                                    ]} 
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Programa / Entidad</label>
                                <input type="text" name="program" defaultValue={editingUser.program || ''} />
                            </div>
                            {editingUser.role === 'student' && (
                                <div className="form-group full-width">
                                    <label>Semestre Actual</label>
                                    <input type="number" name="semester" defaultValue={editingUser.semester || 1} min="1" max="12" />
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="form-actions-premium">
                        <button type="submit" className="submit-btn premium" disabled={isUpdating}>
                            {isUpdating ? (
                                <span className="loader-small"></span>
                            ) : (
                                <><Icons.Check />Guardar Cambios</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
