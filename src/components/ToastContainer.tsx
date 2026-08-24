import React from 'react';
import { CheckCircle2, Info, Heart, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl text-slate-100 text-xs font-medium"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'favorite' ? (
                <Heart className="w-4 h-4 text-rose-400 fill-current flex-shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              )}
              <span className="truncate">{toast.text}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
