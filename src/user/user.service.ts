import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose from 'mongoose';
import { RegisterUserDto } from './dtos/register-user.dto';

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

  async create(registerUserDto: RegisterUserDto) {
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

      const newUser = await this.userModel.create({
        name,
        email,
        username,
        country,
        gender,
        password,
      });

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
}
