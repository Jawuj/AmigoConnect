import { db, storage } from "../firebase";
import { collection, doc, addDoc, updateDoc, getDoc, serverTimestamp, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const useProjectActions = (user, profile, setProfile, userRole, users, showToast, customPrompt, customConfirm) => {

    const sendNotification = async (toUid, message, type, targetId) => {
        try {
            await addDoc(collection(db, "notifications"), {
                to: toUid,
                from: user.uid,
                fromName: profile?.firstName + " " + profile?.lastName || user.displayName,
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

    const handleProjectSubmit = async (e, editingProject) => {
        e.preventDefault();
        if (!user) return;

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
                slug: formData.get('slug'),
                category: formData.get('category'),
                description: formData.get('description'), // Capturar descripción corta
                fullDescription: formData.get('fullDescription') || "",
                problemSolved: formData.get('problemSolved'),
                targetAudience: formData.get('targetAudience'),
                techArchitecture: formData.get('techArchitecture'),
                license: formData.get('license'),
                team: formData.get('team') || "",
                status: formData.get('status'),
                techStack: formData.get('techStack') ? formData.get('techStack').split(',').map(item => item.trim()) : [],
                demoUrl: formData.get('demoUrl') || "",
                sourceCodeUrl: formData.get('sourceCodeUrl') || "",
                docsUrl: formData.get('docsUrl') || "",
                imageUrl: imageUrl,
                videoUrl: formData.get('videoUrl') || "",
                estimatedPrice: formData.get('estimatedPrice') ? Number(formData.get('estimatedPrice')) : null,
                currency: formData.get('currency') || "COP",
                businessModel: formData.get('businessModel') || "",
                maturityLevel: formData.get('maturityLevel'),
                impactPotential: formData.get('impactPotential'),
                program: formData.get('program'),
                sector: formData.get('sector'),
                semester: profile?.semester || 1, // Guardar semestre del autor automáticamente
                updatedAt: serverTimestamp()
            };

            if (editingProject) {
                await updateDoc(doc(db, "projects", editingProject.id), projectData);
                
                if (editingProject.maturityLevel !== 'Producción' && projectData.maturityLevel === 'Producción') {
                    const admins = Object.values(users).filter(u => u.role === 'admin');
                    for (const adm of admins) {
                        await sendNotification(adm.uid, `El proyecto "${projectData.title}" ha sido escalado a PRODUCCIÓN por su autor.`, "sistema", editingProject.id);
                    }
                }
                
                showToast("¡Proyecto actualizado con éxito!", 'success');
                return true;
            } else {
                projectData.createdAt = serverTimestamp();
                projectData.isValidated = false;
                projectData.approvalStatus = 'pending';
                projectData.views = 0;
                projectData.favoritesCount = 0;
                projectData.viewedBy = [];
                projectData.favoritedBy = [];
                projectData.authorId = user.uid;
                const newDoc = await addDoc(collection(db, "projects"), projectData);

                const teachers = Object.values(users).filter(u => u.role === 'teacher');
                // Enviar notificaciones en paralelo para mayor velocidad
                await Promise.all(teachers.map(teacher => {
                    if (teacher.uid || teacher.id) {
                        return sendNotification(
                            teacher.uid || teacher.id,
                            `Nuevo proyecto pendiente de revisión: ${projectData.title}`,
                            'sistema',
                            newDoc.id
                        );
                    }
                    return Promise.resolve();
                }));
                showToast("¡Proyecto enviado para revisión institucional!", 'success');
                return true;
            }
        } catch (error) {
            console.error("Error al procesar proyecto:", error);
            showToast("Hubo un error. Intenta de nuevo.", 'error');
            return false;
        }
    };

    const handleToggleFavorite = async (itemId, providedProfile, providedSetProfile, collectionName = "projects") => {
        if (userRole !== 'student' && userRole !== 'graduate') {
            showToast("Solo los estudiantes y egresados pueden añadir a favoritos", "info");
            return;
        }

        if (!user || user.isAnonymous) {
            showToast("Debes iniciar sesión para guardar favoritos", "info");
            return;
        }
        
        // Usar los valores proporcionados o los del hook (prioridad a los proporcionados en ProjectDetails)
        const actualProfile = providedProfile || profile;
        const actualSetProfile = providedSetProfile || setProfile;

        // Intentar determinar si es favorito desde el perfil local
        let isFavorite = actualProfile?.favorites?.includes(itemId);
        
        // Si no tenemos perfil aún (ej: error de listener), intentamos usar la info del proyecto si está disponible
        if (actualProfile === null) {
            console.warn("[ToggleFavorite] Perfil no disponible, la acción podría fallar en las reglas de seguridad.");
        }

        console.log(`[ToggleFavorite] Item: ${itemId}, isFavorite: ${isFavorite}, Profile:`, actualProfile);

        try {
            // Optimistic UI Update (solo si tenemos el perfil local para manipularlo)
            if (actualSetProfile && actualProfile) {
                const currentFavorites = actualProfile.favorites || [];
                const updatedFavorites = isFavorite 
                    ? currentFavorites.filter(id => id !== itemId)
                    : [...currentFavorites, itemId];
                actualSetProfile({ ...actualProfile, favorites: updatedFavorites });
            }

            const userRef = doc(db, "users", user.uid);
            const itemRef = doc(db, collectionName, itemId);

            // Operaciones en Firestore (Atómicas)
            await updateDoc(userRef, {
                favorites: isFavorite ? arrayRemove(itemId) : arrayUnion(itemId)
            });

            // Solo actualizamos el contador y la lista de interesados en los Proyectos, no en vacantes (evita errores de permisos)
            if (collectionName === "projects") {
                await updateDoc(itemRef, {
                    favoritedBy: isFavorite ? arrayRemove(user.uid) : arrayUnion(user.uid),
                    favoritesCount: increment(isFavorite ? -1 : 1)
                });
            }

            showToast(isFavorite ? 'Eliminado de favoritos' : 'Guardado en favoritos', isFavorite ? 'info' : 'success');
        } catch (error) {
            console.error("Error al actualizar favoritos:", error);
            if (error.code === 'permission-denied') {
                showToast("No tienes permisos para esta acción o tu sesión expiró.", "error");
            } else {
                showToast("Error al sincronizar con el servidor.", "error");
            }
            
            // Revertir si falló y tenemos el perfil original
            if (actualSetProfile && actualProfile) actualSetProfile(actualProfile);
        }
    };

    const handleApproveProject = async (project) => {
        if (userRole !== 'teacher' && userRole !== 'admin') return;
        const isCurrentlyApproved = project.approvalStatus === 'approved';
        try {
            await updateDoc(doc(db, "projects", project.id), {
                approvalStatus: isCurrentlyApproved ? 'pending' : 'approved'
            });

            if (!isCurrentlyApproved) {
                await sendNotification(
                    project.authorId,
                    `¡Tu proyecto "${project.title}" ha sido aprobado!`,
                    'sistema',
                    project.id
                );
            }
            showToast(isCurrentlyApproved ? "Proyecto desaprobado (ahora pendiente)" : "Proyecto aprobado y publicado", 'success');
        } catch (error) {
            console.error("Error al procesar aprobación:", error);
            showToast("Error al procesar la aprobación", 'error');
        }
    };

    const handleToggleValidation = async (project) => {
        if (userRole !== 'teacher' && userRole !== 'admin') return;
        const isCurrentlyValidated = project.isValidated;
        try {
            await updateDoc(doc(db, "projects", project.id), {
                isValidated: !isCurrentlyValidated,
                validatedBy: isCurrentlyValidated ? null : (profile?.uid || user.uid),
                validatedAt: isCurrentlyValidated ? null : serverTimestamp()
            });
            showToast(isCurrentlyValidated ? "Validación removida" : "Proyecto validado con éxito", 'success');
        } catch (error) {
            console.error("Error al procesar validación:", error);
            showToast("Error al procesar validación", 'error');
        }
    };

    const handleRejectProject = async (project) => {
        if (userRole !== 'teacher' && userRole !== 'admin') return;
        const reason = await customPrompt("Indica el motivo del rechazo para el estudiante:");
        if (!reason) return;

        try {
            await updateDoc(doc(db, "projects", project.id), {
                approvalStatus: 'rejected'
            });
            await sendNotification(
                project.authorId,
                `Tu proyecto "${project.title}" requiere ajustes: ${reason}`,
                'sistema',
                project.id
            );
            showToast("Notificación de rechazo enviada", 'info');
        } catch (error) {
            console.error("Error al rechazar:", error);
            showToast("Error al procesar rechazo", 'error');
        }
    };

    const handleDeleteProject = async (project) => {
        if (!project) return;
        const confirmed = await customConfirm(`¿Seguro que quieres eliminar "${project.title}"? Esta acción no se puede deshacer.`);
        if (!confirmed) return;
        try {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, "projects", project.id));
            
            const admins = Object.values(users).filter(u => u.role === 'admin');
            for(const adm of admins) {
                await sendNotification(adm.uid, `El dueño ha eliminado el proyecto: ${project.title}`, "sistema", null);
            }

            showToast("Proyecto eliminado con éxito.", 'success');
            return true;
        } catch (error) {
            console.error("Error al eliminar proyecto:", error);
            showToast("No se pudo eliminar el proyecto. Intenta de nuevo.", 'error');
            return false;
        }
    };

    return {
        handleProjectSubmit,
        handleToggleFavorite,
        handleApproveProject,
        handleToggleValidation,
        handleRejectProject,
        handleDeleteProject,
        sendNotification
    };
};
