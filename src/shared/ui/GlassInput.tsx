import { InputHTMLAttributes } from 'react';

const styles = {
  // Базовый стеклянный input для форм главной страницы.
  input: "w-full h-[65px] bg-[#6DBBFF]/65 backdrop-blur-sm rounded-full pl-6 pr-32 text-white placeholder-white/70 outline-none border border-white/30 focus:border-white/60 transition disabled:opacity-50",
};

export const GlassInput = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  // className оставляем открытым для локальных правок в виджетах.
  return <input className={`${styles.input} ${className}`} {...props} />;
};