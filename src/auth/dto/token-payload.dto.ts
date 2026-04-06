export class TokenPayloadDto {
  sub!: string;
  iat!: number;
  exp!: number;
  iss!: string;
  aud!: string;
}
