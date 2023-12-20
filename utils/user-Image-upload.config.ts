// file-upload.config.ts
import { diskStorage } from 'multer';
import { UnprocessableEntityException } from '@nestjs/common';

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
    destination: 'public/uploads/userImages',
    filename(req, file, callback) {
      const uniqueFileName = `userImage-${Date.now()}.${
        file.mimetype.split('/')[1]
      }`;
      callback(null, uniqueFileName);
    },
  }),
};
