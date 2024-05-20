import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './user/users.module';
import { HotelModule } from './hotel/hotel.module';
import { AuthModule } from './auth/auth.module';
import { ReservationModule } from './reservation/reservation.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION),
    UsersModule,
    HotelModule,
    AuthModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
