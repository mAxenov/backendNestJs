import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './createUser.dto';

export class CreateUserRoleDto extends CreateUserDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  role: string;
}
