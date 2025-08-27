import { db } from '../db';
import { portfolioStatsTable, projectsTable, likesTable } from '../db/schema';
import { type PortfolioStats } from '../schema';
import { eq, count, sum } from 'drizzle-orm';

export const getPortfolioStats = async (): Promise<PortfolioStats> => {
  try {
    // Get existing stats record
    const existingStats = await db.select()
      .from(portfolioStatsTable)
      .limit(1)
      .execute();

    let statsRecord;

    if (existingStats.length === 0) {
      // Create default stats record if none exists
      const result = await db.insert(portfolioStatsTable)
        .values({
          total_projects: 0,
          years_experience: 0,
          total_likes: 0,
          visitor_count: 0
        })
        .returning()
        .execute();
      
      statsRecord = result[0];
    } else {
      statsRecord = existingStats[0];
    }

    // Calculate dynamic stats from other tables
    const [projectCount, likeCount] = await Promise.all([
      // Count active projects
      db.select({ count: count() })
        .from(projectsTable)
        .where(eq(projectsTable.is_active, true))
        .execute(),
      
      // Get total likes from likes table
      db.select({ total: sum(likesTable.count) })
        .from(likesTable)
        .execute()
    ]);

    const totalProjects = projectCount[0]?.count || 0;
    const totalLikes = likeCount[0]?.total || 0;

    // Update the stats record with calculated values
    const updatedStats = await db.update(portfolioStatsTable)
      .set({
        total_projects: totalProjects,
        total_likes: Number(totalLikes), // Ensure it's a number
        updated_at: new Date()
      })
      .where(eq(portfolioStatsTable.id, statsRecord.id))
      .returning()
      .execute();

    return updatedStats[0];
  } catch (error) {
    console.error('Failed to get portfolio stats:', error);
    throw error;
  }
};