import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioStatsTable, projectsTable, likesTable } from '../db/schema';
import { getPortfolioStats } from '../handlers/get_portfolio_stats';
import { eq } from 'drizzle-orm';

describe('getPortfolioStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create and return default stats when no record exists', async () => {
    const result = await getPortfolioStats();

    // Verify basic structure
    expect(result.id).toBeDefined();
    expect(result.total_projects).toEqual(0);
    expect(result.years_experience).toEqual(0);
    expect(result.total_likes).toEqual(0);
    expect(result.visitor_count).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify record was created in database
    const dbStats = await db.select()
      .from(portfolioStatsTable)
      .where(eq(portfolioStatsTable.id, result.id))
      .execute();

    expect(dbStats).toHaveLength(1);
    expect(dbStats[0].total_projects).toEqual(0);
  });

  it('should calculate total projects from active projects', async () => {
    // Create test projects
    await db.insert(projectsTable)
      .values([
        {
          title: 'Active Project 1',
          description: 'Test project',
          tags: ['javascript'],
          is_active: true
        },
        {
          title: 'Active Project 2', 
          description: 'Another test project',
          tags: ['typescript'],
          is_active: true
        },
        {
          title: 'Inactive Project',
          description: 'Inactive test project',
          tags: ['python'],
          is_active: false
        }
      ])
      .execute();

    const result = await getPortfolioStats();

    expect(result.total_projects).toEqual(2); // Only active projects counted
  });

  it('should calculate total likes from likes table', async () => {
    // Create test likes records
    await db.insert(likesTable)
      .values([
        { count: 10 },
        { count: 25 },
        { count: 5 }
      ])
      .execute();

    const result = await getPortfolioStats();

    expect(result.total_likes).toEqual(40); // Sum of all like counts
  });

  it('should use existing stats record when available', async () => {
    // Create an existing stats record
    const existingStats = await db.insert(portfolioStatsTable)
      .values({
        total_projects: 99,
        years_experience: 5,
        total_likes: 150,
        visitor_count: 1000
      })
      .returning()
      .execute();

    const statsId = existingStats[0].id;

    // Create some projects and likes to verify calculation update
    await db.insert(projectsTable)
      .values({
        title: 'Test Project',
        description: 'Test description',
        tags: ['test'],
        is_active: true
      })
      .execute();

    await db.insert(likesTable)
      .values({ count: 20 })
      .execute();

    const result = await getPortfolioStats();

    // Should use same ID but update calculated fields
    expect(result.id).toEqual(statsId);
    expect(result.years_experience).toEqual(5); // Preserved from existing
    expect(result.visitor_count).toEqual(1000); // Preserved from existing
    expect(result.total_projects).toEqual(1); // Recalculated
    expect(result.total_likes).toEqual(20); // Recalculated
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle zero counts correctly', async () => {
    // No projects or likes in database
    const result = await getPortfolioStats();

    expect(result.total_projects).toEqual(0);
    expect(result.total_likes).toEqual(0);
  });

  it('should update the database record with calculated values', async () => {
    // Create test data
    await db.insert(projectsTable)
      .values({
        title: 'Test Project',
        description: 'Test description',
        tags: ['test'],
        is_active: true
      })
      .execute();

    await db.insert(likesTable)
      .values({ count: 15 })
      .execute();

    const result = await getPortfolioStats();

    // Verify the database was actually updated
    const dbRecord = await db.select()
      .from(portfolioStatsTable)
      .where(eq(portfolioStatsTable.id, result.id))
      .execute();

    expect(dbRecord[0].total_projects).toEqual(1);
    expect(dbRecord[0].total_likes).toEqual(15);
    expect(dbRecord[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple active and inactive projects correctly', async () => {
    // Create mixed project statuses
    const projects = [
      { title: 'Active 1', description: 'desc', tags: ['js'], is_active: true },
      { title: 'Active 2', description: 'desc', tags: ['py'], is_active: true },
      { title: 'Active 3', description: 'desc', tags: ['go'], is_active: true },
      { title: 'Inactive 1', description: 'desc', tags: ['rb'], is_active: false },
      { title: 'Inactive 2', description: 'desc', tags: ['php'], is_active: false }
    ];

    await db.insert(projectsTable)
      .values(projects)
      .execute();

    const result = await getPortfolioStats();

    expect(result.total_projects).toEqual(3); // Only active projects
  });
});