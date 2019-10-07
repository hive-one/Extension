export const sleep = millis => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, millis);
    });
};

export const initialiseIcons = () => {
    const ICONS_ID = 'HiveExtension-icons';
    if (document.getElementById(ICONS_ID)) {
        return;
    }

    document.body.insertAdjacentHTML(
        'afterbegin',
        `
        <svg id="${ICONS_ID}" style="display:none;">
        <symbol id="HiveExtension-icon-bee">
            <g><path d="M31.6,18.2l-2.4-1.1c1.2-3.3,0.4-6.9-1.7-9.4L30,5.3C30.3,5,30.3,4.4,30,4c-0.3-0.4-0.9-0.4-1.3,0 l-2.5,2.4c-0.6-0.5-1.3-0.9-2-1.2c-0.7-0.3-1.5-0.6-2.2-0.7L22.2,1c0-0.5-0.3-0.9-0.8-1c-0.5,0-0.9,0.3-1,0.8l-0.2,3.4 c-3.3,0-6.6,1.7-8.3,4.7L9.5,7.9c-3.3-1.6-7.3-0.1-8.9,3.2S0.5,18.5,3.9,20l2.6,1.2c-0.7,3.9,1.1,7.9,4.6,10l-1.4,3 c-0.2,0.5,0,1,0.4,1.2c0.5,0.2,1,0,1.2-0.4l1.4-3c3.8,1.4,8.1,0.1,10.6-2.9l2.6,1.2c3.3,1.6,7.3,0.1,8.9-3.2S34.9,19.7,31.6,18.2z M23.5,6.8c3.9,1.8,5.6,6.5,3.8,10.4l-0.4,0.9l-1.4-0.7c-0.5-0.2-1,0-1.2,0.4c-0.2,0.5,0,1,0.4,1.2l1.4,0.7l-0.9,1.9L11,15l0.9-1.9 l9.7,4.5c0.5,0.2,1,0,1.2-0.4c0.2-0.5,0-1-0.4-1.2l-9.7-4.5l0.4-0.9C14.9,6.6,19.6,4.9,23.5,6.8z M7,19.4l-2.3-1.1 c-2.4-1.1-3.5-4-2.4-6.5s4-3.5,6.5-2.4l2.3,1.1l-3.9,8.3L7,19.4z M12.6,30c-3.7-1.7-5.4-6.1-4-9.9l3.1,1.5c0.5,0.2,1,0,1.2-0.4 c0.2-0.5,0-1-0.4-1.2l-3.1-1.5l0.9-1.9l14.1,6.6l-0.9,1.9l-7.7-3.6c-0.5-0.2-1,0-1.2,0.4c-0.2,0.5,0,1,0.4,1.2l7.7,3.6 C20.8,30.3,16.4,31.7,12.6,30z M26.7,28.7l-2.3-1.1l0.3-0.6l3.9-8.3l2.3,1.1c2.4,1.1,3.5,4,2.4,6.5S29.1,29.8,26.7,28.7z"></path></g>
        </symbol>
        </svg>
    `,
    );
};

export const displayRank = num => {
    if (num < 1000) return num;
    const numWithDecimal = num * (1 / 1000);
    return numWithDecimal.toFixed(1).toString() + 'k';
};

export const displayScore = num => {
    if (num === null) {
        return null;
    }

    let numDecimalPoints;
    if (num > 100) {
        numDecimalPoints = 0;
    } else if (num > 10) {
        numDecimalPoints = 1;
    } else {
        numDecimalPoints = 2;
    }
    return parseFloat(num).toFixed(numDecimalPoints);
};

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

export const depthFirstNodeSearch = (parentNode, testCondition, currentDepth = 1) => {
    // https://en.wikipedia.org/wiki/Depth-first_search
    const MAX_DEPTH = 20;
    if (currentDepth > MAX_DEPTH) return null;
    for (let i = 0; i < parentNode.childNodes.length; i++) {
        const childNode = parentNode.childNodes[i];
        if (testCondition(childNode)) return childNode;
        const resultChild = depthFirstNodeSearch(childNode, testCondition, currentDepth + 1);
        if (resultChild) return resultChild;
    }
    return null;
};

export const stringToHash = str => {
    const len = str.length;
    let hash = 0;
    if (len === 0) return hash;
    let i;
    for (i = 0; i < len; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

export const errorHandle = err => {
    if (process.env.NODE_ENV === 'development') {
        throw new Error(err);
    } else {
        return;
    }
};
