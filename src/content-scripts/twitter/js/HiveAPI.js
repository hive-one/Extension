import { MESSAGES } from '../../../config';

class HIVE_API_FETCH_DATA_STATUS {
  static SUCCESS = 'success';
  static ERROR = 'error';
}

const AVAILABLE_IDENTIFIERS_STORING_KEY = 'HiveAPI::AVAILABLE_IDENTIFIERS';

export class HiveAPI {
  cache;
  host = '';
  defaultCluster = 'Crypto';

  _availableIdentifiers;
  _initializationPromise;
  _userRequestsMap = {};

  constructor(_host, _defaultCluster, _cache) {
    this.host = _host;
    this.defaultCluster = _defaultCluster;
    this.cache = _cache;
    this._availableIdentifiers = [];

    this.initialize();
  }

  async initialize() {
    if (!this._initializationPromise) {
      this._initializationPromise = new Promise(async resolve => {
        await this._initializeAvailableIdentifiers();

        resolve();
      });
    }

    return this._initializationPromise;
  }

  async _initializeAvailableIdentifiers() {
    const cachedIdentifiers = await this.cache.get(AVAILABLE_IDENTIFIERS_STORING_KEY);

    if (cachedIdentifiers) {
      this._availableIdentifiers = cachedIdentifiers.available;
    } else {
      const response = await this.fetchInBackgroundContext(
        `${this.host}/api/influencers/scores/people/available/`
      );

      if (response && response.data && response.data.available) {
        this._availableIdentifiers = response.data.available;
        this.cache.save(AVAILABLE_IDENTIFIERS_STORING_KEY, {
          available: this._availableIdentifiers
        });
      }
    }
  }

  async getTwitterUserScore(id, clusterName = this.defaultCluster) {
    let score = 0;
    let name = clusterName;
    let indexed = false;
    let rank = null;
    let followers = [];
    let podcasts = [];

    if (id && this.isIdentifierIndexed(id)) {
      const { data, status } = await this.getTwitterUserData(id);

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
          data.podcasts &&
          data.podcasts.sort((a, b) => b.node.published - a.node.published).slice(0, 5);

        indexed = true;
      }
    }

    return { name, score, rank, indexed, followers, podcasts };
  }

  async getTwitterUserClusters(id) {
    const { data, status } = await this.getTwitterUserData(id);

    let clusters = [];

    if (status === HIVE_API_FETCH_DATA_STATUS.SUCCESS) {
      clusters = data.clusters;
    }

    return clusters;
  }

  async getTwitterUserData(id) {
    const cacheKey = this.getUserScoreStoringCacheKey(id);
    const cachedData = await this.cache.get(cacheKey);

    if (typeof cachedData !== 'undefined' && cachedData !== null) {
      return cachedData;
    }

    let status, data;

    try {
      let responsePromise = this._userRequestsMap[id];

      if (!responsePromise) {
        responsePromise = this.fetchInBackgroundContext(
          `${this.host}/api/influencers/scores/people/id/${id}/`
        );
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
      status
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
          url
        },
        ({ type, data, error }) => {
          if (type === MESSAGES.FETCH_SUCCESS) {
            resolve(data);
          } else {
            reject(error);
          }
        }
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
    return this._availableIdentifiers;
  }

  isIdentifierIndexed(id) {
    if (id.toString) {
      id = id.toString();
    }

    return this.getAvailableIdentifiers().includes(id);
  }
}
