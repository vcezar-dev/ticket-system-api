import 'dotenv/config';
import { AppDataSource } from '../data-source';

async function clearSeed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Cannot run seed:clear in production');
    process.exit(1);
  }

  await AppDataSource.initialize();
  console.log('Database connected');

  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.query('TRUNCATE TABLE "comment", "ticket", "user" CASCADE');
  console.log('All seed data cleared');

  await queryRunner.release();

  await AppDataSource.destroy();
  console.log('Seed cleared successfully');
}

clearSeed().catch((error) => {
  console.error('Seed clear failed:', error);
  process.exit(1);
});
