import { describe, it, expect } from 'vitest';

describe('Backend Functionality', () => {
    it('should return true for a simple test', () => {
        expect(true).toBe(true);
    });

    it('should add two numbers correctly', () => {
        const sum = (a, b) => a + b;
        expect(sum(1, 2)).toBe(3);
    });
});