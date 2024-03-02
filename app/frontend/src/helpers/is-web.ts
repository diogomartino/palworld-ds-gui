export const isWeb = () =>
  typeof window !== 'undefined' && (window as any).wails === undefined;
