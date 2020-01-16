import ExtensionSettings from './Settings';
import TimedCache from './TimedCache';
import HiveAPI from './HiveAPI';

import { CONFIG } from '../../../config';

export default async () => {
    const settings = await new ExtensionSettings();
    const cache = new TimedCache(CONFIG.USER_DATA_CACHE_LIFETIME);
    const api = await new HiveAPI(CONFIG.API_HOST, settings, cache);

    return { api, settings };
};
