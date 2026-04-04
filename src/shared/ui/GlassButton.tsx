import { ReactNode, ButtonHTMLAttributes } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  asChild?: boolean; // оставлено для будущей композиции с Link
}

const styles = {
  // Универсальная стеклянная кнопка для однотипных CTA.
  button: "inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition px-6 py-3 rounded-full border border-white/30 text-white font-medium text-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
};

export const GlassButton = ({ children, className = '', ...props }: GlassButtonProps) => {
  return (
    // className оставляем, чтобы легко править локально в виджетах.
    <button className={`${styles.button} ${className}`} {...props}>
      {children}
    </button>
  );
};