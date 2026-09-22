import React, { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer shadow-sm';

  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 border border-amber-400',
    secondary: 'bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 border border-blue-500',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 border border-emerald-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-md shadow-red-600/25 hover:shadow-red-600/40 border border-red-500',
    outline: 'border-2 border-amber-600 dark:border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 hover:border-amber-500 bg-white/80 dark:bg-stone-900/80 font-bold',
    ghost: 'text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-500/10 font-bold',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4.5 py-2.5 text-sm font-bold gap-2',
    lg: 'px-6 py-3.5 text-base font-extrabold gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" color="current" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
