
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add getUserInitials function
export function getUserInitials(name: string): string {
  if (!name) return '';
  
  const names = name.split(' ').filter(n => n.length > 0);
  
  if (names.length === 0) return '';
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}
