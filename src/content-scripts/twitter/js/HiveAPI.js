import { MESSAGES } from '../../../config';

class HIVE_API_FETCH_DATA_STATUS {
    static SUCCESS = 'success';
    static ERROR = 'error';
}

const AVAILABLE_SCREEN_NAMES_KEY = 'HiveAPI::TWITTER_INFLUENCERS_AVAILABLE_SCREEN_NAMES';
const AVAILABLE_IDS_KEY = 'HiveAPI::TWITTER_INFLUENCERS_AVAILABLE_IDS';

class HiveAPI {
    cache;
    host = '';

    _acceptableIds;
    _userRequestsMap = {};

    constructor(_host, settings, _cache) {
        this.host = _host;
        this.settings = settings;
        this.cache = _cache;
        this._acceptableIds = [];
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

    async getTwitterUserScoreById(id, clusterName = this.defaultCluster) {
        let score = 0;
        let name = clusterName;
        let indexed = false;
        let rank = null;
        let followers = [];
        let podcasts = [];

        if (id && this.isIdentifierIndexed(id)) {
            const { data, status } = await this.getTwitterUserDataById(id);

            if (status === HIVE_API_FETCH_DATA_STATUS.SUCCESS) {
                if (clusterName === 'Highest') {
                    const highestScoreCluster = data.clusters.slice().sort((a, b) => b.score - a.score)[0];

                    name = highestScoreCluster.abbr;
                    score = highestScoreCluster.score;
                    rank = highestScoreCluster.rank;
                    followers = highestScoreCluster.followers;
                } else {
                    const cluster = data.clusters.find(item => item.abbr === clusterName);
                    score = cluster.score;
                    rank = cluster.rank;
                    followers = cluster.followers;
                }

                podcasts =
                    data.podcasts && data.podcasts.sort((a, b) => b.node.published - a.node.published).slice(0, 5);

                indexed = true;
            }
        }

        return { name, score, rank, indexed, followers, podcasts };
    }
    async getTwitterUserScoreByScreenName(screenName, clusterName = this.defaultCluster) {
        let score = 0;
        let name = clusterName;
        let indexed = false;
        let rank = null;
        let followers = [];
        let podcasts = [];

        //TODO fix the isIndentifierIndexed
        // if (screenName && this.isIdentifierIndexed(screenName)) {
        if (screenName) {
            const { data, status } = await this.getTwitterUserDataByName(screenName);
            if (status === HIVE_API_FETCH_DATA_STATUS.SUCCESS) {
                if (clusterName === 'Highest') {
                    const highestScoreCluster = data.clusters.slice().sort((a, b) => b.score - a.score)[0];

                    name = highestScoreCluster.abbr;
                    score = highestScoreCluster.score;
                    rank = highestScoreCluster.rank;
                    followers = highestScoreCluster.followers;
                } else {
                    const cluster = data.clusters.find(item => item.abbr === clusterName);
                    score = cluster.score;
                    rank = cluster.rank;
                    followers = cluster.followers;
                }

                podcasts =
                    data.podcasts && data.podcasts.sort((a, b) => b.node.published - a.node.published).slice(0, 5);

                indexed = true;
            }
        }

        return { name, score, rank, indexed, followers, podcasts };
    }

    async getTwitterUserClustersById(id) {
        const { data, status } = await this.getTwitterUserDataById(id);
        let clusters = [];

        if (status === HIVE_API_FETCH_DATA_STATUS.SUCCESS) {
            clusters = data.clusters;
        }

        return clusters;
    }

    async getTwitterUserClustersByName(name) {
        const { data, status } = await this.getTwitterUserDataByName(name);
        console.log('data and scores from API fetch call ', data, status);
        let clusters = [];

        if (status === HIVE_API_FETCH_DATA_STATUS.SUCCESS) {
            clusters = data.clusters;
        }
        console.log('clusters ', clusters);
        return clusters;
    }

    async getTwitterUserDataById(id) {
        const cacheKey = this.getUserScoreStoringCacheKey(id);
        const cachedData = await this.cache.get(cacheKey);

        if (typeof cachedData !== 'undefined' && cachedData !== null) {
            return cachedData;
        }

        let status, data;

        try {
            let responsePromise = this._userRequestsMap[id];

            if (!responsePromise) {
                responsePromise = this.fetchInBackgroundContext(`${this.host}/api/influencers/scores/people/id/${id}/`);
                this._userRequestsMap[id] = responsePromise;
            }

            const response = await responsePromise;
            data = this.processScoreResponse(response);
            status = HIVE_API_FETCH_DATA_STATUS.SUCCESS;
        } catch (error) {
            status = HIVE_API_FETCH_DATA_STATUS.ERROR;
        }

        const fetchingInfo = {
            data,
            status,
        };

        await this.cache.save(cacheKey, fetchingInfo);

        return fetchingInfo;
    }

    async getTwitterUserDataByName(name) {
        const cacheKey = this.getUserScoreStoringCacheKey(name);
        const cachedData = await this.cache.get(cacheKey);

        if (typeof cachedData !== 'undefined' && cachedData !== null) {
            return cachedData;
        }

        let status, data;

        try {
            let responsePromise = this._userRequestsMap[name];

            if (!responsePromise) {
                responsePromise = this.fetchInBackgroundContext(
                    `${this.host}/api/influencers/scores/people/screen_name/${name}/`,
                );
                this._userRequestsMap[name] = responsePromise;
            }

            const response = await responsePromise;
            data = this.processScoreResponse(response);
            status = HIVE_API_FETCH_DATA_STATUS.SUCCESS;
        } catch (error) {
            status = HIVE_API_FETCH_DATA_STATUS.ERROR;
        }

        const fetchingInfo = {
            data,
            status,
        };

        await this.cache.save(cacheKey, fetchingInfo);

        return fetchingInfo;
    }

    getUserScoreStoringCacheKey(id) {
        return `user_${id}_allCrypto_score`;
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

    processScoreResponse(response) {
        response = JSON.parse(JSON.stringify(response.data));

        response.clusters = response.scores.map(item => {
            if (item.node.followers && item.node.followers.edges) {
                item.node.followers = item.node.followers.edges.map(followerNode => followerNode.node);
            }

            return item.node;
        });

        delete response.scores;

        response.podcasts = response.podcasts.edges;

        return response;
    }

    getAvailableIdentifiers() {
        return this._acceptableIds;
    }

    isIdentifierIndexed(id) {
        if (id.toString) {
            id = id.toString();
        }

        return this.getAvailableIdentifiers().includes(id);
    }
}

export default HiveAPI;
