import { expect, test } from '@nocobase/test/e2e';

test.describe('save as template', () => {
  test('save as template, then delete it', async ({ page, mockPage, clearBlockTemplates }) => {
    // 1. 创建一个区块，然后保存为模板
    await mockPage().goto();
    await page.getByLabel('schema-initializer-Grid-page:').hover();
    await page.getByRole('menuitem', { name: 'table Table right' }).hover();
    await page.getByRole('menuitem', { name: 'Users' }).click();
    await page.getByLabel('block-item-CardItem-users-').hover();
    await page.getByLabel('designer-schema-settings-CardItem-blockSettings:table-users').hover();
    await page.getByRole('menuitem', { name: 'Save as template' }).click();
    await page.getByRole('button', { name: 'OK', exact: true }).click();

    // 2. 删除模板
    await clearBlockTemplates();

    // 3. 再次回到页面，应该显示“模板已删除字样”
    await page.reload();
    await expect(page.getByText('The block template "')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });
});
