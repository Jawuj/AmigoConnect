import React, { useEffect } from 'react';
import Icons from '../components/shared/Icons';
import '../styles/privacy.css';

export default function PrivacyPage({ setActiveView }) {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="privacy-page fade-in">
            <div className="privacy-header">
                <button className="back-btn" onClick={() => setActiveView('dashboard')}>
                    <Icons.ChevronLeft /> Volver al Inicio
                </button>
                <h1>Política de Privacidad</h1>
                <p>Última actualización: 14 de Mayo de 2026</p>
            </div>

            <div className="privacy-content">
                <section>
                    <h2>1. Compromiso de Privacidad</h2>
                    <p>
                        En <strong>AmigoConnect</strong>, valoramos su confianza y nos comprometemos a proteger su privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, compartimos y protegemos su información personal cuando utiliza nuestra plataforma.
                    </p>
                </section>

                <section>
                    <h2>2. Información que Recopilamos</h2>
                    <p>Recopilamos información para proporcionar mejores servicios a todos nuestros usuarios:</p>
                    <ul>
                        <li><strong>Información de Registro:</strong> Nombre, correo electrónico, rol (estudiante, empresa, docente) y datos de perfil que usted decide proporcionar.</li>
                        <li><strong>Contenido del Usuario:</strong> Proyectos, descripciones, imágenes y vacantes que usted publica en la plataforma.</li>
                        <li><strong>Datos de Interacción:</strong> Información sobre cómo interactúa con otros usuarios y proyectos (favoritos, vistas, notificaciones).</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Uso de la Información</h2>
                    <p>Utilizamos la información recopilada para:</p>
                    <ul>
                        <li>Operar, mantener y mejorar las funcionalidades de AmigoConnect.</li>
                        <li>Personalizar su experiencia y mostrarle contenido relevante.</li>
                        <li>Facilitar la conexión entre estudiantes y empresas/docentes.</li>
                        <li>Enviar notificaciones importantes sobre su cuenta o actividad en la plataforma.</li>
                        <li>Garantizar la seguridad y prevenir actividades fraudulentas o prohibidas.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Protección de Datos</h2>
                    <p>
                        Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra el acceso no autorizado, la alteración, divulgación o destrucción. Esto incluye el uso de servicios de autenticación seguros y bases de datos protegidas mediante reglas de seguridad estrictas.
                    </p>
                </section>

                <section>
                    <h2>5. Sus Derechos</h2>
                    <p>Como usuario, usted tiene derecho a:</p>
                    <ul>
                        <li>Acceder a sus datos personales y rectificarlos si son inexactos.</li>
                        <li>Eliminar su cuenta y los datos asociados a ella en cualquier momento.</li>
                        <li>Configurar la visibilidad de su perfil y proyectos.</li>
                        <li>Oponerse al tratamiento de sus datos para fines específicos.</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Cookies y Tecnologías Similares</h2>
                    <p>
                        AmigoConnect utiliza cookies y tecnologías similares para mantener su sesión activa y analizar el tráfico de la plataforma. Puede configurar su navegador para rechazar todas las cookies, aunque esto podría afectar el funcionamiento de algunas partes del sitio.
                    </p>
                </section>

                <section>
                    <h2>7. Cambios en esta Política</h2>
                    <p>
                        Podemos actualizar nuestra Política de Privacidad ocasionalmente. Le notificaremos cualquier cambio significativo publicando la nueva política en esta página y actualizando la "Última fecha de actualización".
                    </p>
                </section>

                <section>
                    <h2>8. Contacto</h2>
                    <p>
                        Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos en: <strong>amigoconnect.support@gmail.com</strong>
                    </p>
                </section>
            </div>
        </div>
    );
}
