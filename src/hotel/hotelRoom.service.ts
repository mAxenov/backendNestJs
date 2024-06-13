import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { HotelRoom, HotelRoomDocument } from './schemes/hotelRoom.schema';
import {
  SearchRoomsParams,
  SearchRoomsParamsAdmin,
} from './interfaces/SearchRoomsParams';
import { ReservationService } from 'src/reservation/reservation.service';

@Injectable()
export class HotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name)
    private readonly HotelRoomModel: Model<HotelRoomDocument>,
    @Inject(forwardRef(() => ReservationService))
    private readonly reservationService: ReservationService,
  ) {}

  async create(data: Partial<HotelRoom>): Promise<HotelRoom> {
    const createdRoom = new this.HotelRoomModel(data);
    return createdRoom.save();
  }

  async findById(id: string): Promise<HotelRoom> {
    return this.HotelRoomModel.findById(id).populate('hotel').exec();
  }

  // async search(params: SearchRoomsParams): Promise<HotelRoom[]> {
  //   const { limit, offset, hotel, isEnabled, dateStart, dateEnd } = params;
  //   const query: any = { hotel };
  //   if (isEnabled !== undefined) {
  //     query.isEnabled = isEnabled;
  //   }
  //   return this.HotelRoomModel.find(query)
  //     .limit(limit)
  //     .skip(offset)
  //     .populate('hotel')
  //     .exec();
  // }

  async search(params: SearchRoomsParams) {
    const {
      limit = 10,
      offset = 0,
      hotel,
      isEnabled,
      dateStart,
      dateEnd,
    } = params;
    console.log(params);

    // Шаг 1: Находим все бронирования, которые пересекаются с заданным периодом
    const conflictingReservations =
      await this.reservationService.conflictingReservations({
        dateStart,
        dateEnd,
        hotel,
      });

    console.log('Conflicting reservations', conflictingReservations);
    const reservedRoomIds = conflictingReservations.map(
      (reservation) => reservation.roomId,
    );

    const pipeline = [
      {
        $match: {
          _id: { $nin: reservedRoomIds },
          isEnabled: isEnabled,
          ...(hotel ? { hotel: new mongoose.Types.ObjectId(hotel) } : {}),
        },
      },
      {
        $group: {
          _id: '$hotel',
          hotel: { $first: '$hotelDetails' },
          rooms: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'hotels', // Название коллекции отелей
          localField: '_id',
          foreignField: '_id',
          as: 'hotelDetails',
        },
      },
      {
        $unwind: '$hotelDetails',
      },
      {
        $project: {
          _id: 0,
          hotelDetails: {
            id: '$_id',
            title: 1,
            description: 1,
            images: 1,
          },
          rooms: {
            _id: 1,
            title: 1,
            hotelId: '$_id',
            description: 1,
            images: 1,
          },
        },
      },
      { $skip: offset },
      { $limit: limit },
    ];

    const availableRooms = await this.HotelRoomModel.aggregate(pipeline).exec();
    return availableRooms;
  }

  async searchAdmin(params: SearchRoomsParamsAdmin): Promise<HotelRoom[]> {
    const { limit, offset, hotel, isEnabled } = params;
    const query: any = { hotel };
    if (isEnabled !== undefined) {
      query.isEnabled = isEnabled;
    }
    return this.HotelRoomModel.find(query).limit(limit).skip(offset).exec();
  }

  async update(id: string, data: Partial<HotelRoom>): Promise<HotelRoom> {
    return this.HotelRoomModel.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();
  }
}
