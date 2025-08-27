import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type CreateContactMessageInput } from '../schema';
import { getContactMessages } from '../handlers/get_contact_messages';

// Test data for creating contact messages
const testMessage1: CreateContactMessageInput = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Project Inquiry',
  message: 'I would like to discuss a potential collaboration.'
};

const testMessage2: CreateContactMessageInput = {
  name: 'Jane Smith',
  email: null,
  subject: 'Feedback',
  message: 'Great portfolio! Love the retro design.'
};

const testMessage3: CreateContactMessageInput = {
  name: 'Bob Wilson',
  email: 'bob@company.com',
  subject: 'Job Opportunity',
  message: 'We have an exciting opportunity for you.'
};

describe('getContactMessages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no messages exist', async () => {
    const result = await getContactMessages();

    expect(result).toEqual([]);
  });

  it('should fetch all contact messages', async () => {
    // Create test messages
    await db.insert(contactMessagesTable)
      .values([
        {
          name: testMessage1.name,
          email: testMessage1.email,
          subject: testMessage1.subject,
          message: testMessage1.message
        },
        {
          name: testMessage2.name,
          email: testMessage2.email,
          subject: testMessage2.subject,
          message: testMessage2.message
        }
      ])
      .execute();

    const result = await getContactMessages();

    expect(result).toHaveLength(2);
    
    // Verify all required fields are present
    result.forEach(message => {
      expect(message.id).toBeDefined();
      expect(typeof message.name).toBe('string');
      expect(typeof message.subject).toBe('string');
      expect(typeof message.message).toBe('string');
      expect(typeof message.is_read).toBe('boolean');
      expect(message.created_at).toBeInstanceOf(Date);
    });

    // Verify specific message content
    const johnMessage = result.find(m => m.name === 'John Doe');
    expect(johnMessage).toBeDefined();
    expect(johnMessage!.email).toBe('john@example.com');
    expect(johnMessage!.subject).toBe('Project Inquiry');
    expect(johnMessage!.message).toBe('I would like to discuss a potential collaboration.');
    expect(johnMessage!.is_read).toBe(false); // Default value

    const janeMessage = result.find(m => m.name === 'Jane Smith');
    expect(janeMessage).toBeDefined();
    expect(janeMessage!.email).toBeNull();
    expect(janeMessage!.subject).toBe('Feedback');
  });

  it('should order messages by creation date (newest first)', async () => {
    // Create messages with slight delay to ensure different timestamps
    await db.insert(contactMessagesTable)
      .values({
        name: testMessage1.name,
        email: testMessage1.email,
        subject: testMessage1.subject,
        message: testMessage1.message
      })
      .execute();

    // Add a small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(contactMessagesTable)
      .values({
        name: testMessage2.name,
        email: testMessage2.email,
        subject: testMessage2.subject,
        message: testMessage2.message
      })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(contactMessagesTable)
      .values({
        name: testMessage3.name,
        email: testMessage3.email,
        subject: testMessage3.subject,
        message: testMessage3.message
      })
      .execute();

    const result = await getContactMessages();

    expect(result).toHaveLength(3);
    
    // Verify ordering - newest first
    expect(result[0].name).toBe('Bob Wilson'); // Last created
    expect(result[1].name).toBe('Jane Smith'); // Middle
    expect(result[2].name).toBe('John Doe'); // First created

    // Verify timestamps are in descending order
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].created_at.getTime()).toBeGreaterThanOrEqual(
        result[i].created_at.getTime()
      );
    }
  });

  it('should handle messages with and without email addresses', async () => {
    await db.insert(contactMessagesTable)
      .values([
        {
          name: 'With Email',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'Test message'
        },
        {
          name: 'Without Email',
          email: null,
          subject: 'Another Subject',
          message: 'Another message'
        }
      ])
      .execute();

    const result = await getContactMessages();

    expect(result).toHaveLength(2);
    
    const withEmail = result.find(m => m.name === 'With Email');
    const withoutEmail = result.find(m => m.name === 'Without Email');

    expect(withEmail).toBeDefined();
    expect(withEmail!.email).toBe('test@example.com');

    expect(withoutEmail).toBeDefined();
    expect(withoutEmail!.email).toBeNull();
  });

  it('should handle messages with different read statuses', async () => {
    await db.insert(contactMessagesTable)
      .values([
        {
          name: 'Unread Message',
          email: 'unread@example.com',
          subject: 'Unread',
          message: 'This is unread',
          is_read: false
        },
        {
          name: 'Read Message',
          email: 'read@example.com',
          subject: 'Read',
          message: 'This is read',
          is_read: true
        }
      ])
      .execute();

    const result = await getContactMessages();

    expect(result).toHaveLength(2);
    
    const unreadMessage = result.find(m => m.name === 'Unread Message');
    const readMessage = result.find(m => m.name === 'Read Message');

    expect(unreadMessage).toBeDefined();
    expect(unreadMessage!.is_read).toBe(false);

    expect(readMessage).toBeDefined();
    expect(readMessage!.is_read).toBe(true);
  });
});