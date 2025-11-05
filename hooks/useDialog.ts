import { useState, useCallback } from 'react';

export interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  type?: 'danger' | 'default';
}

export const useDialog = () => {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const showDialog = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'default';
    }
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setDialog(null);
      },
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      type: options?.type || 'default',
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  return {
    dialog,
    showDialog,
    closeDialog,
  };
};

