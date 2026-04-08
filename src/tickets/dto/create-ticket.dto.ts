import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Category } from '../enums/category.enum';
import { Priority } from '../enums/priority.enum';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsEnum(Priority)
  priority!: Priority;

  @IsEnum(Category)
  category!: Category;
}
