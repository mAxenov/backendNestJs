import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemes/user.schema';
import { Model } from 'mongoose';
import { SearchUserParams } from './interfaces/SearchUserParams';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

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
    const { limit, offset, email, name, contactPhone } = params;
    const query = {};
    if (email) query['email'] = { $regex: email, $options: 'i' };
    if (name) query['name'] = { $regex: name, $options: 'i' };
    if (contactPhone)
      query['contactPhone'] = { $regex: contactPhone, $options: 'i' };
    return this.UserModel.find(query).limit(limit).skip(offset).exec();
  }
}
