import React from 'react';
import { db } from "../../firebase";
import { setDoc, doc } from "firebase/firestore";
import CustomSelect from '../shared/CustomSelect';

function Onboarding({ user, setProfile, setIsNewUser, userRole, setUserRole, showToast }) {
    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const selectedRole = formData.get('role');

        const mail = formData.get('mail')?.trim();
        const phone = formData.get('phone')?.trim();

        if (!mail && !phone) {
            if (showToast) showToast("Debe proporcionar al menos un medio de contacto (Correo o Teléfono)", "warning");
            return;
        }

        const newProfile = {
            uid: user.uid,
            DocumentID: user.uid,
            firstName: formData.get('firstName') || user.displayName?.split(' ')[0] || "",
            lastName: formData.get('lastName') || user.displayName?.split(' ').slice(1).join(' ') || "",
            mail: mail || user.email || "",
            role: selectedRole,
            phone: phone || "",
            biography: formData.get('biography') || "",
            avatarUrl: user.photoURL || "",
            createdAt: new Date().toISOString(),
            favorites: [],
            technicalSkills: [], // Placeholder for competencias_tecnicas
            academicExperience: [], // Placeholder for experiencia_academica
            city: formData.get('city') || "",
            country: formData.get('country') || "",
            availableForInternship: formData.get('availableForInternship') === "true",
            availableForJob: formData.get('availableForJob') === "true"
        };

        // Campos según rol
        if (selectedRole === 'student' || selectedRole === 'graduate') {
            newProfile.program = formData.get('program');
            newProfile.semester = Number(formData.get('semester')) || 1;
            newProfile.github = formData.get('github') || "";
            newProfile.portfolioWeb = formData.get('portfolioWeb') || "";
            newProfile.linkedin = formData.get('linkedin') || "";
            newProfile.educationalLevel = formData.get('educationalLevel') || 'pregrado'; // pregrado, posgrado, egresado...
        }

        try {
            await setDoc(doc(db, "users", user.uid), newProfile);
            setProfile(newProfile);
            setIsNewUser(false); // Salir del flujo de onboarding
            if (showToast) showToast("Perfil configurado exitosamente", "success");
        } catch (error) {
            console.error("Error al guardar perfil:", error);
            if (showToast) showToast("Error al guardar el perfil. Intenta de nuevo.", "error");
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                <h2>¡Hola, {user.displayName}!</h2>
                <p>Completa tu perfil para empezar a explorar y publicar proyectos.</p>
                <form className="onboarding-form" onSubmit={handleOnboardingSubmit}>
                    <div className="form-group">
                        <label>Tipo de Usuario</label>
                        <CustomSelect name="role" required onChange={(e) => setUserRole(e.target.value)} value={userRole || 'student'}
                            options={[
                                { value: "student", label: "Estudiante" },
                                { value: "graduate", label: "Egresado" }
                            ]}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Otros tipos de usuario (Docente, Empresa) deben ser creados desde el panel de administración.
                        </p>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombres</label>
                            <input type="text" name="firstName" defaultValue={user.displayName?.split(' ')[0] || ""} required />
                        </div>
                        <div className="form-group">
                            <label>Apellidos</label>
                            <input type="text" name="lastName" defaultValue={user.displayName?.split(' ').slice(1).join(' ') || ""} required />
                        </div>
                    </div>
                    <div className="onboarding-section">
                        <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--primary-color)' }}>Contacto</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Correo electrónico</label>
                                <input type="email" name="mail" defaultValue={user.email} placeholder="ejemplo@correo.com" />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input type="tel" name="phone" placeholder="Ej: 3001234567" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }} />
                            </div>
                        </div>
                        <p style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                            * Debe completar al menos uno de los dos campos anteriores.
                        </p>
                    </div>
                    {(userRole === 'student' || userRole === 'graduate' || !userRole) && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Programa Académico / Facultad</label>
                                <CustomSelect name="program" value="" required
                                    options={[
                                        { value: "", label: "Selecciona tu carrera" },
                                        { value: "Tecnología en Desarrollo de Software", label: "Tecnología en Desarrollo de Software" },
                                        { value: "Ingeniería de Sistemas", label: "Ingeniería de Sistemas" },
                                        { value: "Administración", label: "Administración" },
                                        { value: "Diseño", label: "Diseño" }
                                    ]}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nivel de Estudios</label>
                                <CustomSelect name="educationalLevel" value="pregrado" required
                                    options={[
                                        { value: "pregrado", label: "Pregrado" },
                                        { value: "posgrado", label: "Posgrado" },
                                        { value: "egresado", label: "Egresado" },
                                        { value: "maestria", label: "Maestría" },
                                        { value: "doctorado", label: "Doctorado" }
                                    ]}
                                />
                            </div>
                        </div>
                    )}
                    {userRole === 'teacher' && (
                        <div className="form-group">
                            <label>Facultad / Área de Especialidad</label>
                            <input type="text" name="program" placeholder="Ej: Facultad de Ingeniería" required />
                        </div>
                    )}
                    <div className="form-row">
                        {(userRole === 'student' || userRole === 'graduate' || !userRole) && (
                            <div className="form-group">
                                <label>Semestre Actual</label>
                                <input type="number" name="semester" min="1" max="10" placeholder="1-10" required />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Biografía Breve</label>
                        <textarea name="biography" rows="2" placeholder="Cuéntanos un poco sobre ti, tus habilidades y objetivos..."></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>LinkedIn (Opcional)</label>
                            <input type="url" name="linkedin" placeholder="https://linkedin.com/..." />
                        </div>
                        <div className="form-group">
                            <label>GitHub (Opcional)</label>
                            <input type="url" name="github" placeholder="https://github.com/..." />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Sitio Web o Portafolio (Opcional)</label>
                        <input type="url" name="portfolioWeb" placeholder="https://mi-portafolio.com" />
                    </div>

                    {(userRole === 'student' || userRole === 'graduate' || !userRole) && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ciudad</label>
                                    <input type="text" name="city" placeholder="Ej: Medellín" />
                                </div>
                                <div className="form-group">
                                    <label>País</label>
                                    <input type="text" name="country" placeholder="Ej: Colombia" />
                                </div>
                            </div>
                            <div className="form-row" style={{ marginTop: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                    <input type="checkbox" name="availableForInternship" value="true" />
                                    Busco prácticas profesionales
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                    <input type="checkbox" name="availableForJob" value="true" />
                                    Busco empleo a tiempo completo
                                </label>
                            </div>
                        </>
                    )}

                    <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>Finalizar Registro</button>
                </form>
            </div >
        </div >
    );
}

export default Onboarding;
