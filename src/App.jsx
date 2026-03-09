import { useState, useEffect } from 'react'
import './App.css'
import { auth, db, storage } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query, doc, getDoc, setDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Components
import Login from './components/auth/Login';
import Onboarding from './components/auth/Onboarding';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DashboardPage from './pages/DashboardPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ProfilePage from './pages/ProfilePage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import UploadProjectModal from './components/modals/UploadProjectModal';
import UploadOpportunityModal from './components/modals/UploadOpportunityModal';

function App() {
    const [activeMainFilter, setActiveMainFilter] = useState('Todos');
    const [activeCategories, setActiveCategories] = useState([]); // Array para multi-selección
    const [activeSemester, setActiveSemester] = useState('Todos');
    const [activeStatus, setActiveStatus] = useState('Todos');
    const [activeValidationFilter, setActiveValidationFilter] = useState('Todos');
    const [activeProjectTab, setActiveProjectTab] = useState('all'); // 'all' or 'favorites'
    const [searchQuery, setSearchQuery] = useState('');

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'student' | 'teacher' | 'company'
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState(null); // Error al cargar el perfil
    const [isNewUser, setIsNewUser] = useState(false); // Solo true si el doc de Firestore no existe
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
    const [viewedUserId, setViewedUserId] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isOppModalOpen, setIsOppModalOpen] = useState(false);

    const mainFilters = ['Todos', 'Tecnología', 'Ingeniería'];
    const projectCategories = ['Web', 'Móvil', 'IA', 'IoT', 'Ciberseguridad', 'Data Science'];
    const semesters = ['Todos', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const statuses = ['Todos', 'Estable', 'Beta', 'En Desarrollo'];

    // 0. Manejar estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setAuthError(null);
            setIsNewUser(false);
            try {
                setUser(currentUser);
                if (currentUser) {
                    // Obtener perfil del usuario en Firestore
                    const userRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUserRole(userData.role || 'student');
                        setProfile(userData);
                    } else {
                        // Usuario nuevo → mostrar Onboarding para que elija su rol
                        setUserRole('student');
                        setProfile(null);
                        setIsNewUser(true);
                    }
                } else {
                    setProfile(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error("Error crítico en Auth Listener:", error);
                setAuthError(error.code || error.message);
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

    // 4. Escuchar Oportunidades en tiempo real
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

    const resetFilters = () => {
        setActiveMainFilter('Todos');
        setActiveSemester('Todos');
        setActiveStatus('Todos');
        setActiveCategories([]);
        setActiveValidationFilter('Todos');
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsUploading(true);
        const formData = new FormData(e.target);
        const imageFile = formData.get('image');
        let imageUrl = editingProject?.imageUrl || "";

        try {
            if (imageFile && imageFile.size > 0) {
                const storageRef = ref(storage, `project_images/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

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
                maturityLevel: formData.get('maturityLevel'),
                impactPotential: formData.get('impactPotential'),
                sector: formData.get('sector'),
                tutorId: formData.get('tutorId') || "",
                approvalStatus: 'pending',
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

    const handleDeleteProject = async (project) => {
        if (!project) return;
        const confirmed = window.confirm(`¿Seguro que quieres eliminar "${project.title}"? Esta acción no se puede deshacer.`);
        if (!confirmed) return;
        try {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, "projects", project.id));
            setIsUploadModalOpen(false);
            setEditingProject(null);
        } catch (error) {
            console.error("Error al eliminar proyecto:", error);
            alert("No se pudo eliminar el proyecto. Intenta de nuevo.");
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
                sector: profile?.program || "General",
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
        setViewedUserId(null);
        setActiveView('profile');
    };

    const handleProjectClick = (projectId) => {
        setSelectedProjectId(projectId);
        setActiveView('details');
    };

    const goToDashboard = () => {
        setActiveView('dashboard');
        setSelectedProjectId(null);
        setViewedUserId(null);
    };

    if (authLoading) return <div className="loading-screen">Cargando...</div>;

    if (!user) {
        return <Login />;
    }

    // Error de Firestore al cargar perfil (no confundir con usuario nuevo)
    if (authError) {
        return (
            <div className="loading-screen" style={{ flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: '#f87171' }}>⚠️ Error al cargar tu perfil: {authError}</p>
                <button
                    className="submit-btn"
                    style={{ maxWidth: 200 }}
                    onClick={() => { setAuthError(null); setAuthLoading(true); window.location.reload(); }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (user && isNewUser) {
        return <Onboarding user={user} setProfile={setProfile} setIsNewUser={setIsNewUser} userRole={userRole} setUserRole={setUserRole} />;
    }

    return (
        <div className="dashboard-container">
            <Header
                goToDashboard={goToDashboard}
                activeView={activeView}
                setActiveView={setActiveView}
                unreadCount={unreadCount}
                isNotifOpen={isNotifOpen}
                setIsNotifOpen={setIsNotifOpen}
                notifications={notifications}
                setSelectedProjectId={setSelectedProjectId}
                handleProfileClick={handleProfileClick}
                profile={profile}
                user={user}
                handleLogout={handleLogout}
            />

            {activeView === 'dashboard' && (
                <DashboardPage
                    activeMainFilter={activeMainFilter} setActiveMainFilter={setActiveMainFilter} mainFilters={mainFilters}
                    activeSemester={activeSemester} setActiveSemester={setActiveSemester} semesters={semesters}
                    activeStatus={activeStatus} setActiveStatus={setActiveStatus} statuses={statuses}
                    activeValidationFilter={activeValidationFilter} setActiveValidationFilter={setActiveValidationFilter}
                    activeCategories={activeCategories} setActiveCategories={setActiveCategories} projectCategories={projectCategories}
                    activeProjectTab={activeProjectTab} setActiveProjectTab={setActiveProjectTab}
                    projects={projects}
                    userRole={userRole}
                    user={user}
                    profile={profile}
                    users={users}
                    handleProjectClick={handleProjectClick}
                    handleToggleFavorite={handleToggleFavorite}
                    handleApproveProject={handleApproveProject}
                    handleRejectProject={handleRejectProject}
                    handleToggleValidation={handleToggleValidation}
                    setEditingProject={setEditingProject}
                    setIsUploadModalOpen={setIsUploadModalOpen}
                    setViewedUserId={setViewedUserId}
                    setActiveView={setActiveView}
                    resetFilters={resetFilters}
                />
            )}

            {activeView === 'opportunities' && (
                <OpportunitiesPage
                    opportunities={opportunities}
                    profile={profile}
                    userRole={userRole}
                    user={user}
                    setIsOppModalOpen={setIsOppModalOpen}
                    handleToggleFavorite={handleToggleFavorite}
                />
            )}

            {activeView === 'profile' && (
                <ProfilePage
                    user={user}
                    profile={profile}
                    setProfile={setProfile}
                    users={users}
                    viewedUserId={viewedUserId}
                    projects={projects}
                    handleProjectClick={handleProjectClick}
                />
            )}

            {activeView === 'details' && selectedProjectId && (
                <ProjectDetailsPage
                    project={projects.find(p => p.id === selectedProjectId)}
                    author={users[projects.find(p => p.id === selectedProjectId)?.authorId] || {}}
                    profile={profile}
                    handleToggleFavorite={handleToggleFavorite}
                    goToDashboard={goToDashboard}
                    setViewedUserId={setViewedUserId}
                    setActiveView={setActiveView}
                    handleProjectClick={handleProjectClick}
                    projects={projects}
                />
            )}

            {userRole === 'student' && (
                <button className="fab" onClick={() => setIsUploadModalOpen(true)}>+</button>
            )}

            {isUploadModalOpen && (
                <UploadProjectModal
                    editingProject={editingProject}
                    setEditingProject={setEditingProject}
                    setIsUploadModalOpen={setIsUploadModalOpen}
                    handleProjectSubmit={handleProjectSubmit}
                    handleDeleteProject={handleDeleteProject}
                    isUploading={isUploading}
                    projectCategories={projectCategories}
                    statuses={statuses}
                    users={users}
                />
            )}

            {isOppModalOpen && (
                <UploadOpportunityModal
                    setIsOppModalOpen={setIsOppModalOpen}
                    handleOppSubmit={handleOppSubmit}
                />
            )}

            <Footer />
        </div>
    );
}

export default App