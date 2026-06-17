# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login-sidebar.spec.ts >> Login + Sidebar >> sidebar links navigate correctly
- Location: tests/login-sidebar.spec.ts:44:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3456/login
Call log:
  - navigating to "http://localhost:3456/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE = 'http://localhost:3456';
  4  | 
  5  | test.describe('Login + Sidebar', () => {
  6  |   test('login page renders correctly', async ({ page }) => {
  7  |     await page.goto(BASE + '/login');
  8  |     await expect(page.locator('h1')).toContainText('Quản Lý Phòng Trọ');
  9  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  10 |     await expect(page.locator('input[type="password"]')).toBeVisible();
  11 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  12 |   });
  13 | 
  14 |   test('login fails with wrong password', async ({ page }) => {
  15 |     await page.goto(BASE + '/login');
  16 |     await page.fill('input[type="email"]', 'admin@example.com');
  17 |     await page.fill('input[type="password"]', 'wrongpassword');
  18 |     await page.click('button[type="submit"]');
  19 |     await expect(page.locator('text=Email hoặc mật khẩu không đúng')).toBeVisible();
  20 |   });
  21 | 
  22 |   test('login succeeds and shows sidebar', async ({ page }) => {
  23 |     await page.goto(BASE + '/login');
  24 |     await page.fill('input[type="email"]', 'admin@example.com');
  25 |     await page.fill('input[type="password"]', 'admin123');
  26 |     await page.click('button[type="submit"]');
  27 |     
  28 |     // Wait for redirect to dashboard
  29 |     await page.waitForURL('**/dashboard');
  30 |     
  31 |     // Sidebar should be visible with nav items
  32 |     await expect(page.locator('aside h1')).toBeVisible();
  33 |     await expect(page.locator('aside a:has-text("Phòng trọ")')).toBeVisible();
  34 |     await expect(page.locator('aside a:has-text("Khách thuê")')).toBeVisible();
  35 |     await expect(page.locator('aside a:has-text("Hợp đồng")')).toBeVisible();
  36 |     await expect(page.locator('aside a:has-text("Hóa đơn")')).toBeVisible();
  37 |     await expect(page.locator('aside a:has-text("Báo cáo")')).toBeVisible();
  38 |     await expect(page.locator('aside button:has-text("Đăng xuất")')).toBeVisible();
  39 |     
  40 |     // Admin should see "Người dùng"
  41 |     await expect(page.locator('aside a:has-text("Người dùng")')).toBeVisible();
  42 |   });
  43 | 
  44 |   test('sidebar links navigate correctly', async ({ page }) => {
> 45 |     await page.goto(BASE + '/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3456/login
  46 |     await page.fill('input[type="email"]', 'admin@example.com');
  47 |     await page.fill('input[type="password"]', 'admin123');
  48 |     await page.click('button[type="submit"]');
  49 |     await page.waitForURL('**/dashboard');
  50 | 
  51 |     // Click through each nav item
  52 |     await page.click('aside a:has-text("Phòng trọ")');
  53 |     await page.waitForURL('**/rooms');
  54 |     await expect(page.locator('h1').last()).toContainText('Quản lý phòng');
  55 | 
  56 |     await page.click('aside a:has-text("Khách thuê")');
  57 |     await page.waitForURL('**/tenants');
  58 |     await expect(page.locator('h1').last()).toContainText('Khách thuê');
  59 | 
  60 |     await page.click('aside a:has-text("Hợp đồng")');
  61 |     await page.waitForURL('**/contracts');
  62 |     await expect(page.locator('h1').last()).toContainText('Hợp đồng');
  63 | 
  64 |     await page.click('aside a:has-text("Báo cáo")');
  65 |     await page.waitForURL('**/reports');
  66 |     await expect(page.locator('h1').last()).toContainText('Báo cáo');
  67 |   });
  68 | 
  69 |   test('logout clears session', async ({ page }) => {
  70 |     await page.goto(BASE + '/login');
  71 |     await page.fill('input[type="email"]', 'admin@example.com');
  72 |     await page.fill('input[type="password"]', 'admin123');
  73 |     await page.click('button[type="submit"]');
  74 |     await page.waitForURL('**/dashboard');
  75 | 
  76 |     await page.click('aside button:has-text("Đăng xuất")');
  77 |     await page.waitForURL('**/login');
  78 |     
  79 |     // Try to access dashboard directly — should redirect to login
  80 |     await page.goto(BASE + '/dashboard');
  81 |     await page.waitForURL('**/login');
  82 |   });
  83 | 
  84 |   test('redirects to login when not authenticated', async ({ page }) => {
  85 |     await page.goto(BASE + '/rooms');
  86 |     await page.waitForURL('**/login');
  87 |   });
  88 | });
  89 | 
```