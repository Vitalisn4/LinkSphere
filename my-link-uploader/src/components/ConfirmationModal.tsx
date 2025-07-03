import React from 'react';

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
      <div className="relative z-10 bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md mx-auto flex flex-col items-center">
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-100 font-semibold">{message}</p>
        </div>
        <div className="flex w-full justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 rounded bg-gray-600 text-gray-200 hover:bg-gray-500 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition font-semibold"
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