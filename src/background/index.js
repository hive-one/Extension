import { CONFIG, GA_TYPES } from '../config';
import amplitude from 'amplitude-js/amplitude';
import * as Sentry from '@sentry/browser';

import { _LTracker } from 'loggly-jslogger';

import hive from 'hiveone-js';
const hiveAPI = hive({ apiKey: '5460ce138ce3d46ae5af00018c576af991e3054a', host: 'http://3.120.237.41/' });

const manifestData = chrome.runtime.getManifest();

_LTracker.push({
    logglyKey: '71222fd2-f06f-4975-b882-2316e38c737b',
    sendConsoleErrors: true,
    tag: 'javascript-logs',
});

Sentry.init({ dsn: 'https://4002a4ace3284b8ca195f4d287d215ae@sentry.io/1884106' });

if (process.env.NODE_ENV === 'development') {
    amplitude.getInstance().init('b9aea2974d2570a3443be6100a01777f');
} else {
    amplitude.getInstance().init('284c6c9c6469b7ac797fdf3fc4a83c52');
}

/* global ga */

chrome.runtime.setUninstallURL('https://forms.gle/m4YUEiwWGQHSwj5s5');

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

    chrome.storage.sync.get('HiveExtension:acceptedPermissions', result => {
        console.log(result);
        if (typeof result['HiveExtension:acceptedPermissions'] === 'undefined') {
            chrome.storage.sync.set({
                'HiveExtension:acceptedPermissions': false,
            });
            chrome.tabs.create({ url: chrome.runtime.getURL('index.html#permissions') });
        } else {
            if (result['HiveExtension:acceptedPermissions'] === false) {
                amplitude.getInstance().setOptOut(true);
            }
        }
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

function sendAnalyticsEvent(category, action) {
    chrome.storage.sync.get('HiveExtension:acceptedPermissions', result => {
        if (result['HiveExtension:acceptedPermissions'] === true) {
            if (process.env.NODE_ENV === 'development') {
                console.log(category, action);
            }
            amplitude.getInstance().logEvent(action);
            ga('send', 'event', category, action);
        }
    });
}

function sendLogglyEvent(data) {
    const payload = {
        data,
        appVersion: manifestData.version,
    };
    _LTracker.push(payload);
}

async function hiveOneCall(funcName, funcArgs, sendResponse) {
    try {
        let response = await hiveAPI[funcName](funcArgs);
        sendResponse({
            type: GA_TYPES.FETCH_SUCCESS,
            data: response,
        });
    } catch (error) {
        console.log(error);
        sendResponse({
            type: GA_TYPES.FETCH_FAILURE,
            error,
        });
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case GA_TYPES.TRACK_EVENT:
            if (!request.action || !request.category) {
                throw new Error(
                    `Missing props on request object: action: ${request.action} category: ${request.category}`,
                );
            }
            sendAnalyticsEvent(request.category, request.action);
            break;
        case 'SET_COOKIE':
            chrome.cookies.get({ url: 'https:twitter.com/', name: 'night_mode' }, cookie => {
                sendResponse({ type: 'nightModeCookie', value: cookie ? cookie.value : 0 });
            });
            return true;
        case 'LOG_ERROR':
            if (request.err) {
                Sentry.captureException(request.err);
                sendLogglyEvent(request.err);
            }
            break;
        case 'LOG':
            sendLogglyEvent(request.payload);
            break;
        case 'hiveOne':
            hiveOneCall(request.funcName, request.funcArgs, sendResponse);
            return true;
    }
});
