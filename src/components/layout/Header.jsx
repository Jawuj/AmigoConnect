import React, { useState } from 'react';
import Icons from '../shared/Icons';
import { db } from "../../firebase";
import { updateDoc, doc } from "firebase/firestore";
import { seedDatabase } from '../../utils/seeder';

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
    userRole,
    handleLogout,
    searchQuery,
    setSearchQuery,
    handleClearNotifications
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [dropdownTop, setDropdownTop] = React.useState(0);
    const notifRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        if (isNotifOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isNotifOpen]);

    // Calcula posición del dropdown según la altura real del header (para móvil)
    React.useEffect(() => {
        if (isNotifOpen) {
            const headerEl = document.querySelector('.dashboard-header');
            if (headerEl) {
                const rect = headerEl.getBoundingClientRect();
                setDropdownTop(rect.bottom + 8);
            }
        }
    }, [isNotifOpen, isMobileMenuOpen]);

    return (
        <header className={`dashboard-header ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="header-mobile-top">
                <div className="header-left">
                    <div className="logo-container" onClick={goToDashboard}>
                        <span className="logo-icon"><img src="./UniversityIsotipo.png" alt="Logo" /></span>
                        <span className="logo-text hide-mobile">AmigoConnect</span>
                    </div>
                </div>

                <button className="mobile-menu-btn mobile-only" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
                </button>
            </div>

            <div className={`mobile-search-overlay ${isMobileSearchOpen ? 'open' : ''}`}>
                <div className="search-container mobile">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus={isMobileSearchOpen}
                    />
                    <button className="close-search" onClick={() => setIsMobileSearchOpen(false)}><Icons.X /></button>
                </div>
            </div>

            <div className={`header-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="nav-links">
                    {(userRole === 'student' || userRole === 'graduate') && (
                        <button className={`nav-link ${activeView === 'my-projects' ? 'active' : ''}`} onClick={() => { setActiveView('my-projects'); setIsMobileMenuOpen(false); }}>Inicio</button>
                    )}
                    <button className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }}>Proyectos</button>
                    <button className={`nav-link ${activeView === 'users' ? 'active' : ''}`} onClick={() => { setActiveView('users'); setIsMobileMenuOpen(false); }}>Usuarios</button>
                    <button className={`nav-link ${activeView === 'opportunities' ? 'active' : ''}`} onClick={() => { setActiveView('opportunities'); setIsMobileMenuOpen(false); }}>Oportunidades</button>
                    {userRole === 'admin' && (
                        <button className={`nav-link ${activeView === 'admin' ? 'active' : ''}`} onClick={() => { setActiveView('admin'); setIsMobileMenuOpen(false); }}>Panel Admin</button>
                    )}
                </div>
            </div>

            <div className="search-container hide-mobile">
                <input
                    type="text"
                    placeholder="Buscar proyectos o usuarios..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="header-actions hide-mobile">
                <div className="theme-toggle-wrapper">
                    <button
                        className="icon-button"
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
                    </button>
                </div>

                {(profile || !user?.isAnonymous) && (
                    <div className="notification-wrapper" ref={notifRef}>
                        <button
                            className={`icon-button ${unreadCount > 0 ? 'has-notifications' : ''}`}
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            title="Notificaciones"
                        >
                            <Icons.Bell />
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </button>

                        {isNotifOpen && (
                            <div
                                className="notification-dropdown"
                                style={window.innerWidth <= 850 && dropdownTop ? { top: `${dropdownTop}px` } : {}}
                            >
                                <div className="notif-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h4>Notificaciones</h4>
                                        {notifications.length > 0 && (
                                            <button 
                                                className="clear-notifs-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClearNotifications();
                                                }}
                                                title="Borrar todas"
                                            >
                                                <Icons.Trash size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <button className="close-notif-btn" onClick={() => setIsNotifOpen(false)}>
                                        <Icons.X />
                                    </button>
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
                )}

                <div className="user-profile-info" onClick={(profile || !user?.isAnonymous) ? handleProfileClick : null}>
                    <div className="user-profile-img">
                        {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Yo" />
                        ) : (
                            <span>{(profile?.firstName || user?.displayName || 'U').charAt(0)}</span>
                        )}
                    </div>
                </div>
                <button className="icon-button" onClick={handleLogout} title="Cerrar sesión"><Icons.Logout /></button>
            </div>
        </header>
    );
}

export default Header;
