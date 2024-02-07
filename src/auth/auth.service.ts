import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string) {
    try {
      const user = await this.userService.findByEmailOrUsername(username);
      if (!user) {
        throw new UnauthorizedException('Invalid username or password');
      }
      //   console.log('User found : ', user);
      const passwordMatched = await bcrypt.compare(password, user.password);
      if (!passwordMatched) {
        throw new UnauthorizedException('Invalid username or password');
      }

      const payload = {
        userId: user._id,
        username: user.username,
      };
      const accessToken = await this.jwtService.signAsync(payload);
      return { message: 'Logged in successfully', user, accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        console.log('Error while signIn :', error);
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }
}
