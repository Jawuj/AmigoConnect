import { useState } from 'react'
import './App.css'

function App() {
    const [activeMainFilter, setActiveMainFilter] = useState('Ingeniería');
    const [activeCategory, setActiveCategory] = useState('IA');

    const mainFilters = ['Tecnología', 'Ingeniería'];
    const categories = ['IA', 'Web Dev', 'Ciberseguridad', 'Data Science', 'IoT'];

    const projects = [
        {
            id: 1,
            title: 'App de Gestión Hídrica',
            description: 'Sistema inteligente para el monitoreo y control de consumo...',
            author: 'Juan Delgado',
            date: 'Hace 2 días',
            semester: 'Semestre 8',
            initials: 'JD'
        },
        {
            id: 2,
            title: 'Análisis Predictivo IA',
            description: 'Modelo de aprendizaje profundo para predecir fallas estructurales...',
            author: 'María Rojas',
            date: 'Hace 5 horas',
            semester: 'Semestre 9',
            initials: 'MR'
        },
        {
            id: 3,
            title: 'Diseño Estructural Sismo',
            description: 'Prototipo de base aislante para edificaciones residenciales de baj...',
            author: 'Carlos Paez',
            date: 'Ayer',
            semester: 'Semestre 6',
            initials: 'CP'
        },
        {
            id: 4,
            title: 'Energía Solar Adaptativa',
            description: 'Algoritmo de seguimiento solar para optimizar la eficiencia de...',
            author: 'Laura Velez',
            date: 'Hace 1 sem',
            semester: 'Semestre 8',
            initials: 'LV'
        },
        {
            id: 5,
            title: 'Cripto-Seguridad IoT',
            description: 'Protocolo de encriptación ligera para dispositivos con recursos...',
            author: 'Andres M.',
            date: 'Hace 3 días',
            semester: 'Semestre 10',
            initials: 'AM'
        },
        {
            id: 6,
            title: 'Hidroponía...',
            description: 'Plataforma de gestión para cultivos hidropónicos con control...',
            author: 'Sonia Castro',
            date: 'Hace 1 mes',
            semester: 'Semestre 5',
            initials: 'SC'
        }
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="logo-container">
                    <span className="logo-icon"><img src="./UniversityIsotipo.png" alt="Logo" /></span>
                    <span className="logo-text">AmigoConect</span>
                </div>

                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar proyectos"
                        className="search-input"
                    />
                </div>

                <div className="header-actions">
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
                    <div className="view-switcher">
                        <button className="icon-button" style={{ color: '#333' }}>🔲</button>
                        <button className="icon-button" style={{ color: '#aaa' }}>≡</button>
                    </div>
                </div>

                <div className="project-grid">
                    {projects.map(project => (
                        <article key={project.id} className="project-card">
                            <div className="card-banner">
                                <span className="tag-semester">{project.semester}</span>
                            </div>
                            <div className="card-body">
                                <h3 className="card-title">{project.title}</h3>
                                <p className="card-description">{project.description}</p>
                            </div>
                            <div className="card-footer">
                                <div className="author-info">
                                    <div className="author-avatar">{project.initials}</div>
                                    <span className="author-name">{project.author}</span>
                                </div>
                                <span className="card-date">{project.date}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            <button className="fab">+</button>




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
