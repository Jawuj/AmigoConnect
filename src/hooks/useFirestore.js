import { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export const useFirestore = (user, userRole) => {
    const [projects, setProjects] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [users, setUsers] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [auditLogs, setAuditLogs] = useState([]);

    // 1. Escuchar Usuarios en tiempo real (excluye proxies de sesión y cuentas de prueba)
    useEffect(() => {
        const qUsers = query(collection(db, "users"));
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const usersData = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                // Ignorar documentos proxy de sesión y cuentas de prueba
                if (data.isSessionProxy === true || data.isTestAccount === true) return;
                usersData[doc.id] = { ...data, uid: doc.id };
                if (data.DocumentID) {
                    usersData[String(data.DocumentID)] = { ...data, uid: doc.id };
                }
            });
            setUsers(usersData);
        }, (error) => {
            console.error("Firestore Listener Error [Users]:", error);
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
        }, (error) => {
            console.error("Firestore Listener Error [Projects]:", error);
        });
        return () => unsubscribeProjects();
    }, []);

    // 3. Notificaciones en Tiempo Real
    useEffect(() => {
        if (!user) return;
        const actingCompanyId = localStorage.getItem('actingCompanyId');
        const targetUid = (user.isAnonymous && actingCompanyId) ? actingCompanyId : user.uid;

        const q = query(collection(db, "notifications"), where("to", "==", targetUid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(n => n.to === targetUid)
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.read).length);
        }, (error) => {
            console.error("Firestore Listener Error [Notifications]:", error);
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
        }, (error) => {
            console.error("Firestore Listener Error [Opportunities]:", error);
        });
        return () => unsubscribeOpps();
    }, []);

    // 5. Escuchar Logs de Auditoría (Solo para Admin)
    useEffect(() => {
        if (userRole !== 'admin') return;
        const qLogs = query(collection(db, "audit_logs"));
        const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
            const logsData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setAuditLogs(logsData);
        }, (error) => {
            console.error("Firestore Listener Error [AuditLogs]:", error);
        });
        return () => unsubscribeLogs();
    }, [userRole]);

    return {
        projects,
        setProjects,
        opportunities,
        users,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        auditLogs
    };
};
