import ProfileNav from './ProfileNav';
import TweetAuthorScores from './TweetAuthorScores';
import { sleep } from './utils';

const runProfile = async (settings, api, screenName) => {
    const pNav = new ProfileNav(settings, api, screenName);
    await pNav.run();

    if (settings.showScoreOnTweets) {
        const tweetScores = new TweetAuthorScores(settings, api);
        await tweetScores.run();
    }

    // loop
    await sleep(2000);
    runProfile(settings, api, screenName);
};

export default runProfile;
