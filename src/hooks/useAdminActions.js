import { db } from "../firebase";
import { collection, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export const useAdminActions = (user, profile, users, projects, showToast, sendNotification, customPrompt) => {

    const createAuditLog = async (action, targetId, details) => {
        try {
            await addDoc(collection(db, "audit_logs"), {
                adminId: profile?.uid || user.uid,
                adminName: profile?.firstName + " " + (profile?.lastName || ""),
                action,
                targetId,
                details,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error creating audit log:", error);
        }
    };

    const handleAdminUpdateUser = async (uid, newData) => {
        try {
            const targetUser = users[uid];
            await updateDoc(doc(db, "users", uid), newData);
            await createAuditLog("UPDATE_USER", uid, { 
                name: (targetUser?.firstName || '') + ' ' + (targetUser?.lastName || ''),
                changes: "Actualización de perfil" 
            });
            showToast("Usuario actualizado por administrador", "success");
        } catch (error) {
            console.error("Error admin update user:", error);
            showToast("Error al actualizar usuario", "error");
        }
    };

    const handleAdminDeleteUser = async (uid, silent = false) => {
        try {
            const { deleteDoc } = await import('firebase/firestore');
            const targetUser = users[uid];
            await deleteDoc(doc(db, "users", uid));
            await createAuditLog("DELETE_USER", uid, { name: targetUser?.firstName + " " + targetUser?.lastName });
            
            if (sendNotification) {
                await sendNotification(uid, "Tu cuenta ha sido eliminada por un administrador del sistema.", "sistema", null);
            }
            
            if (!silent) showToast("Usuario eliminado por administrador", "success");
        } catch (error) {
            console.error("Error admin delete user:", error);
            if (!silent) showToast("Error al eliminar usuario", "error");
        }
    };

    const handleAdminUpdateProject = async (pid, newData) => {
        try {
            const projectRef = doc(db, "projects", pid);
            const oldData = projects.find(p => p.id === pid);
            await updateDoc(projectRef, newData);
            await createAuditLog("UPDATE_PROJECT", pid, { 
                title: newData.title || oldData?.title || 'N/A' 
            });

            if (oldData.maturityLevel !== 'Producción' && newData.maturityLevel === 'Producción') {
                const admins = Object.values(users).filter(u => u.role === 'admin');
                for (const adm of admins) {
                    if (sendNotification) {
                        await sendNotification(adm.uid, `El proyecto "${newData.title}" ha escalado a PRODUCCIÓN.`, "sistema", pid);
                    }
                }
            }

            showToast("Proyecto actualizado por administrador", "success");
        } catch (error) {
            console.error("Error admin update project:", error);
            showToast("Error al actualizar proyecto", "error");
        }
    };

    const handleAdminDeleteProject = async (pid, silent = false) => {
        try {
            const targetProj = projects.find(p => p.id === pid);
            let reason = "Infracción de las normas de la comunidad";
            
            if (!silent && customPrompt) {
                const res = await customPrompt(`¿Por qué deseas eliminar el proyecto "${targetProj?.title}"? (Motivo para el autor)`);
                if (!res) return; // Cancelado
                reason = res;
            }

            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, "projects", pid));
            await createAuditLog("DELETE_PROJECT", pid, { 
                title: targetProj?.title,
                reason: reason 
            });

            if (targetProj?.authorId && sendNotification) {
                await sendNotification(
                    targetProj.authorId, 
                    `Tu proyecto "${targetProj.title}" ha sido eliminado por un administrador. Motivo: ${reason}`, 
                    "sistema", 
                    null
                );
            }
            
            if (!silent) showToast("Proyecto eliminado con éxito", "success");
        } catch (error) {
            console.error("Error admin delete project:", error);
            if (!silent) showToast("Error al eliminar proyecto", "error");
        }
    };

    const handleAdminCreateCompany = async (companyData) => {
        try {
            const { setDoc } = await import('firebase/firestore');
            
            const mailExists = Object.values(users).some(u => u.mail?.toLowerCase() === companyData.mail?.toLowerCase());
            if (mailExists) {
                showToast("El correo o usuario ya se encuentra registrado", "error");
                return false;
            }

            const companyRef = doc(collection(db, "users"));
            const companyUid = companyRef.id;
            
            const finalData = {
                ...companyData,
                uid: companyUid
            };

            await setDoc(companyRef, finalData);
            
            await createAuditLog("CREATE_COMPANY", companyUid, { 
                name: companyData.firstName,
                mail: companyData.mail
            });
            
            showToast("Empresa creada con éxito", "success");
            return true;
        } catch (error) {
            console.error("Error creating company:", error);
            showToast("Error al crear la empresa", "error");
            return false;
        }
    };

    return {
        createAuditLog,
        handleAdminUpdateUser,
        handleAdminDeleteUser,
        handleAdminUpdateProject,
        handleAdminDeleteProject,
        handleAdminCreateCompany
    };
};
