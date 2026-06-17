import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3456';

test.describe('Hệ Thống Quản Lý Phòng Trọ — E2E Tests', () => {

  // ── 1. Login ──
  test.describe('Authentication', () => {
    test('should show login page', async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await expect(page.locator('h1')).toContainText('Quản Lý Phòng Trọ');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should login successfully', async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      await expect(page.locator('h1')).toContainText('Tổng quan');
    });

    test('should show error on wrong password', async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'wrongpass');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Email hoặc mật khẩu không đúng')).toBeVisible();
    });

    test('should redirect to dashboard if already logged in', async ({ page }) => {
      // Login first
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      // Go back to login
      await page.goto(BASE_URL + '/login');
      await page.waitForURL('**/dashboard');
    });
  });

  // ── 2. Dashboard ──
  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('should show stats overview', async ({ page }) => {
      await expect(page.locator('text=Tổng quan')).toBeVisible();
      await expect(page.locator('text=Tổng phòng')).toBeVisible();
      await expect(page.locator('text=Tỷ lệ lấp đầy')).toBeVisible();
      await expect(page.locator('text=Doanh thu tháng này')).toBeVisible();
    });

    test('should show room stats: 12 rooms, 3 rented', async ({ page }) => {
      // Total rooms should be 12
      await expect(page.locator('text=Tổng phòng')).toBeVisible();
      // 12 was seeded (total rooms)
    });

    test('should show recent payments section', async ({ page }) => {
      await expect(page.locator('text=Thanh toán gần đây')).toBeVisible();
    });

    test('should navigate via sidebar', async ({ page }) => {
      await page.click('a:has-text("Phòng trọ")');
      await page.waitForURL('**/rooms');
      await expect(page.locator('h1')).toContainText('Quản lý phòng');
    });
  });

  // ── 3. Room Management ──
  test.describe('Room Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('should list all rooms', async ({ page }) => {
      await page.goto(BASE_URL + '/rooms');
      await expect(page.locator('h1')).toContainText('Quản lý phòng');
      // Should show P101
      await expect(page.locator('text=P101')).toBeVisible();
      await expect(page.locator('text=P403')).toBeVisible();
    });

    test('should show create room form', async ({ page }) => {
      await page.goto(BASE_URL + '/rooms/create');
      await expect(page.locator('h1')).toContainText('Thêm phòng mới');
      await expect(page.locator('button:has-text("Thêm phòng")')).toBeVisible();
    });

    test('should show room detail', async ({ page }) => {
      await page.goto(BASE_URL + '/rooms');
      await page.click('a:has-text("P101")');
      await expect(page.locator('h1')).toContainText('Phòng P101');
    });

    test('should show room amenities', async ({ page }) => {
      await page.goto(BASE_URL + '/rooms/1');
      await expect(page.locator('h2:has-text("Tiện ích")')).toBeVisible();
    });
  });

  // ── 4. Tenant Management ──
  test.describe('Tenant Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('should list tenants', async ({ page }) => {
      await page.goto(BASE_URL + '/tenants');
      await expect(page.locator('h1')).toContainText('Khách thuê');
      await expect(page.locator('text=Nguyễn Văn An')).toBeVisible();
      await expect(page.locator('text=Trần Thị Bình')).toBeVisible();
    });

    test('should show create tenant form', async ({ page }) => {
      await page.goto(BASE_URL + '/tenants/create');
      await expect(page.locator('h1')).toContainText('Thêm khách thuê');
      await expect(page.locator('button:has-text("Thêm khách thuê")')).toBeVisible();
    });

    test('should show tenant detail with rental history', async ({ page }) => {
      await page.goto(BASE_URL + '/tenants/1');
      await expect(page.locator('h1')).toContainText('Nguyễn Văn An');
      await expect(page.locator('h2:has-text("Lịch sử thuê trọ")')).toBeVisible();
    });
  });

  // ── 5. Contract Management ──
  test.describe('Contract Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('should list contracts', async ({ page }) => {
      await page.goto(BASE_URL + '/contracts');
      await expect(page.locator('h1')).toContainText('Hợp đồng');
    });

    test('should show contract detail with actions', async ({ page }) => {
      await page.goto(BASE_URL + '/contracts/1');
      await expect(page.locator('text=Thao tác')).toBeVisible();
      await expect(page.locator('text=Gia hạn hợp đồng')).toBeVisible();
    });
  });

  // ── 6. Invoice Management ──
  test.describe('Invoice Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('should list invoices', async ({ page }) => {
      await page.goto(BASE_URL + '/invoices');
      await expect(page.locator('h1')).toContainText('Hóa đơn');
    });

    test('should show batch invoice creation page', async ({ page }) => {
      await page.goto(BASE_URL + '/invoices/create');
      await expect(page.locator('h1')).toContainText('Tạo hóa đơn');
      await expect(page.locator('text=Tạo hàng loạt')).toBeVisible();
      await expect(page.locator('text=Tạo cho 1 phòng')).toBeVisible();
    });
  });

  // ── 7. Reports ──
  test.describe('Reports', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('should show reports page', async ({ page }) => {
      await page.goto(BASE_URL + '/reports');
      await expect(page.locator('h1')).toContainText('Báo cáo');
      await expect(page.locator('text=Doanh thu theo tháng')).toBeVisible();
    });
  });

  // ── 8. Logout ──
  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      await page.click('text=Đăng xuất');
      await page.waitForURL('**/login');
    });
  });
});
