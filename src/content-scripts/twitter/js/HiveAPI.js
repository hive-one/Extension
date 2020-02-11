import { GA_TYPES, CLUSTER_TYPES } from '../../../config';
import { errorHandle } from './newDesign/utils';

import { TEST_DATA } from './testData';

const RESPONSE_TYPES = Object.freeze({
    SUCCESS: 'success',
    ERROR: 'error',
});

const AVAILABLE_SCREEN_NAMES_KEY = 'HiveAPI::TWITTER_INFLUENCERS_AVAILABLE_SCREEN_NAMES';

class HiveAPI {
    cache;
    host = '';

    _acceptableIds;
    _requestsMap;

    constructor(_host, settings, _cache) {
        this.host = _host;
        this.settings = settings;
        this.cache = _cache;
        this._acceptableIds = [];
        this._requestsMap = new Map();
        return new Promise(async resolve => {
            await this._initialize();
            resolve(this);
        });
    }

    get defaultCluster() {
        return this.settings.clusterToDisplay;
    }

    get userDataUrl() {
        return `${this.host}/api/v1/influencers/screen_name`;
    }

    get availableIdsKey() {
        return AVAILABLE_SCREEN_NAMES_KEY;
    }

    async _initialize() {
        const key = this.availableIdsKey;

        try {
            var cachedIds = await this.cache.get(key);

            // Checks to see if the cached values are in the correct format
            // If a user accesses another design, that design's `available` array gets cached.
            if (cachedIds) {
                if (cachedIds.available) {
                    if (typeof cachedIds.available[0] === 'string') {
                        delete cachedIds.available;
                    }
                }
            }

            if (!cachedIds || !cachedIds.available || !cachedIds.available.length) {
                cachedIds = {};
                const res = await this.apiCallInBackground('availableInfluncers');
                if (res.error) {
                    return errorHandle(res.error);
                }
                cachedIds.available = res;
                this.cache.save(AVAILABLE_SCREEN_NAMES_KEY, {
                    available: res,
                });
            }

            // if (process.env.NODE_ENV === 'development') {
            //     cachedIds.available = cachedIds.available.concat(TEST_SCREEN_NAMES);
            // }

            this._acceptableIds = cachedIds.available;
        } catch (err) {
            return errorHandle(`Failed initializing HiveAPI: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
        }
    }

    async getFilteredTwitterUserData(idOrScreenName, clusterName = this.defaultCluster) {
        // loads cached user reponse & returns scores/ranks based on the selected cluster

        if (!idOrScreenName) {
            return errorHandle('Missing arg: idOrScreenName');
        }

        if (!this.isIdentifierIndexed(idOrScreenName)) {
            return errorHandle(`Could not find ${idOrScreenName} within this._acceptableIds`);
        }

        let id, screenName, rank, userName, imageUrl, description, website;
        let score = 0;
        let name = clusterName;
        let indexed = false;
        let followers = [];
        let scores = [];

        const { data, status } = await this._getTwitterUserData(idOrScreenName);

        if (status !== RESPONSE_TYPES.SUCCESS || !data) {
            return errorHandle({
                message: `Failed getting data for: ${idOrScreenName}`,
                payload: data,
                status: status,
            });
        }

        let profile = data;

        id = profile.twitterId;
        screenName = profile.screenName;
        userName = profile.name;
        imageUrl = profile.imageUrl;
        description = profile.description;
        website = profile.website;
        scores = profile.scores;
        // followers = profile.followers.edges;

        if (clusterName === CLUSTER_TYPES.HIGHEST) {
            const highestScoreCluster = scores.slice().sort((a, b) => b.score - a.score)[0];

            name = highestScoreCluster.abbr;
            score = highestScoreCluster.score;
            rank = highestScoreCluster.rank;
            followers = highestScoreCluster.followers;
        } else {
            const selectedCluster = scores.find(c => c.abbr === clusterName);
            score = selectedCluster.score;
            rank = selectedCluster.rank;
            followers = selectedCluster.followers;
        }

        indexed = true;

        return {
            id,
            screenName,
            userName,
            imageUrl,
            description,
            website,
            clusterName: name,
            score,
            scores,
            rank,
            indexed,
            followers,
            hasPodcasts: profile.hasPodcasts,
        };
    }

    async getTwitterUserScores(idOrScreenName) {
        const { data, status } = await this._getTwitterUserData(idOrScreenName);
        let scores = [];

        if (status === RESPONSE_TYPES.SUCCESS) {
            scores = data.scores;
        }

        return scores;
    }

    async getTwitterUserPodcasts(idOrScreenName) {
        const { data, status } = await this._getTwitterUserPodcastsData(idOrScreenName);
        let podcasts = [];

        if (status === RESPONSE_TYPES.SUCCESS) {
            podcasts = data.podcasts;
        }

        return podcasts;
    }

    async _getTwitterUserData(idOrScreenName) {
        // During dev, if the user is a test user return the test info instead.
        if (process.env.NODE_ENV === 'development') {
            if (TEST_DATA.hasOwnProperty(idOrScreenName)) {
                return { data: TEST_DATA[idOrScreenName], status: RESPONSE_TYPES.SUCCESS };
            }
        }

        // Tries pulling data from cache
        // if not requests data from the API and caches it
        const cacheKey = this.getUserDataCacheKey(idOrScreenName);
        const cachedData = await this.cache.get(cacheKey);

        if (typeof cachedData !== 'undefined' && cachedData !== null && cachedData.status !== 'error') {
            chrome.runtime.sendMessage({
                type: 'LOG',
                payload: `Returning Cached Data For ${idOrScreenName}`,
            });
            return cachedData;
        }

        let status;
        const data = await this._requestUserData(idOrScreenName);
        if (data) {
            status = RESPONSE_TYPES.SUCCESS;
        } else {
            status = RESPONSE_TYPES.ERROR;
        }

        const resInfo = {
            data,
            status,
        };
        if (status == RESPONSE_TYPES.SUCCESS) {
            await this.cache.save(cacheKey, resInfo);
        }

        return resInfo;
    }

    async _getTwitterUserPodcastsData(idOrScreenName) {
        // During dev, if the user is a test user return the test info instead.
        if (process.env.NODE_ENV === 'development') {
            if (TEST_DATA.hasOwnProperty(idOrScreenName)) {
                return { data: TEST_DATA[idOrScreenName], status: RESPONSE_TYPES.SUCCESS };
            }
        }

        // Tries pulling data from cache
        // if not requests data from the API and caches it
        const cacheKey = this.getUserPodcastsCacheKey(idOrScreenName);
        const cachedData = await this.cache.get(cacheKey);

        if (typeof cachedData !== 'undefined' && cachedData !== null) {
            return cachedData;
        }

        let status;
        const data = await this._requestUserPodcastData(idOrScreenName);
        if (data) {
            status = RESPONSE_TYPES.SUCCESS;
        } else {
            status = RESPONSE_TYPES.ERROR;
        }

        const resInfo = {
            data,
            status,
        };
        await this.cache.save(cacheKey, resInfo);

        return resInfo;
    }

    async _requestUserData(idOrScreenName) {
        let userData;
        try {
            const res = await this.apiCallInBackground('influencerDetails', {
                influencerId: idOrScreenName,
                includeFollowers: 1,
            });
            if (res.error) {
                return errorHandle(Error(res.error));
            }
            userData = res;
        } catch (err) {
            return errorHandle(err);
        }
        if (!userData) {
            return errorHandle(`Failed requesting user data: ${idOrScreenName}`);
        }

        return userData;
    }

    async _requestUserPodcastData(idOrScreenName) {
        let userData;
        try {
            const res = await this.apiCallInBackground('influencerPodcasts', {
                influencerId: idOrScreenName,
            });
            if (res.error) {
                return errorHandle(Error(res.error));
            }
            userData = res;
        } catch (err) {
            return errorHandle(err);
        }
        if (!userData) {
            return errorHandle(`Failed requesting user podcast data: ${idOrScreenName}`);
        }

        return userData;
    }

    getUserDataCacheKey(idOrScreenName) {
        return `twitter_user_${idOrScreenName}`;
    }

    getUserPodcastsCacheKey(idOrScreenName) {
        return `twitter_user_podcasts_${idOrScreenName}`;
    }

    isIdentifierIndexed(idOrScreenName) {
        if (idOrScreenName.toString) {
            idOrScreenName = idOrScreenName.toString();
        }

        return this._acceptableIds.includes(idOrScreenName);
    }

    apiCallInBackground(funcName, funcArgs = {}) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    type: 'hiveOne',
                    funcName,
                    funcArgs,
                },
                ({ type, data, error }) => {
                    if (type === GA_TYPES.FETCH_SUCCESS) {
                        resolve(data);
                    } else {
                        reject(error);
                    }
                },
            );
        });
    }
}

export default HiveAPI;
