import { useState, useEffect } from 'react'
import './App.css'
import { auth, googleProvider, db } from "./firebase";
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";
import { collection, onSnapshot, query, doc, getDoc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function App() {
    const [activeMainFilter, setActiveMainFilter] = useState('Ingeniería');
    const [activeCategory, setActiveCategory] = useState('IA');
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState({}); // Mapa de todos los usuarios por ID
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Gestión de Vistas
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'profile' | 'details'
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const mainFilters = ['Tecnología', 'Ingeniería'];
    const categories = ['IA', 'Web Dev', 'Ciberseguridad', 'Data Science', 'IoT'];

    // 0. Manejar estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Verificar si tiene perfil en Firestore
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }
            setAuthLoading(false);
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

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
    };


    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newProfile = {
            uid: user.uid,
            DocumentID: user.uid, // Usamos el UID como DocumentID para consistencia
            name: user.displayName,
            mail: user.email,
            dni: formData.get('dni'),
            program: formData.get('program'),
            semester: formData.get('semester'),
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

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsUploading(true);
        const formData = new FormData(e.target);
        const imageFile = formData.get('image');
        let imageUrl = "";

        try {
            // 1. Subir imagen si existe
            if (imageFile && imageFile.size > 0) {
                const storageRef = ref(storage, `project_images/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // 2. Crear documento en Firestore
            const projectData = {
                title: formData.get('title'),
                category: formData.get('category'),
                problemSolved: formData.get('problemSolved'),
                semester: Number(formData.get('semester')),
                status: formData.get('status'),
                techStack: formData.get('techStack').split(',').map(item => item.trim()),
                demoUrl: formData.get('demoUrl'),
                imageUrl: imageUrl,
                authorId: user.uid,
                isValidated: false,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "projects"), projectData);

            setIsUploadModalOpen(false);
            alert("¡Proyecto subido con éxito!");
        } catch (error) {
            console.error("Error al subir proyecto:", error);
            alert("Hubo un error al subir el proyecto. Intenta de nuevo.");
        } finally {
            setIsUploading(false);
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
                        <h2>AmigoConect</h2>
                    </div>
                    <h1>Bienvenido a la red de proyectos</h1>
                    <p>Conéctate con otros estudiantes y comparte tu ingenio.</p>
                    <button className="google-login-btn" onClick={handleLogin}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.png" alt="Google" />
                        Entrar con cuenta institucional
                    </button>
                    <footer className="login-footer">
                        AmigoConect © 2026
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
                            <div className="form-group">
                                <label>Semestre Actual</label>
                                <input type="number" name="semester" min="1" max="10" placeholder="1-10" required />
                            </div>
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
                    <span className="logo-text">AmigoConect</span>
                </div>

                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Buscar proyectos" className="search-input" />
                </div>

                <div className="header-actions">
                    <button className="icon-button">🔔</button>
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
                    <button className="icon-button" onClick={handleLogout} title="Cerrar sesión">🚪</button>
                </div>
            </header>

            {activeView === 'dashboard' && (
                <>
                    <nav className="filter-bar">
                        <div className="semester-filter">
                            <select className="semester-select">
                                <option>Semestre: Todos</option>
                                <option>Semestre 1</option>
                                <option>Semestre 2</option>
                                <option>Semestre 3</option>
                            </select>
                        </div>

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

                        <div className="category-tags">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`tag ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <main className="main-content">
                        <div className="section-header">
                            <h2 className="section-title">Explorar Proyectos</h2>
                        </div>

                        <div className="project-grid">
                            {projects.map(project => {
                                const projectAuthor = users[project.authorId] || {};
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
                                        </div>
                                        <div className="card-body">
                                            <h3 className="card-title">{project.title}</h3>
                                            <p className="card-description">{project.problemSolved || project.description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <small className="tech-stack">
                                                    {Array.isArray(project.techStack) ? project.techStack.slice(0, 3).join(', ') : project.techStack}
                                                </small>
                                                {project.demoUrl && (
                                                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="demo-link-small" onClick={(e) => e.stopPropagation()}>
                                                        🌐 Demo
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
                    </main>
                </>
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
                                <h1>{profile?.name || user?.displayName}</h1>
                                <div className="profile-subtext">
                                    <span>🎓 {profile?.program} • Semestre {profile?.semester}</span>
                                    <span>📧 {user?.email}</span>
                                    {profile?.github && (
                                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="profile-link">
                                            🔗 github.com/{profile.github.split('/').pop()}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button className="edit-profile-btn" onClick={() => alert("Próximamente: Editar perfil")}>
                            <span>✏️</span> Editar Perfil
                        </button>
                    </div>

                    <div className="profile-sections-grid">
                        <section>
                            <h3 className="profile-section-title">Mi Hoja de Vida</h3>
                            <div className="resume-upload-section">
                                {profile?.resumeUrl ? (
                                    <div>
                                        <p>✅ Hoja de vida cargada correctamente.</p>
                                        <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
                                            📄 Ver documento actual
                                        </a>
                                    </div>
                                ) : (
                                    <div>
                                        <p>Aún no has subido tu hoja de vida.</p>
                                        <button className="secondary-action-btn" style={{ maxWidth: '200px', margin: '10px auto' }} onClick={() => alert("Próximamente: Subir PDF")}>
                                            📤 Subir PDF
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

            <button className="fab" onClick={() => setIsUploadModalOpen(true)}>+</button>

            {isUploadModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Subir Nuevo Proyecto</h2>
                            <button className="close-btn" onClick={() => setIsUploadModalOpen(false)}>×</button>
                        </div>
                        <form className="upload-form" onSubmit={handleProjectSubmit}>
                            <div className="form-group">
                                <label>Título del Proyecto</label>
                                <input type="text" name="title" placeholder="Ej: Sistema de Riego IoT" required />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select name="category" required>
                                        <option value="Web">Web</option>
                                        <option value="Móvil">Móvil</option>
                                        <option value="IA">IA</option>
                                        <option value="IoT">IoT</option>
                                        <option value="Ciberseguridad">Ciberseguridad</option>
                                        <option value="Data Science">Data Science</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select name="status" required>
                                        <option value="Estable">Estable</option>
                                        <option value="Beta">Beta</option>
                                        <option value="En Desarrollo">En Desarrollo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Problema Solucionado / Descripción</label>
                                <textarea name="problemSolved" rows="3" placeholder="Describe brevemente qué hace tu proyecto..." required></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Semestre</label>
                                    <input type="number" name="semester" min="1" max="10" placeholder="1-10" required />
                                </div>
                                <div className="form-group">
                                    <label>Demo URL (Opcional)</label>
                                    <input type="url" name="demoUrl" placeholder="https://..." />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Stack Tecnológico (separado por comas)</label>
                                <input type="text" name="techStack" placeholder="React, Node.js, Firebase" required />
                            </div>

                            <div className="form-group">
                                <label>Captura del Proyecto (Imagen)</label>
                                <input type="file" name="image" accept="image/*" required />
                            </div>

                            <button type="submit" className="submit-btn" disabled={isUploading}>
                                {isUploading ? "Subiendo..." : "Publicar Proyecto"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <footer className="dashboard-footer">
                <div className="footer-left">
                    AmigoConect © 2026 Plataforma de Gestión de Proyectos Académicos. Todos los derechos reservados.
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