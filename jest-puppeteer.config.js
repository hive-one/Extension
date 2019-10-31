const CRX_PATH = __dirname + '/dist/';

module.exports = {
    launch: {
        headless: false,
        args: [
            `--disable-extensions-except=${CRX_PATH}`,
            `--load-extension=${CRX_PATH}`,
            '--user-agent=PuppeteerAgent',
        ],
        defaultViewport: null,
    },
};
