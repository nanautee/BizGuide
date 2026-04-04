export const layout = {
  contentRow: "mx-auto w-full max-w-[1280px] px-4 sm:px-6 md:px-8 lg:px-14",
  zContent: "relative z-10",
};

export const buttons = {
  primary: [
    "rounded-full bg-[#4C97F6] px-5 py-2 font-normal text-white transition",
    "text-sm hover:opacity-90 active:scale-95 disabled:opacity-50",
    "sm:px-6 sm:text-base md:text-lg",
  ].join(" "),

  outline: [
    "rounded-full border border-white/40 bg-white/10 px-5 py-2 font-normal text-white transition",
    "text-sm hover:bg-white/20 active:scale-95 disabled:opacity-50",
    "sm:px-6 sm:text-base md:text-lg",
  ].join(" "),

  glass: [
    "inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20",
    "px-5 py-3 font-medium text-white backdrop-blur-sm transition",
    "text-sm hover:bg-white/30 active:scale-95 disabled:opacity-50",
    "sm:px-6 sm:text-base md:text-lg",
  ].join(" "),
};

export const cards = {
  glass: [
    "min-w-0 w-full overflow-hidden rounded-[24px] border border-white/25",
    "bg-white/14 p-4 shadow-[0_12px_24px_rgba(57,111,186,0.25)] backdrop-blur-md",
    "md:p-5",
  ].join(" "),

  metric: [
    "min-w-0 overflow-hidden rounded-[20px] border border-[#87B9F0]/70",
    "bg-white/95 p-3 text-[#2C74BD] shadow-[0_6px_12px_rgba(24,88,163,0.16)]",
    "sm:p-4",
  ].join(" "),

  panel: [
    "min-w-0 overflow-hidden rounded-[20px] border border-[#87B9F0]/70",
    "bg-white/95 p-3 text-[#2C74BD]",
    "sm:p-4",
  ].join(" "),
};

export const backgrounds = {
  auraWrap: "pointer-events-none absolute left-1/2 top-[60%] z-0 -translate-x-1/2 -translate-y-1/2",
  auraImg: "h-full w-full object-contain object-center opacity-95 mix-blend-screen",
  decor: "pointer-events-none absolute z-0",
};

export const overlays = {
  modal: "fixed inset-0 z-50 flex items-center justify-center px-4",
  modalDark: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] px-4",
};

export const feedback = {
  error: "mt-3 rounded-xl bg-red-500/20 px-4 py-2 text-sm text-white sm:text-base",
  loader: "mt-4 flex items-center gap-2 text-sm text-white/80 sm:text-base",
  spinner: "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white sm:h-5 sm:w-5",
};
