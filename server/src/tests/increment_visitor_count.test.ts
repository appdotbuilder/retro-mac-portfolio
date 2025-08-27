import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioStatsTable } from '../db/schema';
import { incrementVisitorCount } from '../handlers/increment_visitor_count';
import { eq } from 'drizzle-orm';

describe('incrementVisitorCount', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create initial stats record with visitor count 1', async () => {
    const result = await incrementVisitorCount();

    // Verify returned data
    expect(result.id).toEqual(1);
    expect(result.visitor_count).toEqual(1);
    expect(result.total_projects).toEqual(0); // Default value
    expect(result.years_experience).toEqual(0); // Default value
    expect(result.total_likes).toEqual(0); // Default value
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing visitor count by 1', async () => {
    // First call creates record with count 1
    await incrementVisitorCount();

    // Second call should increment to 2
    const result = await incrementVisitorCount();

    expect(result.id).toEqual(1);
    expect(result.visitor_count).toEqual(2);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save visitor count to database correctly', async () => {
    const result = await incrementVisitorCount();

    // Query database directly to verify
    const stats = await db.select()
      .from(portfolioStatsTable)
      .where(eq(portfolioStatsTable.id, 1))
      .execute();

    expect(stats).toHaveLength(1);
    expect(stats[0].visitor_count).toEqual(1);
    expect(stats[0].id).toEqual(result.id);
    expect(stats[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple consecutive increments correctly', async () => {
    // Call multiple times
    await incrementVisitorCount();
    await incrementVisitorCount();
    await incrementVisitorCount();
    const result = await incrementVisitorCount();

    expect(result.visitor_count).toEqual(4);

    // Verify in database
    const stats = await db.select()
      .from(portfolioStatsTable)
      .where(eq(portfolioStatsTable.id, 1))
      .execute();

    expect(stats[0].visitor_count).toEqual(4);
  });

  it('should preserve existing stats data while incrementing visitor count', async () => {
    // First create a stats record with some data
    await db.insert(portfolioStatsTable)
      .values({
        id: 1,
        total_projects: 5,
        years_experience: 3,
        total_likes: 10,
        visitor_count: 0
      })
      .execute();

    // Now increment visitor count
    const result = await incrementVisitorCount();

    // Should preserve existing data
    expect(result.total_projects).toEqual(5);
    expect(result.years_experience).toEqual(3);
    expect(result.total_likes).toEqual(10);
    expect(result.visitor_count).toEqual(1); // Incremented from 0 to 1
  });

  it('should update the updated_at timestamp', async () => {
    const firstResult = await incrementVisitorCount();
    const firstTimestamp = firstResult.updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondResult = await incrementVisitorCount();
    const secondTimestamp = secondResult.updated_at;

    expect(secondTimestamp.getTime()).toBeGreaterThan(firstTimestamp.getTime());
  });
});