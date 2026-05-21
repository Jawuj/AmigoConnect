import React from 'react';

function Footer({ setActiveView }) {
    return (
        <footer className="dashboard-footer">
            <div className="footer-left">
                AmigoConnect © 2026 Plataforma de Gestión de Proyectos Académicos. Todos los derechos reservados.
            </div>
            <div className="footer-links">
                <button 
                    className="footer-link-btn" 
                    onClick={() => setActiveView('privacy')}
                >
                    Privacidad
                </button>
                <button 
                    className="footer-link-btn" 
                    onClick={() => setActiveView('terms')}
                >
                    Términos
                </button>
                <a href="mailto:amigoconnect.support@gmail.com">Contacto</a>
            </div>
        </footer>
    );
}

export default Footer;
