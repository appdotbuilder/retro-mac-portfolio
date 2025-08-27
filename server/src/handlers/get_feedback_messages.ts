import { db } from '../db';
import { feedbackMessagesTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { type FeedbackMessage } from '../schema';

export const getFeedbackMessages = async (): Promise<FeedbackMessage[]> => {
  try {
    // Fetch all feedback messages ordered by creation date (newest first)
    const results = await db.select()
      .from(feedbackMessagesTable)
      .orderBy(desc(feedbackMessagesTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Fetching feedback messages failed:', error);
    throw error;
  }
};