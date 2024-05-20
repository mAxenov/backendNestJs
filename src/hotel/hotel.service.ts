import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel, HotelDocument } from './schemes/hotel.schema';
import { SearchHotelParams } from './interfaces/SearchHotelParams';
import { UpdateHotelParams } from './interfaces/UpdateHotelParams';

@Injectable()
export class HotelService {
  constructor(
    @InjectModel(Hotel.name) private readonly HotelModel: Model<HotelDocument>,
  ) {}

  async create(data: any): Promise<Hotel> {
    const createdHotel = new this.HotelModel(data);
    return createdHotel.save();
  }

  async findById(id: string): Promise<Hotel> {
    return this.HotelModel.findById(id).exec();
  }

  async search(params: SearchHotelParams): Promise<Hotel[]> {
    const { limit, offset, title } = params;
    const query = title ? { title: { $regex: title, $options: 'i' } } : {};
    const hotels = await this.HotelModel.find(query)
      .limit(limit)
      .skip(offset)
      .exec();
    return hotels.map((hotel) => ({
      id: hotel._id,
      title: hotel.title,
      description: hotel.description,
      images: hotel.images,
    }));
  }

  async update(id: string, data: UpdateHotelParams) {
    const hotel = await this.HotelModel.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();

    return {
      id: hotel._id,
      title: hotel.title,
      description: hotel.description,
      images: hotel.images,
    };
  }
}
