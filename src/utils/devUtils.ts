export const isDevelopment = import.meta.env.DEV;

export const devLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};
