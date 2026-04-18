import { BcryptService } from './bcrypt.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(() => {
    service = new BcryptService();
  });

  describe('hash', () => {
    it('should return a hashed password', async () => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.hash('password');

      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 'salt');
      expect(result).toBe('hashed');
    });
  });

  describe('compare', () => {
    it('should return true when password matches hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare('password', 'password');

      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'password');
      expect(result).toBe(true);
    });

    it('should return false when password does not match hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare('other-password', 'password');

      expect(bcrypt.compare).toHaveBeenCalledWith('other-password', 'password');
      expect(result).toBe(false);
    });
  });
});
