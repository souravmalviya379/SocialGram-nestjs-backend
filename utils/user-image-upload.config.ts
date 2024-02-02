// file-upload.config.ts
import { diskStorage } from 'multer';
import { UnprocessableEntityException } from '@nestjs/common';

export const USER_IMAGE_PATH = 'uploads/userImages';

export const userImageUploadOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\jpg|jpeg|png|svg$/)) {
      cb(null, true);
    } else {
      cb(
        new UnprocessableEntityException(
          'Only (.jpg/jpeg/png/svg) files are allowed',
        ),
        false,
      );
    }
  },
  storage: diskStorage({
    destination: `public/${USER_IMAGE_PATH}`,
    filename(req, file, callback) {
      const uniqueFileName = `userImage-${Date.now()}.${
        file.mimetype.split('/')[1]
      }`;
      callback(null, uniqueFileName);
    },
  }),
};
