import { InputHTMLAttributes } from "react";

const base = [
  "w-full rounded-full border border-white/25 bg-[#63B0FB]/55",
  "pl-5 pr-16 text-white outline-none transition",
  "placeholder:text-white/70 focus:border-white/55 disabled:opacity-50",
  "h-[48px] text-sm placeholder:text-sm",
  "sm:h-[52px] sm:pl-6 sm:pr-20 sm:text-base sm:placeholder:text-base",
  "md:h-[60px] md:pr-28 md:text-lg md:placeholder:text-lg",
  "xl:h-[68px] xl:pl-8 xl:text-xl xl:placeholder:text-xl",
].join(" ");

export const GlassInput = ({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${base} ${className}`} {...props} />
);
