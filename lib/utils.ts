import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let allocationIdCounter = 0;

/**
 * Generates a unique client ID for allocation rows in forms.
 * Used specifically for React key props in dynamic stone/diamond allocation lists.
 * 
 * Format: allocation_{counter}_{timestamp}
 * Example: allocation_1_1703123456789
 * 
 * @returns {string} Unique client ID for the current session
 */
export function generateAllocationClientID(): string {
  return `allocation_${++allocationIdCounter}_${Date.now()}`;
}

/**
 * Reset counter (useful for testing)
 */
export function resetAllocationIdCounter(): void {
  allocationIdCounter = 0;
}
