/**
 * Theme System for Dynamic Branding
 *
 * This module provides utilities for applying company-specific branding
 * by injecting CSS variables into the document root based on the branding configuration.
 */

import { getClientBranding } from '@/config/branding-client';

/**
 * Converts a hex color to RGB values
 * @param hex - Hex color string (e.g., "#0066CC")
 * @returns RGB values as a string (e.g., "0, 102, 204")
 */
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

/**
 * Adjusts a color's lightness
 * @param hex - Hex color string
 * @param percent - Percentage to lighten (positive) or darken (negative)
 * @returns Adjusted hex color
 */
function adjustColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust each component
  const adjust = (value: number) => {
    const adjusted = value + (255 - value) * (percent / 100);
    return Math.round(Math.min(255, Math.max(0, adjusted)));
  };

  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  // Convert back to hex
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Darkens a color
 * @param hex - Hex color string
 * @param percent - Percentage to darken
 * @returns Darkened hex color
 */
function darkenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken each component
  const darken = (value: number) => {
    const darkened = value * (1 - percent / 100);
    return Math.round(Math.max(0, darkened));
  };

  const newR = darken(r);
  const newG = darken(g);
  const newB = darken(b);

  // Convert back to hex
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Applies branding CSS variables to the document root
 * This function should be called on the client side to inject theme colors
 */
export function applyBranding(): void {
  if (typeof window === 'undefined') {
    // Only run on client side
    return;
  }

  try {
    const branding = getClientBranding();
    const root = document.documentElement;

    // Apply primary color
    root.style.setProperty('--primary', branding.primaryColor);

    // Generate and apply light variant (20% lighter)
    const lightColor = adjustColor(branding.primaryColor, 20);
    root.style.setProperty('--primary-light', lightColor);

    // Generate and apply dark variant (20% darker)
    const darkColor = darkenColor(branding.primaryColor, 20);
    root.style.setProperty('--primary-dark', darkColor);

    // Optional: Set RGB values for opacity usage
    const rgbColor = hexToRgb(branding.primaryColor);
    root.style.setProperty('--primary-rgb', rgbColor);
  } catch (error) {
    console.error('Error applying branding:', error);
  }
}

/**
 * Gets the current primary color from CSS variables
 * @returns The primary color hex value
 */
export function getPrimaryColor(): string {
  if (typeof window === 'undefined') {
    return '#3B82F6'; // Default fallback
  }

  return getComputedStyle(document.documentElement)
    .getPropertyValue('--primary')
    .trim();
}
