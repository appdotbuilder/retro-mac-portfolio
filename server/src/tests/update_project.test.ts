import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type CreateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test project
  const createTestProject = async (): Promise<number> => {
    const testProjectData = {
      title: 'Original Project',
      description: 'Original description',
      tags: ['JavaScript', 'React'],
      demo_link: 'https://original-demo.com',
      image_url: 'https://original-image.com/image.jpg',
      display_order: 5,
      is_active: true
    };

    const result = await db.insert(projectsTable)
      .values(testProjectData)
      .returning()
      .execute();

    return result[0].id;
  };

  it('should update all project fields', async () => {
    const projectId = await createTestProject();

    const updateInput: UpdateProjectInput = {
      id: projectId,
      title: 'Updated Project Title',
      description: 'Updated project description',
      tags: ['TypeScript', 'Next.js', 'PostgreSQL'],
      demo_link: 'https://updated-demo.com',
      image_url: 'https://updated-image.com/new-image.jpg',
      display_order: 10,
      is_active: false
    };

    const result = await updateProject(updateInput);

    // Verify returned data
    expect(result.id).toEqual(projectId);
    expect(result.title).toEqual('Updated Project Title');
    expect(result.description).toEqual('Updated project description');
    expect(result.tags).toEqual(['TypeScript', 'Next.js', 'PostgreSQL']);
    expect(result.demo_link).toEqual('https://updated-demo.com');
    expect(result.image_url).toEqual('https://updated-image.com/new-image.jpg');
    expect(result.display_order).toEqual(10);
    expect(result.is_active).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const projectId = await createTestProject();

    // Update only title and description
    const updateInput: UpdateProjectInput = {
      id: projectId,
      title: 'Partially Updated Title',
      description: 'Partially updated description'
    };

    const result = await updateProject(updateInput);

    // Verify updated fields
    expect(result.title).toEqual('Partially Updated Title');
    expect(result.description).toEqual('Partially updated description');

    // Verify unchanged fields remain the same
    expect(result.tags).toEqual(['JavaScript', 'React']);
    expect(result.demo_link).toEqual('https://original-demo.com');
    expect(result.image_url).toEqual('https://original-image.com/image.jpg');
    expect(result.display_order).toEqual(5);
    expect(result.is_active).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const projectId = await createTestProject();

    // Update nullable fields to null
    const updateInput: UpdateProjectInput = {
      id: projectId,
      demo_link: null,
      image_url: null
    };

    const result = await updateProject(updateInput);

    expect(result.demo_link).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.title).toEqual('Original Project'); // Unchanged
    expect(result.description).toEqual('Original description'); // Unchanged
  });

  it('should update tags array correctly', async () => {
    const projectId = await createTestProject();

    // Update tags with empty array
    const updateInput: UpdateProjectInput = {
      id: projectId,
      tags: []
    };

    const result = await updateProject(updateInput);

    expect(result.tags).toEqual([]);
    expect(Array.isArray(result.tags)).toBe(true);

    // Update tags with new values
    const updateInput2: UpdateProjectInput = {
      id: projectId,
      tags: ['Vue.js', 'Node.js', 'MongoDB']
    };

    const result2 = await updateProject(updateInput2);

    expect(result2.tags).toEqual(['Vue.js', 'Node.js', 'MongoDB']);
    expect(Array.isArray(result2.tags)).toBe(true);
  });

  it('should update is_active boolean correctly', async () => {
    const projectId = await createTestProject();

    // Update to inactive
    const updateInput: UpdateProjectInput = {
      id: projectId,
      is_active: false
    };

    const result = await updateProject(updateInput);

    expect(result.is_active).toEqual(false);

    // Update back to active
    const updateInput2: UpdateProjectInput = {
      id: projectId,
      is_active: true
    };

    const result2 = await updateProject(updateInput2);

    expect(result2.is_active).toEqual(true);
  });

  it('should persist changes to database', async () => {
    const projectId = await createTestProject();

    const updateInput: UpdateProjectInput = {
      id: projectId,
      title: 'Database Test Title',
      display_order: 99
    };

    await updateProject(updateInput);

    // Query database directly to verify persistence
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toEqual('Database Test Title');
    expect(projects[0].display_order).toEqual(99);
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update the updated_at timestamp', async () => {
    const projectId = await createTestProject();

    // Get original timestamp
    const originalProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    const originalUpdatedAt = originalProject[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateProjectInput = {
      id: projectId,
      title: 'Timestamp Test'
    };

    const result = await updateProject(updateInput);

    // Verify updated_at was changed
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error for non-existent project', async () => {
    const updateInput: UpdateProjectInput = {
      id: 99999, // Non-existent ID
      title: 'This should fail'
    };

    await expect(updateProject(updateInput)).rejects.toThrow(/Project with id 99999 not found/i);
  });

  it('should handle edge cases with display_order', async () => {
    const projectId = await createTestProject();

    // Test with 0 display_order
    const updateInput: UpdateProjectInput = {
      id: projectId,
      display_order: 0
    };

    const result = await updateProject(updateInput);

    expect(result.display_order).toEqual(0);
    expect(typeof result.display_order).toEqual('number');
  });
});