import { useState, useEffect } from 'react'
import './App.css'
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";

// Components
import Login from './components/auth/Login';
import Onboarding from './components/auth/Onboarding';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Filters from './components/projects/Filters';
import DashboardPage from './pages/DashboardPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ProfilePage from './pages/ProfilePage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import AdminPage from './pages/AdminPage';
import UsersPage from './pages/UsersPage';
import CompanyHomePage from './pages/CompanyHomePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import UploadProjectModal from './components/modals/UploadProjectModal';
import UploadOpportunityModal from './components/modals/UploadOpportunityModal';
import Icons from './components/shared/Icons';
import { useToast } from './components/shared/useToast';
import ToastContainer from './components/shared/Toast';
import ConfirmModal from './components/modals/ConfirmModal';

import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
import { useProjectActions } from './hooks/useProjectActions';
import { useAdminActions } from './hooks/useAdminActions';
import { useOpportunityActions } from './hooks/useOpportunityActions';
import { mainFilters, projectCategories, semesters, statuses } from './constants/filters';
import { seedDatabase, clearAuditLogs } from './utils/seeder';
import './styles/users.css';
import './styles/company.css';

function App() {
    const { toasts, showToast, removeToast } = useToast();
    
    // Auth & Views
    const {
        user, profile, setProfile, userRole, setUserRole,
        authLoading, authError, isNewUser, setIsNewUser,
        activeView, setActiveView
    } = useAuth();

    // Firestore Data
    const {
        projects, setProjects, opportunities, users,
        notifications, unreadCount, auditLogs
    } = useFirestore(user, userRole);

    // Global UI State
    const [activeMainFilter, setActiveMainFilter] = useState('Todos');
    const [activeCategories, setActiveCategories] = useState([]);
    const [activeSemester, setActiveSemester] = useState('Todos');
    const [activeStatus, setActiveStatus] = useState('Todos');
    const [activeValidationFilter, setActiveValidationFilter] = useState('Todos');
    const [activeProjectTab, setActiveProjectTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('carousel');
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [viewedUserId, setViewedUserId] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isOppModalOpen, setIsOppModalOpen] = useState(false);
    const [oppModalType, setOppModalType] = useState('job'); // 'job' or 'project'

    const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', onConfirm: null, onCancel: null });
    const [promptState, setPromptState] = useState({ isOpen: false, message: '', onConfirm: null, onCancel: null });

    const customConfirm = (message, confirmText = 'Eliminar', cancelText = 'Cancelar') => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                message,
                confirmText,
                cancelText,
                onConfirm: () => { setConfirmState(s => ({ ...s, isOpen: false })); resolve(true); },
                onCancel: () => { setConfirmState(s => ({ ...s, isOpen: false })); resolve(false); }
            });
        });
    };

    const customPrompt = (message) => {
        return new Promise((resolve) => {
            setPromptState({
                isOpen: true,
                message,
                onConfirm: (val) => { setPromptState(s => ({ ...s, isOpen: false })); resolve(val); },
                onCancel: () => { setPromptState(s => ({ ...s, isOpen: false })); resolve(null); }
            });
        });
    };

    // Actions
    const {
        handleProjectSubmit: submitProj,
        handleToggleFavorite,
        handleApproveProject,
        handleToggleValidation,
        handleRejectProject,
        handleDeleteProject: deleteProj,
        sendNotification
    } = useProjectActions(user, profile, setProfile, userRole, users, showToast, customPrompt, customConfirm);

    const {
        handleAdminUpdateUser,
        handleAdminDeleteUser,
        handleAdminUpdateProject,
        handleAdminDeleteProject,
        handleAdminCreateCompany
    } = useAdminActions(user, profile, users, projects, showToast, sendNotification, customPrompt);

    const {
        handleDeleteOpportunity,
        handleOppSubmit: submitOpp,
        handleApproveOpportunity,
        handleRejectOpportunity,
        handleUpdateOpportunity
    } = useOpportunityActions(user, profile, userRole, showToast, customConfirm, customPrompt, sendNotification);

    const handleOppSubmit = (e) => submitOpp(e, setIsOppModalOpen);

    const resetFilters = () => {
        setActiveMainFilter('Todos');
        setActiveSemester('Todos');
        setActiveStatus('Todos');
        setActiveCategories([]);
        setActiveValidationFilter('Todos');
    };

    const handleClearNotifications = async () => {
        try {
            const { writeBatch, collection, query, where, getDocs } = await import('firebase/firestore');
            const batch = writeBatch(db);
            const actingCompanyId = localStorage.getItem('actingCompanyId');
            const targetUid = (user.isAnonymous && actingCompanyId) ? actingCompanyId : user.uid;
            const q = query(collection(db, "notifications"), where("to", "==", targetUid));
            const snapshot = await getDocs(q);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            showToast("Notificaciones eliminadas", "success");
        } catch (error) {
            console.error("Error clearing notifications:", error);
            showToast("Error al limpiar notificaciones", "error");
        }
    };

    const handleProjectSubmit = async (e) => {
        setIsUploading(true);
        const success = await submitProj(e, editingProject);
        if (success) {
            setIsUploadModalOpen(false);
            setEditingProject(null);
        }
        setIsUploading(false);
    };

    const handleDeleteProject = async (project) => {
        const success = await deleteProj(project);
        if (success) {
            setIsUploadModalOpen(false);
            setEditingProject(null);
        }
    };

    useEffect(() => {
        const handleGlobalKeyDown = async (e) => {
            const isInput = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
            if (isInput) return;

            // Ctrl + V (Seeder)
            if (e.ctrlKey && (e.key === 'v' || e.key === 'V' || e.code === 'KeyV')) {
                e.preventDefault();
                const confirmed = await customConfirm(
                    '¿Estás seguro que deseas regenerar la base de datos de pruebas (Seeder)?',
                    'Ejecutar Seeder',
                    'Cancelar'
                );
                
                if (confirmed) {
                    showToast('Ejecutando seeder, por favor espera...', 'info');
                    const success = await seedDatabase();
                    if (success) {
                        showToast('Base de datos regenerada con éxito.', 'success');
                    }
                }
            }

            // Ctrl + C (Audit Logs) - Solo Admin
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.code === 'KeyC') && userRole === 'admin') {
                e.preventDefault();
                const confirmed = await customConfirm(
                    '¿Estás seguro de que deseas ELIMINAR TODOS los registros de auditoría?',
                    'Borrar Auditoría',
                    'Cancelar'
                );
                
                if (confirmed) {
                    const success = await clearAuditLogs();
                    if (success) showToast('Registros de auditoría eliminados', 'success');
                    else showToast('Error al eliminar registros', 'error');
                }
            }

        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [userRole, customConfirm, showToast]);

    // Reset scroll position to top when switching views or projects
    useEffect(() => {
        const viewport = document.querySelector('.main-viewport');
        if (viewport) {
            viewport.scrollTop = 0;
        }
    }, [activeView, selectedProjectId, viewedUserId]);


    const handleLogout = async () => {
        try {
            if (user && user.isAnonymous) {
                const { deleteDoc } = await import('firebase/firestore');
                await deleteDoc(doc(db, "users", user.uid));
            }
        } catch (error) {
            console.error("Error deleting session proxy on logout:", error);
        }
        localStorage.removeItem('actingCompanyId');
        await signOut(auth);
        setActiveView('dashboard');
    };

    const handleProfileClick = () => {
        setViewedUserId(null);
        setActiveView('profile');
    };

    const handleProjectClick = async (projectId) => {
        setSelectedProjectId(projectId);
        setActiveView('details');

        if (!user) return;

        const viewerId = profile?.uid || user.uid;

        // Validación previa local para evitar doble incremento y peticiones extra
        const project = projects.find(p => p.id === projectId);
        if (project && project.viewedBy && project.viewedBy.includes(viewerId)) return;

        try {
            const projectRef = doc(db, "projects", projectId);
            const projSnap = await getDoc(projectRef);
            
            if (projSnap.exists()) {
                const projData = projSnap.data();
                const viewedBy = projData.viewedBy || [];

                // Solo sumamos vista si el usuario no lo ha visto antes
                if (!viewedBy.includes(viewerId)) {
                    await updateDoc(projectRef, {
                        views: increment(1),
                        viewedBy: arrayUnion(viewerId)
                    });
                    
                }
            }
        } catch (error) {
            console.error("Error al registrar la visualización:", error);
        }
    };

    const goToDashboard = () => {
        if (userRole === 'company') {
            setActiveView('company-home');
        } else if (userRole === 'student' || userRole === 'graduate') {
            setActiveView('my-projects');
        } else if (userRole === 'admin') {
            setActiveView('admin');
        } else {
            setActiveView('dashboard');
        }
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
                {authError && (
                    <p style={{ color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px' }}>
                        <Icons.AlertTriangle /> Error al cargar tu perfil: {authError}
                    </p>
                )}
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
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <Onboarding user={user} setProfile={setProfile} setIsNewUser={setIsNewUser} userRole={userRole} setUserRole={setUserRole} showToast={showToast} />
            </>
        );
    }

    return (
        <div className="dashboard-container">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <ConfirmModal {...confirmState} />
            <ConfirmModal {...promptState} isPrompt />
            
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
                userRole={userRole}
                handleLogout={handleLogout}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleClearNotifications={handleClearNotifications}
            />

            <div className="layout-body">
                {(activeView === 'dashboard' || activeView === 'my-projects') && (
                        <Filters
                            activeMainFilter={activeMainFilter} setActiveMainFilter={setActiveMainFilter} mainFilters={mainFilters}
                            activeSemester={activeSemester} setActiveSemester={setActiveSemester} semesters={semesters}
                            activeStatus={activeStatus} setActiveStatus={setActiveStatus} statuses={statuses}
                            activeCategories={activeCategories} setActiveCategories={setActiveCategories} projectCategories={projectCategories}
                            activeView={activeView}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />
                )}

                <main className="main-viewport">
                    {activeView === 'dashboard' && (
                        <DashboardPage
                            projects={projects}
                            users={users}
                            searchQuery={searchQuery}
                            activeMainFilter={activeMainFilter}
                            activeCategories={activeCategories}
                            activeSemester={activeSemester}
                            activeStatus={activeStatus}
                            handleProjectClick={handleProjectClick}
                            handleToggleFavorite={handleToggleFavorite}
                            handleApproveProject={handleApproveProject}
                            handleRejectProject={handleRejectProject}
                            handleToggleValidation={handleToggleValidation}
                            profile={profile}
                            user={user}
                            userRole={userRole}
                            handleEditProject={setEditingProject}
                            setIsUploadModalOpen={setIsUploadModalOpen}
                            setViewedUserId={setViewedUserId}
                            setActiveView={setActiveView}
                            viewMode={viewMode}
                        />
                    )}

                    {activeView === 'my-projects' && (
                        <DashboardPage
                            key="my-projects"
                            title="Mis Proyectos"
                            hideHero={true}
                            projects={projects.filter(p => p.authorId === user?.uid)}
                            users={users}
                            searchQuery={searchQuery}
                            activeMainFilter={activeMainFilter}
                            activeCategories={activeCategories}
                            activeSemester={activeSemester}
                            activeStatus={activeStatus}
                            handleProjectClick={handleProjectClick}
                            handleToggleFavorite={handleToggleFavorite}
                            handleApproveProject={handleApproveProject}
                            handleRejectProject={handleRejectProject}
                            handleToggleValidation={handleToggleValidation}
                            profile={profile}
                            user={user}
                            userRole={userRole}
                            handleEditProject={setEditingProject}
                            setIsUploadModalOpen={setIsUploadModalOpen}
                            setViewedUserId={setViewedUserId}
                            setActiveView={setActiveView}
                            viewMode={viewMode}
                        />
                    )}

                    {activeView === 'opportunities' && (
                        <OpportunitiesPage
                            opportunities={opportunities}
                            profile={profile}
                            userRole={userRole}
                            user={user}
                            setIsOppModalOpen={setIsOppModalOpen}
                            setOppModalType={setOppModalType}
                            handleToggleFavorite={handleToggleFavorite}
                            handleDeleteOpportunity={handleDeleteOpportunity}
                            handleApproveOpportunity={handleApproveOpportunity}
                            handleRejectOpportunity={handleRejectOpportunity}
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
                            showToast={showToast}
                            customPrompt={customPrompt}
                            userRole={userRole}
                        />
                    )}

                    {activeView === 'users' && (
                        <UsersPage 
                            users={users}
                            projects={projects}
                            searchQuery={searchQuery}
                            setViewedUserId={setViewedUserId}
                            setActiveView={setActiveView}
                        />
                    )}

                    {activeView === 'company-home' && (
                        <CompanyHomePage 
                            setActiveView={setActiveView}
                            profile={profile}
                        />
                    )}

                    {activeView === 'details' && selectedProjectId && (
                        <ProjectDetailsPage
                            project={projects.find(p => p.id === selectedProjectId)}
                            author={(users && projects.find(p => p.id === selectedProjectId)) ? users[projects.find(p => p.id === selectedProjectId).authorId] : {}}
                            profile={profile}
                            user={user}
                            userRole={userRole}
                            handleToggleFavorite={handleToggleFavorite}
                            goToDashboard={goToDashboard}
                            setViewedUserId={setViewedUserId}
                            setActiveView={setActiveView}
                            handleProjectClick={handleProjectClick}
                            projects={projects}
                            setEditingProject={setEditingProject}
                            setIsUploadModalOpen={setIsUploadModalOpen}
                        />
                    )}

                    {activeView === 'admin' && userRole === 'admin' && (
                        <AdminPage 
                            users={users}
                            projects={projects}
                            handleAdminUpdateUser={handleAdminUpdateUser}
                            handleAdminDeleteUser={handleAdminDeleteUser}
                            handleAdminUpdateProject={handleAdminUpdateProject}
                            handleAdminDeleteProject={handleAdminDeleteProject}
                            handleApproveProject={handleApproveProject}
                            handleRejectProject={handleRejectProject}
                            handleToggleValidation={handleToggleValidation}
                            auditLogs={auditLogs}
                            opportunities={opportunities}
                            handleApproveOpportunity={handleApproveOpportunity}
                            handleRejectOpportunity={handleRejectOpportunity}
                            handleDeleteOpportunity={handleDeleteOpportunity}
                            handleUpdateOpportunity={handleUpdateOpportunity}
                            handleAdminCreateCompany={handleAdminCreateCompany}
                            setViewedUserId={setViewedUserId}
                            setActiveView={setActiveView}
                            showToast={showToast}
                            customConfirm={customConfirm}
                        />
                    )}

                    {activeView === 'terms' && (
                        <TermsPage setActiveView={setActiveView} />
                    )}

                    {activeView === 'privacy' && (
                        <PrivacyPage setActiveView={setActiveView} />
                    )}
                    
                    <Footer setActiveView={setActiveView} />
                </main>
            </div>

            {(userRole === 'student' || userRole === 'graduate') && (
                <button className="premium-fab" onClick={() => setIsUploadModalOpen(true)} title="Subir Proyecto">
                    <Icons.Plus />
                </button>
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
                    customConfirm={customConfirm}
                    setActiveView={setActiveView}
                />
            )}

            {isOppModalOpen && (
                <UploadOpportunityModal
                    setIsOppModalOpen={setIsOppModalOpen}
                    handleOppSubmit={handleOppSubmit}
                    oppModalType={oppModalType}
                />
            )}
        </div>
    );
}

export default App