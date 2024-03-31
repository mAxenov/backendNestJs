import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/interfaces/createUser.dto';
import { Response } from 'express';
import { Roles } from './guards/roles';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CreateUserRoleDto } from 'src/user/interfaces/createUserRole.dto';
import { SearchUserParams } from 'src/user/interfaces/SearchUserParams';
import { UsersService } from 'src/user/users.service';
import { plainToClass } from 'class-transformer';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('client/register')
  async signup(@Body() user: CreateUserDto, @Res() res: Response) {
    const { user: profile, token } = await this.authService.signup(user);

    res.cookie('authCookie', token, { httpOnly: true });
    res.json({ id: profile._id, email: profile.email, name: profile.name });
  }

  @Post('auth/login')
  async signin(
    @Body() signinDto: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { email, password } = signinDto;
    const { user, token } = await this.authService.signin(email, password);
    res.cookie('authCookie', token, { httpOnly: true });
    res.json(
      plainToClass(CreateUserDto, user, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Post('auth/logout')
  async logout(@Res() res: Response) {
    res.clearCookie('authCookie');
    return res.send('Logout successful');
  }

  @Post('admin/users')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async signupAdmin(@Body() user: CreateUserRoleDto) {
    const { user: profile } = await this.authService.signup(user);
    return {
      id: profile._id,
      email: profile.email,
      name: profile.name,
      contactPhone: profile.contactPhone,
      role: profile.role,
    };
  }

  @Get(['manager/users', 'admin/users'])
  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsers(@Query() params: SearchUserParams) {
    const users = await this.usersService.findAll(params);
    return users.map((user) => ({
      id: user._id,
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
    }));
  }
}
