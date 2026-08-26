import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface CyberpunkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const CyberpunkDialog: React.FC<CyberpunkDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  isDanger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
      {/* Dialog Box */}
      <div className="relative w-full max-w-md">
        {/* Outer glow effect */}
        <div className={`absolute inset-0 ${
          isDanger ? 'bg-red-500/20' : 'bg-green-500/20'
        } blur-xl`}></div>
        
        {/* Main dialog */}
        <div className={`relative border-2 ${
          isDanger ? 'border-red-500' : 'border-green-500'
        } bg-black shadow-2xl`}>
          
          {/* Header */}
          <div className={`border-b-2 ${
            isDanger ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'
          } p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              {isDanger && <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />}
              <h2 className={`text-lg font-bold ${
                isDanger ? 'text-red-400' : 'text-green-400'
              }`} style={{ textShadow: isDanger ? '0 0 10px #ff0000' : '0 0 10px #00ff00' }}>
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`${
                isDanger ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
              } transition`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className={`${
              isDanger ? 'text-red-300' : 'text-green-300'
            } leading-relaxed whitespace-pre-line`}>
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className={`border-t-2 ${
            isDanger ? 'border-red-500' : 'border-green-500'
          } p-4 flex gap-3`}>
            <button
              onClick={onClose}
              className="flex-1 p-3 bg-black border-2 border-green-700 text-green-400 hover:bg-green-900/30 hover:border-green-500 transition font-semibold uppercase"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 p-3 border-2 font-semibold uppercase transition ${
                isDanger
                  ? 'bg-red-900/30 border-red-500 text-red-400 hover:bg-red-900/50 hover:border-red-400'
                  : 'bg-green-900/30 border-green-500 text-green-400 hover:bg-green-900/50 hover:border-green-400'
              }`}
              style={{ textShadow: isDanger ? '0 0 5px #ff0000' : '0 0 5px #00ff00' }}
            >
              {confirmText}
            </button>
          </div>

          {/* Corner accents */}
          <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${
            isDanger ? 'border-red-500' : 'border-green-500'
          }`}></div>
          <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${
            isDanger ? 'border-red-500' : 'border-green-500'
          }`}></div>
          <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${
            isDanger ? 'border-red-500' : 'border-green-500'
          }`}></div>
          <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${
            isDanger ? 'border-red-500' : 'border-green-500'
          }`}></div>
        </div>
      </div>
    </div>
  );
};
