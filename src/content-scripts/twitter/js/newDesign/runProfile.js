import { getScreenNameFromUrl } from './utils';
import ProfileNav from './ProfileNav';

const runProfile = async (settings, api) => {
    const profileScreenName = getScreenNameFromUrl();
    if (!profileScreenName) {
        throw new Error(`Failed parsing @handle from URL: "${window.location.href}"`);
    }

    console.log(`Viewing profile: ${profileScreenName}`);

    const pNav = new ProfileNav(settings, api, profileScreenName);
    await pNav.run();
};

export default runProfile;
