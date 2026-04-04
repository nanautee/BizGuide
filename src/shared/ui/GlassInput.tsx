import { InputHTMLAttributes } from 'react';

const styles = {
  // Базовый стеклянный input для форм главной страницы.
  input:
    "w-full h-[56px] md:h-[60px] rounded-full border border-white/25 bg-[#63B0FB]/55 pl-6 pr-28 text-base text-white outline-none transition placeholder:text-base placeholder:text-white/70 focus:border-white/55 disabled:opacity-50 md:text-lg md:placeholder:text-lg",
};

export const GlassInput = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  // className оставляем открытым для локальных правок в виджетах.
  return <input className={`${styles.input} ${className}`} {...props} />;
};