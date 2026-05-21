import React, { useState } from 'react';

export default function ConfirmModal({ 
    isOpen, message, onConfirm, onCancel, isPrompt, 
    confirmText = 'Eliminar', cancelText = 'Cancelar' 
}) {
    if (!isOpen) return null;
    const [inputValue, setInputValue] = useState('');

    const isDelete = confirmText === 'Eliminar';
    const confirmColor = isPrompt ? '#3b82f6' : (isDelete ? '#ef4444' : '#10b981');

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
            <div className="modal-content" style={{ maxWidth: '400px', padding: '24px', background: 'var(--bg-card)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text-dark)' }}>
                    {isPrompt ? 'Entrada requerida' : 'Confirmación'}
                </h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{message}</p>
                {isPrompt && (
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onConfirm(inputValue);
                            }
                        }}
                        placeholder="Escribe el motivo aquí..."
                        style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', background: 'var(--bg-light)', color: 'var(--text-main)' }}
                        autoFocus
                    />
                )}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={onCancel}
                        style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => onConfirm(isPrompt ? inputValue : true)}
                        style={{ padding: '10px 20px', background: confirmColor, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
                    >
                        {isPrompt ? 'Aceptar' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
