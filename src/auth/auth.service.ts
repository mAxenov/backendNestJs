import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/interfaces/createUser.dto';
import { UserDocument } from '../user/schemes/user.schema';
import { UsersService } from '../user/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.usersService.findById(payload.id);
    console.log(user);
    return user;
  }

  async signup(user: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.usersService.create({
      ...user,
      passwordHash: hashedPassword,
    });
    return { user: newUser, token: this.generateToken(newUser) };
  }

  async signin(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return { user, token: this.generateToken(user) };
    } else {
      throw new UnauthorizedException('Invalid password');
    }
  }

  private generateToken(user: UserDocument): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }
}
