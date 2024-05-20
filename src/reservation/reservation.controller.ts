import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ReservationDto } from './interfaces/reservation.interface';
import { ReservationService } from './reservation.service';
import { UserDocument } from 'src/user/schemes/user.schema';
import { GetUser } from 'src/auth/GetUser';
import { Roles } from 'src/auth/guards/roles';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Roles('client')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('client/reservations')
export class ReservationClientController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  async addReservation(
    @Body() data: ReservationDto,
    @GetUser() user: UserDocument,
  ) {
    console.log(user);
    return this.reservationService.addReservation(data, user);
  }

  @Delete(':id')
  async removeReservation(
    @Param('id') id: string,
    @GetUser() user: UserDocument,
  ) {
    return this.reservationService.removeReservation(id, user);
  }

  @Get()
  async getReservations(@GetUser() user: UserDocument) {
    return this.reservationService.getReservations({
      userId: user._id.toString(),
    });
  }
}

@Roles('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('manager/reservations')
export class ReservationManagerController {
  constructor(private readonly reservationService: ReservationService) {}

  @Delete(':id')
  async removeReservation(@Param('id') id: string) {
    return this.reservationService.removeReservationManager(id);
  }

  @Get(':userId')
  async getReservations(@Param('userId') userId: string) {
    return this.reservationService.getReservations({
      userId: userId,
    });
  }
}
