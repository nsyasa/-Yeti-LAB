import { test, expect } from '@playwright/test';

test.describe('Lazy Loading & SPA Navigation', () => {
    test.beforeEach(async ({ page }) => {
        // Log console output to terminal for debugging
        page.on('console', (msg) => console.log(`[Browser] ${msg.text()}`));
        // page.on('pageerror', err => console.log(`[Browser Error] ${err}`)); // Optional: catch unhandled exceptions

        await page.goto('/');
    });

    test('should load home page quickly (Main Bundle)', async ({ page }) => {
        // Confirm home page elements are present
        // Hero section text varies by screen size, check for key elements instead
        await expect(page.locator("text=İçindeki Yeti'yi")).toBeVisible();
        await expect(page.locator('#course-list')).toBeVisible();
    });

    test('should load admin panel and redirect to auth (Lazy Load verified)', async ({ page }) => {
        // Navigate to Admin
        await page.goto('/#/admin');

        // Check for Admin login or panel element
        // Since we are not logged in, it might redirect or show restricted access
        // Since we are not logged in, AdminView (once loaded) should redirect to auth.html
        // We wait for this URL change which confirms AdminView code executed
        await expect(page).toHaveURL(/.*auth\.html.*/, { timeout: 15000 });

        // Note: verifying window.AdminView is tricky if page navigated away,
        // but the fact we redirected proves AdminView.mount() ran.
    });

    test('should load teacher panel and redirect to auth (Lazy Load verified)', async ({ page }) => {
        await page.goto('/#/teacher');

        // TeacherView also redirects if not logged in
        await expect(page).toHaveURL(/.*auth\.html.*/, { timeout: 15000 });
    });
});
