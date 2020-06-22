export const strToBool = (value: string): boolean =>
  value === "true" || value === "yes";
export const toBoolStr = (value: boolean): string => (value ? "true" : "false");
