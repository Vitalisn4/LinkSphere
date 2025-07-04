import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, message }) => {
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
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 mb-4">
            <CheckCircle2 size={40} className="text-green-300" />
          </div>
          <p className="text-lg text-gray-100 font-semibold text-center">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal; 