/**
 * Company Branding Configuration
 *
 * This file reads company-specific branding information from environment variables.
 * Each deployment of this template should have its own .env file with company-specific values.
 */

export interface BrandingConfig {
  companyName: string;
  companySlug: string;
  primaryColor: string;
  logoUrl?: string;
}

/**
 * Gets the current company branding configuration from environment variables
 *
 * @returns {BrandingConfig} The branding configuration for the current deployment
 * @throws {Error} If required environment variables are not set
 */
export function getBranding(): BrandingConfig {
  const companyName = process.env.COMPANY_NAME || process.env.NEXT_PUBLIC_COMPANY_NAME;
  const companySlug = process.env.COMPANY_SLUG || process.env.NEXT_PUBLIC_COMPANY_SLUG;
  const primaryColor = process.env.COMPANY_PRIMARY_COLOR || process.env.NEXT_PUBLIC_COMPANY_PRIMARY_COLOR;
  const logoUrl = process.env.COMPANY_LOGO_URL || process.env.NEXT_PUBLIC_COMPANY_LOGO_URL;

  if (!companyName) {
    throw new Error('COMPANY_NAME environment variable is required');
  }

  if (!companySlug) {
    throw new Error('COMPANY_SLUG environment variable is required');
  }

  if (!primaryColor) {
    throw new Error('COMPANY_PRIMARY_COLOR environment variable is required');
  }

  return {
    companyName,
    companySlug,
    primaryColor,
    logoUrl: logoUrl || undefined,
  };
}

/**
 * Client-side branding configuration
 * Use this for components that run on the client side
 */
export function getClientBranding(): BrandingConfig {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME;
  const companySlug = process.env.NEXT_PUBLIC_COMPANY_SLUG;
  const primaryColor = process.env.NEXT_PUBLIC_COMPANY_PRIMARY_COLOR;
  const logoUrl = process.env.NEXT_PUBLIC_COMPANY_LOGO_URL;

  if (!companyName || !companySlug || !primaryColor) {
    throw new Error('NEXT_PUBLIC_COMPANY_* environment variables are required for client-side usage');
  }

  return {
    companyName,
    companySlug,
    primaryColor,
    logoUrl: logoUrl || undefined,
  };
}
