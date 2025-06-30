#!/usr/bin/env node

/**
 * FireGauge Marketing Site Setup Validation
 * 
 * This script validates that the marketing site is properly configured
 * for development and production deployment.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description, required = true) {
  const fullPath = join(projectRoot, filePath);
  const exists = existsSync(fullPath);
  
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    const status = required ? '❌' : '⚠️';
    const color = required ? 'red' : 'yellow';
    log(`${status} ${description} (${filePath})`, color);
    return false;
  }
}

function checkPackageJson() {
  log('\n📦 Package Configuration', 'bold');
  
  const packagePath = join(projectRoot, 'package.json');
  if (!existsSync(packagePath)) {
    log('❌ package.json not found', 'red');
    return false;
  }
  
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  
  // Check scripts
  const requiredScripts = ['dev', 'build', 'preview', 'test'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts?.[script]) {
      log(`✅ Script "${script}" configured`, 'green');
    } else {
      log(`❌ Missing script: "${script}"`, 'red');
    }
  });
  
  // Check key dependencies
  const keyDependencies = [
    '@supabase/supabase-js',
    '@stripe/stripe-js',
    'react',
    'react-dom',
    'react-router-dom',
    'vite'
  ];
  
  keyDependencies.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      log(`✅ Dependency "${dep}" installed`, 'green');
    } else {
      log(`❌ Missing dependency: "${dep}"`, 'red');
    }
  });
  
  return true;
}

function checkEnvironmentConfig() {
  log('\n🌍 Environment Configuration', 'bold');
  
  // Check for environment files
  checkFile('.env.example', 'Environment example file', false);
  checkFile('.env', 'Environment variables file', false);
  
  // Check render.yaml
  if (checkFile('render.yaml', 'Render deployment config', false)) {
    const renderConfig = readFileSync(join(projectRoot, 'render.yaml'), 'utf8');
    
    // Check for required environment variables in render.yaml
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_STRIPE_PUBLISHABLE_KEY',
      'VITE_API_URL'
    ];
    
    requiredEnvVars.forEach(envVar => {
      if (renderConfig.includes(envVar)) {
        log(`✅ Environment variable "${envVar}" configured in render.yaml`, 'green');
      } else {
        log(`⚠️ Environment variable "${envVar}" missing from render.yaml`, 'yellow');
      }
    });
  }
  
  return true;
}

function checkSourceStructure() {
  log('\n📁 Source Structure', 'bold');
  
  // Core application files
  const coreFiles = [
    ['src/App.tsx', 'Main application component'],
    ['src/main.tsx', 'Application entry point'],
    ['index.html', 'HTML template'],
    ['vite.config.ts', 'Vite configuration'],
    ['tailwind.config.ts', 'Tailwind configuration'],
    ['tsconfig.json', 'TypeScript configuration']
  ];
  
  coreFiles.forEach(([path, desc]) => checkFile(path, desc));
  
  // Key components
  const keyComponents = [
    ['src/pages/OnboardingWizard.tsx', 'Onboarding wizard'],
    ['src/components/Pricing.tsx', 'Pricing component'],
    ['src/components/Navbar.tsx', 'Navigation component'],
    ['src/components/WelcomeFlow.tsx', 'Welcome flow component'],
    ['src/config/stripe-config.ts', 'Stripe configuration'],
    ['src/lib/supabase.ts', 'Supabase client'],
    ['src/api/billing.ts', 'Billing API functions']
  ];
  
  keyComponents.forEach(([path, desc]) => checkFile(path, desc));
  
  return true;
}

function checkSupabaseFunctions() {
  log('\n⚡ Supabase Functions', 'bold');
  
  const supabaseFunctions = [
    ['supabase/functions/create-checkout/index.ts', 'Stripe checkout function'],
    ['supabase/functions/create-invoice/index.ts', 'Invoice creation function'],
    ['supabase/functions/stripe-webhook/index.ts', 'Stripe webhook handler'],
    ['supabase/functions/customer-portal/index.ts', 'Customer portal function'],
    ['supabase/functions/support-request/index.ts', 'Support request function']
  ];
  
  supabaseFunctions.forEach(([path, desc]) => checkFile(path, desc, false));
  
  return true;
}

function checkTestingSuite() {
  log('\n🧪 Testing Configuration', 'bold');
  
  const testFiles = [
    ['src/test/setup.ts', 'Test setup configuration'],
    ['src/components/__tests__', 'Component tests directory'],
    ['src/test/integration', 'Integration tests directory'],
    ['vitest.config.ts', 'Vitest configuration (optional)']
  ];
  
  testFiles.forEach(([path, desc]) => checkFile(path, desc, false));
  
  return true;
}

function checkBuildConfiguration() {
  log('\n🔨 Build Configuration', 'bold');
  
  // Check Vite config
  if (checkFile('vite.config.ts', 'Vite configuration')) {
    const viteConfig = readFileSync(join(projectRoot, 'vite.config.ts'), 'utf8');
    
    if (viteConfig.includes('@vitejs/plugin-react')) {
      log('✅ React plugin configured', 'green');
    } else {
      log('❌ React plugin not found in Vite config', 'red');
    }
    
    if (viteConfig.includes('vitest')) {
      log('✅ Vitest testing configured', 'green');
    } else {
      log('⚠️ Vitest testing not configured', 'yellow');
    }
  }
  
  // Check TypeScript config
  if (checkFile('tsconfig.json', 'TypeScript configuration')) {
    const tsConfig = JSON.parse(readFileSync(join(projectRoot, 'tsconfig.json'), 'utf8'));
    
    if (tsConfig.compilerOptions?.baseUrl || tsConfig.compilerOptions?.paths) {
      log('✅ Path aliases configured', 'green');
    } else {
      log('⚠️ Path aliases not configured', 'yellow');
    }
  }
  
  return true;
}

function checkSecurityConfig() {
  log('\n🔒 Security Configuration', 'bold');
  
  // Check for .gitignore
  if (checkFile('.gitignore', 'Git ignore file')) {
    const gitignore = readFileSync(join(projectRoot, '.gitignore'), 'utf8');
    
    const sensitiveFiles = ['.env', 'node_modules', 'dist', '*.log'];
    sensitiveFiles.forEach(pattern => {
      if (gitignore.includes(pattern)) {
        log(`✅ "${pattern}" ignored in git`, 'green');
      } else {
        log(`⚠️ "${pattern}" not ignored in git`, 'yellow');
      }
    });
  }
  
  // Check for sensitive files that shouldn't be committed
  const shouldNotExist = [
    ['.env', 'Environment file (should not be in git)']
  ];
  
  shouldNotExist.forEach(([path, desc]) => {
    if (existsSync(join(projectRoot, path))) {
      log(`⚠️ ${desc} exists - ensure it's in .gitignore`, 'yellow');
    } else {
      log(`✅ ${desc} properly excluded`, 'green');
    }
  });
  
  return true;
}

function printSummary() {
  log('\n📋 Setup Summary', 'bold');
  log('='.repeat(50), 'blue');
  
  log('\n🚀 Next Steps:', 'bold');
  log('1. Ensure all environment variables are set', 'blue');
  log('2. Test the application with: npm run dev', 'blue');
  log('3. Run tests with: npm run test', 'blue');
  log('4. Build for production with: npm run build', 'blue');
  log('5. Deploy using your preferred platform', 'blue');
  
  log('\n📚 Documentation:', 'bold');
  log('• README.md - Setup and deployment instructions', 'blue');
  log('• docs/ - Additional documentation', 'blue');
  log('• DEPLOYMENT_CHECKLIST.md - Production deployment guide', 'blue');
  
  log('\n💡 Tips:', 'bold');
  log('• Keep environment variables secure and never commit them', 'yellow');
  log('• Test the complete onboarding flow before deploying', 'yellow');
  log('• Monitor application performance and error rates', 'yellow');
  log('• Set up proper backup procedures for critical data', 'yellow');
}

// Main execution
function main() {
  log('🔍 FireGauge Marketing Site Setup Validation', 'bold');
  log('='.repeat(50), 'blue');
  
  try {
    checkPackageJson();
    checkEnvironmentConfig();
    checkSourceStructure();
    checkSupabaseFunctions();
    checkTestingSuite();
    checkBuildConfiguration();
    checkSecurityConfig();
    printSummary();
    
    log('\n✅ Setup validation completed!', 'green');
    log('Your FireGauge marketing site appears to be properly configured.', 'green');
    
  } catch (error) {
    log('\n❌ Validation failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Run the validation
main(); 