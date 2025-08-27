import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  try {
    // Insert project record
    const result = await db.insert(projectsTable)
      .values({
        title: input.title,
        description: input.description,
        tags: input.tags, // JSON field - no conversion needed
        demo_link: input.demo_link,
        image_url: input.image_url,
        display_order: input.display_order, // Integer column - no conversion needed
        is_active: input.is_active // Boolean column - no conversion needed
      })
      .returning()
      .execute();

    // Return the created project with proper type casting for JSONB field
    const project = result[0];
    return {
      ...project,
      tags: project.tags as string[] // Cast JSONB field to string array
    };
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};