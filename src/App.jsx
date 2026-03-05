import { useState, useEffect } from 'react'
import './App.css'
import { auth, googleProvider, db, storage } from "./firebase";
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";
import { collection, onSnapshot, query, doc, getDoc, setDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ICONOS SVG
const Icons = {
    Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    Logout: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    External: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
    Rocket: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.09-2.91a2.18 2.18 0 0 0-3.09-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="m9 12 2.55 2.55"></path><path d="m15 9-2 2"></path></svg>,
    Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    Plus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    School: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
    Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
    Github: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
};

function App() {
    const [activeMainFilter, setActiveMainFilter] = useState('Todos');
    const [activeCategories, setActiveCategories] = useState([]); // Array para multi-selección
    const [activeSemester, setActiveSemester] = useState('Todos');
    const [activeStatus, setActiveStatus] = useState('Todos');
    const [activeValidationFilter, setActiveValidationFilter] = useState('Todos'); // 'Todos' | 'Validados' | 'Pendientes'

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'student' | 'teacher' | 'company'
    const [authLoading, setAuthLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [opportunities, setOpportunities] = useState([]); // Nuevas vacantes
    const [users, setUsers] = useState({}); // Mapa de todos los usuarios por ID
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingProject, setEditingProject] = useState(null); // Proyecto que estamos editando

    // Gestión de Vistas
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'profile' | 'details' | 'opportunities'
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isOppModalOpen, setIsOppModalOpen] = useState(false);

    const mainFilters = ['Todos', 'Tecnología', 'Ingeniería'];
    const projectCategories = ['Web', 'Móvil', 'IA', 'IoT', 'Ciberseguridad', 'Data Science'];
    const semesters = ['Todos', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const statuses = ['Todos', 'Estable', 'Beta', 'En Desarrollo'];

    // 0. Manejar estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                setUser(currentUser);
                if (currentUser) {
                    const email = currentUser.email;
                    const domain = email.substring(email.lastIndexOf("@"));

                    // 1. Verificar roles en paralelo para mayor velocidad
                    const [teacherSnap, companySnap] = await Promise.all([
                        getDoc(doc(db, "whitelist_teachers", email)),
                        getDoc(doc(db, "whitelist_companies", domain))
                    ]);

                    let assignedRole = 'student';
                    if (teacherSnap.exists()) {
                        assignedRole = 'teacher';
                    } else if (companySnap.exists()) {
                        assignedRole = 'company';
                    }

                    setUserRole(assignedRole);

                    // 2. Obtener perfil
                    const docSnap = await getDoc(doc(db, "users", currentUser.uid));
                    if (docSnap.exists()) {
                        setProfile(docSnap.data());
                    } else {
                        setProfile(null);
                    }
                } else {
                    setProfile(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error("Error en el listener de autenticación:", error);
            } finally {
                setAuthLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // 1. Escuchar Usuarios en tiempo real
    useEffect(() => {
        const qUsers = query(collection(db, "users"));
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const usersData = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                usersData[doc.id] = data;
                // También indexamos por el campo DocumentID si el usuario lo usa como ID personalizado
                if (data.DocumentID) {
                    usersData[String(data.DocumentID)] = data;
                }
            });
            setUsers(usersData);
        });
        return () => unsubscribeUsers();
    }, []);

    // 2. Escuchar Proyectos en tiempo real
    useEffect(() => {
        const qProjects = query(collection(db, "projects"));
        const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjects(projectsData);
        });
        return () => unsubscribeProjects();
    }, []);
    // 3. Escuchar Oportunidades en tiempo real
    useEffect(() => {
        const qOpps = query(collection(db, "opportunities"));
        const unsubscribeOpps = onSnapshot(qOpps, (snapshot) => {
            const oppsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOpportunities(oppsData);
        });
        return () => unsubscribeOpps();
    }, []);

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const email = result.user.email;
            const domain = email.substring(email.lastIndexOf("@"));

            // 1. Validar dominios permitidos
            // Permitimos: @amigo.edu.co, soporte, o dominios en whitelist_companies
            const companyWhitelistRef = doc(db, "whitelist_companies", domain);
            const companyWhitelistSnap = await getDoc(companyWhitelistRef);

            const isInstitutional = email.endsWith('@amigo.edu.co');
            const isSupport = email === 'amigoconnect.support@gmail.com';
            const isAuthorizedCompany = companyWhitelistSnap.exists();

            if (!isInstitutional && !isSupport && !isAuthorizedCompany) {
                alert("Acceso denegado. Este correo o dominio no está autorizado.");
                await signOut(auth);
                return;
            }

            // El resto se maneja en el listener onAuthStateChanged
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
    };


    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const selectedRole = formData.get('role') || userRole; // Prioridad al del form

        const newProfile = {
            uid: user.uid,
            DocumentID: user.uid,
            name: user.displayName,
            mail: user.email,
            role: selectedRole,
            dni: formData.get('dni'),
            program: formData.get('program'),
            semester: formData.get('semester') || "N/A",
            github: formData.get('github'),
            avatarUrl: user.photoURL || "",
            createdAt: new Date().toISOString()
        };

        try {
            await setDoc(doc(db, "users", user.uid), newProfile);
            setProfile(newProfile);
        } catch (error) {
            console.error("Error al guardar perfil:", error);
            alert("Error al guardar el perfil. Intenta de nuevo.");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedProfile = {
            ...profile,
            name: formData.get('name'),
            program: formData.get('program'),
            semester: Number(formData.get('semester')),
            github: formData.get('github')
        };

        try {
            await updateDoc(doc(db, "users", user.uid), updatedProfile);
            setProfile(updatedProfile);
            setIsEditingProfile(false);
            alert("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            alert("No se pudo actualizar el perfil");
        }
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsUploading(true);
        const formData = new FormData(e.target);
        const imageFile = formData.get('image');
        let imageUrl = editingProject?.imageUrl || "";

        try {
            // 1. Subir imagen si se selecciona una nueva
            if (imageFile && imageFile.size > 0) {
                const storageRef = ref(storage, `project_images/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // 2. Preparar datos
            const projectData = {
                title: formData.get('title'),
                mainFilter: formData.get('mainFilter') || 'Tecnología',
                category: formData.get('category'),
                problemSolved: formData.get('problemSolved'),
                targetAudience: formData.get('targetAudience'),
                techArchitecture: formData.get('techArchitecture'),
                license: formData.get('license'),
                team: formData.get('team'),
                semester: Number(formData.get('semester')),
                status: formData.get('status'),
                techStack: formData.get('techStack').split(',').map(item => item.trim()),
                demoUrl: formData.get('demoUrl'),
                imageUrl: imageUrl,
                authorId: user.uid,
                updatedAt: serverTimestamp()
            };

            if (editingProject) {
                await updateDoc(doc(db, "projects", editingProject.id), projectData);
                alert("¡Proyecto actualizado con éxito!");
            } else {
                projectData.createdAt = serverTimestamp();
                projectData.isValidated = false;
                await addDoc(collection(db, "projects"), projectData);
                alert("¡Proyecto compartido con éxito!");
            }

            setIsUploadModalOpen(false);
            setEditingProject(null);
        } catch (error) {
            console.error("Error al procesar proyecto:", error);
            alert("Hubo un error. Intenta de nuevo.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleValidation = async (project) => {
        if (userRole !== 'teacher') return;
        try {
            await updateDoc(doc(db, "projects", project.id), {
                isValidated: !project.isValidated,
                validatedBy: project.isValidated ? null : user.uid,
                validatedAt: project.isValidated ? null : serverTimestamp()
            });
            alert(project.isValidated ? "Validación removida" : "Proyecto validado correctamente");
        } catch (error) {
            console.error("Error al cambiar validación:", error);
            alert("No se pudo procesar la solicitud");
        }
    };

    const handleOppSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const oppData = {
                title: formData.get('title'),
                company: profile?.name || user.displayName,
                companyId: user.uid,
                description: formData.get('description'),
                modality: formData.get('modality'),
                type: formData.get('type'),
                salary: formData.get('salary'),
                location: formData.get('location'),
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, "opportunities"), oppData);
            alert("¡Oportunidad publicada!");
            setIsOppModalOpen(false);
        } catch (error) {
            console.error("Error al publicar vacante:", error);
            alert("Error al publicar");
        }
    };

    const handleLogout = () => {
        signOut(auth);
        setActiveView('dashboard');
    };

    const handleProfileClick = () => {
        setActiveView('profile');
    };

    const handleProjectClick = (projectId) => {
        setSelectedProjectId(projectId);
        setActiveView('details');
    };

    const goToDashboard = () => {
        setActiveView('dashboard');
        setSelectedProjectId(null);
    };

    if (authLoading) return <div className="loading-screen">Cargando...</div>;

    // VISTA DE LOGIN
    if (!user) {
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
                    <button className="google-login-btn" onClick={handleLogin}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.png" alt="Google" />
                        Entrar con cuenta institucional
                    </button>
                    <footer className="login-footer">
                        AmigoConnect © 2026
                    </footer>
                </div>
            </div>
        );
    }

    // VISTA DE ONBOARDING (REGISTRO)
    if (user && !profile) {
        return (
            <div className="onboarding-page">
                <div className="onboarding-card">
                    <h2>¡Hola, {user.displayName}!</h2>
                    <p>Completa tu perfil para empezar a explorar y publicar proyectos.</p>
                    <form className="onboarding-form" onSubmit={handleOnboardingSubmit}>
                        <div className="form-group">
                            <label>Tipo de Usuario</label>
                            <select name="role" required>
                                <option value="student">Estudiante</option>
                                <option value="graduate">Egresado</option>
                                <option value="company">Empresa / Reclutador</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>DNI / Documento</label>
                            <input type="text" name="dni" placeholder="Ej: 123456789" required />
                        </div>
                        <div className="form-group">
                            <label>Programa Académico</label>
                            <select name="program" required>
                                <option value="">Selecciona tu carrera</option>
                                <option value="Tecnología en Desarrollo de Software">Tecnología en Desarrollo de Software</option>
                                <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                            </select>
                        </div>
                        <div className="form-row">
                            {userRole === 'student' && (
                                <div className="form-group">
                                    <label>Semestre Actual</label>
                                    <input type="number" name="semester" min="1" max="10" placeholder="1-10" required />
                                </div>
                            )}
                            <div className="form-group">
                                <label>GitHub (Opcional)</label>
                                <input type="url" name="github" placeholder="https://github.com/usuario" />
                            </div>
                        </div>
                        <button type="submit" className="submit-btn">Finalizar Registro</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="logo-container" onClick={goToDashboard} style={{ cursor: 'pointer' }}>
                    <span className="logo-icon"><img src="./UniversityIsotipo.png" alt="Logo" /></span>
                    <span className="logo-text">AmigoConnect</span>
                </div>

                <div className="header-nav">
                    <button className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={goToDashboard}>Inicio</button>
                    <button className={`nav-link ${activeView === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveView('opportunities')}>Oportunidades</button>
                </div>

                <div className="search-container">
                    <span className="search-icon"><Icons.Search /></span>
                    <input type="text" placeholder="Buscar proyectos" className="search-input" />
                </div>

                <div className="header-actions">
                    <button className="icon-button" title="Notificaciones"><Icons.Bell /></button>
                    <div className="user-profile-info" onClick={handleProfileClick} title="Mi Perfil">
                        <div className="user-profile-img">
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Yo" />
                            ) : (
                                <span>{(profile?.name || user?.displayName || 'U').charAt(0)}</span>
                            )}
                        </div>
                        <span className="user-profile-name">
                            {profile ? profile.name.split(' ')[0] : user?.displayName?.split(' ')[0]}
                        </span>
                    </div>
                    <button className="icon-button" onClick={handleLogout} title="Cerrar sesión"><Icons.Logout /></button>
                </div>
            </header>

            {activeView === 'dashboard' && (
                <>
                    <nav className="filter-bar">
                        <div className="filter-group">
                            <label className="filter-label">Facultad:</label>
                            <div className="main-filters-group">
                                {mainFilters.map(filter => (
                                    <button
                                        key={filter}
                                        className={`main-filter-btn ${activeMainFilter === filter ? 'active' : ''}`}
                                        onClick={() => setActiveMainFilter(filter)}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Semestre:</label>
                            <div className="semester-filter">
                                <select
                                    className="semester-select"
                                    value={activeSemester}
                                    onChange={(e) => setActiveSemester(e.target.value)}
                                >
                                    {semesters.map(s => (
                                        <option key={s} value={s}>{s === 'Todos' ? 'Todos' : `Semestre ${s}`}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Estado:</label>
                            <div className="semester-filter">
                                <select
                                    className="semester-select"
                                    value={activeStatus}
                                    onChange={(e) => setActiveStatus(e.target.value)}
                                >
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Validación:</label>
                            <div className="semester-filter">
                                <select
                                    value={activeValidationFilter}
                                    onChange={(e) => setActiveValidationFilter(e.target.value)}
                                    className="semester-select"
                                >
                                    <option value="Todos">Todos</option>
                                    <option value="Validados">Validados</option>
                                    <option value="Pendientes">Pendientes</option>
                                </select>
                            </div>
                        </div>

                        <div className="filter-group" style={{ flexGrow: 1 }}>
                            <label className="filter-label">Tecnologías:</label>
                            <div className="category-tags">
                                {projectCategories.map(cat => {
                                    const isActive = activeCategories.includes(cat);
                                    return (
                                        <button
                                            key={cat}
                                            className={`tag ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                if (isActive) {
                                                    setActiveCategories(activeCategories.filter(c => c !== cat));
                                                } else {
                                                    setActiveCategories([...activeCategories, cat]);
                                                }
                                            }}
                                        >
                                            {isActive && <Icons.Check />} {cat}
                                        </button>
                                    );
                                })}
                                {activeCategories.length > 0 && (
                                    <button className="tag-clear" onClick={() => setActiveCategories([])}>Limpiar</button>
                                )}
                            </div>
                        </div>
                    </nav>

                    <main className="main-content">
                        <div className="section-header">
                            <h2 className="section-title">Explorar Proyectos</h2>
                        </div>

                        {(() => {
                            const filteredProjects = projects.filter(project => {
                                const matchMain = activeMainFilter === 'Todos' || project.mainFilter === activeMainFilter;
                                const matchSemester = activeSemester === 'Todos' || String(project.semester) === activeSemester;
                                const matchStatus = activeStatus === 'Todos' || project.status === activeStatus;
                                const matchCategory = activeCategories.length === 0 || activeCategories.includes(project.category);
                                const matchValidation = activeValidationFilter === 'Todos' ||
                                    (activeValidationFilter === 'Validados' && project.isValidated) ||
                                    (activeValidationFilter === 'Pendientes' && !project.isValidated);
                                return matchMain && matchSemester && matchStatus && matchCategory && matchValidation;
                            });

                            if (filteredProjects.length === 0) {
                                return (
                                    <div className="empty-state">
                                        <p>No se encontraron proyectos con los filtros seleccionados.</p>
                                        <button className="tag-clear" onClick={() => {
                                            setActiveMainFilter('Todos');
                                            setActiveSemester('Todos');
                                            setActiveStatus('Todos');
                                            setActiveCategories([]);
                                            setActiveValidationFilter('Todos');
                                        }}>Limpiar Filtros</button>
                                    </div>
                                );
                            }

                            return (
                                <div className="project-grid">
                                    {filteredProjects.map(project => {
                                        const projectAuthor = users[project.authorId] || {};
                                        const isAuthor = user?.uid === project.authorId;
                                        return (
                                            <article key={project.id} className="project-card" onClick={() => handleProjectClick(project.id)} style={{ cursor: 'pointer' }}>
                                                <div
                                                    className="card-banner"
                                                    style={{
                                                        backgroundImage: project.imageUrl ? `url(${project.imageUrl})` : 'none',
                                                        backgroundColor: project.imageUrl ? 'transparent' : '#e6b38a',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }}>
                                                    <span className="tag-semester">Semestre {project.semester || 'N/A'}</span>
                                                    {project.isValidated && <span className="badge-validated">Validado</span>}
                                                    {isAuthor && (
                                                        <button
                                                            className="edit-card-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingProject(project);
                                                                setIsUploadModalOpen(true);
                                                            }}
                                                            title="Editar Proyecto"
                                                        >
                                                            <Icons.Edit />
                                                        </button>
                                                    )}
                                                    {userRole === 'teacher' && (
                                                        <button
                                                            className={`validate-card-btn ${project.isValidated ? 'unvalidate' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleValidation(project);
                                                            }}
                                                            title={project.isValidated ? "Quitar Validación" : "Validar Proyecto"}
                                                        >
                                                            <Icons.Check />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="card-body">
                                                    <h3 className="card-title">{project.title}</h3>
                                                    <p className="card-description">{project.problemSolved || project.description}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <small className="tech-stack">
                                                            {Array.isArray(project.techStack) ? project.techStack.slice(0, 3).join(', ') : project.techStack}
                                                        </small>
                                                        {project.demoUrl && (
                                                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="demo-link-small" onClick={(e) => e.stopPropagation()}>Demo
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="card-footer">
                                                    <div className="author-info">
                                                        <div className="author-avatar">
                                                            {projectAuthor.avatarUrl ? (
                                                                <img src={projectAuthor.avatarUrl} alt={projectAuthor.name} />
                                                            ) : (
                                                                (projectAuthor.name || 'E').charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="author-details">
                                                            <span className="author-name">{projectAuthor.name || 'Cargando...'}</span>
                                                            {projectAuthor.program && <small className="author-program">{projectAuthor.program}</small>}
                                                        </div>
                                                    </div>
                                                    <span className="card-date">{project.status}</span>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </main>
                </>
            )}

            {activeView === 'opportunities' && (
                <div className="opportunities-view">
                    <div className="section-header">
                        <h2 className="section-title">Oportunidades Laborales y Prácticas</h2>
                        {userRole === 'company' && (
                            <button className="primary-action-btn" onClick={() => setIsOppModalOpen(true)}>
                                <Icons.Plus /> Publicar Vacante
                            </button>
                        )}
                    </div>

                    <div className="opps-grid">
                        {opportunities.length === 0 ? (
                            <div className="empty-state">
                                <p>No hay vacantes publicadas en este momento.</p>
                            </div>
                        ) : (
                            opportunities.map(opp => (
                                <article key={opp.id} className="opp-card">
                                    <div className="opp-header">
                                        <div className="company-logo-small">
                                            {opp.companyLogo ? <img src={opp.companyLogo} alt={opp.company} /> : opp.company?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="opp-title">{opp.title}</h3>
                                            <span className="opp-company">{opp.company}</span>
                                        </div>
                                    </div>
                                    <div className="opp-body">
                                        <p>{opp.description}</p>
                                        <div className="opp-tags">
                                            <span className="opp-tag">{opp.modality}</span>
                                            <span className="opp-tag">{opp.type}</span>
                                            <span className="opp-tag">{opp.salary}</span>
                                        </div>
                                    </div>
                                    <div className="opp-footer">
                                        <button className="secondary-action-btn" style={{ width: '100%' }}>Postularme Ahora</button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeView === 'profile' && (
                <div className="profile-view">
                    <div className="profile-header-card">
                        <div className="profile-info-main">
                            <div className="profile-avatar-large">
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Yo" />
                                ) : (
                                    <div className="author-avatar" style={{ width: '100%', height: '100%', fontSize: '3rem' }}>
                                        {(profile?.name || user?.displayName || 'U').charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="profile-details-text">
                                {isEditingProfile ? (
                                    <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                                        <input type="text" name="name" defaultValue={profile?.name || user?.displayName} placeholder="Nombre" required />
                                        <div className="form-row">
                                            <input type="text" name="program" defaultValue={profile?.program} placeholder="Carrera" required />
                                            <input type="number" name="semester" defaultValue={profile?.semester} placeholder="Semestre" required />
                                        </div>
                                        <input type="text" name="github" defaultValue={profile?.github} placeholder="Usuario Github" />
                                        <div className="form-actions-inline">
                                            <button type="submit" className="primary-action-btn"><Icons.Check /> Guardar</button>
                                            <button type="button" className="secondary-action-btn" onClick={() => setIsEditingProfile(false)}>Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h1>{profile?.name || user?.displayName}</h1>
                                        <div className="profile-subtext">
                                            <span><Icons.School /> {profile?.program} • Semestre {profile?.semester}</span>
                                            <span><Icons.Mail /> {user?.email}</span>
                                            {profile?.github && (
                                                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="profile-link">
                                                    <Icons.Github /> github.com/{profile.github.split('/').pop()}
                                                </a>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        {!isEditingProfile && (
                            <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}>
                                <Icons.Edit /> Editar Perfil
                            </button>
                        )}
                    </div>

                    <div className="profile-sections-grid">
                        <section>
                            <h3 className="profile-section-title">Mi Hoja de Vida</h3>
                            <div className="resume-upload-section">
                                {profile?.resumeUrl ? (
                                    <div>
                                        <p>✅ Hoja de vida cargada correctamente.</p>
                                        <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
                                            <Icons.External /> Ver documento actual
                                        </a>
                                    </div>
                                ) : (
                                    <div>
                                        <p>Aún no has subido tu hoja de vida.</p>
                                        <button className="secondary-action-btn" style={{ maxWidth: '200px', margin: '10px auto' }} onClick={() => alert("Próximamente: Subir PDF")}>
                                            <Icons.Upload /> Subir PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section>
                            <h3 className="profile-section-title">Mis Proyectos ({projects.filter(p => p.authorId === user.uid).length})</h3>
                            <div className="project-grid">
                                {projects.filter(p => p.authorId === user.uid).map(project => (
                                    <article key={project.id} className="project-card" onClick={() => handleProjectClick(project.id)} style={{ cursor: 'pointer' }}>
                                        <div className="card-banner" style={{ backgroundImage: `url(${project.imageUrl})`, backgroundSize: 'cover' }}>
                                            <span className="tag-semester">Semestre {project.semester}</span>
                                        </div>
                                        <div className="card-body">
                                            <h3 className="card-title">{project.title}</h3>
                                            <small className="tech-stack">{Array.isArray(project.techStack) ? project.techStack.slice(0, 2).join(', ') : project.techStack}</small>
                                        </div>
                                    </article>
                                ))}
                                {projects.filter(p => p.authorId === user.uid).length === 0 && (
                                    <p>Aún no has publicado proyectos.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeView === 'details' && selectedProjectId && (
                <div className="details-view">
                    <nav className="breadcrumb">
                        <span onClick={goToDashboard}>Explorar</span> / <span>Proyecto</span>
                    </nav>

                    {(() => {
                        const project = projects.find(p => p.id === selectedProjectId);
                        if (!project) return <p>Proyecto no encontrado</p>;
                        const author = users[project.authorId] || {};

                        return (
                            <>
                                <div className="details-grid">
                                    <div className="details-main">
                                        <img src={project.imageUrl} alt={project.title} className="details-main-image" />
                                        <div className="details-content">
                                            <div className="details-meta">
                                                <span className="details-tag">Semestre {project.semester}</span>
                                                <span className="details-tag">{project.category}</span>
                                            </div>
                                            <h1>{project.title}</h1>

                                            <div className="author-strip" onClick={() => setActiveView('profile')} style={{ cursor: 'pointer' }}>
                                                {author.avatarUrl ? <img src={author.avatarUrl} alt={author.name} /> : <div className="author-avatar">{(author.name || 'U').charAt(0)}</div>}
                                                <div>
                                                    <strong>{author.name}</strong> • <small>{author.program}</small>
                                                </div>
                                            </div>

                                            <div className="details-description">
                                                <h3>Sobre el proyecto</h3>
                                                <p>{project.problemSolved}</p>
                                            </div>

                                            {project.techArchitecture && (
                                                <div className="details-description">
                                                    <h3>Arquitectura Técnica</h3>
                                                    <p>{project.techArchitecture}</p>
                                                </div>
                                            )}

                                            {project.team && (
                                                <div className="details-description">
                                                    <h3>Equipo Desarrollador</h3>
                                                    <p>{project.team}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <aside className="details-sidebar">
                                        <div className="sidebar-card">
                                            <h3 className="sidebar-title">Detalles del Recurso</h3>
                                            <div className="detail-item">
                                                <span className="detail-label">Tecnología</span>
                                                <span className="detail-value">{Array.isArray(project.techStack) ? project.techStack.join(', ') : project.techStack}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Estado</span>
                                                <span className="detail-value">{project.status}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Público</span>
                                                <span className="detail-value">{project.targetAudience}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Licencia</span>
                                                <span className="detail-value">{project.license}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Publicado</span>
                                                <span className="detail-value">Marzo 2026</span>
                                            </div>

                                            {project.demoUrl && (
                                                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="primary-action-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                                                    🚀 Ver Demo Online
                                                </a>
                                            )}
                                            <button className="secondary-action-btn">⭐ Guardar en Favoritos</button>
                                        </div>
                                    </aside>
                                </div>

                                <div className="more-author-section">
                                    <h3 className="profile-section-title">Otros proyectos de este autor</h3>
                                    <div className="project-grid">
                                        {projects.filter(p => p.authorId === project.authorId && p.id !== project.id).slice(0, 3).map(p => (
                                            <article key={p.id} className="project-card" onClick={() => handleProjectClick(p.id)} style={{ cursor: 'pointer' }}>
                                                <div className="card-banner" style={{ backgroundImage: `url(${p.imageUrl})`, backgroundSize: 'cover' }}></div>
                                                <div className="card-body">
                                                    <h3 className="card-title">{p.title}</h3>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            {userRole === 'student' && (
                <button className="fab" onClick={() => setIsUploadModalOpen(true)}>+</button>
            )}

            {isUploadModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingProject ? 'Editar Proyecto' : 'Subir Nuevo Proyecto'}</h2>
                            <button className="close-btn" onClick={() => { setIsUploadModalOpen(false); setEditingProject(null); }}>×</button>
                        </div>
                        <form className="upload-form" onSubmit={handleProjectSubmit}>
                            <div className="form-group">
                                <label>Título del Proyecto</label>
                                <input type="text" name="title" defaultValue={editingProject?.title} placeholder="Ej: Sistema de Riego IoT" required />
                            </div>

                            <div className="form-group">
                                <label>Facultad / Programa</label>
                                <select name="mainFilter" defaultValue={editingProject?.mainFilter || "Tecnología"} required>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Ingeniería">Ingeniería</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select name="category" defaultValue={editingProject?.category} required>
                                        {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select name="status" defaultValue={editingProject?.status} required>
                                        {statuses.filter(s => s !== 'Todos').map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Problema Solucionado</label>
                                <textarea name="problemSolved" rows="2" defaultValue={editingProject?.problemSolved} placeholder="¿Qué problema resuelve este proyecto?" required></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Público Objetivo</label>
                                    <input type="text" name="targetAudience" defaultValue={editingProject?.targetAudience} placeholder="Ej: Niños, Empresas..." required />
                                </div>
                                <div className="form-group">
                                    <label>Licencia</label>
                                    <select name="license" defaultValue={editingProject?.license || "MIT"}>
                                        <option value="MIT">MIT</option>
                                        <option value="GPL">GPL</option>
                                        <option value="Apache">Apache</option>
                                        <option value="Propietaria">Propietaria</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Arquitectura Técnica</label>
                                <textarea name="techArchitecture" rows="2" defaultValue={editingProject?.techArchitecture} placeholder="Ej: MVC, Microservicios, Serverless..." required></textarea>
                            </div>

                            <div className="form-group">
                                <label>Equipo Desarrollador (Opcional)</label>
                                <input type="text" name="team" defaultValue={editingProject?.team} placeholder="Nombres de los integrantes separados por comas" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Semestre</label>
                                    <input type="number" name="semester" min="1" max="10" defaultValue={editingProject?.semester} placeholder="1-10" required />
                                </div>
                                <div className="form-group">
                                    <label>Demo URL (Opcional)</label>
                                    <input type="url" name="demoUrl" defaultValue={editingProject?.demoUrl} placeholder="https://..." />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Stack Tecnológico (separado por comas)</label>
                                <input type="text" name="techStack" defaultValue={editingProject?.techStack?.join(', ')} placeholder="React, Node.js, Firebase" required />
                            </div>

                            <div className="form-group">
                                <label>Captura del Proyecto {editingProject ? '(Opcional si no cambias)' : '(Imagen)'}</label>
                                <input type="file" name="image" accept="image/*" required={!editingProject} />
                            </div>

                            <button type="submit" className="submit-btn" disabled={isUploading}>
                                {isUploading ? "Guardando..." : (editingProject ? "Actualizar Proyecto" : "Publicar Proyecto")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {isOppModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Publicar Nueva Oportunidad</h2>
                            <button className="close-btn" onClick={() => setIsOppModalOpen(false)}>×</button>
                        </div>
                        <form className="upload-form" onSubmit={handleOppSubmit}>
                            <div className="form-group">
                                <label>Cargo / Título</label>
                                <input type="text" name="title" placeholder="Ej: Desarrollador Backend Junior" required />
                            </div>
                            <div className="form-group">
                                <label>Descripción de la Vacante</label>
                                <textarea name="description" rows="4" placeholder="Describe los requisitos y responsabilidades..." required></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Modalidad</label>
                                    <select name="modality" required>
                                        <option value="Remoto">Remoto</option>
                                        <option value="Presencial">Presencial</option>
                                        <option value="Híbrido">Híbrido</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select name="type" required>
                                        <option value="Tiempo Completo">Tiempo Completo</option>
                                        <option value="Práctica / Pasantía">Práctica / Pasantía</option>
                                        <option value="Medio Tiempo">Medio Tiempo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Salario / Remuneración</label>
                                    <input type="text" name="salary" placeholder="Ej: $2.500.000 o 'A convenir'" />
                                </div>
                                <div className="form-group">
                                    <label>Ubicación</label>
                                    <input type="text" name="location" placeholder="Ciudad o 'Cualquiera'" />
                                </div>
                            </div>
                            <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>Publicar Vacante</button>
                        </form>
                    </div>
                </div>
            )}

            <footer className="dashboard-footer">
                <div className="footer-left">
                    AmigoConnect © 2026 Plataforma de Gestión de Proyectos Académicos. Todos los derechos reservados.
                </div>
                <div className="footer-links">
                    <a href="#">Privacidad</a>
                    <a href="#">Términos</a>
                    <a href="mailto:amigoconnect.support@gmail.com">Contacto</a>
                </div>
            </footer>
        </div>
    )
}

export default App