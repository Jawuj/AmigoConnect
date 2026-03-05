import { useState, useEffect } from 'react'
import './App.css'
import { signInWithPopup } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore"; // Importar herramientas de Firestore
import { auth, googleProvider, db } from "./firebase";

function App() {
    const [activeMainFilter, setActiveMainFilter] = useState('Ingeniería');
    const [activeCategory, setActiveCategory] = useState('IA');
    const [projects, setProjects] = useState([]); // Estado para los proyectos de Firebase

    const mainFilters = ['Tecnología', 'Ingeniería'];
    const categories = ['IA', 'Web Dev', 'Ciberseguridad', 'Data Science', 'IoT'];

    // 1. Escuchar Firestore en tiempo real
    useEffect(() => {
        // Referencia a la colección "projects" que creaste en el emulador [cite: 119]
        const q = query(collection(db, "projects"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjects(projectsData);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("Usuario logueado:", result.user);
            alert(`¡Bienvenido, ${result.user.displayName}!`);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="logo-container">
                    <span className="logo-icon"><img src="./UniversityIsotipo.png" alt="Logo" /></span>
                    <span className="logo-text">AmigoConect</span>
                </div>

                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Buscar proyectos" className="search-input" />
                </div>

                <div className="header-actions">
                    <button className="icon-button" onClick={handleLogin}>🔑 Login</button> {/* Botón de login añadido */}
                    <button className="icon-button">🔔</button>
                    <div className="user-profile-img"></div>
                </div>
            </header>

            {/* ... Resto de tu barra de navegación (nav) queda igual ... */}

            <main className="main-content">
                <div className="section-header">
                    <h2 className="section-title">Explorar Proyectos</h2>
                </div>

                <div className="project-grid">
                    {projects.map(project => (
                        <article key={project.id} className="project-card">
                            {/* Reemplaza la sección del banner por esto */}
                            <div
                                className="card-banner"
                                style={{
                                    backgroundImage: project.imageUrl ? `url(${project.imageUrl})` : 'none',
                                    backgroundColor: project.imageUrl ? 'transparent' : '#e6b38a'
                                }}>
                                <span className="tag-semester">Semestre {project.semester || 'N/A'}</span>
                                {project.isValidated && <span className="badge-validated">Validado</span>}
                            </div>
                            <div className="card-body">
                                <h3 className="card-title">{project.title}</h3>
                                <p className="card-description">{project.problemSolved || project.description}</p>
                                <small className="tech-stack">{project.techStack}</small> {/* Muestra la arquitectura [cite: 52] */}
                            </div>
                            <div className="card-footer">
                                <div className="author-info">
                                    <div className="author-avatar">ID</div>
                                    <span className="author-name">{project.authorId || 'Estudiante'}</span>
                                </div>
                                <span className="card-date">{project.status}</span> {/* Estado del proyecto [cite: 57] */}
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            <button className="fab" onClick={() => alert("Módulo de registro próximamente")}>+</button>

            <footer className="dashboard-footer">
                <div className="footer-left">
                    AmigoConect © 2026 Plataforma de Gestión de Proyectos Académicos. [cite: 42]
                </div>
            </footer>
        </div>
    )
}

export default App