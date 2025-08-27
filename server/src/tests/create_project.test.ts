import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq } from 'drizzle-orm';

// Basic test input with all fields
const testInput: CreateProjectInput = {
  title: 'Test Project',
  description: 'A project for testing the create handler',
  tags: ['React', 'TypeScript', 'Tailwind'],
  demo_link: 'https://example.com/demo',
  image_url: 'https://example.com/image.jpg',
  display_order: 5,
  is_active: true
};

// Minimal test input (relying on Zod defaults)
const minimalInput: CreateProjectInput = {
  title: 'Minimal Project',
  description: 'A minimal project with defaults',
  tags: [], // Default from Zod
  demo_link: null,
  image_url: null,
  display_order: 0, // Default from Zod
  is_active: true // Default from Zod
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project with all fields', async () => {
    const result = await createProject(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Project');
    expect(result.description).toEqual(testInput.description);
    expect(result.tags).toEqual(['React', 'TypeScript', 'Tailwind']);
    expect(result.demo_link).toEqual('https://example.com/demo');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.display_order).toEqual(5);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a project with minimal input and apply defaults', async () => {
    const result = await createProject(minimalInput);

    // Basic field validation
    expect(result.title).toEqual('Minimal Project');
    expect(result.description).toEqual(minimalInput.description);
    expect(result.tags).toEqual([]);
    expect(result.demo_link).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.display_order).toEqual(0);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save project to database correctly', async () => {
    const result = await createProject(testInput);

    // Query using proper drizzle syntax
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    const savedProject = projects[0];
    
    expect(savedProject.title).toEqual('Test Project');
    expect(savedProject.description).toEqual(testInput.description);
    expect(savedProject.tags).toEqual(['React', 'TypeScript', 'Tailwind']);
    expect(savedProject.demo_link).toEqual('https://example.com/demo');
    expect(savedProject.image_url).toEqual('https://example.com/image.jpg');
    expect(savedProject.display_order).toEqual(5);
    expect(savedProject.is_active).toEqual(true);
    expect(savedProject.created_at).toBeInstanceOf(Date);
    expect(savedProject.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null values correctly', async () => {
    const inputWithNulls: CreateProjectInput = {
      title: 'Project with Nulls',
      description: 'Testing null handling',
      tags: ['JavaScript'],
      demo_link: null,
      image_url: null,
      display_order: 1,
      is_active: false
    };

    const result = await createProject(inputWithNulls);

    expect(result.title).toEqual('Project with Nulls');
    expect(result.description).toEqual('Testing null handling');
    expect(result.tags).toEqual(['JavaScript']);
    expect(result.demo_link).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.display_order).toEqual(1);
    expect(result.is_active).toEqual(false);
  });

  it('should handle empty tags array correctly', async () => {
    const inputWithEmptyTags: CreateProjectInput = {
      title: 'No Tags Project',
      description: 'A project without any tags',
      tags: [],
      demo_link: 'https://example.com',
      image_url: 'https://example.com/image.png',
      display_order: 0,
      is_active: true
    };

    const result = await createProject(inputWithEmptyTags);

    expect(result.tags).toEqual([]);
    expect(Array.isArray(result.tags)).toBe(true);
    
    // Verify it's saved correctly in database
    const savedProjects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(savedProjects[0].tags).toEqual([]);
  });

  it('should create multiple projects with different display orders', async () => {
    const project1Input: CreateProjectInput = {
      title: 'First Project',
      description: 'The first project',
      tags: ['Vue'],
      demo_link: null,
      image_url: null,
      display_order: 1,
      is_active: true
    };

    const project2Input: CreateProjectInput = {
      title: 'Second Project',
      description: 'The second project',
      tags: ['Angular'],
      demo_link: null,
      image_url: null,
      display_order: 2,
      is_active: true
    };

    const result1 = await createProject(project1Input);
    const result2 = await createProject(project2Input);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.title).toEqual('First Project');
    expect(result2.title).toEqual('Second Project');
    expect(result1.display_order).toEqual(1);
    expect(result2.display_order).toEqual(2);
    expect(result1.tags).toEqual(['Vue']);
    expect(result2.tags).toEqual(['Angular']);

    // Verify both are in database
    const allProjects = await db.select()
      .from(projectsTable)
      .execute();

    expect(allProjects).toHaveLength(2);
  });

  it('should handle complex tag arrays correctly', async () => {
    const complexTagsInput: CreateProjectInput = {
      title: 'Complex Tags Project',
      description: 'Testing complex tag combinations',
      tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vercel'],
      demo_link: 'https://complex-project.com',
      image_url: 'https://complex-project.com/screenshot.png',
      display_order: 10,
      is_active: true
    };

    const result = await createProject(complexTagsInput);

    expect(result.tags).toEqual([
      'React', 
      'Next.js', 
      'TypeScript', 
      'Tailwind CSS', 
      'Framer Motion', 
      'Vercel'
    ]);
    expect(result.tags).toHaveLength(6);
    
    // Verify JSON storage in database
    const savedProjects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(savedProjects[0].tags).toEqual(result.tags);
  });
});