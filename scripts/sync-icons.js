#!/usr/bin/env node

/**
 * Manual Icon Sync Script
 * Copies generated icons to Android & iOS directories
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../assets');
const ICON_PNG = path.join(ASSETS_DIR, 'icon.png');
const SPLASH_PNG = path.join(ASSETS_DIR, 'splash.png');
const ICON_BACKGROUND = '#10B981';

console.log('🎨 Manual Icon Sync Script');
console.log('===========================\n');

async function ensureAssetsExist() {
  console.log('📝 Ensuring icon and splash assets exist...');

  // Create assets directory if it doesn't exist
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // Generate icon if it doesn't exist
  if (!fs.existsSync(ICON_PNG)) {
    console.log('⚠️  Icon not found, generating from source...');
    const SOURCE_ICON = path.join(__dirname, '../public/smlogo.webp');
    const TEMP_PNG = path.join(__dirname, '../temp-icon.png');

    await sharp(SOURCE_ICON).png().toFile(TEMP_PNG);
    await sharp(TEMP_PNG)
      .resize(1024, 1024, { fit: 'contain', background: ICON_BACKGROUND })
      .png()
      .toFile(ICON_PNG);
    fs.unlinkSync(TEMP_PNG);
    console.log('✅ Icon generated');
  }

  // Generate splash if it doesn't exist
  if (!fs.existsSync(SPLASH_PNG)) {
    console.log('⚠️  Splash not found, generating from source...');
    const SOURCE_ICON = path.join(__dirname, '../public/smlogo.webp');
    const TEMP_PNG = path.join(__dirname, '../temp-icon.png');

    await sharp(SOURCE_ICON).png().toFile(TEMP_PNG);
    await sharp(TEMP_PNG)
      .resize(2732, 2732, { fit: 'contain', background: ICON_BACKGROUND })
      .png()
      .toFile(SPLASH_PNG);
    fs.unlinkSync(TEMP_PNG);
    console.log('✅ Splash generated');
  }

  console.log('✅ Assets ready\n');
}

async function copyToAndroid() {
  console.log('📝 Copying icons to Android...');

  const androidDirs = [
    'android/app/src/main/res/mipmap-hdpi',
    'android/app/src/main/res/mipmap-mdpi',
    'android/app/src/main/res/mipmap-xhdpi',
    'android/app/src/main/res/mipmap-xxhdpi',
    'android/app/src/main/res/mipmap-xxxhdpi',
  ];

  const sizes = {
    'mipmap-hdpi': 72,
    'mipmap-mdpi': 48,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  };

  for (const dir of androidDirs) {
    const sizeName = dir.split('/').pop();
    const size = sizes[sizeName];

    await sharp(ICON_PNG)
      .resize(size, size)
      .toFile(path.join(__dirname, '..', dir, '/ic_launcher.png'));

    await sharp(ICON_PNG)
      .resize(size, size)
      .toFile(path.join(__dirname, '..', dir, '/ic_launcher_round.png'));
  }

  // Copy to drawable directories (for splash)
  const drawableDirs = fs.readdirSync(path.join(__dirname, '../android/app/src/main/res'))
    .filter(d => d.startsWith('drawable'));

  for (const dir of drawableDirs) {
    const dirPath = path.join(__dirname, '../android/app/src/main/res', dir);
    if (fs.statSync(dirPath).isDirectory()) {
      await sharp(SPLASH_PNG)
        .resize(
          dir.includes('land') ? 1920 : 1080,
          dir.includes('land') ? 1080 : 1920
        )
        .toFile(path.join(dirPath, 'splash.png'));
    }
  }

  console.log('✅ Android icons copied\n');
}

async function copyToIOS() {
  console.log('📝 Copying icons to iOS...');

  const iosIconSet = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');

  const sizes = [
    { name: 'AppIcon-512@2x.png', size: 1024 },
    { name: 'AppIcon-512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const outputPath = path.join(iosIconSet, name);
    await sharp(ICON_PNG)
      .resize(size, size)
      .toFile(outputPath);
  }

  // Copy splash
  const iosSplashSet = path.join(__dirname, '../ios/App/App/Assets.xcassets/Splash.imageset');

  await sharp(SPLASH_PNG)
    .resize(2732, 2732)
    .toFile(path.join(iosSplashSet, 'splash-2732x2732.png'));

  await sharp(SPLASH_PNG)
    .resize(2732, 2732)
    .toFile(path.join(iosSplashSet, 'splash-2732x2732-1.png'));

  await sharp(SPLASH_PNG)
    .resize(2732, 2732)
    .toFile(path.join(iosSplashSet, 'splash-2732x2732-2.png'));

  console.log('✅ iOS icons copied\n');
}

async function updateCapacitorConfig() {
  console.log('📝 Checking capacitor.config.json...');

  const configPath = path.join(__dirname, '../android/app/src/main/assets/capacitor.config.json');

  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('✅ capacitor.config.json exists');
  }

  console.log('');
}

async function main() {
  try {
    await ensureAssetsExist();
    await copyToAndroid();
    await copyToIOS();
    await updateCapacitorConfig();

    console.log('🎉 All done! Icons synced successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: pnpm build && pnpm cap:sync');
    console.log('   2. Open in IDE: pnpm cap:open:android (or ios)');
    console.log('   3. Build and test on device/simulator');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
