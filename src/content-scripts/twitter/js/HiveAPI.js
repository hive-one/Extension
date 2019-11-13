import { GA_TYPES, CLUSTER_TYPES } from '../../../config';

import { TEST_SCREEN_NAMES, TEST_DATA } from './testData';

const RESPONSE_TYPES = Object.freeze({
    SUCCESS: 'success',
    ERROR: 'error',
});

const AVAILABLE_SCREEN_NAMES_KEY = 'HiveAPI::TWITTER_INFLUENCERS_AVAILABLE_SCREEN_NAMES';
const AVAILABLE_IDS_KEY = 'HiveAPI::TWITTER_INFLUENCERS_AVAILABLE_IDS';
const FOLLOWERS_KEY = 'HiveAPI::TWITTER_FOLLOWERS';

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
        return `${this.host}/api/influencers/profile/screen_name`;
    }

    get availableIdsKey() {
        return AVAILABLE_SCREEN_NAMES_KEY;
    }

    get availableIdsUrl() {
        return `${this.host}/api/influencers/scores/people/available/screen_names/`;
    }

    async _initialize() {
        const key = this.availableIdsKey;
        const url = this.availableIdsUrl;

        try {
            var cachedIds = await this.cache.get(key);

            // Checks to see if the cached values are in the correct format
            // If a user accesses another design, that design's `available` array gets cached.
            if (cachedIds) {
                if (cachedIds.available) {
                    if (
                        (key === AVAILABLE_SCREEN_NAMES_KEY && !isNaN(parseInt(cachedIds.available[0], 10))) ||
                        (key === AVAILABLE_IDS_KEY && isNaN(parseInt(cachedIds.available[0], 10)))
                    ) {
                        delete cachedIds.available;
                    }
                }
            }

            if (!cachedIds || !cachedIds.available || !cachedIds.available.length) {
                const res = await this.fetchInBackgroundContext(url, {
                    headers: {
                        Authorization: 'Token 5460ce138ce3d46ae5af00018c576af991e3054a',
                    },
                });
                if (res.error) {
                    throw new Error(res.error);
                }
                const { data } = res;
                cachedIds = data;
                this.cache.save(AVAILABLE_SCREEN_NAMES_KEY, {
                    available: cachedIds.available,
                });
            }

            if (process.env.NODE_ENV === 'development') {
                cachedIds.available = cachedIds.available.concat(TEST_SCREEN_NAMES);
            }

            this._acceptableIds = cachedIds.available;
        } catch (err) {
            console.error('Failed initializing HiveAPI\n', err);
        }
    }

    async getFilteredTwitterUserData(idOrScreenName, clusterName = this.defaultCluster) {
        // loads cached user reponse & returns scores/ranks based on the selected cluster

        if (!idOrScreenName) {
            throw new Error('Missing arg: idOrScreenName');
        }

        if (!this.isIdentifierIndexed(idOrScreenName)) {
            throw new Error(`Could not find ${idOrScreenName} within this._acceptableIds`);
        }

        let id, screenName, rank, userName, imageUrl, description, website;
        let score = 0;
        let name = clusterName;
        let indexed = false;
        let followers = [];
        let podcasts = [];
        let scores = [];

        const { data, status } = await this._getTwitterUserData(idOrScreenName);

        if (status !== RESPONSE_TYPES.SUCCESS || !data) {
            throw new Error(`Failed getting data for for: ${idOrScreenName}`);
        }

        let profile;

        if (data.hasOwnProperty('data')) {
            profile = data.data.profile;
        } else {
            profile = data.profile;
        }

        id = profile.id;
        screenName = profile.screenName;
        userName = profile.name;
        imageUrl = profile.imageUrl;
        description = profile.description;
        website = profile.website;
        scores = profile.clusters.edges;
        followers = profile.followers.edges;

        if (clusterName === CLUSTER_TYPES.HIGHEST) {
            const highestScoreCluster = scores.slice().sort((a, b) => b.score - a.score)[0];

            name = highestScoreCluster.abbr;
            score = highestScoreCluster.score;
            rank = highestScoreCluster.history.edges[0].node.rank;
            // followers = highestScoreCluster.followers.edges;
        } else {
            const { node: selectedCluster } = scores.find(c => c.node.abbr === clusterName);
            score = selectedCluster.score;
            rank = selectedCluster.history.edges[0].node.rank;
            // followers = selectedCluster.followers.edges;
        }

        podcasts =
            profile.podcasts.edges &&
            profile.podcasts.edges.sort((a, b) => b.node.published - a.node.published).slice(0, 5);

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
            podcasts,
        };
    }

    async getFollowersInfo(followers, followersIds, screenName) {
        let key = `${FOLLOWERS_KEY}_${screenName}`;
        try {
            var cachedFollowers = await this.cache.get(key);

            if (!cachedFollowers || !cachedFollowers.data || !cachedFollowers.data.success) {
                const res = await this.fetchInBackgroundContext(`${this.host}/api/influencers/scores/batch/`, {
                    method: 'POST',
                    body: JSON.stringify({ ids: followersIds }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Token 5460ce138ce3d46ae5af00018c576af991e3054a',
                    },
                });
                if (res.error) {
                    throw new Error(res.error);
                }
                cachedFollowers = res;
                this.cache.save(key, cachedFollowers);
            }
            followers = cachedFollowers.data.success;
        } catch (err) {
            console.error('Failed to get follower data\n', err);
        }
        return followers;
    }

    async getTwitterUserScores(idOrScreenName) {
        const { data, status } = await this._getTwitterUserData(idOrScreenName);
        let scores = [];

        if (status === RESPONSE_TYPES.SUCCESS) {
            scores = data.scores;
        }

        return scores;
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

        if (typeof cachedData !== 'undefined' && cachedData !== null) {
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
        await this.cache.save(cacheKey, resInfo);

        return resInfo;
    }

    async _requestUserData(idOrScreenName) {
        const url = `${this.userDataUrl}/${idOrScreenName}/`;
        // Immediately save requests to state to prevent duplicate requests
        let responsePromise = this._requestsMap[idOrScreenName];
        if (!responsePromise) {
            responsePromise = this.fetchInBackgroundContext(url, {
                headers: {
                    Authorization: 'Token 5460ce138ce3d46ae5af00018c576af991e3054a',
                },
            });
            this._requestsMap[idOrScreenName] = responsePromise;
        }

        let userData;
        try {
            const res = await responsePromise;
            if (res.error) {
                throw new Error(res.error);
            }
            const { data } = res;
            userData = data;
            // pop from state
            delete this._requestsMap[idOrScreenName];
        } catch (err) {
            console.error(err);
        }
        if (!userData) {
            throw new Error(`Failed requesting user data: ${idOrScreenName}`);
        }

        return userData;
    }

    getUserDataCacheKey(idOrScreenName) {
        return `twitter_user_${idOrScreenName}`;
    }

    isIdentifierIndexed(idOrScreenName) {
        if (idOrScreenName.toString) {
            idOrScreenName = idOrScreenName.toString();
        }

        return this._acceptableIds.includes(idOrScreenName);
    }

    fetchInBackgroundContext(url, options = {}) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    type: GA_TYPES.FETCH,
                    url,
                    options,
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
