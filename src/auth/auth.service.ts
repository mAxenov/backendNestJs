import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/interfaces/createUser.dto';
import { UserDocument } from '../user/schemes/user.schema';
import { UsersService } from '../user/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  async validateUser(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.usersService.findById(payload.id);
    return user;
  }

  async signup(user: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.usersService.create({
      ...user,
      passwordHash: hashedPassword,
    });
    return { user: newUser };
  }

  async signin(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const tokens = this.tokenService.generateTokens(user);

      await this.tokenService.saveToken(user._id, tokens.refreshToken);
      return { user, ...tokens };
    } else {
      throw new UnauthorizedException('Invalid password');
    }
  }

  async logout(refreshToken: string) {
    await this.tokenService.removeToken(refreshToken);
    return null;
  }

  async refresh(refreshToken: string) {
    const userData = this.tokenService.validateToken(refreshToken);
    const tokenFromDb = await this.tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user = await this.usersService.findById(userData.id);
    const tokens = this.tokenService.generateTokens(user);

    await this.tokenService.saveToken(user._id, tokens.refreshToken);
    return { user, ...tokens };
  }
}
