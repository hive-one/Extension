import { CustomCache } from './CustomCache';
import moment from 'moment';

const TIMESTAMP_KEY = '__TimedCache__TIMESTAMP';

export class TimedCache extends CustomCache {
  lifetime = 0;

  constructor(lifetime) {
    super();

    if (typeof lifetime !== 'number') {
      throw 'Lifetime argument needs to be passed to TimedCache';
    }

    this.lifetime = lifetime;
  }

  async get(key) {
    const result = await super.get(key);

    if (result && (!result[TIMESTAMP_KEY] || this.isTimestampOutdated(result[TIMESTAMP_KEY]))) {
      return null;
    }

    return result;
  }

  isTimestampOutdated(timestamp) {
    if (isNaN(timestamp)) {
      return true;
    }

    if (typeof timestamp !== 'string') {
      timestamp = parseInt(timestamp, 10);
    }

    return this.getCurrentTimestamp() - timestamp >= this.lifetime;
  }

  getCurrentTimestamp() {
    return moment().unix();
  }

  async save(key, value) {
    if (typeof value !== 'object') {
      throw 'TimedCache only supports saving objects';
    }

    if (!value[TIMESTAMP_KEY]) {
      value[TIMESTAMP_KEY] = this.getCurrentTimestamp();
    }

    return super.save(key, value);
  }
}
