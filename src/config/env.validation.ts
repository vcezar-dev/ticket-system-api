import * as z from 'zod';

const booleanFromString = z
  .string()
  .transform((val) => val.trim() === 'true')
  .or(z.boolean());

const envSchema = z.object({
  // api
  PORT: z.coerce.number().default(3000),

  // database
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USERNAME: z.string(),
  DATABASE_DATABASE: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_LOGGING: booleanFromString.default(false),

  // jwt
  JWT_SECRET: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_ISSUER: z.string(),
  JWT_ACCESS_TOKEN_TTL: z.coerce.number().default(3600),
  JWT_REFRESH_TOKEN_TTL: z.coerce.number().default(604800),
});

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${JSON.stringify(result.error.flatten().fieldErrors, null, 2)}`,
    );
  }

  Object.assign(process.env, result.data);

  return result.data;
}
