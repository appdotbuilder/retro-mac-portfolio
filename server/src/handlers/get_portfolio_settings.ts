import { db } from '../db';
import { portfolioSettingsTable } from '../db/schema';
import { type PortfolioSettings } from '../schema';

export const getPortfolioSettings = async (): Promise<PortfolioSettings> => {
  try {
    // Fetch the first (and typically only) settings record
    const results = await db.select()
      .from(portfolioSettingsTable)
      .limit(1)
      .execute();

    // If settings exist, return them
    if (results.length > 0) {
      return results[0];
    }

    // If no settings exist, create and return default settings
    const defaultSettings = await db.insert(portfolioSettingsTable)
      .values({
        sound_enabled: true,
        theme: 'classic',
        animation_speed: 'normal',
        show_visitor_count: true
      })
      .returning()
      .execute();

    return defaultSettings[0];
  } catch (error) {
    console.error('Failed to get portfolio settings:', error);
    throw error;
  }
};