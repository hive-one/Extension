import ExtensionSettings from './Settings';

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
    const settings = await new ExtensionSettings();

    if (settings.isNewTwitterDesign) {
        console.log(
            'HIVE.ONE EXTENTION: Running for the new design (2019.07.15 and later)',
        );
        runNewDesign();
    } else {
        console.log(
            'HIVE.ONE EXTENTION: Running for the legacy design (2019.07.14 and earlier)',
        );
        runOldDesign({ settings });
    }
})();
