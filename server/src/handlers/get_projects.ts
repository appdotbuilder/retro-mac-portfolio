import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type Project } from '../schema';
import { eq, asc, desc } from 'drizzle-orm';

export const getProjects = async (): Promise<Project[]> => {
  try {
    // Fetch all active projects ordered by display_order ascending, then by created_at descending
    const results = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.is_active, true))
      .orderBy(asc(projectsTable.display_order), desc(projectsTable.created_at))
      .execute();

    // Convert the results to match the Project schema
    return results.map(project => ({
      ...project,
      tags: Array.isArray(project.tags) ? project.tags : []
    }));
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
};