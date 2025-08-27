import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type CreateContactMessageInput } from '../schema';
import { createContactMessage } from '../handlers/create_contact_message';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateContactMessageInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  subject: 'Test Subject',
  message: 'This is a test contact message'
};

// Test input with nullable email
const testInputWithNullEmail: CreateContactMessageInput = {
  name: 'Jane Smith',
  email: null,
  subject: 'Another Test Subject',
  message: 'This is another test contact message without email'
};

describe('createContactMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contact message with all fields', async () => {
    const result = await createContactMessage(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.subject).toEqual('Test Subject');
    expect(result.message).toEqual('This is a test contact message');
    expect(result.is_read).toEqual(false); // Should default to false
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a contact message with null email', async () => {
    const result = await createContactMessage(testInputWithNullEmail);

    // Basic field validation
    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toBeNull();
    expect(result.subject).toEqual('Another Test Subject');
    expect(result.message).toEqual('This is another test contact message without email');
    expect(result.is_read).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save contact message to database', async () => {
    const result = await createContactMessage(testInput);

    // Query using proper drizzle syntax
    const contactMessages = await db.select()
      .from(contactMessagesTable)
      .where(eq(contactMessagesTable.id, result.id))
      .execute();

    expect(contactMessages).toHaveLength(1);
    expect(contactMessages[0].name).toEqual('John Doe');
    expect(contactMessages[0].email).toEqual('john.doe@example.com');
    expect(contactMessages[0].subject).toEqual('Test Subject');
    expect(contactMessages[0].message).toEqual('This is a test contact message');
    expect(contactMessages[0].is_read).toEqual(false);
    expect(contactMessages[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple contact messages with unique IDs', async () => {
    const result1 = await createContactMessage(testInput);
    const result2 = await createContactMessage(testInputWithNullEmail);

    // Should have different IDs
    expect(result1.id).not.toEqual(result2.id);

    // Both should be saved to database
    const contactMessages = await db.select()
      .from(contactMessagesTable)
      .execute();

    expect(contactMessages).toHaveLength(2);
    
    // Find each message by ID
    const message1 = contactMessages.find(m => m.id === result1.id);
    const message2 = contactMessages.find(m => m.id === result2.id);

    expect(message1).toBeDefined();
    expect(message1?.name).toEqual('John Doe');
    expect(message1?.is_read).toEqual(false);

    expect(message2).toBeDefined();
    expect(message2?.name).toEqual('Jane Smith');
    expect(message2?.email).toBeNull();
    expect(message2?.is_read).toEqual(false);
  });

  it('should handle long message content correctly', async () => {
    const longMessageInput: CreateContactMessageInput = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Long Message Test',
      message: 'This is a very long message that should be handled correctly by the database. '.repeat(50)
    };

    const result = await createContactMessage(longMessageInput);

    expect(result.message).toEqual(longMessageInput.message);
    expect(result.message.length).toBeGreaterThan(1000);

    // Verify it's saved correctly in database
    const savedMessage = await db.select()
      .from(contactMessagesTable)
      .where(eq(contactMessagesTable.id, result.id))
      .execute();

    expect(savedMessage[0].message).toEqual(longMessageInput.message);
  });

  it('should set created_at timestamp automatically', async () => {
    const beforeCreation = new Date();
    const result = await createContactMessage(testInput);
    const afterCreation = new Date();

    // created_at should be between before and after timestamps
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });
});