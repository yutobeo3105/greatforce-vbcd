import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');

const pages = [
  { name: '01-login', path: '/login', requiresAuth: false },
  { name: '02-dashboard', path: '/', requiresAuth: true },
  { name: '03-contacts', path: '/contacts', requiresAuth: true },
  { name: '04-companies', path: '/companies', requiresAuth: true },
  { name: '05-deals', path: '/deals', requiresAuth: true },
  { name: '06-activities', path: '/activities', requiresAuth: true },
  { name: '07-products', path: '/products', requiresAuth: true },
  { name: '08-quotes', path: '/quotes', requiresAuth: true },
  { name: '09-users', path: '/users', requiresAuth: true },
  { name: '10-email-templates', path: '/email-templates', requiresAuth: true },
  { name: '11-import-export', path: '/import-export', requiresAuth: true },
  { name: '12-bulk-actions', path: '/bulk-actions', requiresAuth: true },
  { name: '13-permissions', path: '/permissions', requiresAuth: true },
];

async function takeScreenshots() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  console.log('Starting screenshot capture...\n');

  for (const pageInfo of pages) {
    try {
      console.log(`📸 Capturing: ${pageInfo.name}`);
      
      if (pageInfo.requiresAuth && pageInfo.name === '02-dashboard') {
        console.log('   Logging in first...');
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[type="email"]', 'admin@greatforce.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        console.log('   ✓ Logged in successfully');
      }

      await page.goto(`${BASE_URL}${pageInfo.path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageInfo.name}.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      console.log(`   ✓ Saved to: ${screenshotPath}\n`);
    } catch (error) {
      console.error(`   ✗ Error capturing ${pageInfo.name}:`, error.message, '\n');
    }
  }

  console.log('Taking mobile screenshots...\n');
  
  await context.close();
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  });
  const mobilePage = await mobileContext.newPage();

  const mobilePages = [
    { name: '14-mobile-login', path: '/login' },
    { name: '15-mobile-dashboard', path: '/' },
    { name: '16-mobile-contacts', path: '/contacts' },
    { name: '17-mobile-deals', path: '/deals' },
  ];

  for (const pageInfo of mobilePages) {
    try {
      console.log(`📱 Capturing: ${pageInfo.name}`);
      
      if (pageInfo.name === '15-mobile-dashboard') {
        console.log('   Logging in first...');
        await mobilePage.goto(`${BASE_URL}/login`);
        await mobilePage.waitForLoadState('networkidle');
        
        await mobilePage.fill('input[type="email"]', 'admin@greatforce.com');
        await mobilePage.fill('input[type="password"]', 'password123');
        await mobilePage.click('button[type="submit"]');
        
        await mobilePage.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
        await mobilePage.waitForLoadState('networkidle');
        console.log('   ✓ Logged in successfully');
      }

      await mobilePage.goto(`${BASE_URL}${pageInfo.path}`);
      await mobilePage.waitForLoadState('networkidle');
      await mobilePage.waitForTimeout(2000);

      const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageInfo.name}.png`);
      await mobilePage.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      console.log(`   ✓ Saved to: ${screenshotPath}\n`);
    } catch (error) {
      console.error(`   ✗ Error capturing ${pageInfo.name}:`, error.message, '\n');
    }
  }

  await browser.close();
  console.log('✅ Screenshot capture complete!\n');
}

takeScreenshots().catch(console.error);
