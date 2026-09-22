import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'amber' | 'current' | 'white';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'amber' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorMap = {
    amber: 'border-amber-500/20 border-t-amber-500',
    current: 'border-current/20 border-t-current',
    white: 'border-white/20 border-t-white',
  };

  return (
    <div className="inline-flex items-center justify-center">
      <div
        className={`${sizeMap[size]} ${colorMap[color]} rounded-full animate-spin`}
        role="status"
        aria-label="Cargando..."
      />
    </div>
  );
};
