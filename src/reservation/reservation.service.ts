import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Reservation } from './schemes/Reservation.schema';
import {
  ReservationDto,
  ReservationSearchOptions,
} from './interfaces/reservation.interface';
import { HotelRoomService } from 'src/hotel/hotelRoom.service';
import { UserDocument } from 'src/user/schemes/user.schema';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @Inject(forwardRef(() => HotelRoomService))
    private readonly hotelRoomService: HotelRoomService,
  ) {}

  async addReservation(data: ReservationDto, user) {
    const { hotelRoom, startDate, endDate } = data;
    const room: any = await this.hotelRoomService.findById(hotelRoom);

    if (!room) {
      throw new NotFoundException('Hotel room not found');
    }

    //Проверка на доступность номера на заданную дату
    const conflictingReservations = await this.reservationModel.find({
      roomId: hotelRoom,
      $or: [{ dateStart: { $lt: endDate }, dateEnd: { $gt: startDate } }],
    });

    if (conflictingReservations.length > 0) {
      throw new BadRequestException(
        'Room is not available for the selected dates',
      );
    }

    const reservationdata = {
      userId: user._id,
      hotelId: room.hotel._id,
      roomId: hotelRoom,
      dateStart: startDate,
      dateEnd: endDate,
    };

    const reservation = new this.reservationModel(reservationdata);
    await reservation.save();

    return {
      startDate: reservation.dateStart.toISOString(),
      endDate: reservation.dateEnd.toISOString(),
      hotelRoom: {
        description: room.description,
        images: room.images,
      },
      hotel: {
        title: room.hotel.title,
        description: room.hotel.description,
      },
    };
  }

  async removeReservation(id: string, user: UserDocument): Promise<void> {
    const reservation = await this.reservationModel.findById(id).exec();
    console.log(user._id, reservation.userId);
    console.log(reservation);
    if (user._id.toString() !== reservation.userId.toString()) {
      throw new NotFoundException('user does not match room');
    }
    await this.reservationModel.findByIdAndDelete(id).exec();
  }

  async removeReservationManager(id: string): Promise<void> {
    const reservation = await this.reservationModel
      .findByIdAndDelete(id)
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
  }

  async conflictingReservations(params: any) {
    const { hotel, dateStart, dateEnd } = params;

    const reservationQuery = {
      $or: [
        { dateStart: { $lt: dateEnd, $gte: dateStart } },
        { dateEnd: { $gt: dateStart, $lte: dateEnd } },
        { dateStart: { $lte: dateStart }, dateEnd: { $gte: dateEnd } },
      ],
      // $or: [{ dateStart: { $lt: dateEnd }, dateEnd: { $gt: dateStart } }],
    };

    if (hotel) {
      reservationQuery['hotelId'] = new mongoose.Types.ObjectId(hotel);
    }
    // Находим все бронирования, которые пересекаются с заданным периодом
    const conflictingReservations = await this.reservationModel
      .find(reservationQuery)
      .select('roomId');

    return conflictingReservations;
  }

  async getReservations(filter: ReservationSearchOptions) {
    const query = { userId: filter.userId } as any;

    if (filter.dateStart) {
      query.dateStart = { $gte: filter.dateStart };
    }

    if (filter.dateEnd) {
      query.dateEnd = { $lte: filter.dateEnd };
    }

    const reservation: Reservation[] = await this.reservationModel
      .find(query)
      .populate('roomId hotelId')
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const reservationRequest = reservation.map((reservation) => {
      return {
        id: reservation._id,
        startDate: reservation.dateStart.toISOString(),
        endDate: reservation.dateEnd.toISOString(),
        hotelRoom: {
          description: reservation.roomId.description,
          images: reservation.roomId.images,
          title: reservation.roomId.title,
        },
        hotel: {
          title: reservation.hotelId.title,
          description: reservation.hotelId.description,
        },
      };
    });

    return reservationRequest;
  }
}
