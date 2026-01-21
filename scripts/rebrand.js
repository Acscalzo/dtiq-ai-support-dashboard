#!/usr/bin/env node

/**
 * Rebranding Script
 *
 * This script updates the .env file with new company branding values.
 * It makes it easy to rebrand the dashboard for a new company deployment.
 *
 * Usage:
 *   node scripts/rebrand.js "Company Name" "company-slug" "#HEX_COLOR"
 *
 * Example:
 *   node scripts/rebrand.js "DTIQ" "dtiq" "#0066CC"
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateHexColor(color) {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexRegex.test(color);
}

function validateSlug(slug) {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
}

function updateEnvFile(envPath, companyName, companySlug, primaryColor) {
  let envContent = '';

  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    log(`\n✓ Found existing ${path.basename(envPath)}`, 'green');
  } else {
    // Try to read from .env.example
    const envExamplePath = path.join(path.dirname(envPath), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf8');
      log(`\n✓ Using ${path.basename(envExamplePath)} as template`, 'green');
    } else {
      log(`\n✗ No .env or .env.example file found`, 'red');
      process.exit(1);
    }
  }

  // Update or add branding variables
  const updates = {
    'COMPANY_NAME': companyName,
    'NEXT_PUBLIC_COMPANY_NAME': companyName,
    'COMPANY_SLUG': companySlug,
    'NEXT_PUBLIC_COMPANY_SLUG': companySlug,
    'COMPANY_PRIMARY_COLOR': primaryColor,
    'NEXT_PUBLIC_COMPANY_PRIMARY_COLOR': primaryColor,
  };

  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (envContent.match(regex)) {
      // Update existing value
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      // Add new value at the end
      envContent += `\n${key}="${value}"`;
    }
  });

  // Write updated content back to file
  fs.writeFileSync(envPath, envContent, 'utf8');
  log(`✓ Updated ${path.basename(envPath)}`, 'green');
}

function printSummary(companyName, companySlug, primaryColor) {
  log('\n' + '='.repeat(60), 'cyan');
  log('  Rebranding Complete!', 'bright');
  log('='.repeat(60), 'cyan');
  log('\nNew Branding Configuration:', 'bright');
  log(`  Company Name:   ${companyName}`, 'cyan');
  log(`  Company Slug:   ${companySlug}`, 'cyan');
  log(`  Primary Color:  ${primaryColor}`, 'cyan');
  log('\nNext Steps:', 'bright');
  log('  1. Update logo at public/logo.png (optional)', 'yellow');
  log('  2. Review the updated .env file', 'yellow');
  log('  3. Restart your development server: npm run dev', 'yellow');
  log('  4. Deploy to your hosting platform', 'yellow');
  log('\n' + '='.repeat(60), 'cyan');
}

function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  AI Support Dashboard - Rebranding Script', 'bright');
  log('='.repeat(60), 'cyan');

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length < 3) {
    log('\n✗ Error: Missing required arguments', 'red');
    log('\nUsage:', 'bright');
    log('  node scripts/rebrand.js <company-name> <company-slug> <primary-color>\n', 'yellow');
    log('Example:', 'bright');
    log('  node scripts/rebrand.js "DTIQ" "dtiq" "#0066CC"\n', 'yellow');
    log('Arguments:', 'bright');
    log('  company-name:    Display name (e.g., "DTIQ")', 'cyan');
    log('  company-slug:    URL-safe identifier (e.g., "dtiq")', 'cyan');
    log('  primary-color:   Hex color code (e.g., "#0066CC")\n', 'cyan');
    process.exit(1);
  }

  const [companyName, companySlug, primaryColor] = args;

  // Validate inputs
  log('\nValidating inputs...', 'bright');

  if (!companyName || companyName.trim().length === 0) {
    log('✗ Error: Company name cannot be empty', 'red');
    process.exit(1);
  }
  log('✓ Company name is valid', 'green');

  if (!validateSlug(companySlug)) {
    log('✗ Error: Company slug must be lowercase letters, numbers, and hyphens only', 'red');
    log('  Example: "my-company" or "company123"', 'yellow');
    process.exit(1);
  }
  log('✓ Company slug is valid', 'green');

  if (!validateHexColor(primaryColor)) {
    log('✗ Error: Primary color must be a valid hex color (e.g., #0066CC)', 'red');
    process.exit(1);
  }
  log('✓ Primary color is valid', 'green');

  // Update .env file
  log('\nUpdating configuration files...', 'bright');
  const projectRoot = path.join(__dirname, '..');
  const envPath = path.join(projectRoot, '.env');
  const envLocalPath = path.join(projectRoot, '.env.local');

  // Try to update .env.local first, then .env
  if (fs.existsSync(envLocalPath)) {
    updateEnvFile(envLocalPath, companyName, companySlug, primaryColor);
  } else if (fs.existsSync(envPath)) {
    updateEnvFile(envPath, companyName, companySlug, primaryColor);
  } else {
    // Create new .env file from .env.example
    const envExamplePath = path.join(projectRoot, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('✓ Created .env from .env.example', 'green');
      updateEnvFile(envPath, companyName, companySlug, primaryColor);
    } else {
      log('✗ Error: No .env, .env.local, or .env.example file found', 'red');
      process.exit(1);
    }
  }

  // Print summary
  printSummary(companyName, companySlug, primaryColor);
}

// Run the script
main();
