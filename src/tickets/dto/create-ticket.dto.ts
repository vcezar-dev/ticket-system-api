import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Category } from '../enums/category.enum';
import { Priority } from '../enums/priority.enum';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly title!: string;

  @IsString()
  @MaxLength(500)
  readonly description!: string;

  @IsEnum(Priority)
  readonly priority!: Priority;

  @IsEnum(Category)
  readonly category!: Category;
}
