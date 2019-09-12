export const CONFIG = Object.freeze({
    API_HOST: 'https://hive.one',
    DEFAULT_OPTIONS: {
        clusterToDisplay: 'Crypto',
        displaySetting: 'showRanks',
        useIcons: false,
        subscribedToNewsletter: false,
        showScoreOnTweets: true,
        topFollowersCluster: 'Crypto',
    },
    MAX_SCORE: 1000,
    GOOGLE_ANALYTICS_ID: 'UA-39572645-2',
    USER_DATA_CACHE_LIFETIME: 86400, // 24 hours
});

export const MESSAGES = Object.freeze({
    FETCH: 'fetch',
    FETCH_SUCCESS: 'fetch-success',
    FETCH_FAILURE: 'fetch-failure',
    TRACK_EVENT: 'trackEvent',
});

export const TOOLTIPS = Object.freeze({
    TOOLTIP_CLASS: 'HiveExtension_Tooltip',
    TOOLTIP_TEXT_CLASS: 'HiveExtension_Tooltip-text',
});
