import { GA_TYPES, CLUSTER_TYPES } from '../../../config';

const RESPONSE_TYPES = Object.freeze({
    SUCCESS: 'success',
    ERROR: 'error',
});

const AVAILABLE_SCREEN_NAMES_KEY = 'HiveAPI::TWITTER_INFLUENCERS_AVAILABLE_SCREEN_NAMES';
const AVAILABLE_IDS_KEY = 'HiveAPI::TWITTER_INFLUENCERS_AVAILABLE_IDS';

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
        if (this.settings.isNewTwitterDesign) {
            return `${this.host}/api/influencers/scores/people/screen_name`;
        } else {
            return `${this.host}/api/influencers/scores/people/id`;
        }
    }

    get availableIdsKey() {
        if (this.settings.isNewTwitterDesign) {
            return AVAILABLE_SCREEN_NAMES_KEY;
        } else {
            return AVAILABLE_IDS_KEY;
        }
    }

    get availableIdsUrl() {
        if (this.settings.isNewTwitterDesign) {
            return `${this.host}/api/influencers/scores/people/available/screen_names/`;
        } else {
            return `${this.host}/api/influencers/scores/people/available/ids/`;
        }
    }

    async _initialize() {
        const key = this.availableIdsKey;
        const url = this.availableIdsUrl;

        try {
            var cachedIds = await this.cache.get(key);

            // Checks to see if the cached values are in the correct format
            // If a user accesses another design, that design's `available` array gets cached.
            if (cachedIds.available) {
                if (
                    (key === AVAILABLE_SCREEN_NAMES_KEY && !isNaN(parseInt(cachedIds.available[0], 10))) ||
                    (key === AVAILABLE_IDS_KEY && isNaN(parseInt(cachedIds.available[0], 10)))
                ) {
                    delete cachedIds.available;
                }
            }

            if (!cachedIds || !cachedIds.available || !cachedIds.available.length) {
                const res = await this.fetchInBackgroundContext(url);
                if (res.error) {
                    throw new Error(res.error);
                }
                const { data } = res;
                cachedIds = data;
                this.cache.save(AVAILABLE_SCREEN_NAMES_KEY, {
                    available: cachedIds.available,
                });
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

        let id, screenName, rank;
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

        id = data.twitter_id;
        screenName = data.screen_name;
        scores = data.scores;

        if (clusterName === CLUSTER_TYPES.HIGHEST) {
            const highestScoreCluster = data.scores.slice().sort((a, b) => b.score - a.score)[0];

            name = highestScoreCluster.abbr;
            score = highestScoreCluster.score;
            rank = highestScoreCluster.rank;
            followers = highestScoreCluster.followers.edges;
        } else {
            const { node: selectedCluster } = data.scores.find(c => c.node.abbr === clusterName);
            score = selectedCluster.score;
            rank = selectedCluster.rank;
            followers = selectedCluster.followers.edges;
        }

        podcasts =
            data.podcasts.edges && data.podcasts.edges.sort((a, b) => b.node.published - a.node.published).slice(0, 5);

        indexed = true;

        return { id, screenName, clusterName: name, score, scores, rank, indexed, followers, podcasts };
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
            responsePromise = this.fetchInBackgroundContext(url);
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

    fetchInBackgroundContext(url) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    type: GA_TYPES.FETCH,
                    url,
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
