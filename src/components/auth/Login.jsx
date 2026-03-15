import React from 'react';
import { auth, googleProvider, db } from "../../firebase";
import { signInWithPopup, signInAnonymously, signOut } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import Icons from '../shared/Icons';

function Login() {
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const email = result.user.email;
            const domain = email.substring(email.lastIndexOf("@"));

            // 1. Validar dominios y whitelist
            const isInstitutional = email.endsWith('@amigo.edu.co');
            const isSupport = email === 'amigoconnect.support@gmail.com';

            const [companySnap, teacherSnap] = await Promise.all([
                getDoc(doc(db, "whitelist_companies", domain)),
                getDoc(doc(db, "whitelist_teachers", email))
            ]);

            const isAuthorizedCompany = companySnap.exists();
            const isAuthorizedTeacher = teacherSnap.exists();

            if (!isInstitutional && !isSupport && !isAuthorizedCompany && !isAuthorizedTeacher) {
                alert("Acceso denegado. Este correo o dominio no está autorizado.");
                await signOut(auth);
                return;
            }

            // El resto se maneja en el listener onAuthStateChanged
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Error al acceder con Google.");
        }
    };

    const handleGuestLogin = async () => {
        try {
            await signInAnonymously(auth);
            // El listener en App.jsx lo manejará
        } catch (error) {
            console.error("Error al entrar como invitado:", error);
            if (error.code === 'auth/admin-restricted-operation') {
                alert("Debes ir a la consola de Firebase > Authentication > Sign-in method, y habilitar el inicio de sesión 'Anónimo'.");
            } else {
                alert("No se pudo entrar como invitado.");
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-overlay"></div>
            <div className="login-card">
                <div className="login-logo">
                    <img src="./UniversityIsotipo.png" alt="Logo" />
                    <h2>AmigoConnect</h2>
                </div>
                <h1>Bienvenido a la red de proyectos</h1>
                <p>Conéctate con otros estudiantes y comparte tu ingenio.</p>
                <button className="google-login-btn" onClick={handleLogin} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Icons.Google />
                    Entrar con cuenta institucional
                </button>
                <div style={{ margin: '15px 0', textAlign: 'center', color: '#64748b' }}>o</div>
                <button className="secondary-action-btn" onClick={handleGuestLogin} style={{ width: '100%' }}>
                    Entrar como Invitado
                </button>
                <footer className="login-footer">
                    AmigoConnect © 2026
                </footer>
            </div>
        </div>
    );
}

export default Login;
