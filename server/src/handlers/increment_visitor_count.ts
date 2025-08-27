import { db } from '../db';
import { portfolioStatsTable } from '../db/schema';
import { type PortfolioStats } from '../schema';
import { sql } from 'drizzle-orm';

export const incrementVisitorCount = async (): Promise<PortfolioStats> => {
  try {
    // Use PostgreSQL's ON CONFLICT to handle upsert operation
    // If no record exists (first visitor), create one with visitor_count = 1
    // If record exists, increment visitor_count by 1
    const result = await db.insert(portfolioStatsTable)
      .values({
        id: 1, // We only have one stats record
        visitor_count: 1,
        updated_at: new Date()
      })
      .onConflictDoUpdate({
        target: portfolioStatsTable.id,
        set: {
          visitor_count: sql`${portfolioStatsTable.visitor_count} + 1`,
          updated_at: new Date()
        }
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Visitor count increment failed:', error);
    throw error;
  }
};