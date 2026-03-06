import { useState, useEffect } from 'react'
import './App.css'
import { auth, googleProvider, db, storage } from "./firebase";
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";
import { collection, onSnapshot, query, doc, getDoc, setDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ICONOS SVG
const Icons = {
    Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    Logout: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    External: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
    Rocket: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.09-2.91a2.18 2.18 0 0 0-3.09-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="m9 12 2.55 2.55"></path><path d="m15 9-2 2"></path></svg>,
    Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    Plus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    School: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
    Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
    Github: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
    X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
};

function App() {
    const [activeMainFilter, setActiveMainFilter] = useState('Todos');
    const [activeCategories, setActiveCategories] = useState([]); // Array para multi-selección
    const [activeSemester, setActiveSemester] = useState('Todos');
    const [activeStatus, setActiveStatus] = useState('Todos');
    const [activeValidationFilter, setActiveValidationFilter] = useState('Todos');
    const [activeProjectTab, setActiveProjectTab] = useState('all'); // 'all' or 'favorites'
    const [activeOppTab, setActiveOppTab] = useState('all'); // 'all' or 'favorites'
    // 'Todos' | 'Validados' | 'Pendientes'

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'student' | 'teacher' | 'company'
    const [authLoading, setAuthLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [opportunities, setOpportunities] = useState([]); // Nuevas vacantes
    const [users, setUsers] = useState({}); // Mapa de todos los usuarios por ID
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingProject, setEditingProject] = useState(null); // Proyecto que estamos editando
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Gestión de Vistas
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'profile' | 'details' | 'opportunities'
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isOppModalOpen, setIsOppModalOpen] = useState(false);

    const mainFilters = ['Todos', 'Tecnología', 'Ingeniería'];
    const projectCategories = ['Web', 'Móvil', 'IA', 'IoT', 'Ciberseguridad', 'Data Science'];
    const semesters = ['Todos', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const statuses = ['Todos', 'Estable', 'Beta', 'En Desarrollo'];

    // 0. Manejar estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                setUser(currentUser);
                if (currentUser) {
                    const email = currentUser.email;
                    const domain = email.substring(email.lastIndexOf("@"));

                    // 1. Verificar roles en paralelo
                    const [teacherSnap, companySnap] = await Promise.all([
                        getDoc(doc(db, "whitelist_teachers", email)),
                        getDoc(doc(db, "whitelist_companies", domain))
                    ]);

                    let assignedRole = 'student';
                    if (teacherSnap.exists()) {
                        assignedRole = 'teacher';
                    } else if (companySnap.exists()) {
                        if (domain === '@amigo.edu.co') {
                            // Institucional -> Solo es empresa si NO es docente (ya checado) 
                            // y si decidimos permitir empresas con este dominio. 
                            // Por defecto para seguridad, si no es docente, lo tratamos como estudiante.
                            assignedRole = 'student';
                        } else {
                            assignedRole = 'company';
                        }
                    }

                    // 2. Obtener y sincronizar perfil
                    const userRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        console.log("Perfil detectado:", userData.role, "Whitelist dice:", assignedRole);

                        // Prioridad: Si el perfil ya tiene un rol 'teacher' o 'company', 
                        // y el whitelist no lo contradice por ser de mayor rango, lo mantenemos.
                        let finalRole = userData.role || assignedRole;

                        // Sincronización forzada desde Whitelist (Whitelist manda si eres Profe/Empresa)
                        if (assignedRole === 'teacher' || assignedRole === 'company') {
                            finalRole = assignedRole;
                        }

                        // Guardar rol final en estado
                        setUserRole(finalRole);

                        // Sincronizar cambios en Firestore si es necesario
                        const updates = {};
                        if (userData.role !== finalRole) updates.role = finalRole;

                        if (finalRole === 'company' && companySnap.exists()) {
                            const companyName = companySnap.data().name;
                            if (userData.name !== companyName) updates.name = companyName;
                        } else if (finalRole === 'teacher' && teacherSnap.exists()) {
                            const teacherName = teacherSnap.data().fullName;
                            if (userData.name !== teacherName) updates.name = teacherName;
                        }

                        if (Object.keys(updates).length > 0) {
                            await updateDoc(userRef, updates);
                            Object.assign(userData, updates);
                        }

                        setProfile(userData);
                    } else if (assignedRole !== 'student') {
                        // Caso especial: Primer login de Profe o Empresa, crear perfil base automático
                        console.log("Auto-creando perfil para:", assignedRole);
                        const whitelistData = assignedRole === 'teacher' ? teacherSnap.data() : companySnap.data();
                        const initialProfile = {
                            uid: currentUser.uid,
                            name: assignedRole === 'teacher' ? whitelistData.fullName : whitelistData.name,
                            mail: email,
                            role: assignedRole,
                            program: assignedRole === 'teacher' ? (whitelistData.faculty || "Facultad") : "Entidad Externa",
                            avatarUrl: currentUser.photoURL || "",
                            createdAt: new Date().toISOString(),
                            dni: "S/N",
                            favorites: [],
                            description: assignedRole === 'company' ? "Empresa vinculada a AmigoConnect" : "",
                            github: ""
                        };
                        await setDoc(userRef, initialProfile);
                        setUserRole(assignedRole);
                        setProfile(initialProfile);
                    } else {
                        // Estudiante sin perfil -> Se queda en profile null para Onboarding
                        setUserRole('student');
                        setProfile(null);
                    }
                } else {
                    setProfile(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error("Error crítico en Auth Listener:", error);
            } finally {
                setAuthLoading(false);
            }
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

    // 3. Notificaciones en Tiempo Real
    useEffect(() => {
        if (!user) return;
        // El snippet anterior tiene un error de anidamiento, lo corregiré luego.
        // Mejor usar el patrón estándar:
        const q = query(collection(db, "notifications"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(n => n.to === user.uid)
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.read).length);
        });
        return () => unsubscribe();
    }, [user]);

    // 4. Funciones de ayuda
    // 5. Escuchar Oportunidades en tiempo real
    useEffect(() => {
        const qOpps = query(collection(db, "opportunities"));
        const unsubscribeOpps = onSnapshot(qOpps, (snapshot) => {
            const oppsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOpportunities(oppsData);
        });
        return () => unsubscribeOpps();
    }, []);

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const email = result.user.email;
            const domain = email.substring(email.lastIndexOf("@"));

            // 1. Validar dominios y whitelist
            const isInstitutional = email.endsWith('@amigo.edu.co');
            const isSupport = email === 'amigoconnect.support@gmail.com';

            const [companySnap, teacherSnap] = await Promise.all([
                getDoc(doc(db, "whitelist_companies", domain)),
                getDoc(doc(db, "whitelist_teachers", email))
            ]);

            const isAuthorizedCompany = companySnap.exists();
            const isAuthorizedTeacher = teacherSnap.exists();

            if (!isInstitutional && !isSupport && !isAuthorizedCompany && !isAuthorizedTeacher) {
                alert("Acceso denegado. Este correo o dominio no está autorizado.");
                await signOut(auth);
                return;
            }

            // El resto se maneja en el listener onAuthStateChanged
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
    };


    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const selectedRole = formData.get('role');

        const newProfile = {
            uid: user.uid,
            DocumentID: user.uid,
            name: user.displayName,
            mail: user.email,
            role: selectedRole,
            dni: formData.get('dni'),
            avatarUrl: user.photoURL || "",
            createdAt: new Date().toISOString(),
            favorites: []
        };

        // Campos según rol
        if (selectedRole === 'company') {
            newProfile.program = "Entidad Externa";
            newProfile.semester = "N/A";
            newProfile.github = formData.get('github') || "";
        } else if (selectedRole === 'teacher') {
            newProfile.program = formData.get('program'); // Facultad
            newProfile.semester = "N/A";
            newProfile.github = formData.get('github') || "";
        } else {
            newProfile.program = formData.get('program');
            newProfile.semester = formData.get('semester');
            newProfile.github = formData.get('github') || "";
        }

        try {
            await setDoc(doc(db, "users", user.uid), newProfile);
            setProfile(newProfile);
        } catch (error) {
            console.error("Error al guardar perfil:", error);
            alert("Error al guardar el perfil. Intenta de nuevo.");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const program = formData.get('program');
        const semester = formData.get('semester');
        const github = formData.get('github');
        const academicAverage = formData.get('academicAverage');
        const technicalSkills = formData.get('technicalSkills')?.split(',').map(s => s.trim()) || [];
        const softSkills = formData.get('softSkills')?.split(',').map(s => s.trim()) || [];

        try {
            const updatedProfile = {
                ...profile,
                name,
                program,
                semester,
                github,
                academicAverage,
                technicalSkills,
                softSkills
            };
            await setDoc(doc(db, "users", user.uid), updatedProfile);
            setProfile(updatedProfile);
            setIsEditingProfile(false);
            alert("Perfil actualizado!");
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            alert("Error al guardar cambios");
        }
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsUploading(true);
        const formData = new FormData(e.target);
        const imageFile = formData.get('image');
        let imageUrl = editingProject?.imageUrl || "";

        try {
            // 1. Subir imagen si se selecciona una nueva
            if (imageFile && imageFile.size > 0) {
                const storageRef = ref(storage, `project_images/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // 2. Preparar datos
            const projectData = {
                title: formData.get('title'),
                mainFilter: formData.get('mainFilter') || 'Tecnología',
                category: formData.get('category'),
                problemSolved: formData.get('problemSolved'),
                targetAudience: formData.get('targetAudience'),
                techArchitecture: formData.get('techArchitecture'),
                license: formData.get('license'),
                team: formData.get('team'),
                semester: Number(formData.get('semester')),
                status: formData.get('status'),
                techStack: formData.get('techStack').split(',').map(item => item.trim()),
                demoUrl: formData.get('demoUrl'),
                imageUrl: imageUrl,
                maturityLevel: formData.get('maturityLevel'), // Prototipo, Beta, Estable, Producción
                impactPotential: formData.get('impactPotential'),
                sector: formData.get('sector'),
                tutorId: formData.get('tutorId') || "", // ID del docente asignado
                approvalStatus: 'pending', // Todos los proyectos nuevos nacen como pendientes
                authorId: user.uid,
                updatedAt: serverTimestamp()
            };

            if (editingProject) {
                await updateDoc(doc(db, "projects", editingProject.id), projectData);
                alert("¡Proyecto actualizado con éxito!");
            } else {
                projectData.createdAt = serverTimestamp();
                projectData.isValidated = false;
                projectData.approvalStatus = 'pending';
                const newDoc = await addDoc(collection(db, "projects"), projectData);

                // Enviar notificación al tutor si se asignó uno
                if (projectData.tutorId) {
                    await sendNotification(
                        projectData.tutorId,
                        `Nuevo proyecto pendiente de revisión: ${projectData.title}`,
                        'project_approval',
                        newDoc.id
                    );
                }

                alert("¡Proyecto enviado para revisión institucional!");
            }

            setIsUploadModalOpen(false);
            setEditingProject(null);
        } catch (error) {
            console.error("Error al procesar proyecto:", error);
            alert("Hubo un error. Intenta de nuevo.");
        } finally {
            setIsUploading(false);
        }
    };

    // 5. Sistema de Notificaciones
    const sendNotification = async (toUid, message, type, targetId) => {
        try {
            await addDoc(collection(db, "notifications"), {
                to: toUid,
                from: user.uid,
                fromName: profile?.name || user.displayName,
                message,
                type,
                targetId,
                read: false,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al enviar notificación:", error);
        }
    };

    const handleToggleFavorite = async (itemId) => {
        if (!user) return;
        const currentFavorites = profile?.favorites || [];
        const isFavorite = currentFavorites.includes(itemId);

        try {
            const newFavorites = isFavorite
                ? currentFavorites.filter(id => id !== itemId)
                : [...currentFavorites, itemId];

            await updateDoc(doc(db, "users", user.uid), { favorites: newFavorites });
            setProfile({ ...profile, favorites: newFavorites });
        } catch (error) {
            console.error("Error al actualizar favoritos:", error);
        }
    };

    const handleApproveProject = async (project) => {
        if (userRole !== 'teacher') return;
        const isCurrentlyApproved = project.approvalStatus === 'approved';
        try {
            await updateDoc(doc(db, "projects", project.id), {
                approvalStatus: isCurrentlyApproved ? 'pending' : 'approved'
            });

            if (!isCurrentlyApproved) {
                await sendNotification(
                    project.authorId,
                    `¡Tu proyecto "${project.title}" ha sido aprobado!`,
                    'approval_result',
                    project.id
                );
            }
            alert(isCurrentlyApproved ? "Proyecto desaprobado (ahora pendiente)" : "Proyecto aprobado y publicado");
        } catch (error) {
            console.error("Error al procesar aprobación:", error);
        }
    };

    const handleToggleValidation = async (project) => {
        if (userRole !== 'teacher') return;
        const isCurrentlyValidated = project.isValidated;
        try {
            await updateDoc(doc(db, "projects", project.id), {
                isValidated: !isCurrentlyValidated,
                validatedBy: isCurrentlyValidated ? null : user.uid,
                validatedAt: isCurrentlyValidated ? null : serverTimestamp()
            });
            alert(isCurrentlyValidated ? "Validación removida" : "Proyecto validado con éxito");
        } catch (error) {
            console.error("Error al procesar validación:", error);
        }
    };
    const handleRejectProject = async (project) => {
        if (userRole !== 'teacher') return;
        const reason = prompt("Indica el motivo del rechazo para el estudiante:");
        if (!reason) return;

        try {
            await updateDoc(doc(db, "projects", project.id), {
                approvalStatus: 'rejected'
            });
            await sendNotification(
                project.authorId,
                `Tu proyecto "${project.title}" requiere ajustes: ${reason}`,
                'approval_result',
                project.id
            );
            alert("Notificación de rechazo enviada");
        } catch (error) {
            console.error("Error al rechazar:", error);
        }
    };

    const handleOppSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const oppData = {
                title: formData.get('title'),
                company: profile?.name || user.displayName,
                companyId: user.uid,
                description: formData.get('description'),
                modality: formData.get('modality'),
                type: formData.get('type'),
                salary: formData.get('salary'),
                location: formData.get('location'),
                contact: formData.get('contact'),
                sector: profile?.program || "General", // Usamos el sector/programa
                approvalStatus: 'pending',
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, "opportunities"), oppData);
            alert("¡Oportunidad enviada para validación institucional!");
            setIsOppModalOpen(false);
        } catch (error) {
            console.error("Error al publicar vacante:", error);
            alert("Error al publicar");
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
                        <h2>AmigoConnect</h2>
                    </div>
                    <h1>Bienvenido a la red de proyectos</h1>
                    <p>Conéctate con otros estudiantes y comparte tu ingenio.</p>
                    <button className="google-login-btn" onClick={handleLogin}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.png" alt="Google" />
                        Entrar con cuenta institucional
                    </button>
                    <footer className="login-footer">
                        AmigoConnect © 2026
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
                            <label>Tipo de Usuario</label>
                            <select name="role" required onChange={(e) => setUserRole(e.target.value)}>
                                <option value="student">Estudiante</option>
                                <option value="graduate">Egresado</option>
                                <option value="teacher">Docente / Investigador</option>
                                <option value="company">Empresa / Reclutador</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>DNI / Documento</label>
                            <input type="text" name="dni" placeholder="Ej: 123456789" required />
                        </div>
                        {(userRole === 'student' || userRole === 'graduate') && (
                            <div className="form-group">
                                <label>Programa Académico</label>
                                <select name="program" required>
                                    <option value="">Selecciona tu carrera</option>
                                    <option value="Tecnología en Desarrollo de Software">Tecnología en Desarrollo de Software</option>
                                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                                </select>
                            </div>
                        )}
                        {userRole === 'teacher' && (
                            <div className="form-group">
                                <label>Facultad / Área de Especialidad</label>
                                <input type="text" name="program" placeholder="Ej: Facultad de Ingeniería" required />
                            </div>
                        )}
                        <div className="form-row">
                            {(userRole === 'student' || userRole === 'graduate') && (
                                <div className="form-group">
                                    <label>Semestre Actual</label>
                                    <input type="number" name="semester" min="1" max="10" placeholder="1-10" required />
                                </div>
                            )}
                            <div className="form-group">
                                <label>
                                    {userRole === 'company' ? 'Sitio Web / LinkedIn' :
                                        userRole === 'teacher' ? 'Perfil Investigador / LinkedIn' : 'GitHub (Opcional)'}
                                </label>
                                <input type="text" name="github" placeholder="https://..." />
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
                    <span className="logo-text">AmigoConnect</span>
                </div>

                <div className="header-nav">
                    <button className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={goToDashboard}>Inicio</button>
                    <button className={`nav-link ${activeView === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveView('opportunities')}>Oportunidades</button>
                </div>

                <div className="search-container">
                    <span className="search-icon"><Icons.Search /></span>
                    <input type="text" placeholder="Buscar proyectos" className="search-input" />
                </div>

                <div className="header-actions">
                    <div className="notification-wrapper">
                        <button
                            className={`icon-button ${unreadCount > 0 ? 'has-notifications' : ''}`}
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            title="Notificaciones"
                        >
                            <Icons.Bell />
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </button>

                        {isNotifOpen && (
                            <div className="notification-dropdown">
                                <div className="notif-header">
                                    <h4>Notificaciones</h4>
                                </div>
                                <div className="notif-list">
                                    {notifications.length === 0 ? (
                                        <p className="notif-empty">No hay notificaciones</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={async () => {
                                                await updateDoc(doc(db, "notifications", n.id), { read: true });
                                                if (n.targetId) {
                                                    setSelectedProjectId(n.targetId);
                                                    setActiveView('details');
                                                    setIsNotifOpen(false);
                                                }
                                            }}>
                                                <div className="notif-content">
                                                    <p className="notif-message">{n.message}</p>
                                                    <small className="notif-time">Hace poco</small>
                                                </div>
                                                {!n.read && <span className="unread-dot"></span>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

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
                    <button className="icon-button" onClick={handleLogout} title="Cerrar sesión"><Icons.Logout /></button>
                </div>
            </header>

            {activeView === 'dashboard' && (
                <>
                    <nav className="filter-bar">
                        <div className="filter-group">
                            <label className="filter-label">Facultad:</label>
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
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Semestre:</label>
                            <div className="semester-filter">
                                <select
                                    className="semester-select"
                                    value={activeSemester}
                                    onChange={(e) => setActiveSemester(e.target.value)}
                                >
                                    {semesters.map(s => (
                                        <option key={s} value={s}>{s === 'Todos' ? 'Todos' : `Semestre ${s}`}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Estado:</label>
                            <div className="semester-filter">
                                <select
                                    className="semester-select"
                                    value={activeStatus}
                                    onChange={(e) => setActiveStatus(e.target.value)}
                                >
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Validación:</label>
                            <div className="semester-filter">
                                <select
                                    value={activeValidationFilter}
                                    onChange={(e) => setActiveValidationFilter(e.target.value)}
                                    className="semester-select"
                                >
                                    <option value="Todos">Todos</option>
                                    <option value="Validados">Validados</option>
                                    <option value="Pendientes">Pendientes</option>
                                </select>
                            </div>
                        </div>

                        <div className="filter-group" style={{ flexGrow: 1 }}>
                            <label className="filter-label">Tecnologías:</label>
                            <div className="category-tags">
                                {projectCategories.map(cat => {
                                    const isActive = activeCategories.includes(cat);
                                    return (
                                        <button
                                            key={cat}
                                            className={`tag ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                if (isActive) {
                                                    setActiveCategories(activeCategories.filter(c => c !== cat));
                                                } else {
                                                    setActiveCategories([...activeCategories, cat]);
                                                }
                                            }}
                                        >
                                            {isActive && <Icons.Check />} {cat}
                                        </button>
                                    );
                                })}
                                {activeCategories.length > 0 && (
                                    <button className="tag-clear" onClick={() => setActiveCategories([])}>Limpiar</button>
                                )}
                            </div>
                        </div>
                    </nav>

                    <main className="main-content">
                        <div className="section-header">
                            <h2 className="section-title">Explorar Proyectos</h2>
                            <div className="view-tabs">
                                <button
                                    className={`view-tab ${activeProjectTab === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveProjectTab('all')}
                                >Todos</button>
                                <button
                                    className={`view-tab ${activeProjectTab === 'favorites' ? 'active' : ''}`}
                                    onClick={() => setActiveProjectTab('favorites')}
                                >Mis Favoritos ⭐</button>
                            </div>
                        </div>

                        {(() => {
                            const filteredProjects = projects.filter(project => {
                                const matchMain = activeMainFilter === 'Todos' || project.mainFilter === activeMainFilter;
                                const matchSemester = activeSemester === 'Todos' || String(project.semester) === activeSemester;
                                const matchStatus = activeStatus === 'Todos' || project.status === activeStatus;
                                const matchCategory = activeCategories.length === 0 || activeCategories.includes(project.category);
                                const matchValidation = activeValidationFilter === 'Todos' ||
                                    (activeValidationFilter === 'Validados' && project.isValidated) ||
                                    (activeValidationFilter === 'Pendientes' && !project.isValidated);

                                const isFavorite = profile?.favorites?.includes(project.id);
                                const matchFavorites = activeProjectTab === 'all' || (activeProjectTab === 'favorites' && isFavorite);

                                return matchMain && matchSemester && matchStatus && matchCategory && matchValidation && matchFavorites;
                            });

                            // Visibilidad de Aprobación
                            const visibleProjects = filteredProjects.filter(p => {
                                if (userRole === 'teacher') return true; // Profesores ven todo
                                if (user?.uid === p.authorId) return true; // Autor ve lo suyo
                                if (p.approvalStatus === 'approved') return true; // Solo aprobados para el resto
                                return false;
                            });

                            if (visibleProjects.length === 0) {
                                return (
                                    <div className="empty-state">
                                        <p>No se encontraron proyectos aprobados o disponibles.</p>
                                        <button className="tag-clear" onClick={() => {
                                            setActiveMainFilter('Todos');
                                            setActiveSemester('Todos');
                                            setActiveStatus('Todos');
                                            setActiveCategories([]);
                                            setActiveValidationFilter('Todos');
                                        }}>Limpiar Filtros</button>
                                    </div>
                                );
                            }

                            return (
                                <div className="project-grid">
                                    {visibleProjects.map(project => {
                                        const projectAuthor = users[project.authorId] || {};
                                        const isAuthor = user?.uid === project.authorId;

                                        return (
                                            <article key={project.id} className="project-card" onClick={() => handleProjectClick(project.id)} style={{
                                                cursor: 'pointer',
                                                borderTop: project.approvalStatus === 'pending' ? '4px solid #ff9800' : 'none'
                                            }}>
                                                <button
                                                    className={`btn-favorite ${profile?.favorites?.includes(project.id) ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(project.id); }}
                                                    title="Añadir a favoritos"
                                                >
                                                    {profile?.favorites?.includes(project.id) ? '⭐' : '☆'}
                                                </button>

                                                <div
                                                    className="card-banner"
                                                    style={{
                                                        backgroundImage: project.imageUrl ? `url(${project.imageUrl})` : 'none',
                                                        backgroundColor: project.imageUrl ? 'transparent' : '#e6b38a',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }}>
                                                    <div className="banner-badges">
                                                        <span className="tag-semester">Semestre {project.semester || 'N/A'}</span>
                                                        {project.isValidated && <span className="badge-validated">Validado</span>}
                                                        {project.approvalStatus === 'pending' && <span className="badge-pending">Pendiente</span>}
                                                        {project.approvalStatus === 'rejected' && <span className="badge-rejected">Rechazado</span>}
                                                    </div>
                                                </div>
                                                {/* Acciones de Docente (Control Unificado) */}
                                                {userRole === 'teacher' && (
                                                    <div className="card-teacher-actions">
                                                        <button
                                                            className={`action-dot ${project.approvalStatus === 'approved' ? 'approved' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); handleApproveProject(project); }}
                                                            title={project.approvalStatus === 'approved' ? "Desaprobar" : "Aprobar"}
                                                        >
                                                            {project.approvalStatus === 'approved' ? <Icons.X /> : <Icons.Check />}
                                                        </button>
                                                        {project.approvalStatus === 'pending' && (
                                                            <button
                                                                className="action-dot reject"
                                                                onClick={(e) => { e.stopPropagation(); handleRejectProject(project); }}
                                                                title="Rechazar"
                                                            >
                                                                <Icons.X />
                                                            </button>
                                                        )}
                                                        <button
                                                            className={`action-dot validate ${project.isValidated ? 'active' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); handleToggleValidation(project); }}
                                                            title={project.isValidated ? "Quitar Validación" : "Validar"}
                                                        >
                                                            <Icons.Shield />
                                                        </button>
                                                        <button
                                                            className="action-dot edit"
                                                            onClick={(e) => { e.stopPropagation(); setEditingProject(project); setIsUploadModalOpen(true); }}
                                                            title="Editar"
                                                        >
                                                            <Icons.Edit />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Edición (Solo Autor para no solapar con acciones de profe) */}
                                                {(isAuthor && userRole !== 'teacher') && (
                                                    <button
                                                        className="edit-card-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingProject(project);
                                                            setIsUploadModalOpen(true);
                                                        }}
                                                        title="Editar Proyecto"
                                                    >
                                                        <Icons.Edit />
                                                    </button>
                                                )}
                                                <div className="card-body">
                                                    <h3 className="card-title">{project.title}</h3>
                                                    <p className="card-description">{project.problemSolved || project.description}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <small className="tech-stack">
                                                            {Array.isArray(project.techStack) ? project.techStack.slice(0, 3).join(', ') : project.techStack}
                                                        </small>
                                                        {project.demoUrl && (
                                                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="demo-link-small" onClick={(e) => e.stopPropagation()}>Demo
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
                            );
                        })()}
                    </main>
                </>
            )}

            {activeView === 'opportunities' && (
                <div className="opportunities-view">
                    <div className="section-header">
                        <h2 className="section-title">Oportunidades Laborales</h2>
                        <div className="header-actions-row">
                            <div className="view-tabs">
                                <button
                                    className={`view-tab ${activeOppTab === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveOppTab('all')}
                                >Todas</button>
                                <button
                                    className={`view-tab ${activeOppTab === 'favorites' ? 'active' : ''}`}
                                    onClick={() => setActiveOppTab('favorites')}
                                >Mis Favoritas ⭐</button>
                            </div>
                            {userRole === 'company' && (
                                <button className="primary-action-btn" onClick={() => setIsOppModalOpen(true)}>
                                    <Icons.Plus /> Publicar Vacante
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="opps-grid">
                        {(() => {
                            const isFavorite = (id) => profile?.favorites?.includes(id);

                            const visibleOpps = opportunities.filter(o => {
                                const matchFavorites = activeOppTab === 'all' || (activeOppTab === 'favorites' && isFavorite(o.id));
                                if (!matchFavorites) return false;

                                if (userRole === 'teacher') return true;
                                if (user?.uid === o.companyId) return true;
                                if (o.approvalStatus === 'approved') return true;
                                return false;
                            });

                            if (visibleOpps.length === 0) {
                                return (
                                    <div className="empty-state">
                                        <p>No hay vacantes aprobadas en este momento.</p>
                                    </div>
                                );
                            }

                            return visibleOpps.map(opp => {
                                return (
                                    <article key={opp.id} className={`opp-card ${opp.approvalStatus === 'pending' ? 'pending' : ''}`}>
                                        <button
                                            className={`btn-favorite-opp ${profile?.favorites?.includes(opp.id) ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(opp.id); }}
                                            title="Añadir a favoritos"
                                        >
                                            {profile?.favorites?.includes(opp.id) ? '⭐' : '☆'}
                                        </button>
                                        <div className="opp-header">
                                            <div className="company-logo-small">
                                                {opp.companyLogo ? <img src={opp.companyLogo} alt={opp.company} /> : opp.company?.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="opp-title">{opp.title}</h3>
                                                <span className="opp-company">{opp.company}</span>
                                            </div>
                                        </div>
                                        <div className="opp-body">
                                            <p>{opp.description}</p>
                                            <div className="opp-tags">
                                                <span className="opp-tag">{opp.modality}</span>
                                                <span className="opp-tag">{opp.type}</span>
                                                <span className="opp-tag">{opp.salary}</span>
                                            </div>
                                        </div>
                                        <div className="opp-footer">
                                            <div className="opp-contact-info">
                                                <Icons.Mail /> <span>{opp.contact}</span>
                                            </div>
                                            {userRole === 'student' && (
                                                <button className="secondary-action-btn" onClick={() => window.open(opp.contact.startsWith('http') ? opp.contact : `mailto:${opp.contact}`)}>
                                                    Postularme Ahora
                                                </button>
                                            )}

                                            {/* Validación de Vacantes (Docente/Coordinador) */}
                                            {userRole === 'teacher' && (
                                                <div className="card-teacher-actions" style={{ position: 'relative', background: 'transparent', boxShadow: 'none' }}>
                                                    <button
                                                        className={`action-dot ${opp.approvalStatus === 'approved' ? 'approved' : ''}`}
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const isCurrentlyApproved = opp.approvalStatus === 'approved';
                                                            try {
                                                                await updateDoc(doc(db, "opportunities", opp.id), {
                                                                    approvalStatus: isCurrentlyApproved ? 'pending' : 'approved'
                                                                });
                                                                alert(isCurrentlyApproved ? "Vacante desaprobada" : "Vacante aprobada");
                                                            } catch (error) {
                                                                console.error("Error updating opp", error);
                                                            }
                                                        }}
                                                        title={opp.approvalStatus === 'approved' ? 'Desaprobar Publicación' : 'Aprobar Publicación'}
                                                    >
                                                        {opp.approvalStatus === 'approved' ? <Icons.X /> : <Icons.Check />}
                                                    </button>
                                                    {opp.approvalStatus === 'pending' && (
                                                        <button className="action-dot reject" onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const reason = prompt("Motivo del rechazo:");
                                                            if (reason) {
                                                                try {
                                                                    await updateDoc(doc(db, "opportunities", opp.id), { approvalStatus: 'rejected' });
                                                                    alert("Vacante rechazada");
                                                                } catch (error) {
                                                                    console.error("Error rejecting opp", error);
                                                                }
                                                            }
                                                        }} title="Rechazar">
                                                            <Icons.X />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                );
                            })
                        })()}
                    </div>
                </div>
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
                                {isEditingProfile ? (
                                    <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                                        <div className="form-group-inline">
                                            <input type="text" name="name" defaultValue={profile?.name || user?.displayName} placeholder="Nombre" required />
                                            <input type="number" step="0.1" name="academicAverage" defaultValue={profile?.academicAverage} placeholder="Promedio Académico" />
                                        </div>
                                        <div className="form-row">
                                            <input type="text" name="program" defaultValue={profile?.program} placeholder="Carrera" required />
                                            <input type="number" name="semester" defaultValue={profile?.semester} placeholder="Semestre" required />
                                        </div>
                                        <input type="text" name="technicalSkills" defaultValue={profile?.technicalSkills?.join(', ')} placeholder="Habilidades Técnicas (separadas por coma)" />
                                        <input type="text" name="softSkills" defaultValue={profile?.softSkills?.join(', ')} placeholder="Habilidades Blandas (separadas por coma)" />
                                        <input type="text" name="github" defaultValue={profile?.github} placeholder="Link de Github" />
                                        <div className="form-actions-inline">
                                            <button type="submit" className="primary-action-btn"><Icons.Check /> Guardar Perfil Profesional</button>
                                            <button type="button" className="secondary-action-btn" onClick={() => setIsEditingProfile(false)}>Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h1>{profile?.name || user?.displayName}</h1>
                                        <div className="profile-subtext">
                                            <span><Icons.School /> {profile?.program} • Semestre {profile?.semester}</span>
                                            {profile?.academicAverage && <span className="badge-gpa">Promedio: {profile.academicAverage}</span>}
                                            <span><Icons.Mail /> {user?.email}</span>
                                            {profile?.github && (
                                                <a href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                                                    <Icons.Github /> Perfil Github
                                                </a>
                                            )}
                                        </div>

                                        {(profile?.technicalSkills?.length > 0 || profile?.softSkills?.length > 0) && (
                                            <div className="profile-skills-summary">
                                                {profile?.technicalSkills?.slice(0, 5).map(s => <span key={s} className="skill-chip">{s}</span>)}
                                                {profile?.technicalSkills?.length > 5 && <span className="skill-chip more">+{profile.technicalSkills.length - 5}</span>}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        {!isEditingProfile && (
                            <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}>
                                <Icons.Edit /> Editar Perfil
                            </button>
                        )}
                    </div>

                    <div className="profile-sections-grid">
                        <section>
                            <h3 className="profile-section-title">
                                {profile?.role === 'teacher' ? 'Información Profesional' : 'Mi Hoja de Vida'}
                            </h3>
                            <div className="resume-upload-section">
                                {profile?.role === 'teacher' ? (
                                    <div className="teacher-info-card">
                                        <p><strong>Docente de la facultad:</strong> {profile?.program}</p>
                                        <p><strong>Contacto:</strong> {profile?.mail}</p>
                                        {profile?.github && (
                                            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="resume-link">
                                                <Icons.External /> Perfil Profesional
                                            </a>
                                        )}
                                    </div>
                                ) : profile?.resumeUrl ? (
                                    <div>
                                        <p>✅ Hoja de vida cargada correctamente.</p>
                                        <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
                                            <Icons.External /> Ver documento actual
                                        </a>
                                    </div>
                                ) : (
                                    <div>
                                        <p>Aún no has subido tu hoja de vida.</p>
                                        <button className="secondary-action-btn" style={{ maxWidth: '200px', margin: '10px auto' }} onClick={() => alert("Próximamente: Subir PDF")}>
                                            <Icons.Upload /> Subir PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section>
                            <h3 className="profile-section-title">
                                {profile?.role === 'teacher' ? 'Proyectos Validados por mí' : `Mis Proyectos (${projects.filter(p => p.authorId === user.uid).length})`}
                            </h3>
                            <div className="project-grid">
                                {projects
                                    .filter(p => profile?.role === 'teacher' ? p.validatedBy === user.uid : p.authorId === user.uid)
                                    .map(project => (
                                        <article key={project.id} className="project-card" onClick={() => handleProjectClick(project.id)} style={{ cursor: 'pointer' }}>
                                            <div className="card-banner" style={{ backgroundImage: `url(${project.imageUrl})`, backgroundSize: 'cover' }}>
                                                <div className="banner-badges">
                                                    <span className="tag-semester">Semestre {project.semester}</span>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <h3 className="card-title">{project.title}</h3>
                                                <small className="tech-stack">{Array.isArray(project.techStack) ? project.techStack.slice(0, 2).join(', ') : project.techStack}</small>
                                            </div>
                                        </article>
                                    ))}
                                {projects.filter(p => profile?.role === 'teacher' ? p.validatedBy === user.uid : p.authorId === user.uid).length === 0 && (
                                    <p>{profile?.role === 'teacher' ? 'Aún no has validado proyectos.' : 'Aún no has publicado proyectos.'}</p>
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
                                                <span className="details-tag sector">{project.sector}</span>
                                                <span className={`status-badge ${project.approvalStatus}`}>{project.approvalStatus?.toUpperCase()}</span>
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

                                            {project.impactPotential && (
                                                <div className="details-description highlight">
                                                    <h3>Potencial de Impacto</h3>
                                                    <p>{project.impactPotential}</p>
                                                </div>
                                            )}

                                            {project.techArchitecture && (
                                                <div className="details-description">
                                                    <h3>Arquitectura Técnica</h3>
                                                    <p>{project.techArchitecture}</p>
                                                </div>
                                            )}

                                            {project.team && (
                                                <div className="details-description">
                                                    <h3>Equipo Desarrollador</h3>
                                                    <p>{project.team}</p>
                                                </div>
                                            )}
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
                                                <span className="detail-label">Nivel Madurez (TRL)</span>
                                                <span className="detail-value">{project.maturityLevel || 'Inicial'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Licencia</span>
                                                <span className="detail-value">{project.license}</span>
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
                                            <button
                                                className={`secondary-action-btn ${profile?.favorites?.includes(project.id) ? 'active' : ''}`}
                                                onClick={() => handleToggleFavorite(project.id)}
                                            >
                                                {profile?.favorites?.includes(project.id) ? '⭐ Guardado' : '☆ Guardar en Favoritos'}
                                            </button>
                                        </div>
                                    </aside>
                                </div>

                                <div className="more-author-section">
                                    <h3 className="profile-section-title">Otros proyectos de este autor</h3>
                                    <div className="project-grid">
                                        {projects.filter(p => p.authorId === project.authorId && p.id !== project.id).slice(0, 3).map(p => (
                                            <article key={p.id} className="project-card" onClick={() => handleProjectClick(p.id)} style={{ cursor: 'pointer' }}>
                                                <div className="card-banner" style={{ backgroundImage: `url(${p.imageUrl})`, backgroundSize: 'cover' }}>
                                                    <div className="banner-badges">
                                                        <span className="tag-semester">Semestre {p.semester}</span>
                                                    </div>
                                                </div>
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

            {userRole === 'student' && (
                <button className="fab" onClick={() => setIsUploadModalOpen(true)}>+</button>
            )}

            {isUploadModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingProject ? 'Editar Proyecto' : 'Subir Nuevo Proyecto'}</h2>
                            <button className="close-btn" onClick={() => { setIsUploadModalOpen(false); setEditingProject(null); }}>×</button>
                        </div>
                        <form className="upload-form" onSubmit={handleProjectSubmit}>
                            <div className="form-group">
                                <label>Título del Proyecto/Producto</label>
                                <input type="text" name="title" defaultValue={editingProject?.title} placeholder="Ej: AmigoConnect" required />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sector Económico</label>
                                    <select name="sector" defaultValue={editingProject?.sector || ""} required>
                                        <option value="">Selecciona un sector</option>
                                        <option value="Tecnología">Tecnología / Software</option>
                                        <option value="Salud">Salud / Bienestar</option>
                                        <option value="Educación">Educación / EdTech</option>
                                        <option value="Finanzas">Finanzas / FinTech</option>
                                        <option value="Social">Impacto Social</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Nivel de Madurez (TRL)</label>
                                    <select name="maturityLevel" defaultValue={editingProject?.maturityLevel || "Prototipo"} required>
                                        <option value="Prototipo">Prototipo Inicial</option>
                                        <option value="Beta">Versión Beta / MVP</option>
                                        <option value="Estable">Versión Estable</option>
                                        <option value="Producción">En Producción / Mercado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descripción del Proyecto (Resumen Ejecutivo)</label>
                                <textarea name="problemSolved" rows="3" defaultValue={editingProject?.problemSolved} placeholder="Describe el impacto y valor de tu producto..." required></textarea>
                            </div>

                            <div className="form-group">
                                <label>Potencial de Impacto Institucional/Social</label>
                                <textarea name="impactPotential" rows="2" defaultValue={editingProject?.impactPotential} placeholder="¿Cómo cambia esto el entorno o la comunidad?" required></textarea>
                            </div>

                            <div className="form-group">
                                <label>Facultad / Programa</label>
                                <select name="mainFilter" defaultValue={editingProject?.mainFilter || "Tecnología"} required>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Ingeniería">Ingeniería</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select name="category" defaultValue={editingProject?.category} required>
                                        {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estado del Proyecto</label>
                                    <select name="status" defaultValue={editingProject?.status} required>
                                        {statuses.filter(s => s !== 'Todos').map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Público Objetivo</label>
                                    <input type="text" name="targetAudience" defaultValue={editingProject?.targetAudience} placeholder="Ej: Niños, Empresas..." required />
                                </div>
                                <div className="form-group">
                                    <label>Licencia</label>
                                    <select name="license" defaultValue={editingProject?.license || "MIT"}>
                                        <option value="MIT">MIT</option>
                                        <option value="GPL">GPL</option>
                                        <option value="Apache">Apache</option>
                                        <option value="Propietaria">Propietaria</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Arquitectura Técnica</label>
                                <textarea name="techArchitecture" rows="2" defaultValue={editingProject?.techArchitecture} placeholder="Ej: MVC, Microservicios, Serverless..." required></textarea>
                            </div>

                            <div className="form-group">
                                <label>Equipo Desarrollador (Opcional)</label>
                                <input type="text" name="team" defaultValue={editingProject?.team} placeholder="Nombres de los integrantes separados por comas" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Semestre</label>
                                    <input type="number" name="semester" min="1" max="10" defaultValue={editingProject?.semester} placeholder="1-10" required />
                                </div>
                                <div className="form-group">
                                    <label>Demo URL (Opcional)</label>
                                    <input type="url" name="demoUrl" defaultValue={editingProject?.demoUrl} placeholder="https://..." />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Stack Tecnológico (separado por comas)</label>
                                <input type="text" name="techStack" defaultValue={editingProject?.techStack?.join(', ')} placeholder="React, Node.js, Firebase" required />
                            </div>

                            <div className="form-group">
                                <label>Captura del Proyecto {editingProject ? '(Opcional si no cambias)' : '(Imagen)'}</label>
                                <input type="file" name="image" accept="image/*" required={!editingProject} />
                            </div>

                            <div className="form-group">
                                <label>Docente Tutor / Supervisor (Asignado)</label>
                                <select name="tutorId" defaultValue={editingProject?.tutorId || ""}>
                                    <option value="">Selecciona un tutor para validación</option>
                                    {Object.values(users).filter(u => u.role === 'teacher').map(t => (
                                        <option key={t.uid} value={t.uid}>{t.name} - {t.program}</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isUploading}>
                                {isUploading ? 'Procesando...' : (editingProject ? 'Actualizar y Enviar a Revisión' : 'Publicar y Enviar a Revisión')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {isOppModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Publicar Nueva Oportunidad</h2>
                            <button className="close-btn" onClick={() => setIsOppModalOpen(false)}>×</button>
                        </div>
                        <form className="upload-form" onSubmit={handleOppSubmit}>
                            <div className="form-group">
                                <label>Cargo / Título</label>
                                <input type="text" name="title" placeholder="Ej: Desarrollador Backend Junior" required />
                            </div>
                            <div className="form-group">
                                <label>Descripción de la Vacante</label>
                                <textarea name="description" rows="4" placeholder="Describe los requisitos y responsabilidades..." required></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Modalidad</label>
                                    <select name="modality" required>
                                        <option value="Remoto">Remoto</option>
                                        <option value="Presencial">Presencial</option>
                                        <option value="Híbrido">Híbrido</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select name="type" required>
                                        <option value="Tiempo Completo">Tiempo Completo</option>
                                        <option value="Práctica / Pasantía">Práctica / Pasantía</option>
                                        <option value="Medio Tiempo">Medio Tiempo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Salario Sugerido</label>
                                    <input type="text" name="salary" placeholder="Ej: 2.5M - 3.5M" required />
                                </div>
                                <div className="form-group">
                                    <label>Ubicación</label>
                                    <input type="text" name="location" placeholder="Ciudad o Remoto" required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Contacto para Aplicar (Email o Link)</label>
                                <input type="text" name="contact" placeholder="Ej: reclutamiento@claro.com" required />
                            </div>
                            <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>Publicar Vacante</button>
                        </form>
                    </div>
                </div>
            )}

            <footer className="dashboard-footer">
                <div className="footer-left">
                    AmigoConnect © 2026 Plataforma de Gestión de Proyectos Académicos. Todos los derechos reservados.
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