import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioSettingsTable } from '../db/schema';
import { getPortfolioSettings } from '../handlers/get_portfolio_settings';

describe('getPortfolioSettings', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return existing settings when they exist', async () => {
    // Create test settings
    const testSettings = await db.insert(portfolioSettingsTable)
      .values({
        sound_enabled: false,
        theme: 'dark',
        animation_speed: 'fast',
        show_visitor_count: false
      })
      .returning()
      .execute();

    const result = await getPortfolioSettings();

    // Verify it returns the existing settings
    expect(result.id).toEqual(testSettings[0].id);
    expect(result.sound_enabled).toBe(false);
    expect(result.theme).toEqual('dark');
    expect(result.animation_speed).toEqual('fast');
    expect(result.show_visitor_count).toBe(false);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create and return default settings when none exist', async () => {
    // Ensure no settings exist
    const existingSettings = await db.select()
      .from(portfolioSettingsTable)
      .execute();
    expect(existingSettings).toHaveLength(0);

    const result = await getPortfolioSettings();

    // Verify it returns default settings
    expect(result.id).toBeDefined();
    expect(result.sound_enabled).toBe(true);
    expect(result.theme).toEqual('classic');
    expect(result.animation_speed).toEqual('normal');
    expect(result.show_visitor_count).toBe(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save default settings to database when none exist', async () => {
    await getPortfolioSettings();

    // Verify settings were saved to database
    const savedSettings = await db.select()
      .from(portfolioSettingsTable)
      .execute();

    expect(savedSettings).toHaveLength(1);
    expect(savedSettings[0].sound_enabled).toBe(true);
    expect(savedSettings[0].theme).toEqual('classic');
    expect(savedSettings[0].animation_speed).toEqual('normal');
    expect(savedSettings[0].show_visitor_count).toBe(true);
    expect(savedSettings[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return first settings when multiple exist', async () => {
    // Create multiple settings records
    const firstSettings = await db.insert(portfolioSettingsTable)
      .values({
        sound_enabled: true,
        theme: 'classic',
        animation_speed: 'slow',
        show_visitor_count: true
      })
      .returning()
      .execute();

    await db.insert(portfolioSettingsTable)
      .values({
        sound_enabled: false,
        theme: 'dark',
        animation_speed: 'fast',
        show_visitor_count: false
      })
      .execute();

    const result = await getPortfolioSettings();

    // Should return the first record
    expect(result.id).toEqual(firstSettings[0].id);
    expect(result.sound_enabled).toBe(true);
    expect(result.theme).toEqual('classic');
    expect(result.animation_speed).toEqual('slow');
    expect(result.show_visitor_count).toBe(true);
  });

  it('should handle all theme options correctly', async () => {
    // Test with retro theme
    await db.insert(portfolioSettingsTable)
      .values({
        sound_enabled: true,
        theme: 'retro',
        animation_speed: 'normal',
        show_visitor_count: true
      })
      .execute();

    const result = await getPortfolioSettings();

    expect(result.theme).toEqual('retro');
    expect(typeof result.theme).toBe('string');
  });

  it('should handle all animation speed options correctly', async () => {
    // Test with fast animation speed
    await db.insert(portfolioSettingsTable)
      .values({
        sound_enabled: true,
        theme: 'classic',
        animation_speed: 'fast',
        show_visitor_count: true
      })
      .execute();

    const result = await getPortfolioSettings();

    expect(result.animation_speed).toEqual('fast');
    expect(typeof result.animation_speed).toBe('string');
  });
});