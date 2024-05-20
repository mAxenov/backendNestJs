import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelRoom, HotelRoomDocument } from './schemes/hotelRoom.schema';
import { SearchRoomsParams } from './interfaces/SearchRoomsParams';

@Injectable()
export class HotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name)
    private readonly HotelRoomModel: Model<HotelRoomDocument>,
  ) {}

  async create(data: Partial<HotelRoom>): Promise<HotelRoom> {
    const createdRoom = new this.HotelRoomModel(data);
    return createdRoom.save();
  }

  async findById(id: string): Promise<HotelRoom> {
    return this.HotelRoomModel.findById(id).populate('hotel').exec();
  }

  async search(params: SearchRoomsParams): Promise<HotelRoom[]> {
    const { limit, offset, hotel, isEnabled } = params;
    const query: any = { hotel };
    if (isEnabled !== undefined) {
      query.isEnabled = isEnabled;
    }
    return this.HotelRoomModel.find(query)
      .limit(limit)
      .skip(offset)
      .populate('hotel')
      .exec();
  }

  async update(id: string, data: Partial<HotelRoom>): Promise<HotelRoom> {
    return this.HotelRoomModel.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();
  }
}
