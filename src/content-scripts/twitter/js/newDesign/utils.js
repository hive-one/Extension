export const sleep = millis => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, millis);
    });
};

const anchorsLoaded = () => document.getElementsByTagName('a').length > 10;

export const getProfileImage = screenName => {
    const PHOTO_URL = `${window.location.href}/photo`;

    const anchors = document.getElementsByTagName('a');
    for (let i = 0; i < anchors.length; i++) {
        const element = anchors[i];
        if (element.href === PHOTO_URL) return element;
    }
    throw new Error(`Failed finding profile image for ${screenName}`);
};

export const getTweets = () => {
    const articles = document.getElementsByTagName('article');
    if (articles.length) return articles;
    throw new Error('Failed finding tweets.');
};

export const waitUntilDomLoaded = async () => {
    while (!anchorsLoaded()) {
        // console.log('sleeping...');
        await sleep(200);
    }
    console.log('DOM Loaded...');

    return;
};

export const waitUntilResult = async func => {
    const NUM_TRIES = 20;
    const SLEEP_AMT = 100;
    for (let i = 1; i < NUM_TRIES; i++) {
        try {
            const result = func();
            if (result) return result;
        } catch (err) {
            // do nothing
        }
        await sleep(i * SLEEP_AMT);
    }

    throw new Error(`Reached max retries for ${func}`);
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
