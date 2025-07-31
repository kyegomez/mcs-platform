const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const publicDir = path.join(__dirname, '../public');
  const bgPath = path.join(publicDir, 'bg.png');
  
  if (!fs.existsSync(bgPath)) {
    console.error('Background image not found at:', bgPath);
    return;
  }

  try {
    // Create optimized Open Graph image (1200x630 - optimal for social media)
    await sharp(bgPath)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(publicDir, 'og-image.png'));

    // Create Twitter card image (1200x600)
    await sharp(bgPath)
      .resize(1200, 600, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(publicDir, 'twitter-card.png'));

    // Create favicon sizes
    await sharp(bgPath)
      .resize(32, 32, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'favicon-32x32.png'));

    await sharp(bgPath)
      .resize(16, 16, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'favicon-16x16.png'));

    // Create apple touch icon
    await sharp(bgPath)
      .resize(180, 180, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    // Create PWA icons
    await sharp(bgPath)
      .resize(192, 192, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'icon-192.png'));

    await sharp(bgPath)
      .resize(512, 512, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'icon-512.png'));

    console.log('✅ All images optimized successfully!');
    console.log('Generated files:');
    console.log('- og-image.png (1200x630) - Open Graph');
    console.log('- twitter-card.png (1200x600) - Twitter Card');
    console.log('- favicon-32x32.png - Favicon');
    console.log('- favicon-16x16.png - Favicon');
    console.log('- apple-touch-icon.png - Apple Touch Icon');
    console.log('- icon-192.png - PWA Icon');
    console.log('- icon-512.png - PWA Icon');

  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages(); 