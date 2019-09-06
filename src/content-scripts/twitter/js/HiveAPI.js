import { MESSAGES } from '../../../config';

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
            if (settings.isNewTwitterDesign) {
                await this._initialize(
                    AVAILABLE_SCREEN_NAMES_KEY,
                    `${this.host}/api/influencers/scores/people/available/screen_names/`,
                );
            } else {
                await this._initialize(AVAILABLE_IDS_KEY, `${this.host}/api/influencers/scores/people/available/ids/`);
            }
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

    async _initialize(key, url) {
        try {
            var cachedIds = await this.cache.get(key);
            if (!cachedIds) {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`Cannot handle status code "${res.status}" for url "${url}"`);
                }
                const { data } = await res.json();
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

    async getTwitterUserData(id, clusterName = this.defaultCluster) {
        // loads cached user reponse & returns scores/ranks based on the selected cluster

        let score = 0;
        let name = clusterName;
        let indexed = false;
        let rank = null;
        let followers = [];
        let podcasts = [];

        if (id && this.isIdentifierIndexed(id)) {
            const { data, status } = await this._getTwitterUserData(id);

            if (status === RESPONSE_TYPES.SUCCESS) {
                if (clusterName === 'Highest') {
                    const highestScoreCluster = data.clusters.slice().sort((a, b) => b.score - a.score)[0];

                    name = highestScoreCluster.abbr;
                    score = highestScoreCluster.score;
                    rank = highestScoreCluster.rank;
                    followers = highestScoreCluster.followers.edges;
                } else {
                    const { node: cluster } = data.scores.find(({ node: cluster }) => cluster.abbr === clusterName);
                    score = cluster.score;
                    rank = cluster.rank;
                    followers = cluster.followers.edges;
                }

                podcasts =
                    data.podcasts.edges &&
                    data.podcasts.edges.sort((a, b) => b.node.published - a.node.published).slice(0, 5);

                indexed = true;
            }
        }

        return { name, score, rank, indexed, followers, podcasts };
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
        // if not requests dat from the API and caches it
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
            responsePromise = fetch(url);
            this._requestsMap[idOrScreenName] = responsePromise;
        }

        let userData;
        try {
            const res = await responsePromise;
            if (!res.ok) {
                throw new Error(`Unhandled response code: "${res.status}" for URL: "${url}"`);
            }
            const { data } = await res.json();
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

    getUserDataCacheKey(id) {
        return `twitter_user_${id}`;
    }

    isIdentifierIndexed(id) {
        if (id.toString) {
            id = id.toString();
        }

        return this._acceptableIds.includes(id);
    }

    fetchInBackgroundContext(url) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    type: MESSAGES.FETCH,
                    url,
                },
                ({ type, data, error }) => {
                    if (type === MESSAGES.FETCH_SUCCESS) {
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
