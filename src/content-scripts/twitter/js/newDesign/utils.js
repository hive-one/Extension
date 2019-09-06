export const sleep = millis => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, millis);
    });
};

const anchorsLoaded = () => document.getElementsByTagName('a').length > 10;

export const waitUntilDomLoaded = async () => {
    while (!anchorsLoaded()) {
        // console.log('sleeping...');
        await sleep(100);
    }
    console.log('DOM Loaded...');

    return;
};

export const getScreenNameFromUrl = () => {
    const pattern = /^\/([A-Za-z0-9_]+)/;
    const { pathname } = window.location;
    try {
        return pattern.exec(pathname)[1];
    } catch (err) {
        return;
    }
};
