import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UserIdDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
