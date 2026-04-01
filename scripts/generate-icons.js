#!/usr/bin/env node

/**
 * Icon Generation Script
 * Converts webp to PNG and generates app icons for iOS & Android
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_ICON = path.join(__dirname, '../public/smlogo.webp');
const TEMP_PNG = path.join(__dirname, '../temp-icon.png');
const ASSETS_DIR = path.join(__dirname, '../assets');
const ICON_PNG = path.join(ASSETS_DIR, 'icon.png');
const ICON_BACKGROUND = '#10B981'; // Emerald 500
const SPLASH_BACKGROUND = '#10B981'; // Emerald 500

console.log('🎨 Icon Generation Script');
console.log('===========================\n');

async function convertWebpToPng() {
  console.log('📝 Step 1: Converting webp to PNG...');

  try {
    await sharp(SOURCE_ICON)
      .png()
      .toFile(TEMP_PNG);
    console.log('✅ Converted to PNG successfully');
    return true;
  } catch (error) {
    console.error('❌ Error converting webp to PNG:', error.message);
    return false;
  }
}

async function createSquaredIcon() {
  console.log('\n📝 Step 2: Creating squared icon (1024x1024)...');

  try {
    // Create a 1024x1024 PNG with padding
    await sharp(TEMP_PNG)
      .resize(1024, 1024, {
        fit: 'contain',
        background: ICON_BACKGROUND,
      })
      .png()
      .toFile(ICON_PNG);

    console.log('✅ Created squared icon');
    return true;
  } catch (error) {
    console.error('❌ Error creating squared icon:', error.message);
    return false;
  }
}

async function createSplashImage() {
  console.log('\n📝 Step 3: Creating splash image (2732x2732)...');

  try {
    const SPLASH_PNG = path.join(ASSETS_DIR, 'splash.png');

    // Create a 2732x2732 PNG splash screen
    await sharp(TEMP_PNG)
      .resize(2732, 2732, {
        fit: 'contain',
        background: SPLASH_BACKGROUND,
      })
      .png()
      .toFile(SPLASH_PNG);

    console.log('✅ Created splash image');
    return true;
  } catch (error) {
    console.error('❌ Error creating splash image:', error.message);
    return false;
  }
}

async function generateCapacitorAssets() {
  console.log('\n📝 Step 4: Generating Capacitor assets...');

  try {
    const command = `npx @capacitor/assets generate \
      --iconBackgroundColor=${ICON_BACKGROUND} \
      --splashBackgroundColor=${SPLASH_BACKGROUND} \
      --android \
      --ios`;

    console.log('Running:', command);
    execSync(command, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });

    console.log('\n✅ Generated Capacitor assets');
    return true;
  } catch (error) {
    console.error('❌ Error generating Capacitor assets:', error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\n📝 Step 5: Cleaning up temporary files...');

  try {
    if (fs.existsSync(TEMP_PNG)) {
      fs.unlinkSync(TEMP_PNG);
      console.log('✅ Cleaned up temporary files');
    }
  } catch (error) {
    console.warn('⚠️  Warning: Could not clean up temporary files:', error.message);
  }
}

async function main() {
  try {
    // Check if source file exists
    if (!fs.existsSync(SOURCE_ICON)) {
      console.error(`❌ Error: Source icon not found at ${SOURCE_ICON}`);
      process.exit(1);
    }

    // Create assets directory if it doesn't exist
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    // Run steps
    const converted = await convertWebpToPng();
    if (!converted) {
      process.exit(1);
    }

    const squared = await createSquaredIcon();
    if (!squared) {
      await cleanup();
      process.exit(1);
    }

    const splashed = await createSplashImage();
    if (!splashed) {
      await cleanup();
      process.exit(1);
    }

    const generated = await generateCapacitorAssets();
    if (!generated) {
      await cleanup();
      process.exit(1);
    }

    await cleanup();

    console.log('\n🎉 All done! Icons generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review the generated icons');
    console.log('   2. Run: pnpm cap:sync');
    console.log('   3. Open in IDE: pnpm cap:open:android (or ios)');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    await cleanup();
    process.exit(1);
  }
}

main();
