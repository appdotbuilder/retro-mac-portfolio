import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProject = async (input: UpdateProjectInput): Promise<Project> => {
  try {
    // First verify the project exists
    const existingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    if (existingProject.length === 0) {
      throw new Error(`Project with id ${input.id} not found`);
    }

    // Build the update object with only provided fields
    const updateData: any = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.tags !== undefined) {
      updateData.tags = input.tags;
    }
    if (input.demo_link !== undefined) {
      updateData.demo_link = input.demo_link;
    }
    if (input.image_url !== undefined) {
      updateData.image_url = input.image_url;
    }
    if (input.display_order !== undefined) {
      updateData.display_order = input.display_order;
    }
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }

    // Update the project
    const result = await db.update(projectsTable)
      .set(updateData)
      .where(eq(projectsTable.id, input.id))
      .returning()
      .execute();

    const updatedProject = result[0];

    // Return with proper type conversion for tags (JSONB)
    return {
      ...updatedProject,
      tags: Array.isArray(updatedProject.tags) ? updatedProject.tags : []
    };
  } catch (error) {
    console.error('Project update failed:', error);
    throw error;
  }
};