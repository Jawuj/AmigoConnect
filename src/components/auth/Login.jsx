import React from 'react';
import { auth, googleProvider, db } from "../../firebase";
import { signInWithPopup, signInAnonymously, signOut } from "firebase/auth";
import { getDoc, doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import Icons from '../shared/Icons';

function Login() {
    const [activeForm, setActiveForm] = React.useState('options');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorMsg, setErrorMsg] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    // ─── Utilidad: iniciar sesión como usuario Firestore (empresa o admin) ─────
    const signInAsFirestoreUser = async (profile) => {
        await signOut(auth);
        await signInAnonymously(auth);
        const anonUser = auth.currentUser;

        // Limpiar todos los proxies de sesión anteriores (evita acumulación)
        try {
            const oldProxiesQ = query(
                collection(db, "users"),
                where("isSessionProxy", "==", true)
            );
            const oldProxiesSnap = await getDocs(oldProxiesQ);
            if (!oldProxiesSnap.empty) {
                const { writeBatch } = await import('firebase/firestore');
                const batch = writeBatch(db);
                oldProxiesSnap.docs.forEach(d => batch.delete(d.ref));
                await batch.commit();
            }
        } catch (err) {
            // No bloquear el login si la limpieza falla
            console.warn("No se pudieron limpiar proxies anteriores:", err);
        }

        // Escribir documento proxy para que Firestore Rules identifique el rol
        await setDoc(doc(db, "users", anonUser.uid), {
            role: profile.role,
            isSessionProxy: true,
            actingAs: profile.uid,
            firstName: profile.firstName || '',
            uid: anonUser.uid
        });

        localStorage.setItem('actingCompanyId', profile.uid);
        window.location.reload();
    };

    // ─── Google / Institucional ────────────────────────────────────────────────
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const email = result.user.email;
            const domain = email.substring(email.lastIndexOf("@"));

            const isInstitutional = email.endsWith('@amigo.edu.co');
            const isSupport = email === 'amigoconnect.support@gmail.com';

            const [companySnap, teacherSnap] = await Promise.all([
                getDoc(doc(db, "whitelist_companies", domain)),
                getDoc(doc(db, "whitelist_teachers", email))
            ]);

            if (!isInstitutional && !isSupport && !companySnap.exists() && !teacherSnap.exists()) {
                alert("Acceso denegado. Este correo o dominio no está autorizado.");
                await signOut(auth);
                return;
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Error al acceder con Google.");
        }
    };

    // ─── Invitado ──────────────────────────────────────────────────────────────
    const handleGuestLogin = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Error al entrar como invitado:", error);
            alert("No se pudo entrar como invitado.");
        }
    };

    // ─── Administrador ─────────────────────────────────────────────────────────
    const submitAdmin = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg('');
        if (!password) { setErrorMsg('Por favor, ingresa la contraseña.'); return; }

        setIsLoading(true);
        try {
            const adminDocRef = doc(db, "users", "system_admin");
            let adminSnap = await getDoc(adminDocRef);

            // Si el admin no existe, lo creamos de manera automática.
            if (!adminSnap.exists()) {
                try {
                    const { initializeSystem } = await import('../../utils/initializeSystem');
                    const initResult = await initializeSystem();
                    if (initResult.success) {
                        adminSnap = await getDoc(adminDocRef);
                    }
                } catch (initErr) {
                    console.error("Error al inicializar el sistema automáticamente:", initErr);
                }
            }

            if (adminSnap.exists()) {
                const adminData = adminSnap.data();
                if (adminData.password === password) {
                    await signInAsFirestoreUser(adminData);
                } else {
                    setErrorMsg('Contraseña incorrecta.');
                }
            } else {
                setErrorMsg('Error al verificar credenciales.');
            }
        } catch (error) {
            console.error("Error signing in as admin:", error);
            setErrorMsg('Error al verificar credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Empresa ───────────────────────────────────────────────────────────────
    const submitCompany = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg('');
        const trimmedUser = username.trim();
        if (!trimmedUser) { setErrorMsg('Por favor, ingresa el usuario.'); return; }
        if (!password) { setErrorMsg('Por favor, ingresa la contraseña.'); return; }

        setIsLoading(true);
        try {
            let foundCompany = null;

            const searchFields = ['firstName', 'mail'];
            for (const field of searchFields) {
                if (foundCompany) break;
                const q = query(
                    collection(db, "users"),
                    where("role", "==", "company"),
                    where(field, "==", trimmedUser)
                );
                const snapshot = await getDocs(q);
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    // Filtrar proxies client-side
                    if (data.password === password && !data.isSessionProxy) foundCompany = data;
                });
            }

            if (foundCompany) {
                await signInAsFirestoreUser(foundCompany);
            } else {
                setErrorMsg('Usuario o contraseña incorrectos.');
            }
        } catch (error) {
            console.error("Error signing in as company:", error);
            setErrorMsg('Error al verificar credenciales.');
        } finally {
            setIsLoading(false);
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

                <div className="login-actions">
                    {activeForm === 'options' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                            <button className="google-login-btn" onClick={handleLogin} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0, width: '100%' }}>
                                <Icons.Google />
                                Entrar con cuenta institucional
                            </button>

                            <button className="secondary-action-btn" onClick={handleGuestLogin} style={{ width: '100%', margin: 0 }}>
                                Entrar como Invitado
                            </button>

                            <button className="secondary-action-btn" onClick={() => { setActiveForm('company'); setUsername(''); setPassword(''); setErrorMsg(''); }} style={{ width: '100%', margin: 0 }}>
                                Entrar como Empresa
                            </button>

                            <button className="secondary-action-btn admin-toggle-btn" onClick={() => { setActiveForm('admin'); setPassword(''); setErrorMsg(''); }} style={{ width: '100%', margin: 0, background: 'transparent', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                                Entrar como Admin
                            </button>
                        </div>
                    )}

                    {activeForm === 'admin' && (
                        <form onSubmit={submitAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                            <div className="form-group" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    Contraseña de Administrador
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoFocus
                                    style={{ padding: '12px', border: '2px solid #eee', borderRadius: 'var(--radius-md)', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            {errorMsg && (
                                <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'left', margin: 0 }}>
                                    {errorMsg}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                <button type="button" className="secondary-action-btn" onClick={() => setActiveForm('options')} style={{ flex: 1, margin: 0, padding: '10px 15px' }}>
                                    Volver
                                </button>
                                <button type="submit" className="submit-btn" disabled={isLoading} style={{ flex: 1, margin: 0, padding: '10px 15px', fontSize: '1rem' }}>
                                    {isLoading ? 'Verificando...' : 'Entrar'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeForm === 'company' && (
                        <form onSubmit={submitCompany} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                            <div className="form-group" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    Usuario / Empresa
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nombre o usuario de la empresa"
                                    autoFocus
                                    style={{ padding: '12px', border: '2px solid #eee', borderRadius: 'var(--radius-md)', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div className="form-group" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{ padding: '12px', border: '2px solid #eee', borderRadius: 'var(--radius-md)', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            {errorMsg && (
                                <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'left', margin: 0 }}>
                                    {errorMsg}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                <button type="button" className="secondary-action-btn" onClick={() => setActiveForm('options')} style={{ flex: 1, margin: 0, padding: '10px 15px' }}>
                                    Volver
                                </button>
                                <button type="submit" className="submit-btn" disabled={isLoading} style={{ flex: 1, margin: 0, padding: '10px 15px', fontSize: '1rem' }}>
                                    {isLoading ? 'Verificando...' : 'Entrar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <footer className="login-footer" style={{ marginTop: '20px' }}>
                    AmigoConnect © 2026
                </footer>
            </div>
        </div>
    );
}

export default Login;
