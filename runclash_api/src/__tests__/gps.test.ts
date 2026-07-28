import { GPSService } from '../services/gps.service';

describe('GPSService', () => {
  let gpsService: GPSService;

  beforeEach(() => {
    gpsService = new GPSService();
  });

  describe('shouldAcceptLocation', () => {
    it('accepts location when accuracy is undefined', () => {
      expect(gpsService.shouldAcceptLocation(undefined)).toBe(true);
    });

    it('accepts location when accuracy is within threshold', () => {
      expect(gpsService.shouldAcceptLocation(20)).toBe(true);
      expect(gpsService.shouldAcceptLocation(50)).toBe(true);
    });

    it('rejects location when accuracy exceeds threshold', () => {
      expect(gpsService.shouldAcceptLocation(60)).toBe(false);
    });
  });

  describe('isDistanceValid', () => {
    it('accepts valid distances', () => {
      expect(gpsService.isDistanceValid(10)).toBe(true);
      expect(gpsService.isDistanceValid(50)).toBe(true);
    });

    it('rejects too-small distances', () => {
      expect(gpsService.isDistanceValid(2)).toBe(false);
    });

    it('rejects too-large distances', () => {
      expect(gpsService.isDistanceValid(101)).toBe(false);
    });
  });

  describe('calculateCalories', () => {
    it('calculates calories for a given distance', () => {
      expect(gpsService.calculateCalories(1000)).toBe(35);
      expect(gpsService.calculateCalories(0)).toBe(0);
    });
  });

  describe('calculateXP', () => {
    it('calculates XP from distance and calories', () => {
      const xp = gpsService.calculateXP(1000, 35);
      expect(xp).toBeGreaterThan(0);
      expect(typeof xp).toBe('number');
    });

    it('returns 10 base XP for zero values', () => {
      expect(gpsService.calculateXP(0, 0)).toBe(10);
    });
  });

  describe('calculateLevel', () => {
    it('returns level 1 for XP below 100', () => {
      expect(gpsService.calculateLevel(0)).toBe(1);
      expect(gpsService.calculateLevel(99)).toBe(1);
    });

    it('returns level 2 for XP between 100 and 399', () => {
      expect(gpsService.calculateLevel(100)).toBe(2);
    });

    it('returns level 3 for XP >= 400', () => {
      expect(gpsService.calculateLevel(400)).toBe(3);
    });
  });

  describe('haversineDistance', () => {
    it('returns 0 for same point', () => {
      expect(gpsService.haversineDistance(0, 0, 0, 0)).toBeCloseTo(0, 5);
    });

    it('calculates distance between two points', () => {
      const distance = gpsService.haversineDistance(0, 0, 0, 1);
      expect(distance).toBeGreaterThan(0);
    });
  });
});
