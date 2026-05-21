import { db } from "../firebase";
import { collection, doc, setDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";

const students = [
    { firstName: "Elena", lastName: "Rodríguez", program: "Ingeniería de Sistemas", faculty: "Ingeniería", semester: 7, biography: "Apasionada por la IA y el desarrollo web.", email: "elena@example.com", technicalSkills: [{ nombre: "React", nivel: "avanzado" }, { nombre: "Python", nivel: "intermedio" }] },
    { firstName: "Mateo", lastName: "García", program: "Ingeniería de Sistemas", faculty: "Ingeniería", semester: 5, biography: "Entusiasta de la ciberseguridad.", email: "mateo@example.com", technicalSkills: [{ nombre: "Linux", nivel: "avanzado" }, { nombre: "Network Security", nivel: "intermedio" }] },
    { firstName: "Sofía", lastName: "López", program: "Ingeniería de Software", faculty: "Ingeniería", semester: 9, biography: "Enfocada en arquitectura de software.", email: "sofia@example.com", technicalSkills: [{ nombre: "Java", nivel: "avanzado" }, { nombre: "Spring Boot", nivel: "intermedio" }] },
    { firstName: "Julián", lastName: "Pérez", program: "Ingeniería Electrónica", faculty: "Ingeniería", semester: 10, biography: "Experto en IoT y domótica.", email: "julian@example.com", technicalSkills: [{ nombre: "IoT", nivel: "avanzado" }, { nombre: "Raspberry Pi", nivel: "avanzado" }] },
    { firstName: "Santiago", lastName: "Torres", program: "Ingeniería de Sistemas", faculty: "Ingeniería", semester: 3, biography: "Aprendiendo desarrollo Fullstack.", email: "santiago@example.com", technicalSkills: [{ nombre: "Javascript", nivel: "intermedio" }, { nombre: "HTML", nivel: "avanzado" }] },
    { firstName: "Daniel", lastName: "Castro", program: "Ingeniería de Sistemas", faculty: "Ingeniería", semester: 6, biography: "Especialista en Cloud Computing.", email: "daniel@example.com", technicalSkills: [{ nombre: "AWS", nivel: "avanzado" }, { nombre: "Docker", nivel: "intermedio" }] },
    { firstName: "Andrés", lastName: "Vargas", program: "Ingeniería de Software", faculty: "Ingeniería", semester: 8, biography: "Desarrollador backend apasionado por microservicios.", email: "andres@example.com", technicalSkills: [{ nombre: "Node.js", nivel: "avanzado" }, { nombre: "Kafka", nivel: "intermedio" }] },
    { firstName: "Nicolás", lastName: "Herrera", program: "Ingeniería Electrónica", faculty: "Ingeniería", semester: 4, biography: "Interesado en procesamiento de señales digitales.", email: "nicolas@example.com", technicalSkills: [{ nombre: "MATLAB", nivel: "avanzado" }, { nombre: "VHDL", nivel: "intermedio" }] },
    { firstName: "Felipe", lastName: "Moreno", program: "Ingeniería de Sistemas", faculty: "Ingeniería", semester: 9, biography: "DevOps evangelist y amante del open source.", email: "felipe@example.com", technicalSkills: [{ nombre: "Kubernetes", nivel: "avanzado" }, { nombre: "Terraform", nivel: "intermedio" }] },
    { firstName: "Sebastián", lastName: "Ríos", program: "Ingeniería de Software", faculty: "Ingeniería", semester: 7, biography: "Construyendo compiladores y lenguajes de programación.", email: "sebastian@example.com", technicalSkills: [{ nombre: "C++", nivel: "avanzado" }, { nombre: "LLVM", nivel: "basico" }] }
];

const projectTemplates = [
    { 
        title: "MediCloud Pro", 
        category: "IA", 
        faculty: "Salud", 
        description: "Plataforma de IA para diagnóstico médico automático mediante imágenes radiológicas.", 
        fullDescription: "Sistema avanzado de visión artificial que analiza radiografías y tomografías para detectar anomalías tempranas con un 98% de precisión. Utiliza redes neuronales convolucionales entrenadas con miles de casos clínicos reales.",
        problemSolved: "Largas esperas en diagnósticos radiológicos básicos que retrasan tratamientos críticos.", 
        targetAudience: "Clínicas, hospitales públicos y centros de salud rural.", 
        techArchitecture: "Arquitectura de microservicios en Python/FastAPI para el backend de IA, con un frontend en React optimizado para visualización DICOM.", 
        techStack: ["Python", "TensorFlow", "React", "FastAPI"], 
        status: "Estable", 
        developmentState: "Publicado", 
        maturityLevel: "Mercado", 
        semester: 8, 
        impactPotential: "Reducción del 40% en tiempos de espera médicos y ahorro de costos operativos.", 
        businessModel: "SaaS por suscripción hospitalaria con planes basados en volumen de imágenes.", 
        estimatedPrice: 15000000, 
        currency: "COP", 
        license: "Propiedad Intelectual", 
        team: "Equipo BioTech UC Amigó", 
        views: 2101,
        repoUrl: "https://github.com/amigoconnect/medicloud-pro",
        demoUrl: "https://medicloud-pro.demo"
    },
    { 
        title: "FreelanceHub", 
        category: "Web", 
        faculty: "Negocios", 
        description: "Marketplace de freelancers tech con sistema de reputación y pagos escrow.", 
        fullDescription: "Plataforma integral que permite a estudiantes universitarios encontrar sus primeros proyectos pagados mientras las empresas locales acceden a talento joven a precios competitivos.",
        problemSolved: "La brecha entre el conocimiento académico y la primera experiencia laboral real.", 
        targetAudience: "Estudiantes universitarios y PYMES locales.", 
        techArchitecture: "Aplicación Fullstack con Next.js utilizando Server Actions para la lógica de negocio y PostgreSQL como base de datos principal.", 
        techStack: ["Next.js", "Stripe", "PostgreSQL", "Tailwind CSS"], 
        status: "Estable", 
        developmentState: "Publicado", 
        maturityLevel: "Mercado", 
        semester: 9, 
        impactPotential: "Generación de empleo para más de 500 estudiantes en su primer año.", 
        businessModel: "Comisión del 10% por cada proyecto completado exitosamente.", 
        estimatedPrice: 2000000, 
        currency: "COP", 
        license: "MIT", 
        team: "BizDev Innovations", 
        views: 1850,
        repoUrl: "https://github.com/amigoconnect/freelance-hub",
        demoUrl: "https://freelancehub.app"
    },
    { 
        title: "SmartFarm IoT", 
        category: "IoT", 
        faculty: "Ingeniería", 
        description: "Monitoreo de cultivos en tiempo real mediante sensores y predicción del clima.", 
        fullDescription: "Nodos de sensores autónomos que miden humedad, temperatura y pH del suelo, enviando alertas vía Telegram a los agricultores para optimizar el riego.",
        problemSolved: "Desperdicio de agua en cultivos por riego innecesario o falta de información climática.", 
        targetAudience: "Pequeños y medianos agricultores de la región.", 
        techArchitecture: "Nodos basados en ESP32 comunicándose por MQTT a un servidor central que procesa los datos con Python.", 
        techStack: ["C++", "Arduino", "Firebase", "Python"], 
        status: "Beta", 
        developmentState: "Validado", 
        maturityLevel: "Validado", 
        semester: 5, 
        impactPotential: "Ahorro del 30% en consumo de agua y mejora en la calidad de la cosecha.", 
        businessModel: "Venta de kit de hardware + suscripción a plataforma de alertas premium.", 
        estimatedPrice: 1200000, 
        currency: "COP", 
        license: "GPL v3", 
        team: "AgroTech Team", 
        views: 950
    }
];

const opportunityTemplates = Array.from({ length: 50 }, (_, i) => {
    const isProject = i % 2 === 0;
    if (isProject) {
        return {
            type: 'proyecto',
            title: `Colaborador para Proyecto ${i + 1}`,
            description: `Buscamos estudiantes para unirse al equipo de desarrollo en un proyecto innovador de ${i % 2 === 0 ? 'IA' : 'Blockchain'}.`,
            sector: `Tecnología / Investigación`,
            contact: `investigacion_${i}@amigo.edu.co`,
            budget: `$${(i+1)*200}.000 COP`,
            approvalStatus: 'approved',
            createdAt: new Date()
        };
    } else {
        return {
            type: 'empleo',
            title: `Junior Developer ${i + 1}`,
            companyName: `Empresa Tech ${i + 1}`,
            urlVacante: `https://empresatech${i}.com/jobs`,
            description: `Buscamos talento joven apasionado por la tecnología para integrarse a nuestro equipo de desarrollo ágil.`,
            academicReq: `Estudiante de 5to semestre en adelante.`,
            techReq: ["React", "Javascript", "Git"],
            benefits: `Seguro médico, flexibilidad horaria, bonos de productividad.`,
            modality: i % 2 === 0 ? 'remoto' : 'hibrido',
            location: 'Medellín, Colombia',
            salaryMin: 2000000 + (i * 10000),
            salaryMax: 4000000,
            currency: 'COP',
            contact: `rrhh_${i}@empresatech.com`,
            approvalStatus: 'approved',
            createdAt: new Date()
        };
    }
});

export const seedDatabase = async () => {
    try {
        console.log("Iniciando Seed con 50 estudiantes, 50 proyectos y 50 oportunidades...");

        const BATCH_SIZE = 400;
        let opCount = 0;
        let currentBatch = writeBatch(db);
        const batches = [];

        const flushIfNeeded = async () => {
            if (opCount >= BATCH_SIZE) {
                batches.push(currentBatch);
                currentBatch = writeBatch(db);
                opCount = 0;
            }
        };

        // 1. Borrar colecciones actuales
        const projectsSnapshot = await getDocs(collection(db, "projects"));
        for (const d of projectsSnapshot.docs) {
            await flushIfNeeded();
            currentBatch.delete(d.ref);
            opCount++;
        }

        const opportunitiesSnapshot = await getDocs(collection(db, "opportunities"));
        for (const d of opportunitiesSnapshot.docs) {
            await flushIfNeeded();
            currentBatch.delete(d.ref);
            opCount++;
        }

        // 2. Crear datos masivos (50 registros)
        for (let i = 0; i < 50; i++) {
            const uid = `seed_student_${i}`;
            const studentBase = students[i % students.length];
            
            // Crear Usuario Completo
            await flushIfNeeded();
            currentBatch.set(doc(db, "users", uid), {
                ...studentBase,
                firstName: `${studentBase.firstName} (Seed ${i})`,
                role: "student",
                email: `estudiante_${i}@amigo.edu.co`,
                location: "Medellín, Colombia",
                status: "Buscando Prácticas",
                technicalSkills: [
                    { nombre: "Python", nivel: "experto" },
                    { nombre: "React", nivel: "avanzado" },
                    { nombre: "Linux", nivel: "avanzado" },
                    { nombre: "Firebase", nivel: "intermedio" }
                ],
                academicExperience: [
                    {
                        title: studentBase.program,
                        institution: "Universidad Católica Luis Amigó",
                        level: "pregrado",
                        period: "(Actualidad)"
                    }
                ],
                createdAt: new Date(),
                avatarUrl: `https://i.pravatar.cc/150?u=${uid}`
            });
            opCount++;

            // Crear Proyecto Completo
            const projBase = projectTemplates[i % projectTemplates.length];
            const projectId = `seed_project_${i}`;
            await flushIfNeeded();
            currentBatch.set(doc(db, "projects", projectId), {
                ...projBase,
                title: `${projBase.title} #${i + 1}`,
                authorId: uid,
                createdAt: new Date(),
                approvalStatus: "approved",
                isValidated: true,
                imageUrl: `https://picsum.photos/seed/${projectId}/800/600`
            });
            opCount++;

            // Crear Oportunidad
            const opp = opportunityTemplates[i];
            const oppId = `seed_opp_${i}`;
            await flushIfNeeded();
            currentBatch.set(doc(db, "opportunities", oppId), {
                ...opp,
                companyId: uid
            });
            opCount++;
        }

        batches.push(currentBatch);
        for (const batch of batches) {
            await batch.commit();
        }

        console.log(`Seed completado exitosamente.`);
        return true;
    } catch (error) {
        console.error("Error al sembrar datos:", error);
        return false;
    }
};

export const clearAuditLogs = async () => {
    try {
        const snapshot = await getDocs(collection(db, "audit_logs"));
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log("Auditoría limpiada");
        return true;
    } catch (error) {
        console.error("Error clearing audit logs:", error);
        return false;
    }
};