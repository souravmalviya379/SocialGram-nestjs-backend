// file-upload.config.ts
import { diskStorage } from 'multer';
import { UnprocessableEntityException } from '@nestjs/common';
import { Request } from 'express';

export const MAX_IMAGES_COUNT = 10;
export const POST_IMAGE_PATH = 'uploads/postImages';

export const postImageUploadOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: MAX_IMAGES_COUNT,
  },
  fileFilter: (req: Request, file, cb) => {
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
    destination: `public/${POST_IMAGE_PATH}`,
    filename(req, file, callback) {
      const uniqueFileName = `postImage-${Date.now()}.${
        file.mimetype.split('/')[1]
      }`;
      callback(null, uniqueFileName);
    },
  }),
};
