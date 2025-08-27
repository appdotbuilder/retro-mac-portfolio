import { db } from '../db';
import { feedbackMessagesTable } from '../db/schema';
import { type CreateFeedbackMessageInput, type FeedbackMessage } from '../schema';

export const createFeedbackMessage = async (input: CreateFeedbackMessageInput): Promise<FeedbackMessage> => {
  try {
    // Insert feedback message record
    const result = await db.insert(feedbackMessagesTable)
      .values({
        name: input.name,
        email: input.email,
        message: input.message
      })
      .returning()
      .execute();

    // Return the created feedback message
    const feedbackMessage = result[0];
    return {
      ...feedbackMessage
    };
  } catch (error) {
    console.error('Feedback message creation failed:', error);
    throw error;
  }
};