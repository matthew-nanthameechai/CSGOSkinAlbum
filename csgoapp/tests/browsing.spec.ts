import { test, expect } from '@playwright/test';

test.describe('Public browsing (logged out)', () => {
  test('shows the sign-in prompt and skin gallery', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Browse skins by rarity')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Sign in to CS:GO Skin Album' })
  ).toBeVisible();
});
  
  test('does not show the Favorites tab when logged out', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Favorites' })).toHaveCount(0);
  });

  test('does not show heart buttons when logged out', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.favorite-button')).toHaveCount(0);
  });

  // Testing switching tabs
  test('can switch to the Weapons tab', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Weapons' }).click();
    await expect(page.getByRole('button', { name: 'Weapons' })).toHaveClass(/active/);
  });

  test('can switch to the Gloves tab', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Gloves' }).click();
    await expect(page.getByRole('button', { name: 'Gloves' })).toHaveClass(/active/);
  });

  test('can switch to the Knives tab', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Knives' }).click();
    await expect(page.getByRole('button', { name: 'Knives' })).toHaveClass(/active/);
  });

  test('can switch to all items tab', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'all items' }).click();
    await expect(page.getByRole('button', { name: 'All Items' })).toHaveClass(/active/);
  });
  

  test('can filter by rarity', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Filter by rarity').selectOption('Covert');
    // Every visible rarity heading should now say "Covert"
    const headings = page.locator('.rarity-heading h2');
    await expect(headings).toHaveText(['Covert']);
  });
});