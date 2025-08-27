import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { feedbackMessagesTable } from '../db/schema';
import { type CreateFeedbackMessageInput } from '../schema';
import { createFeedbackMessage } from '../handlers/create_feedback_message';
import { eq } from 'drizzle-orm';

// Test input with email
const testInputWithEmail: CreateFeedbackMessageInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  message: 'Great portfolio! I love your work on the React projects.'
};

// Test input without email (nullable field)
const testInputWithoutEmail: CreateFeedbackMessageInput = {
  name: 'Anonymous User',
  email: null,
  message: 'Thanks for sharing your projects. Very inspiring!'
};

describe('createFeedbackMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a feedback message with email', async () => {
    const result = await createFeedbackMessage(testInputWithEmail);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.message).toEqual('Great portfolio! I love your work on the React projects.');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a feedback message without email', async () => {
    const result = await createFeedbackMessage(testInputWithoutEmail);

    // Basic field validation
    expect(result.name).toEqual('Anonymous User');
    expect(result.email).toBeNull();
    expect(result.message).toEqual('Thanks for sharing your projects. Very inspiring!');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save feedback message to database', async () => {
    const result = await createFeedbackMessage(testInputWithEmail);

    // Query using proper drizzle syntax
    const feedbackMessages = await db.select()
      .from(feedbackMessagesTable)
      .where(eq(feedbackMessagesTable.id, result.id))
      .execute();

    expect(feedbackMessages).toHaveLength(1);
    expect(feedbackMessages[0].name).toEqual('John Doe');
    expect(feedbackMessages[0].email).toEqual('john.doe@example.com');
    expect(feedbackMessages[0].message).toEqual('Great portfolio! I love your work on the React projects.');
    expect(feedbackMessages[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple feedback messages correctly', async () => {
    // Create two different feedback messages
    const result1 = await createFeedbackMessage(testInputWithEmail);
    const result2 = await createFeedbackMessage(testInputWithoutEmail);

    // Verify both have different IDs
    expect(result1.id).not.toEqual(result2.id);

    // Query all feedback messages
    const allMessages = await db.select()
      .from(feedbackMessagesTable)
      .execute();

    expect(allMessages).toHaveLength(2);
    
    // Verify both messages are stored correctly
    const messageWithEmail = allMessages.find(msg => msg.email === 'john.doe@example.com');
    const messageWithoutEmail = allMessages.find(msg => msg.email === null);

    expect(messageWithEmail).toBeDefined();
    expect(messageWithEmail?.name).toEqual('John Doe');
    
    expect(messageWithoutEmail).toBeDefined();
    expect(messageWithoutEmail?.name).toEqual('Anonymous User');
  });

  it('should handle long messages correctly', async () => {
    const longMessage = 'This is a very long feedback message. '.repeat(50);
    const longMessageInput: CreateFeedbackMessageInput = {
      name: 'Verbose User',
      email: 'verbose@example.com',
      message: longMessage
    };

    const result = await createFeedbackMessage(longMessageInput);

    expect(result.message).toEqual(longMessage);
    expect(result.message.length).toBeGreaterThan(1000);

    // Verify it's stored correctly in database
    const storedMessage = await db.select()
      .from(feedbackMessagesTable)
      .where(eq(feedbackMessagesTable.id, result.id))
      .execute();

    expect(storedMessage[0].message).toEqual(longMessage);
  });
});