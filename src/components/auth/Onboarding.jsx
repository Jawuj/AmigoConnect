import React from 'react';
import { db } from "../../firebase";
import { setDoc, doc } from "firebase/firestore";

function Onboarding({ user, setProfile, setIsNewUser, userRole, setUserRole }) {
    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const selectedRole = formData.get('role');

        const newProfile = {
            uid: user.uid,
            DocumentID: user.uid,
            name: user.displayName,
            mail: user.email,
            role: selectedRole,
            dni: formData.get('dni'),
            phone: formData.get('phone') || "",
            biography: formData.get('biography') || "",
            avatarUrl: user.photoURL || "",
            createdAt: new Date().toISOString(),
            favorites: [],
            technicalSkills: [], // Placeholder for competencias_tecnicas
            academicExperience: [] // Placeholder for experiencia_academica
        };

        // Campos según rol
        if (selectedRole === 'company') {
            newProfile.program = "Entidad Externa";
            newProfile.semester = "N/A";
            newProfile.github = formData.get('github') || "";
            newProfile.portfolioWeb = formData.get('portfolioWeb') || "";
            newProfile.linkedin = formData.get('linkedin') || "";
        } else if (selectedRole === 'teacher') {
            newProfile.program = formData.get('program'); // Facultad
            newProfile.semester = "N/A";
            newProfile.github = formData.get('github') || "";
            newProfile.portfolioWeb = formData.get('portfolioWeb') || "";
            newProfile.linkedin = formData.get('linkedin') || "";
        } else {
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
        } catch (error) {
            console.error("Error al guardar perfil:", error);
            alert("Error al guardar el perfil. Intenta de nuevo.");
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
                        <select name="role" required onChange={(e) => setUserRole(e.target.value)} value={userRole || 'student'}>
                            <option value="student">Estudiante</option>
                            <option value="graduate">Egresado</option>
                            <option value="teacher">Docente / Investigador</option>
                            <option value="company">Empresa / Reclutador</option>
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>DNI / Documento</label>
                            <input type="text" name="dni" placeholder="Ej: 123456789" required />
                        </div>
                        <div className="form-group">
                            <label>Teléfono (Opcional)</label>
                            <input type="tel" name="phone" placeholder="Ej: 3001234567" />
                        </div>
                    </div>
                    {(userRole === 'student' || userRole === 'graduate' || !userRole) && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Programa Académico / Facultad</label>
                                <select name="program" required>
                                    <option value="">Selecciona tu carrera</option>
                                    <option value="Tecnología en Desarrollo de Software">Tecnología en Desarrollo de Software</option>
                                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                                    <option value="Administración">Administración</option>
                                    <option value="Diseño">Diseño</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nivel de Estudios</label>
                                <select name="educationalLevel" required>
                                    <option value="pregrado">Pregrado</option>
                                    <option value="posgrado">Posgrado</option>
                                    <option value="egresado">Egresado</option>
                                    <option value="maestria">Maestría</option>
                                    <option value="doctorado">Doctorado</option>
                                </select>
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

                    <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>Finalizar Registro</button>
                </form>
            </div>
        </div>
    );
}

export default Onboarding;
