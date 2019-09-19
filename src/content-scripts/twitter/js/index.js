import ExtensionSettings from './Settings';
import TimedCache from './TimedCache';
import HiveAPI from './HiveAPI';
import { CONFIG } from '../../../config';

/*
 * Twitter introduced a new desgin on 15 July 2019
 * This caused most-all of the ID's and class names
 * of DOM elements to change.
 * Users who are logged out recieve the old design
 * by default, while logged in users recieve the
 * new design
 */
import runOldDesign from './oldDesign';
import runNewDesign from './newDesign';

(async () => {
    // Constructor returns a promise, thus it must be awaited,
    // despite what VSCodes squiggly line says
    console.log('Hello');
    const settings = await new ExtensionSettings();
    const cache = new TimedCache(CONFIG.USER_DATA_CACHE_LIFETIME);
    const api = await new HiveAPI(CONFIG.API_HOST, settings, cache);
    console.log('World');

    if (settings.isNewTwitterDesign) {
        console.log('HIVE.ONE EXTENTION: Running for the new design (2019.07.15 and later)');
        runNewDesign(settings, api);
    } else {
        console.log('HIVE.ONE EXTENTION: Running for the legacy design (2019.07.14 and earlier)');
        runOldDesign(settings, api);
    }
})();
