import { expect, test } from '@playwright/test';

test('runs one local notification action per button', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Request permissions' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Schedule now' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Schedule in 15 seconds' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get pending' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel all' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove all delivered' })).toBeVisible();

  await page.getByRole('button', { name: 'Check permissions' }).click();
  await expect(page.locator('.latest')).toContainText('Check permissions');
});
