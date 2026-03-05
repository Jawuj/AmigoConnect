import { useState, useEffect } from 'react'
import './App.css'
import { signInWithPopup } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore"; // Importar herramientas de Firestore
import { auth, googleProvider, db } from "./firebase";

function App() {
    const [activeMainFilter, setActiveMainFilter] = useState('Ingeniería');
    const [activeCategory, setActiveCategory] = useState('IA');
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState({}); // Mapa de usuarios por ID

    const mainFilters = ['Tecnología', 'Ingeniería'];
    const categories = ['IA', 'Web Dev', 'Ciberseguridad', 'Data Science', 'IoT'];

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
                    <button className="icon-button" onClick={handleLogin}>🔑 Login</button>
                    <button className="icon-button">🔔</button>
                    <div className="user-profile-img"></div>
                </div>
            </header>

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
                            <article key={project.id} className="project-card">
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
                                    <small className="tech-stack">
                                        {Array.isArray(project.techStack) ? project.techStack.join(', ') : project.techStack}
                                    </small>
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

            <button className="fab" onClick={() => alert("Módulo de registro próximamente")}>+</button>

            <footer className="dashboard-footer">
                <div className="footer-left">
                    AmigoConect © 2026 Plataforma de Gestión de Proyectos Académicos. Todos los derechos reservados.
                </div>
                <div className="footer-links">
                    <a href="#">Privacidad</a>
                    <a href="#">Términos</a>
                    <a href="#">Contacto</a>
                </div>
            </footer>
        </div>
    )
}

export default App