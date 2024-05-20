import { Reservation } from '../schemes/Reservation.schema';

export interface ReservationDto {
  hotelRoom: string;
  startDate: string;
  endDate: string;
}

export interface ReservationSearchOptions {
  userId: string;
  dateStart?: Date;
  dateEnd?: Date;
}

export interface IReservation {
  addReservation(data: ReservationDto): Promise<Reservation>;
  removeReservation(id: string): Promise<void>;
  getReservations(filter: ReservationSearchOptions): Promise<Reservation[]>;
}
