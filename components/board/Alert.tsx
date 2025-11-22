"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmOptions extends AlertOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function useAlert() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

  const showAlert = (options: AlertOptions) => {
    setAlertOptions(options);
    setAlertOpen(true);
  };

  const AlertComponent = () => {
    if (!alertOptions) return null;

    return (
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertOptions.title || "แจ้งเตือน"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertOptions.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (alertOptions.onConfirm) {
                  alertOptions.onConfirm();
                }
                setAlertOpen(false);
              }}
            >
              {alertOptions.confirmText || "ตกลง"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return { showAlert, AlertComponent };
}

export function useConfirm() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<{
    title?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showConfirm = (options: {
    title?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setConfirmOptions(options);
    setConfirmOpen(true);
  };

  const ConfirmComponent = () => {
    if (!confirmOptions) return null;

    const handleConfirm = () => {
      if (confirmOptions.onConfirm) {
        confirmOptions.onConfirm();
      }
      setConfirmOpen(false);
    };

    const handleCancel = () => {
      if (confirmOptions.onCancel) {
        confirmOptions.onCancel();
      }
      setConfirmOpen(false);
    };

    return (
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmOptions.title || "ยืนยันการดำเนินการ"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmOptions.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {confirmOptions.cancelText || "ยกเลิก"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {confirmOptions.confirmText || "ยืนยัน"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return { showConfirm, ConfirmComponent };
}

