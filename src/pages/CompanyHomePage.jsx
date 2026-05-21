import React from 'react';
import Icons from '../components/shared/Icons';
import '../styles/company.css';

export default function CompanyHomePage({ setActiveView, profile }) {
    return (
        <div className="company-home-container view-fade-in">
            <div className="company-welcome">
                <h1>Bienvenido, {profile?.firstName || 'Empresa'}</h1>
                <p>¿Qué deseas explorar hoy en AmigoConnect?</p>
            </div>

            <div className="selection-grid">
                <div className="selection-card projects" onClick={() => setActiveView('dashboard')}>
                    <div className="selection-icon red">
                        <Icons.Briefcase />
                    </div>
                    <h2>Proyectos</h2>
                    <p>Explora proyectos académicos, innovaciones y talento estudiantil.</p>
                    <button className="selection-btn btn-red">Ver Proyectos</button>
                </div>

                <div className="selection-card users" onClick={() => setActiveView('users')}>
                    <div className="selection-icon green">
                        <Icons.Users />
                    </div>
                    <h2>Talento Estudiantil</h2>
                    <p>Encuentra el talento que tu empresa necesita para sus próximos retos.</p>
                    <button className="selection-btn btn-green">Ver Usuarios</button>
                </div>

                <div className="selection-card opportunities" onClick={() => setActiveView('opportunities')}>
                    <div className="selection-icon orange">
                        <Icons.Briefcase />
                    </div>
                    <h2>Publicar Vacante</h2>
                    <p>Publica ofertas laborales, prácticas o retos empresariales para los estudiantes.</p>
                    <button className="selection-btn btn-orange">Publicar / Ver Ofertas</button>
                </div>
            </div>
        </div>
    );
}
