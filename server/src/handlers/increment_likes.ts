import { db } from '../db';
import { likesTable } from '../db/schema';
import { type IncrementLikeInput, type Like } from '../schema';
import { eq } from 'drizzle-orm';

export const incrementLikes = async (input: IncrementLikeInput): Promise<Like> => {
  try {
    // First, try to get existing like record
    const existingLikes = await db.select()
      .from(likesTable)
      .limit(1)
      .execute();

    if (existingLikes.length > 0) {
      // Update existing record
      const existing = existingLikes[0];
      const newCount = existing.count + input.increment;
      
      const result = await db.update(likesTable)
        .set({
          count: newCount,
          updated_at: new Date()
        })
        .where(eq(likesTable.id, existing.id))
        .returning()
        .execute();
      
      return result[0];
    } else {
      // Create new record if none exists
      const result = await db.insert(likesTable)
        .values({
          count: input.increment
        })
        .returning()
        .execute();
      
      return result[0];
    }
  } catch (error) {
    console.error('Like increment failed:', error);
    throw error;
  }
};