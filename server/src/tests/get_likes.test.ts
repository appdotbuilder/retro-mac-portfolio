import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { likesTable } from '../db/schema';
import { getLikes } from '../handlers/get_likes';

describe('getLikes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create and return default likes record when none exists', async () => {
    const result = await getLikes();

    // Should have default values
    expect(result.count).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify it was actually saved to database
    const dbRecords = await db.select()
      .from(likesTable)
      .execute();

    expect(dbRecords).toHaveLength(1);
    expect(dbRecords[0].count).toEqual(0);
    expect(dbRecords[0].id).toEqual(result.id);
  });

  it('should return existing likes record when one exists', async () => {
    // Create an existing likes record
    const existingLike = await db.insert(likesTable)
      .values({
        count: 42
      })
      .returning()
      .execute();

    const result = await getLikes();

    // Should return the existing record
    expect(result.id).toEqual(existingLike[0].id);
    expect(result.count).toEqual(42);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Should not create additional records
    const dbRecords = await db.select()
      .from(likesTable)
      .execute();

    expect(dbRecords).toHaveLength(1);
  });

  it('should return first record when multiple exist', async () => {
    // Create multiple likes records
    await db.insert(likesTable)
      .values([
        { count: 10 },
        { count: 20 },
        { count: 30 }
      ])
      .execute();

    const result = await getLikes();

    // Should return the first record (lowest ID)
    expect(result.count).toEqual(10);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify all records still exist in database
    const dbRecords = await db.select()
      .from(likesTable)
      .execute();

    expect(dbRecords).toHaveLength(3);
  });

  it('should handle database dates correctly', async () => {
    const result = await getLikes();

    // Timestamps should be Date objects
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Both timestamps should be recent (within last minute)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThan(oneMinuteAgo.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(now.getTime());

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(oneMinuteAgo.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(now.getTime());
  });
});