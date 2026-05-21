import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

export const useOpportunityActions = (user, profile, userRole, showToast, customConfirm, customPrompt, sendNotification) => {

    const handleDeleteOpportunity = async (oppId, skipConfirm = false, silent = false) => {
        if (!skipConfirm) {
            const confirmed = await customConfirm("¿Seguro que quieres eliminar esta vacante? Esta acción no se puede deshacer.");
            if (!confirmed) return;
        }
        try {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, "opportunities", oppId));
            if (!silent) showToast("Vacante eliminada con éxito.", 'success');
        } catch (error) {
            console.error("Error al eliminar vacante:", error);
            if (!silent) showToast("No se pudo eliminar la vacante.", 'error');
        }
    };

    const handleOppSubmit = async (e, setIsOppModalOpen) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const type = formData.get('type') || 'empleo';
        
        try {
            const oppData = {
                title: formData.get('title'),
                urlVacante: formData.get('urlVacante') || "",
                company: profile?.firstName || profile?.name || user.displayName || "Empresa",
                companyId: localStorage.getItem('actingCompanyId') || user.uid,
                description: formData.get('description'),
                academicReq: formData.get('academicReq') || "",
                techReq: formData.get('techReq') ? formData.get('techReq').split(',').map(s => s.trim()) : [],
                benefits: formData.get('benefits') || "",
                modality: formData.get('modality') || (type === 'proyecto' ? 'remoto' : 'presencial'),
                type: type,
                salaryMin: formData.get('salaryMin') ? Number(formData.get('salaryMin')) : null,
                salaryMax: formData.get('salaryMax') ? Number(formData.get('salaryMax')) : null,
                budget: formData.get('budget') || "",
                currency: formData.get('currency') || 'COP',
                location: formData.get('location') || (type === 'proyecto' ? 'Global' : ""),
                deadline: formData.get('deadline') || null,
                contact: formData.get('contact'),
                sector: formData.get('sector') || profile?.program || "General",
                approvalStatus: 'pending',
                isActive: true,
                views: 0,
                applicationsCount: 0,
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, "opportunities"), oppData);
            showToast(type === 'proyecto' ? "¡Vacante de proyecto enviada!" : "¡Oportunidad enviada para validación institucional!", 'success');
            if (setIsOppModalOpen) setIsOppModalOpen(false);
        } catch (error) {
            console.error("Error al publicar vacante:", error);
            showToast("Error al publicar", 'error');
        }
    };

    const handleApproveOpportunity = async (opp) => {
        if (userRole !== 'teacher' && userRole !== 'admin') return;
        const isCurrentlyApproved = opp.approvalStatus === 'approved';
        try {
            await updateDoc(doc(db, "opportunities", opp.id), {
                approvalStatus: isCurrentlyApproved ? 'pending' : 'approved'
            });
            
            if (!isCurrentlyApproved) {
                await sendNotification(
                    opp.companyId,
                    `¡Tu vacante "${opp.title}" ha sido aprobada y ya es pública!`,
                    'sistema',
                    opp.id
                );
            }
            
            showToast(isCurrentlyApproved ? "Vacante desaprobada (ahora pendiente)" : "Vacante aprobada con éxito", 'success');
        } catch (error) {
            console.error("Error al aprobar vacante:", error);
            showToast("Error al procesar la aprobación", 'error');
        }
    };

    const handleRejectOpportunity = async (opp) => {
        if (userRole !== 'teacher' && userRole !== 'admin') return;
        const reason = await customPrompt("Indica el motivo del rechazo:");
        if (!reason) return;
        try {
            await updateDoc(doc(db, "opportunities", opp.id), {
                approvalStatus: 'rejected'
            });
            
            await sendNotification(
                opp.companyId,
                `Tu vacante "${opp.title}" ha sido rechazada. Motivo: ${reason}`,
                'sistema',
                opp.id
            );
            
            showToast("Vacante rechazada", 'info');
        } catch (error) {
            console.error("Error al rechazar vacante:", error);
            showToast("Error al procesar el rechazo", 'error');
        }
    };

    const handleUpdateOpportunity = async (oppId, updatedData) => {
        try {
            const data = { ...updatedData };
            if (data.techReq && typeof data.techReq === 'string') {
                data.techReq = data.techReq.split(',').map(s => s.trim());
            }
            if (data.salaryMin !== undefined) {
                data.salaryMin = data.salaryMin ? Number(data.salaryMin) : null;
            }
            if (data.salaryMax !== undefined) {
                data.salaryMax = data.salaryMax ? Number(data.salaryMax) : null;
            }
            await updateDoc(doc(db, "opportunities", oppId), data);
            showToast("Vacante actualizada con éxito.", 'success');
            return true;
        } catch (error) {
            console.error("Error al actualizar vacante:", error);
            showToast("Error al actualizar la vacante.", 'error');
            return false;
        }
    };

    return {
        handleDeleteOpportunity,
        handleOppSubmit,
        handleApproveOpportunity,
        handleRejectOpportunity,
        handleUpdateOpportunity
    };
};
