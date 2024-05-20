import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token, TokenDocument } from './schemes/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/schemes/user.schema';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private readonly TokenModel: Model<TokenDocument>,
    private jwtService: JwtService,
  ) {}

  generateTokens(user: UserDocument) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '60m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateToken(token: string) {
    try {
      const userData = this.jwtService.verify(token);
      return userData;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId: string, refreshToken: string) {
    const tokenData = await this.TokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await this.TokenModel.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = await this.TokenModel.deleteOne({ refreshToken });
    return tokenData;
  }

  async findToken(refreshToken: string) {
    const tokenData = await this.TokenModel.findOne({ refreshToken });
    return tokenData;
  }
}
