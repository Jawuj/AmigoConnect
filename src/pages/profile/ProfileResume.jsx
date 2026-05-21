import React from 'react';
import Icons from '../../components/shared/Icons';

export default function ProfileResume({ 
    displayProfile, isOwnProfile, user, userRole, isUploading, uploadProgress, handleFileUpload 
}) {
    const isTeacher = displayProfile?.role === 'teacher';
    
    if (!isOwnProfile && userRole !== 'admin' && !isTeacher) return null;
    if (!isOwnProfile && userRole !== 'admin' && isTeacher && !displayProfile?.program && !displayProfile?.mail) return null;

    return (
        <section>
            <h3 className="profile-section-title">
                {isTeacher ? 'Información Profesional' : 'Hoja de Vida'}
            </h3>
            <div className="resume-upload-section">
                {isTeacher ? (
                    <div className="teacher-info-card">
                        {displayProfile?.program && <p><strong>Docente de la facultad:</strong> {displayProfile?.program}</p>}
                        {(isOwnProfile || userRole === 'admin') && (displayProfile?.mail || isOwnProfile) && (
                            <p><strong>Contacto Privado:</strong> {displayProfile?.mail || (isOwnProfile ? user?.email : '')}</p>
                        )}
                        {displayProfile?.github && (
                            <a href={displayProfile.github} target="_blank" rel="noopener noreferrer" className="resume-link">
                                <Icons.External /> Perfil Profesional
                            </a>
                        )}
                    </div>
                ) : (displayProfile?.resumeUrl && (isOwnProfile || userRole === 'admin')) ? (
                    <div>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Check /> Hoja de vida {isOwnProfile ? 'cargada correctamente' : 'disponible'}.</p>
                        <a href={displayProfile.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
                            <Icons.External /> Ver documento {isOwnProfile ? 'actual' : ''}
                        </a>
                        {isOwnProfile && (
                            <div style={{ marginTop: '15px' }}>
                                <label className="upload-trigger-btn secondary">
                                    <Icons.Edit /> Reemplazar Documento
                                    <input 
                                        type="file" 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => handleFileUpload(e.target.files[0])}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                ) : (
                    isOwnProfile && (
                        <div className="upload-placeholder">
                            <div className="upload-icon-circle"><Icons.Upload /></div>
                            <p>Aún no has subido tu hoja de vida</p>
                            <small>Sube tu CV en PDF, Word o Imagen.</small>
                            <div className="upload-btn-container">
                                <label className="upload-trigger-btn">
                                    <Icons.Plus /> Seleccionar Archivo
                                    <input 
                                        type="file" 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => handleFileUpload(e.target.files[0])}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        disabled={isUploading}
                                    />
                                </label>
                                {isUploading && (
                                    <div className="upload-progress-container">
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                        <span>{Math.round(uploadProgress)}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    );
}
