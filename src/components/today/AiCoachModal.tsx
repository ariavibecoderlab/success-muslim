'use client';

interface AiCoachModalProps {
  message: string;
  suggestedNext?: string;
  onClose: () => void;
}

export function AiCoachModal({ message, suggestedNext, onClose }: AiCoachModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-card p-6 max-w-md w-full shadow-xl">
        <p className="text-gray-700 mb-4">{message}</p>
        {suggestedNext && (
          <p className="text-sm text-primary font-medium mb-4">
            Try tomorrow: {suggestedNext}
          </p>
        )}
        <button
          onClick={onClose}
          className="w-full py-2 bg-primary text-white rounded-card font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
