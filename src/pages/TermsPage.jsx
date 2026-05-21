import React, { useEffect } from 'react';
import Icons from '../components/shared/Icons';
import '../styles/terms.css';

export default function TermsPage({ setActiveView }) {
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const element = document.getElementById(hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        }
    }, []);

    return (
        <div className="terms-page fade-in">
            <div className="terms-header">
                <button className="back-btn" onClick={() => setActiveView('dashboard')}>
                    <Icons.ChevronLeft /> Volver al Inicio
                </button>
                <h1>Términos y Condiciones de Uso</h1>
                <p>Última actualización: 13 de Mayo de 2026</p>
            </div>

            <div className="terms-content">
                <section>
                    <h2>1. Información de las Partes y Objeto del Acuerdo</h2>
                    <p>
                        Bienvenido a <strong>AmigoConnect</strong>. Los presentes Términos y Condiciones ("Términos") constituyen un acuerdo legalmente vinculante entre usted (el "Usuario", "Estudiante", "Empresa" o "Egresado") y AmigoConnect (la "Plataforma"). 
                    </p>
                    <p>
                        El objeto de este acuerdo es regular el acceso y uso de los servicios de la Plataforma, la cual funciona como un ecosistema digital diseñado para conectar talento académico con oportunidades profesionales, facilitando la exhibición de proyectos y la publicación de vacantes. Al acceder, registrarse o utilizar nuestros servicios, usted declara haber leído, comprendido y aceptado en su totalidad estos Términos.
                    </p>
                </section>

                <section>
                    <h2>2. Alcances, Limitaciones y Responsabilidades</h2>
                    <p>
                        AmigoConnect proporciona la infraestructura digital para la interacción entre los usuarios. Como Plataforma, <strong>no garantizamos</strong> la contratación efectiva, ni el éxito comercial de los proyectos publicados.
                    </p>
                    <ul>
                        <li><strong>Responsabilidades del Usuario:</strong> Proveer información veraz, mantener la confidencialidad de sus credenciales de acceso y actuar con ética profesional en todas sus interacciones.</li>
                        <li><strong>Responsabilidades de AmigoConnect:</strong> Mantener la disponibilidad operativa de la plataforma (SLA del 99%) y proteger los datos personales conforme a nuestra Política de Privacidad.</li>
                    </ul>
                </section>

                <section id="proyectos" className="highlight-section">
                    <h2>3. Políticas de Contenido, Subida de Proyectos y Vacantes</h2>
                    <p>
                        Para mantener un entorno seguro y profesional, todo contenido (proyectos, productos, vacantes u oportunidades) subido a la Plataforma está sujeto a estrictas normas de moderación.
                    </p>
                    
                    <h3>3.1. Restricciones de Contenido (Lo que NO está permitido)</h3>
                    <ul>
                        <li><strong>Contenido para adultos:</strong> Queda estrictamente prohibido cualquier material pornográfico, desnudez explícita o contenido sexualmente sugerente.</li>
                        <li><strong>Gore y violencia:</strong> No se permiten imágenes, videos o descripciones de violencia gráfica, maltrato animal o automutilación.</li>
                        <li><strong>Discurso de odio:</strong> Se prohíbe promover la violencia, discriminación o acoso por motivos de raza, religión, género, orientación sexual o discapacidad.</li>
                        <li><strong>Actividades ilegales:</strong> No se permite contenido relacionado con la venta de sustancias ilícitas, armas, piratería o cualquier actividad contraria a la ley.</li>
                        <li><strong>Infracción de Propiedad Intelectual:</strong> No suba código, diseños, textos o marcas registradas de las que no sea titular o no cuente con las licencias correspondientes.</li>
                        <li><strong>Spam y Malware:</strong> Está prohibido el uso de la Plataforma para distribuir virus, troyanos, esquemas piramidales o publicidad no autorizada.</li>
                    </ul>

                    <h3>3.2. Pautas de Excelencia (Lo que SÍ se espera)</h3>
                    <ul>
                        <li><strong>Relevancia Profesional:</strong> Asegúrese de que sus proyectos tengan un enfoque académico, de innovación o profesional claro.</li>
                        <li><strong>Transparencia:</strong> Describa de manera precisa el Nivel de Madurez Tecnológica (TRL) y el estado real de sus desarrollos.</li>
                        <li><strong>Atribución Correcta:</strong> Dé el crédito correspondiente a coautores, mentores y librerías de código abierto utilizadas.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Propiedad Intelectual</h2>
                    <p>
                        <strong>Usted conserva todos los derechos</strong> sobre los proyectos y el contenido original que suba a AmigoConnect. Sin embargo, al publicar contenido, usted otorga a la Plataforma una licencia global, no exclusiva y libre de regalías para alojar, reproducir, distribuir y mostrar dicho contenido dentro del entorno de AmigoConnect con el fin exclusivo de operar y promover el servicio.
                    </p>
                </section>

                <section>
                    <h2>5. Cancelación, Suspensión y Terminación</h2>
                    <p>
                        Cualquiera de las partes puede dar por terminado este acuerdo en cualquier momento. Usted puede cancelar su cuenta directamente desde la configuración de su perfil.
                    </p>
                    <p>
                        AmigoConnect se reserva el derecho de <strong>suspender o eliminar cuentas inmediatamente y sin previo aviso</strong> si determinamos, a nuestra entera discreción, que el usuario ha violado la Sección 3 (Políticas de Contenido) de estos Términos o ha puesto en riesgo la integridad de la Plataforma.
                    </p>
                </section>
                
                <section>
                    <h2>6. Legislación Aplicable y Resolución de Conflictos</h2>
                    <p>
                        Estos Términos se rigen e interpretan de acuerdo con las leyes vigentes aplicables. Cualquier controversia, disputa o reclamación que surja de, o esté relacionada con este acuerdo, será sometida a la jurisdicción exclusiva de los tribunales competentes en el país de operación principal de AmigoConnect.
                    </p>
                </section>
            </div>
        </div>
    );
}
