import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import removeFile from 'utils/remove-file';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async findById(userId: string | mongoose.Types.ObjectId) {
    return await this.userModel.findById(userId);
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email: email });
  }

  async findByEmailOrUsername(username: string) {
    return await this.userModel.findOne({
      $or: [{ username: username }, { email: username }],
    });
  }

  async create(registerUserDto: RegisterUserDto, file: any) {
    try {
      const {
        name,
        email,
        username,
        country,
        gender,
        password,
        confirmPassword,
      } = registerUserDto;

      if (password !== confirmPassword) {
        throw new BadRequestException(
          'Password and confirmPassword do not match',
        );
      }

      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const newUser = new this.userModel({
        name,
        email,
        username,
        country,
        gender,
        password,
      });

      if (file) {
        console.log('file', file);
        newUser.image = `uploads/userImages/${file.filename}`;
      }

      await newUser.save();
      return {
        message: 'User registered successfully',
        newUser,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else {
        console.log('Error while creating User : ', error);
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }

  async edit(
    user: UserDocument,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    try {
      for (const update in updateUserDto) {
        user[update] = updateUserDto[update];
      }
      if (file) {
        if (user.image) {
          removeFile(`public/${user.image}`);
        }
        user.image = `uploads/userImages/${file.filename}`;
      }
      await user.save();

      return {
        message: 'User profile updated successfully',
        user,
      };
    } catch (error) {
      console.log('Error while editing user data : ', error);
      throw new InternalServerErrorException(
        'Something went wrong while updating user data',
      );
    }
  }
}
