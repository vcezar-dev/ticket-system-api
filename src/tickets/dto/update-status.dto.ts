import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Status } from '../enums/status.enum';

export class UpdateStatusDto {
  @IsEnum(Status)
  status!: Status;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}
