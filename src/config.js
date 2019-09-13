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

//
export const GA_TYPES = Object.freeze({
    FETCH: 'fetch',
    FETCH_SUCCESS: 'fetch-success',
    FETCH_FAILURE: 'fetch-failure',
    TRACK_EVENT: 'trackEvent',
});

export const TOOLTIP_CLASSNAMES = Object.freeze({
    TOOLTIP: 'HiveExtension_Tooltip',
    TEXT: 'HiveExtension_Tooltip-text',
});

export const DISPLAY_TYPES = Object.freeze({
    RANKS: 'showRanks',
    SCORES: 'showScores',
    RANKS_WITH_SCORES_FALLBACK: 'showRanksWithScoreFallback',
});

export const CLUSTER_TYPES = Object.freeze({
    HIGHEST: 'Highest',
    CRYPTO: 'Crypto',
    BTC: 'BTC',
    ETH: 'ETH',
    XRP: 'XRP',
});
