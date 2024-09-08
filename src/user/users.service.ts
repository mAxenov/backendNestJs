import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemes/user.schema';
import { Model } from 'mongoose';
import { SearchUserParams } from './interfaces/SearchUserParams';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async onModuleInit() {
    const count = await this.UserModel.estimatedDocumentCount();
    if (count > 0) return;

    await this.UserModel.create({
      name: 'Admin',
      email: 'admin@admin',
      passwordHash: await bcrypt.hash('admin1', 10),
      contactPhone: '888 888 888',
      role: 'admin',
    });
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.UserModel(data);
    return createdUser.save();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.UserModel.findOne({ email }).exec();
  }

  async findAll(params: SearchUserParams): Promise<UserDocument[]> {
    const { limit, offset, searchParams } = params;

    let query = {};
    if (searchParams)
      query = {
        $or: [
          { email: { $regex: searchParams, $options: 'i' } },
          { name: { $regex: searchParams, $options: 'i' } },
          { contactPhone: { $regex: searchParams, $options: 'i' } },
        ],
      };

    return this.UserModel.find(query).limit(limit).skip(offset).exec();
  }
}
