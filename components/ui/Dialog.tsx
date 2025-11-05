import React from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface DialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'default';
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'default',
}) => {
  if (!isOpen) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              size="sm"
            >
              {cancelText}
            </Button>
            <Button
              variant={type === 'danger' ? 'primary' : 'primary'}
              onClick={onConfirm}
              size="sm"
              className={type === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') {
    return dialogContent;
  }

  return createPortal(dialogContent, document.body);
};

export default Dialog;

