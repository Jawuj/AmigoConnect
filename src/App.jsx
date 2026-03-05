import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
  <>
      <header className="encabezado">
        <div className="encabezado-titulo-principal">
            <h2>Amigo Connect</h2>
        </div>
        <div className="encabezado-barra-de-busqueda">
            <p className="buscar_proyectos">
                <input type="text" placeholder="Búsca proyectos" name="text" id="text"
                    className="campo_de_busqueda_proyectos" autoComplete= "name"/>
            </p>
        </div>
        <div className="encabezado-filtros">
            <label htmlFor="semestre" className="filtros-titulo">Semestre:</label>
            <select id="semestre" name="semestre" className="semestres-lista">
                    <option value="primer_semestre" className="opcion-semestre">1° semestre</option>
                    <option value="segundo_semestre" className="opcion-semestre">2° semestre</option>
                    <option value="tercer_semestre" className="opcion-semestre">3° semestre</option>
                    <option value="cuarto_semestre" className="opcion-semestre">4° semestre</option>
                    <option value="quinto_semestre" className="opcion-semestre">5° semestre</option>
                    <option value="sexto_semestre" className="opcion-semestre">6° semestre</option>
                    <option value="septimo_semestre" className="opcion-semestre">7° semestre</option>
                    <option value="octavo_semestre" className="opcion-semestre">8° semestre</option>
                    <option value="noveno_semestre" className="opcion-semestre">9° semestre</option>
                    <option value="decimo_semestre" className="opcion-semestre">10° semestre</option>
                    <option value="todos-los-semestres" className="opcion-semestre">Todos los semestres</option>
            </select>
        </div>

    </header>

    <main>
        <section className="contenido_pagina_principal">
            <h3>Bienvenido a AmigoConect</h3>
            <p>AmigoConect permite que cada estudiante cree un perfil profesional donde pueda mostrar sus habilidades y
                proyectos de forma organizada. Las empresas pueden revisar los perfiles, ver los trabajos publicados y
                contactar directamente a los estudiantes que les interesen.

                De esta manera, la plataforma fortalece la conexión entre los estudiantes de la Universidad Católica
                Luis Amigó y el sector empresarial, facilitando oportunidades laborales y de crecimiento profesional.
            </p>
        </section>


        <button className="boton_añadir_proyecto">
            <div className="text_boton_añadir_proyecto">+</div>
        </button>



    </main>
    <footer className="footer">
        <div className="footer-contenido">
            <div className="footer-logo">
                <img src="Amigoconect/src/img/Logo-universidad-luis-amigo.png" alt="Logo"/>
            </div>

        </div>


    </footer>
    </>
  )
}

export default App
