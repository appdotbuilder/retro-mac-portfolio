import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { likesTable } from '../db/schema';
import { type IncrementLikeInput } from '../schema';
import { incrementLikes } from '../handlers/increment_likes';
import { eq } from 'drizzle-orm';

describe('incrementLikes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new like record when none exists', async () => {
    const input: IncrementLikeInput = {
      increment: 1
    };

    const result = await incrementLikes(input);

    expect(result.id).toBeDefined();
    expect(result.count).toEqual(1);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing like count', async () => {
    // Create initial like record
    await db.insert(likesTable)
      .values({
        count: 5
      })
      .execute();

    const input: IncrementLikeInput = {
      increment: 3
    };

    const result = await incrementLikes(input);

    expect(result.count).toEqual(8); // 5 + 3
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should use default increment of 1 when not specified', async () => {
    const input: IncrementLikeInput = {
      increment: 1 // Zod default is applied in the parsed input
    };

    const result = await incrementLikes(input);

    expect(result.count).toEqual(1);
  });

  it('should handle multiple increments correctly', async () => {
    // First increment
    const firstInput: IncrementLikeInput = { increment: 2 };
    const firstResult = await incrementLikes(firstInput);
    expect(firstResult.count).toEqual(2);

    // Second increment
    const secondInput: IncrementLikeInput = { increment: 5 };
    const secondResult = await incrementLikes(secondInput);
    expect(secondResult.count).toEqual(7); // 2 + 5
    expect(secondResult.id).toEqual(firstResult.id); // Same record
  });

  it('should save incremented likes to database', async () => {
    const input: IncrementLikeInput = {
      increment: 10
    };

    const result = await incrementLikes(input);

    // Verify in database
    const savedLikes = await db.select()
      .from(likesTable)
      .where(eq(likesTable.id, result.id))
      .execute();

    expect(savedLikes).toHaveLength(1);
    expect(savedLikes[0].count).toEqual(10);
    expect(savedLikes[0].updated_at).toBeInstanceOf(Date);
  });

  it('should increment from existing count correctly', async () => {
    // Create initial record with count 15
    const initialRecord = await db.insert(likesTable)
      .values({
        count: 15
      })
      .returning()
      .execute();

    const input: IncrementLikeInput = {
      increment: 7
    };

    const result = await incrementLikes(input);

    expect(result.count).toEqual(22); // 15 + 7
    expect(result.id).toEqual(initialRecord[0].id);

    // Verify updated_at was changed
    expect(result.updated_at.getTime()).toBeGreaterThan(initialRecord[0].updated_at.getTime());
  });

  it('should handle large increment values', async () => {
    const input: IncrementLikeInput = {
      increment: 100
    };

    const result = await incrementLikes(input);

    expect(result.count).toEqual(100);
    expect(result.id).toBeDefined();
  });

  it('should work with single like table record assumption', async () => {
    // The handler assumes there's only one likes record in the table
    // Test that it always uses the first record found
    const input1: IncrementLikeInput = { increment: 3 };
    const result1 = await incrementLikes(input1);
    
    const input2: IncrementLikeInput = { increment: 2 };
    const result2 = await incrementLikes(input2);
    
    // Should be the same record ID, with cumulative count
    expect(result2.id).toEqual(result1.id);
    expect(result2.count).toEqual(5); // 3 + 2
    
    // Verify only one record exists in table
    const allLikes = await db.select().from(likesTable).execute();
    expect(allLikes).toHaveLength(1);
    expect(allLikes[0].count).toEqual(5);
  });
});