import { createWriteStream, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { finished } from 'stream/promises';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

/**
 * Handles file upload and returns the file path
 * @param {Object} file - GraphQL Upload file object
 * @returns {Promise<String>} - URL path to the uploaded file
 */
export const processUpload = async (file) => {
  try {
    const { createReadStream, filename, mimetype } = await file;
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(mimetype)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }

    // Generate unique filename to prevent collisions
    const uniqueFilename = `${uuidv4()}-${filename}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Create file stream
    const stream = createReadStream();
    const out = createWriteStream(filePath);
    
    // Write file to disk
    stream.pipe(out);
    await finished(out);
    
    // Return the URL path to the file (relative to server)
    return `/uploads/${uniqueFilename}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Get absolute file path from URL path
 * @param {String} urlPath - URL path to the file
 * @returns {String} - Absolute file path
 */
export const getFilePath = (urlPath) => {
  const relativePath = urlPath.replace(/^\/uploads\//, '');
  return path.join(uploadDir, relativePath);
};
