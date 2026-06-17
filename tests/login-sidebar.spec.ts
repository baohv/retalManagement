import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3456';

test.describe('Login + Sidebar', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto(BASE + '/login');
    await expect(page.locator('h1')).toContainText('Quản Lý Phòng Trọ');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login fails with wrong password', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email hoặc mật khẩu không đúng')).toBeVisible();
  });

  test('login succeeds and shows sidebar', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    
    // Sidebar should be visible with nav items
    await expect(page.locator('aside h1')).toBeVisible();
    await expect(page.locator('aside a:has-text("Phòng trọ")')).toBeVisible();
    await expect(page.locator('aside a:has-text("Khách thuê")')).toBeVisible();
    await expect(page.locator('aside a:has-text("Hợp đồng")')).toBeVisible();
    await expect(page.locator('aside a:has-text("Hóa đơn")')).toBeVisible();
    await expect(page.locator('aside a:has-text("Báo cáo")')).toBeVisible();
    await expect(page.locator('aside button:has-text("Đăng xuất")')).toBeVisible();
    
    // Admin should see "Người dùng"
    await expect(page.locator('aside a:has-text("Người dùng")')).toBeVisible();
  });

  test('sidebar links navigate correctly', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Click through each nav item
    await page.click('aside a:has-text("Phòng trọ")');
    await page.waitForURL('**/rooms');
    await expect(page.locator('h1').last()).toContainText('Quản lý phòng');

    await page.click('aside a:has-text("Khách thuê")');
    await page.waitForURL('**/tenants');
    await expect(page.locator('h1').last()).toContainText('Khách thuê');

    await page.click('aside a:has-text("Hợp đồng")');
    await page.waitForURL('**/contracts');
    await expect(page.locator('h1').last()).toContainText('Hợp đồng');

    await page.click('aside a:has-text("Báo cáo")');
    await page.waitForURL('**/reports');
    await expect(page.locator('h1').last()).toContainText('Báo cáo');
  });

  test('logout clears session', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.click('aside button:has-text("Đăng xuất")');
    await page.waitForURL('**/login');
    
    // Try to access dashboard directly — should redirect to login
    await page.goto(BASE + '/dashboard');
    await page.waitForURL('**/login');
  });

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto(BASE + '/rooms');
    await page.waitForURL('**/login');
  });
});
