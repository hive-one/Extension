/* eslint-env jest */

describe('Test Authenticated Extension', () => {
    // Login
    beforeAll(async () => {
        await page.goto('https://twitter.com/login');
        await page.type('[name="session[username_or_email]"]', 'USERNAMEHERE');
        await page.type('input[class="js-password-field"]', 'PASSWORD HERE');
        const form = await page.$("form[class='t1-form clearfix signin js-signin']");
        await form.evaluate(form => form.submit());
        await page.waitForNavigation();
    });

    it('Visit aantonop and check if extension exists in profile header', async () => {
        await page.goto('https://twitter.com/aantonop');
        let hiveElem = await page.waitForSelector(
            'div[class="HiveExtension_Tooltip HiveExtension_Twitter_ProfileNav-container"]',
        );
        expect(await hiveElem.evaluate(node => node.className)).toBe(
            'HiveExtension_Tooltip HiveExtension_Twitter_ProfileNav-container',
        );
    });

    // Check the popup appears when clicking on header circle

    // Check extension works on tweets

    // Check popup appears when clicking on score/rank in tweet

    // Check extension works on inline profile previews

    // Check popup appears when clicking on score/rank inline profile previews

    // Check popup injects on hover profile previews

    // Check specifc rotues
});
