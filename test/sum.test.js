/* eslint-env jest */

test('This is just a test baby', async () => {
    await page.goto('https://google.com');
    expect(1 + 1).toBe(2);
});
