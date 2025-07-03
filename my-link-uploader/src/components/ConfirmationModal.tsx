import React from 'react';
import { Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      />
      {/* Modal content */}
      <div className="relative z-10 bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col items-center border border-gray-700">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-600 to-red-500 mb-4">
            <Trash2 size={36} className="text-white" />
          </div>
          <p className="text-lg text-gray-100 font-semibold text-center">{message}</p>
        </div>
        <div className="flex w-full justify-center gap-4 mt-4">
          <button
            className="px-5 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition font-medium"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-red-500 text-white hover:from-pink-700 hover:to-red-600 transition font-semibold shadow"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 