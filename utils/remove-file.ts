import { unlinkSync } from 'fs';

export default function removeFile(filePath) {
  try {
    unlinkSync(filePath);
  } catch (error) {
    console.log('Error while deleting user image : ', error);
  }
}
