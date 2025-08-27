import { db } from '../db';
import { likesTable } from '../db/schema';
import { type Like } from '../schema';

export const getLikes = async (): Promise<Like> => {
  try {
    // Get the first (and likely only) row from the likes table
    const results = await db.select()
      .from(likesTable)
      .limit(1)
      .execute();

    // If no likes record exists, create a default one
    if (results.length === 0) {
      const newLikeResult = await db.insert(likesTable)
        .values({
          count: 0
        })
        .returning()
        .execute();

      return newLikeResult[0];
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get likes:', error);
    throw error;
  }
};