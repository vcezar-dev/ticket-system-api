import { Role } from '../../users/enums/role.enum';

export class TokenPayloadDto {
  sub!: string;
  role!: Role;
  iat!: number;
  exp!: number;
  iss!: string;
  aud!: string;
}
