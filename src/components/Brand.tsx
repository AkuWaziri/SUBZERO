import React from 'react';
import { cn } from '../lib/utils';
// @ts-ignore
import logo from '../assets/images/subzero_clean_logo_1779027046030.png';

interface BrandProps {
  className?: string;
  showText?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Brand: React.FC<BrandProps> = ({ className, showText = true, size = 'md' }) => {
  const sizeMap = {
    xs: 'w-12 h-12',
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const textMap = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className={cn("relative group shrink-0", sizeMap[size])}>
        <img 
          src={logo} 
          alt="SubZero Logo" 
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-black tracking-tighter text-black uppercase leading-none",
            textMap[size]
          )}>
            SUB<span className="text-blue-600">ZERO</span>
          </span>
          {(size === 'xs' || size === 'sm') && (
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5 leading-none px-0.5">
              By Waziri
            </span>
          )}
        </div>
      )}
    </div>
  );
};
