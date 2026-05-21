import React, { useEffect, useState } from 'react';
import Icons from '../shared/Icons';
import CustomSelect from '../shared/CustomSelect';

export default function AdminCreateCompanyModal({
    isOpen, onClose, onCreateCompany, isSaving, customConfirm
}) {
    const [selectedSector, setSelectedSector] = useState("Tecnología");
    const [showOtherSector, setShowOtherSector] = useState(false);
    const [otherSectorValue, setOtherSectorValue] = useState("");

    const sectorOptions = [
        { value: "Tecnología", label: "Tecnología" },
        { value: "Salud", label: "Salud" },
        { value: "Educación", label: "Educación" },
        { value: "Bancos", label: "Bancos y Finanzas" },
        { value: "Energía", label: "Energía" },
        { value: "Manufactura", label: "Manufactura" },
        { value: "Comercio", label: "Comercio" },
        { value: "Otro", label: "Otro" }
    ];

    useEffect(() => {
        if (selectedSector === "Otro") {
            setShowOtherSector(true);
        } else {
            setShowOtherSector(false);
        }
    }, [selectedSector]);

    if (!isOpen) return null;

    const handleAttemptClose = async () => {
        const confirmed = await customConfirm(
            '¿Estás seguro de que deseas salir? Los datos no guardados se perderán.',
            'Sí, salir',
            'Continuar editando'
        );
        if (confirmed) onClose();
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleAttemptClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleOverlayClick = (e) => {
        if (e.target.className === 'modal-overlay') {
            handleAttemptClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const finalSector = selectedSector === "Otro" ? otherSectorValue : selectedSector;

        const data = {
            firstName: formData.get('firstName'),
            lastName: "",
            mail: formData.get('mail'),
            contactMail: formData.get('contactMail') || "",
            password: formData.get('password'),
            role: 'company',
            city: formData.get('city') || "Medellín",
            country: formData.get('country') || "Colombia",
            phone: formData.get('phone') || "",
            biography: formData.get('biography') || "Perfil de empresa.",
            program: "",
            sector: finalSector,
            semester: "",
            favorites: [],
            availableForInternship: false,
            availableForJob: false,
            technicalSkills: [],
            createdAt: new Date().toISOString(),
            isTestAccount: false
        };

        const success = await onCreateCompany(data);
        if (success) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content premium-modal" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <Icons.Briefcase />
                        <h2>Crear Perfil de Empresa</h2>
                    </div>
                    <button className="close-btn" type="button" onClick={handleAttemptClose} title="Cerrar">
                        <Icons.X />
                    </button>
                </div>
                <form className="upload-form" onSubmit={handleSubmit}>
                    <section className="modal-section">
                        <h3 className="section-title-modal">Datos de la Empresa</h3>
                        <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>Nombre de la Empresa</label>
                                <input type="text" name="firstName" placeholder="Ej: Google Colombia" required />
                            </div>
                             <div className="form-group">
                                 <label>Usuario de Acceso (para Login)</label>
                                 <input type="text" name="mail" placeholder="Ej: google (sin espacios)" required />
                             </div>
                             <div className="form-group">
                                 <label>Correo Electrónico de Contacto</label>
                                 <input type="email" name="contactMail" placeholder="Ej: contacto@google.com" required />
                             </div>
                             <div className="form-group">
                                 <label>Contraseña de Acceso</label>
                                 <input type="text" name="password" placeholder="Establece una contraseña" required />
                             </div>
                        </div>
                    </section>

                    <section className="modal-section">
                        <h3 className="section-title-modal">Información de Perfil</h3>
                        <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>Sector de la Empresa</label>
                                <CustomSelect 
                                    value={selectedSector} 
                                    onChange={(e) => setSelectedSector(e.target.value)}
                                    options={sectorOptions} 
                                />
                                {showOtherSector && (
                                    <input 
                                        type="text" 
                                        placeholder="Especifica el sector" 
                                        value={otherSectorValue}
                                        onChange={(e) => setOtherSectorValue(e.target.value)}
                                        style={{ marginTop: '8px' }}
                                        required
                                    />
                                )}
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="form-group">
                                    <label>Ciudad</label>
                                    <input type="text" name="city" defaultValue="Medellín" required />
                                </div>
                                <div className="form-group">
                                    <label>País</label>
                                    <input type="text" name="country" defaultValue="Colombia" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Teléfono de Contacto</label>
                                <input type="tel" name="phone" placeholder="Ej: 3001234567" />
                            </div>
                            <div className="form-group">
                                <label>Descripción / Biografía corta</label>
                                <textarea name="biography" rows="3" placeholder="Describe brevemente la empresa..."></textarea>
                            </div>
                        </div>
                    </section>

                    <div className="form-actions-premium" style={{ marginTop: '20px' }}>
                        <button type="submit" className="submit-btn premium" disabled={isSaving}>
                            {isSaving ? (
                                <span className="loader-small"></span>
                            ) : (
                                <><Icons.Check />Crear Empresa</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
