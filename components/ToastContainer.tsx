import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useLibrary();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-none border border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transform transition-all duration-300 animate-slide-in
            ${toast.type === 'error' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-black dark:text-white'}
          `}
        >
          <span className="text-sm font-medium tracking-wide">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
