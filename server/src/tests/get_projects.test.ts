import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { getProjects } from '../handlers/get_projects';

describe('getProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getProjects();
    expect(result).toEqual([]);
  });

  it('should return only active projects', async () => {
    // Create test projects - one active, one inactive
    await db.insert(projectsTable).values([
      {
        title: 'Active Project',
        description: 'This project is active',
        tags: ['react', 'typescript'],
        display_order: 1,
        is_active: true
      },
      {
        title: 'Inactive Project',
        description: 'This project is inactive',
        tags: ['vue', 'javascript'],
        display_order: 2,
        is_active: false
      }
    ]).execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Active Project');
    expect(result[0].is_active).toBe(true);
  });

  it('should order projects by display_order ascending, then by created_at descending', async () => {
    // Create projects with different display orders and timestamps
    const now = new Date();
    const earlier = new Date(now.getTime() - 60000); // 1 minute earlier
    const later = new Date(now.getTime() + 60000); // 1 minute later

    await db.insert(projectsTable).values([
      {
        title: 'Project B - Order 2',
        description: 'Second in display order',
        tags: ['react'],
        display_order: 2,
        is_active: true,
        created_at: later
      },
      {
        title: 'Project A1 - Order 1',
        description: 'First in display order, created later',
        tags: ['vue'],
        display_order: 1,
        is_active: true,
        created_at: later
      },
      {
        title: 'Project A2 - Order 1',
        description: 'First in display order, created earlier',
        tags: ['angular'],
        display_order: 1,
        is_active: true,
        created_at: earlier
      }
    ]).execute();

    const result = await getProjects();

    expect(result).toHaveLength(3);
    
    // First two should have display_order 1, ordered by created_at desc
    expect(result[0].display_order).toBe(1);
    expect(result[0].title).toEqual('Project A1 - Order 1');
    
    expect(result[1].display_order).toBe(1);
    expect(result[1].title).toEqual('Project A2 - Order 1');
    
    // Last should have display_order 2
    expect(result[2].display_order).toBe(2);
    expect(result[2].title).toEqual('Project B - Order 2');
  });

  it('should return projects with all fields properly formatted', async () => {
    const testProject = {
      title: 'Full Project Test',
      description: 'A complete project for testing',
      tags: ['react', 'typescript', 'tailwind'],
      demo_link: 'https://demo.example.com',
      image_url: 'https://image.example.com/project.jpg',
      display_order: 5,
      is_active: true
    };

    await db.insert(projectsTable).values(testProject).execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    const project = result[0];
    
    expect(project.id).toBeDefined();
    expect(project.title).toEqual('Full Project Test');
    expect(project.description).toEqual('A complete project for testing');
    expect(project.tags).toEqual(['react', 'typescript', 'tailwind']);
    expect(project.demo_link).toEqual('https://demo.example.com');
    expect(project.image_url).toEqual('https://image.example.com/project.jpg');
    expect(project.display_order).toBe(5);
    expect(project.is_active).toBe(true);
    expect(project.created_at).toBeInstanceOf(Date);
    expect(project.updated_at).toBeInstanceOf(Date);
  });

  it('should handle projects with nullable fields', async () => {
    await db.insert(projectsTable).values({
      title: 'Minimal Project',
      description: 'A project with minimal data',
      tags: [],
      demo_link: null,
      image_url: null,
      display_order: 0,
      is_active: true
    }).execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    const project = result[0];
    
    expect(project.title).toEqual('Minimal Project');
    expect(project.tags).toEqual([]);
    expect(project.demo_link).toBeNull();
    expect(project.image_url).toBeNull();
    expect(project.display_order).toBe(0);
  });

  it('should handle empty tags array correctly', async () => {
    await db.insert(projectsTable).values({
      title: 'No Tags Project',
      description: 'Project without any tags',
      tags: [],
      display_order: 1,
      is_active: true
    }).execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0].tags).toEqual([]);
    expect(Array.isArray(result[0].tags)).toBe(true);
  });
});