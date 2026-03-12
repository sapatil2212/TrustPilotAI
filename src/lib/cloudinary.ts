import { v2 as cloudinary } from 'cloudinary';
import QRCode from 'qrcode';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImage(
  base64Image: string,
  folder: string = 'trustpilotai'
): Promise<UploadResult | null> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'image',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    return null;
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete failed:', error);
    return false;
  }
}

export async function generateAndUploadQRCode(
  reviewLink: string
): Promise<string | null> {
  try {
    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(reviewLink, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      // Return the base64 data URL if Cloudinary is not configured
      console.warn('Cloudinary not configured, returning base64 QR code');
      return qrCodeDataUrl;
    }

    // Upload to Cloudinary
    const result = await uploadImage(qrCodeDataUrl, `trustpilotai/qrcodes`);
    return result?.url || qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    return null;
  }
}

/**
 * Generate QR code as PNG base64
 */
export async function generateQRCodePNG(reviewLink: string): Promise<string | null> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(reviewLink, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code PNG generation failed:', error);
    return null;
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(reviewLink: string): Promise<string | null> {
  try {
    const svgString = await QRCode.toString(reviewLink, {
      type: 'svg',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return svgString;
  } catch (error) {
    console.error('QR code SVG generation failed:', error);
    return null;
  }
}

export default cloudinary;
