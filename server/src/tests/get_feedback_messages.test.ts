import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { feedbackMessagesTable } from '../db/schema';
import { type CreateFeedbackMessageInput } from '../schema';
import { getFeedbackMessages } from '../handlers/get_feedback_messages';

// Test feedback message inputs
const testFeedbackMessage1: CreateFeedbackMessageInput = {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Great portfolio! Love your work.'
};

const testFeedbackMessage2: CreateFeedbackMessageInput = {
  name: 'Jane Smith',
  email: null,
  message: 'Impressive projects. Keep it up!'
};

const testFeedbackMessage3: CreateFeedbackMessageInput = {
  name: 'Bob Johnson',
  email: 'bob@test.com',
  message: 'Very professional looking site.'
};

describe('getFeedbackMessages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no feedback messages exist', async () => {
    const result = await getFeedbackMessages();

    expect(result).toEqual([]);
  });

  it('should fetch all feedback messages', async () => {
    // Insert test feedback messages
    await db.insert(feedbackMessagesTable)
      .values([
        testFeedbackMessage1,
        testFeedbackMessage2,
        testFeedbackMessage3
      ])
      .execute();

    const result = await getFeedbackMessages();

    // Should return all 3 messages
    expect(result).toHaveLength(3);

    // Verify message content
    const names = result.map(msg => msg.name);
    expect(names).toContain('John Doe');
    expect(names).toContain('Jane Smith');
    expect(names).toContain('Bob Johnson');

    // Verify all required fields are present
    result.forEach(message => {
      expect(message.id).toBeDefined();
      expect(message.name).toBeDefined();
      expect(message.message).toBeDefined();
      expect(message.created_at).toBeInstanceOf(Date);
      
      // Email can be null
      expect(message.email === null || typeof message.email === 'string').toBe(true);
    });
  });

  it('should return feedback messages ordered by creation date (newest first)', async () => {
    // Insert messages with small delays to ensure different timestamps
    await db.insert(feedbackMessagesTable)
      .values(testFeedbackMessage1)
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(feedbackMessagesTable)
      .values(testFeedbackMessage2)
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(feedbackMessagesTable)
      .values(testFeedbackMessage3)
      .execute();

    const result = await getFeedbackMessages();

    expect(result).toHaveLength(3);

    // Verify messages are ordered by creation date (newest first)
    expect(result[0].name).toEqual('Bob Johnson'); // Last inserted
    expect(result[1].name).toEqual('Jane Smith');  // Second inserted
    expect(result[2].name).toEqual('John Doe');    // First inserted

    // Verify timestamps are in descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
    }
  });

  it('should handle feedback messages with null email correctly', async () => {
    // Insert message with null email
    await db.insert(feedbackMessagesTable)
      .values(testFeedbackMessage2)
      .execute();

    const result = await getFeedbackMessages();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Jane Smith');
    expect(result[0].email).toBeNull();
    expect(result[0].message).toEqual('Impressive projects. Keep it up!');
  });

  it('should handle feedback messages with valid email correctly', async () => {
    // Insert message with valid email
    await db.insert(feedbackMessagesTable)
      .values(testFeedbackMessage1)
      .execute();

    const result = await getFeedbackMessages();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('John Doe');
    expect(result[0].email).toEqual('john@example.com');
    expect(result[0].message).toEqual('Great portfolio! Love your work.');
  });

  it('should verify correct data structure returned', async () => {
    // Insert test message
    await db.insert(feedbackMessagesTable)
      .values(testFeedbackMessage1)
      .execute();

    const result = await getFeedbackMessages();

    expect(result).toHaveLength(1);
    const message = result[0];

    // Verify all expected properties exist
    expect(typeof message.id).toBe('number');
    expect(typeof message.name).toBe('string');
    expect(typeof message.message).toBe('string');
    expect(message.created_at).toBeInstanceOf(Date);
    
    // Email can be string or null
    expect(message.email === null || typeof message.email === 'string').toBe(true);

    // Verify specific values
    expect(message.name).toEqual('John Doe');
    expect(message.email).toEqual('john@example.com');
    expect(message.message).toEqual('Great portfolio! Love your work.');
    expect(message.id).toBeGreaterThan(0);
  });
});