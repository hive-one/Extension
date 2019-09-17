import { CONFIG, GA_TYPES } from '../config';

/* global ga */

chrome.runtime.onInstalled.addListener(function() {
    const defaultOptionsNames = Object.keys(CONFIG.DEFAULT_OPTIONS);

    chrome.storage.sync.get(defaultOptionsNames, result => {
        defaultOptionsNames.map(option => {
            if (typeof result[option] === 'undefined') {
                console.log('HiveExtension::option', option, 'is undefined, will set it to default');
                chrome.storage.sync.set({
                    [option]: CONFIG.DEFAULT_OPTIONS[option],
                });
            }
        });
    });

    if (chrome.declarativeContent) {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
            chrome.declarativeContent.onPageChanged.addRules([
                {
                    conditions: [
                        new chrome.declarativeContent.PageStateMatcher({
                            pageUrl: { hostEquals: 'twitter.com' },
                        }),
                    ],
                    actions: [new chrome.declarativeContent.ShowPageAction()],
                },
            ]);
        });
    } else {
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if (tab.status === 'complete' && tab.url.match(/twitter.com/)) {
                chrome.pageAction.show(tabId);
            } else {
                chrome.pageAction.hide(tabId);
            }
        });
    }
});

// Standard Google Universal Analytics code
(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    (i[r] =
        i[r] ||
        function() {
            (i[r].q = i[r].q || []).push(arguments);
        }),
        (i[r].l = 1 * new Date());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', CONFIG.GOOGLE_ANALYTICS_ID, 'auto');
ga('set', 'checkProtocolTask', () => {});
ga('send', 'pageview', '/');

async function fetchURL(url, options, callback) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Cannot handle status code "${response.status}" for url "${url}"`);
        }
        const data = await response.json();
        callback({
            type: GA_TYPES.FETCH_SUCCESS,
            data,
        });
    } catch (error) {
        callback({
            type: GA_TYPES.FETCH_FAILURE,
            error,
        });
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case GA_TYPES.TRACK_EVENT:
            ga('send', 'event', request.category, request.action);
            break;
        case GA_TYPES.FETCH:
            fetchURL(request.url, request.options, sendResponse);
            return true;
    }
});
