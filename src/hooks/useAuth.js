import { useState, useEffect, useRef } from 'react';
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');
    
    // Usamos una ref para persistir el estado de "primera carga" sin cierres obsoletos
    const isInitialLoad = useRef(true);

    useEffect(() => {
        let unsubscribeProfile = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setAuthError(null);
            setIsNewUser(false);
            
            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            setUser(currentUser);

            if (currentUser) {
                let targetUid = currentUser.uid;
                const actingCompanyId = localStorage.getItem('actingCompanyId');
                if (currentUser.isAnonymous && actingCompanyId) {
                    targetUid = actingCompanyId;
                }

                const userRef = doc(db, "users", targetUid);

                unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setProfile(userData);
                        const role = userData.role || 'student';
                        setUserRole(role);
                        
                        // Solo establecemos la vista inicial LA PRIMERA VEZ
                        if (isInitialLoad.current) {
                            if (role === 'student' || role === 'graduate') {
                                setActiveView('my-projects');
                            } else if (role === 'company') {
                                setActiveView('company-home');
                            } else if (role === 'admin') {
                                setActiveView('admin');
                            } else {
                                setActiveView('dashboard');
                            }
                            isInitialLoad.current = false;
                        }
                    } else if (currentUser.isAnonymous) {
                        setUserRole('guest');
                        setProfile(null);
                        if (isInitialLoad.current) {
                            setActiveView('dashboard');
                            isInitialLoad.current = false;
                        }
                    } else {
                        setUserRole('student');
                        setProfile(null);
                        setIsNewUser(true);
                        if (isInitialLoad.current) {
                            setActiveView('dashboard');
                            isInitialLoad.current = false;
                        }
                    }
                    setAuthLoading(false);
                }, (error) => {
                    console.error("Error en Profile Listener:", error);
                    setAuthError(error.code || error.message);
                    setAuthLoading(false);
                });
            } else {
                setProfile(null);
                setUserRole(null);
                setActiveView('dashboard');
                setAuthLoading(false);
                isInitialLoad.current = true; // Reiniciar para el próximo login
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    return {
        user,
        profile,
        setProfile,
        userRole,
        setUserRole,
        authLoading,
        setAuthLoading,
        authError,
        setAuthError,
        isNewUser,
        setIsNewUser,
        activeView,
        setActiveView
    };
};
