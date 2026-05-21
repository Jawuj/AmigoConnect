import { db, auth } from "../firebase";
import { collection, doc, setDoc, getDoc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { signInAnonymously, signOut } from "firebase/auth";

/**
 * Elimina todas las cuentas marcadas como proxy de sesión (isSessionProxy: true)
 * y las cuentas de prueba (isTestAccount: true).
 */
export const deleteTestAndProxyAccounts = async () => {
    try {
        const usersSnap = await getDocs(collection(db, "users"));
        const batch = writeBatch(db);
        let count = 0;
        usersSnap.docs.forEach(d => {
            const data = d.data();
            // Evitar borrar el admin definitivo, y limpiar otros admin duplicados heredados
            if (d.id !== "system_admin" && (
                data.isTestAccount === true || 
                data.isSessionProxy === true || 
                data.role === "admin"
            )) {
                batch.delete(d.ref);
                count++;
            }
        });
        await batch.commit();
        console.log(`[initializeSystem] Eliminadas ${count} cuentas de prueba/proxy/duplicados.`);
        return count;
    } catch (error) {
        console.error("[initializeSystem] Error eliminando cuentas:", error);
        throw error;
    }
};

/**
 * Crea el perfil definitivo del Administrador en Firestore si no existe ninguno real.
 * Requiere una sesión de Firebase Auth activa para cumplir las reglas de seguridad.
 * El documento se crea bajo el UID actual de Auth para que la regla `request.auth.uid == userId` pase.
 */
export const createRealAdmin = async () => {
    try {
        const adminRef = doc(db, "users", "system_admin");
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
            console.log("[initializeSystem] Ya existe el Administrador real. No se creará otro.");
            return "system_admin";
        }

        // Asegurar sesión anónima para poder escribir bajo el UID de Auth
        if (!auth.currentUser) {
            await signInAnonymously(auth);
        }

        await setDoc(adminRef, {
            uid: "system_admin",
            firstName: "Administrador",
            lastName: "",
            mail: "admin",
            password: "777v",
            role: "admin",
            city: "Medellín",
            country: "Colombia",
            phone: "",
            biography: "Administrador del sistema AmigoConnect.",
            program: "",
            semester: "",
            favorites: [],
            technicalSkills: [],
            academicExperience: [],
            availableForInternship: false,
            availableForJob: false,
            isTestAccount: false,
            isSessionProxy: false,
            createdAt: new Date().toISOString()
        });

        console.log("[initializeSystem] Admin creado con UID: system_admin");
        return "system_admin";
    } catch (error) {
        console.error("[initializeSystem] Error creando admin:", error);
        throw error;
    }
};

/**
 * Función principal: limpia cuentas de prueba/proxy y crea el Admin real.
 * Llama a esta función con Ctrl+K desde el panel.
 */
export const initializeSystem = async () => {
    try {
        console.log("[initializeSystem] Iniciando limpieza y configuración...");
        
        // Asegurar sesión limpia (cerrando sesión previa si existe)
        await signOut(auth);
        await signInAnonymously(auth);

        const deleted = await deleteTestAndProxyAccounts();
        const adminUid = await createRealAdmin();

        if (adminUid) {
            console.log("[initializeSystem] Sistema inicializado. Admin UID:", adminUid);
            // Guardar el actingCompanyId para que el usuario actual entre como admin
            localStorage.setItem('actingCompanyId', adminUid);
        }

        return { success: true, deleted, adminCreated: !!adminUid };
    } catch (error) {
        console.error("[initializeSystem] Fallo:", error);
        return { success: false, error: error.message };
    }
};
