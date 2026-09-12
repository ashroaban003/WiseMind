import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'wood';
  size?: 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled = false,
  ...props
}) => {
  // Base sizing ensures >= 48px height and 2x horizontal padding
  const sizeClasses = {
    md: 'min-h-[48px] px-6 py-2.5 text-lg',
    lg: 'min-h-[56px] px-8 py-3.5 text-xl font-medium',
    xl: 'min-h-[64px] px-10 py-4 text-2xl font-medium tracking-wide',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#8B5829] hover:bg-[#74451C] active:bg-[#5C3414] text-[#FAF6EE] shadow-[0_4px_12px_rgba(116,69,28,0.3)] border border-[#A26D3A]',
    wood:
      'wood-texture text-[#FFFDF9] font-medium border border-[#D4A56E]/40 hover:brightness-105 active:translate-y-0.5 transition-all shadow-[0_4px_14px_rgba(90,50,20,0.35)]',
    secondary:
      'bg-[#EFE4D0] hover:bg-[#E5D7BF] active:bg-[#DAC8AC] text-[#3D2817] border border-[#D4C0A0] shadow-[0_2px_6px_rgba(60,35,15,0.08)]',
    outline:
      'bg-transparent hover:bg-[#EFE4D0]/60 active:bg-[#E5D7BF]/70 text-[#4A321C] border-2 border-[#8B5829]/40 hover:border-[#8B5829]',
    ghost:
      'bg-transparent hover:bg-[#EFE4D0]/50 active:bg-[#E5D7BF]/60 text-[#4A321C] border border-transparent',
  }[variant];

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none filter grayscale-[30%]'
    : 'cursor-pointer transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0';

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-3 rounded-xl select-none text-center whitespace-nowrap focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B8814D] ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
