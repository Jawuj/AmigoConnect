import React from 'react';
import Icons from './Icons';

export default function ToastContainer({ toasts, removeToast }) {
    if (!toasts.length) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type} ${toast.isExiting ? 'exiting' : ''}`}>
                    <div className="toast-icon">
                        {toast.type === 'success' && <Icons.StarFilled />}
                        {toast.type === 'error' && <Icons.AlertTriangle />}
                        {toast.type === 'info' && <Icons.Info />}
                        {toast.type === 'warning' && <Icons.AlertTriangle />}
                    </div>
                    <span>{toast.message}</span>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
                    <div className="toast-progress" />
                </div>
            ))}
        </div>
    );
}
