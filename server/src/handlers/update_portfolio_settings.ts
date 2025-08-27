import { db } from '../db';
import { portfolioSettingsTable } from '../db/schema';
import { type UpdatePortfolioSettingsInput, type PortfolioSettings } from '../schema';

export const updatePortfolioSettings = async (input: UpdatePortfolioSettingsInput): Promise<PortfolioSettings> => {
  try {
    // First, check if settings record exists
    const existingSettings = await db.select()
      .from(portfolioSettingsTable)
      .limit(1)
      .execute();

    if (existingSettings.length === 0) {
      // Create new settings record with provided values
      const result = await db.insert(portfolioSettingsTable)
        .values({
          sound_enabled: input.sound_enabled,
          theme: input.theme,
          animation_speed: input.animation_speed,
          show_visitor_count: input.show_visitor_count,
          updated_at: new Date()
        })
        .returning()
        .execute();

      return result[0];
    } else {
      // Update existing settings record
      const updateData: any = {
        updated_at: new Date()
      };

      // Only update provided fields
      if (input.sound_enabled !== undefined) {
        updateData.sound_enabled = input.sound_enabled;
      }
      if (input.theme !== undefined) {
        updateData.theme = input.theme;
      }
      if (input.animation_speed !== undefined) {
        updateData.animation_speed = input.animation_speed;
      }
      if (input.show_visitor_count !== undefined) {
        updateData.show_visitor_count = input.show_visitor_count;
      }

      const result = await db.update(portfolioSettingsTable)
        .set(updateData)
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Portfolio settings update failed:', error);
    throw error;
  }
};