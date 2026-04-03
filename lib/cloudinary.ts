import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload function for images
export async function uploadImage(
  file: File,
  folder: string = "restaurant-profiles",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const arrayBuffer = file.arrayBuffer();
    arrayBuffer.then((buffer) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            format: "webp",
            quality: "auto:good",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result?.secure_url || "");
            }
          },
        )
        .end(Buffer.from(buffer));
    });
  });
}

// Delete function for images
export async function deleteImage(publicId: string): Promise<boolean> {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        resolve(false);
      } else {
        resolve(result?.result === "ok" || false);
      }
    });
  });
}

// Get public ID from URL
export function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
}
