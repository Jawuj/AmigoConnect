import { db, storage } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const useUserActions = (user, profile, setProfile, showToast, customPrompt) => {

    const targetUid = profile?.uid || user?.uid;

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const isCompany = profile?.role === 'company';
            const isAdmin = profile?.role === 'admin';

            const updatedProfile = {
                ...profile,
                firstName: formData.get('firstName'),
                lastName: isCompany || isAdmin ? "" : (formData.get('lastName') || ""),
                program: isCompany || isAdmin ? "" : (formData.get('program') || ""),
                semester: isCompany || isAdmin ? "" : (formData.get('semester') || ""),
                github: isCompany || isAdmin ? "" : (formData.get('github') || ""),
                academicAverage: isCompany || isAdmin ? "" : (formData.get('academicAverage') || ""),
                biography: formData.get('biography') || "",
                phone: formData.get('phone') || "",
                linkedin: formData.get('linkedin') || "",
                portfolioWeb: formData.get('portfolioWeb') || "",
                city: formData.get('city') || "",
                country: formData.get('country') || "",
                availableForInternship: isCompany || isAdmin ? false : (formData.get('availableForInternship') === "true"),
                availableForJob: isCompany || isAdmin ? false : (formData.get('availableForJob') === "true"),
                ...(isCompany ? { 
                    sector: formData.get('sector') || profile?.sector || "Tecnología",
                    contactMail: formData.get('contactMail') || ""
                } : {})
            };
            await setDoc(doc(db, "users", targetUid), updatedProfile);
            setProfile(updatedProfile);
            showToast("Perfil actualizado!", "success");
            return true;
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            showToast("Error al guardar cambios", "error");
            return false;
        }
    };

    const handleAddSkill = async (newSkill) => {
        if (!newSkill || !newSkill.nombre) return;
        const updatedSkills = [...(profile?.technicalSkills || []), newSkill];

        try {
            const updatedProfile = { ...profile, technicalSkills: updatedSkills };
            await setDoc(doc(db, "users", targetUid), updatedProfile);
            setProfile(updatedProfile);
            showToast("Competencia añadida", "success");
        } catch (e) {
            console.error(e);
            showToast("Error al añadir competencia", "error");
        }
    };

    const handleRemoveSkill = async (index) => {
        const updatedSkills = profile.technicalSkills.filter((_, i) => i !== index);
        try {
            const updatedProfile = { ...profile, technicalSkills: updatedSkills };
            await setDoc(doc(db, "users", targetUid), updatedProfile);
            setProfile(updatedProfile);
        } catch (e) {
            console.error(e);
            showToast("Error al eliminar competencia", "error");
        }
    };

    const handleAddExperience = async (newExp) => {
        if (!newExp || !newExp.institucion) return;
        const updatedExp = [...(profile?.academicExperience || []), newExp];

        try {
            const updatedProfile = { ...profile, academicExperience: updatedExp };
            await setDoc(doc(db, "users", targetUid), updatedProfile);
            setProfile(updatedProfile);
            showToast("Experiencia añadida", "success");
        } catch (e) {
            console.error(e);
            showToast("Error al añadir experiencia", "error");
        }
    };

    const handleRemoveExperience = async (index) => {
        const updatedExp = profile.academicExperience.filter((_, i) => i !== index);
        try {
            const updatedProfile = { ...profile, academicExperience: updatedExp };
            await setDoc(doc(db, "users", targetUid), updatedProfile);
            setProfile(updatedProfile);
        } catch (e) {
            console.error(e);
            showToast("Error al eliminar experiencia", "error");
        }
    };

    const handleFileUpload = async (file, setUploadProgress, setIsUploading) => {
        if (!file) return;

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];

        if (!allowedTypes.includes(file.type)) {
            showToast("Solo se permiten archivos PDF, Word o Imágenes (JPG/PNG)", "error");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast("El archivo es demasiado grande (máx 5MB)", "error");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const storageRef = ref(storage, `resumes/${targetUid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Error al subir archivo:", error);
                    showToast("Error al subir el archivo", "error");
                    setIsUploading(false);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    try {
                        const updatedProfile = { ...profile, resumeUrl: downloadURL };
                        await setDoc(doc(db, "users", targetUid), updatedProfile, { merge: true });
                        setProfile(updatedProfile);
                        showToast("Hoja de Vida actualizada con éxito", "success");
                        resolve(downloadURL);
                    } catch (e) {
                        console.error("Error al guardar URL:", e);
                        showToast("Error al guardar enlace", "error");
                        reject(e);
                    }
                    setIsUploading(false);
                    setUploadProgress(0);
                }
            );
        });
    };

    return {
        handleUpdateProfile,
        handleAddSkill,
        handleRemoveSkill,
        handleAddExperience,
        handleRemoveExperience,
        handleFileUpload
    };
};
