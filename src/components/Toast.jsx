import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="toast-icon text-success" size={20} />;
      case 'error':
        return <XCircle className="toast-icon text-error" size={20} />;
      default:
        return <AlertCircle className="toast-icon text-info" size={20} />;
    }
  };

  return (
    <div className={`toast-notification toast-${type} animate-slide-in`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
      </div>
      <button onClick={onClose} className="toast-close-btn">
        <X size={14} />
      </button>
    </div>
  );
}

export default Toast;
