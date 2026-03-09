import React from 'react';
import Icons from '../shared/Icons';
import { db } from "../../firebase";
import { updateDoc, doc } from "firebase/firestore";

function Header({
    goToDashboard,
    activeView,
    setActiveView,
    unreadCount,
    isNotifOpen,
    setIsNotifOpen,
    notifications,
    setSelectedProjectId,
    handleProfileClick,
    profile,
    user,
    handleLogout
}) {
    return (
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
    );
}

export default Header;
