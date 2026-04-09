import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Status } from '../enums/status.enum';

export class UpdateStatusDto {
  @IsEnum(Status)
  readonly status!: Status;

  @IsUUID()
  @IsOptional()
  readonly assignedTo?: string;
}
