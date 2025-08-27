import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioSettingsTable } from '../db/schema';
import { type UpdatePortfolioSettingsInput } from '../schema';
import { updatePortfolioSettings } from '../handlers/update_portfolio_settings';

describe('updatePortfolioSettings', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new settings when none exist', async () => {
    const input: UpdatePortfolioSettingsInput = {
      sound_enabled: false,
      theme: 'dark',
      animation_speed: 'fast',
      show_visitor_count: false
    };

    const result = await updatePortfolioSettings(input);

    expect(result.sound_enabled).toEqual(false);
    expect(result.theme).toEqual('dark');
    expect(result.animation_speed).toEqual('fast');
    expect(result.show_visitor_count).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update existing settings', async () => {
    // First create a settings record
    await db.insert(portfolioSettingsTable)
      .values({
        sound_enabled: true,
        theme: 'classic',
        animation_speed: 'normal',
        show_visitor_count: true
      })
      .execute();

    const input: UpdatePortfolioSettingsInput = {
      sound_enabled: false,
      theme: 'retro'
    };

    const result = await updatePortfolioSettings(input);

    expect(result.sound_enabled).toEqual(false);
    expect(result.theme).toEqual('retro');
    // Should keep existing values for unspecified fields
    expect(result.animation_speed).toEqual('normal');
    expect(result.show_visitor_count).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create initial settings
    await db.insert(portfolioSettingsTable)
      .values({
        sound_enabled: true,
        theme: 'classic',
        animation_speed: 'normal',
        show_visitor_count: true
      })
      .execute();

    const input: UpdatePortfolioSettingsInput = {
      animation_speed: 'slow'
    };

    const result = await updatePortfolioSettings(input);

    expect(result.animation_speed).toEqual('slow');
    // Other fields should remain unchanged
    expect(result.sound_enabled).toEqual(true);
    expect(result.theme).toEqual('classic');
    expect(result.show_visitor_count).toEqual(true);
  });

  it('should save updated settings to database', async () => {
    const input: UpdatePortfolioSettingsInput = {
      sound_enabled: false,
      theme: 'dark',
      animation_speed: 'fast',
      show_visitor_count: false
    };

    const result = await updatePortfolioSettings(input);

    // Verify data was saved to database
    const savedSettings = await db.select()
      .from(portfolioSettingsTable)
      .execute();

    expect(savedSettings).toHaveLength(1);
    expect(savedSettings[0].id).toEqual(result.id);
    expect(savedSettings[0].sound_enabled).toEqual(false);
    expect(savedSettings[0].theme).toEqual('dark');
    expect(savedSettings[0].animation_speed).toEqual('fast');
    expect(savedSettings[0].show_visitor_count).toEqual(false);
    expect(savedSettings[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle partial updates with boolean false values', async () => {
    // Create initial settings with all true/default values
    await db.insert(portfolioSettingsTable)
      .values({
        sound_enabled: true,
        theme: 'classic',
        animation_speed: 'normal',
        show_visitor_count: true
      })
      .execute();

    // Update with false values to ensure they're properly handled
    const input: UpdatePortfolioSettingsInput = {
      sound_enabled: false,
      show_visitor_count: false
    };

    const result = await updatePortfolioSettings(input);

    expect(result.sound_enabled).toEqual(false);
    expect(result.show_visitor_count).toEqual(false);
    // Unchanged fields should retain original values
    expect(result.theme).toEqual('classic');
    expect(result.animation_speed).toEqual('normal');
  });

  it('should update timestamp on every call', async () => {
    // Create initial settings
    const initialResult = await updatePortfolioSettings({
      sound_enabled: true
    });

    // Wait a small amount to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update again
    const updatedResult = await updatePortfolioSettings({
      theme: 'dark'
    });

    expect(updatedResult.updated_at.getTime()).toBeGreaterThan(initialResult.updated_at.getTime());
  });

  it('should handle empty input object', async () => {
    const input: UpdatePortfolioSettingsInput = {};

    const result = await updatePortfolioSettings(input);

    // Should create record with default values when no existing record
    expect(result.sound_enabled).toEqual(true); // Default value
    expect(result.theme).toEqual('classic'); // Default value
    expect(result.animation_speed).toEqual('normal'); // Default value
    expect(result.show_visitor_count).toEqual(true); // Default value
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});