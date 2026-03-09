import React from 'react';
import { db } from "../../firebase";
import { setDoc, doc } from "firebase/firestore";

function Onboarding({ user, setProfile, userRole, setUserRole }) {
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
            avatarUrl: user.photoURL || "",
            createdAt: new Date().toISOString(),
            favorites: []
        };

        // Campos según rol
        if (selectedRole === 'company') {
            newProfile.program = "Entidad Externa";
            newProfile.semester = "N/A";
            newProfile.github = formData.get('github') || "";
        } else if (selectedRole === 'teacher') {
            newProfile.program = formData.get('program'); // Facultad
            newProfile.semester = "N/A";
            newProfile.github = formData.get('github') || "";
        } else {
            newProfile.program = formData.get('program');
            newProfile.semester = formData.get('semester');
            newProfile.github = formData.get('github') || "";
        }

        try {
            await setDoc(doc(db, "users", user.uid), newProfile);
            setProfile(newProfile);
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
                    <div className="form-group">
                        <label>DNI / Documento</label>
                        <input type="text" name="dni" placeholder="Ej: 123456789" required />
                    </div>
                    {(userRole === 'student' || userRole === 'graduate' || !userRole) && (
                        <div className="form-group">
                            <label>Programa Académico</label>
                            <select name="program" required>
                                <option value="">Selecciona tu carrera</option>
                                <option value="Tecnología en Desarrollo de Software">Tecnología en Desarrollo de Software</option>
                                <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                            </select>
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
                        <div className="form-group">
                            <label>
                                {userRole === 'company' ? 'Sitio Web / LinkedIn' :
                                    userRole === 'teacher' ? 'Perfil Investigador / LinkedIn' : 'GitHub (Opcional)'}
                            </label>
                            <input type="text" name="github" placeholder="https://..." />
                        </div>
                    </div>
                    <button type="submit" className="submit-btn">Finalizar Registro</button>
                </form>
            </div>
        </div>
    );
}

export default Onboarding;
