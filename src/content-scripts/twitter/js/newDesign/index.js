import runProfile from './runProfile';
import runHome from './runHome';
import runProfilePreview from './runProfilePreview';
import runNotifications from './runNotifications';
import { initialiseIcons } from './utils';

// TODO: Handle popup showing who retweeted and who liked
// TODO: Handle 'Who to follow' Module

const skippableRoutes = /^\/(messages|compose|settings)/;
const homeRoutes = /^\/(home|explore|i+\/+interactions|(^i\/related_users+\/)|[A-Za-z0-9_]+\/with_replies|[A-Za-z0-9_]+\/media|[A-Za-z0-9_]+\/likes)/;
const profilePreviewRoutes = /^\/([A-Za-z0-9_]+\/followers|[A-Za-z0-9_]+\/following|[A-Za-z0-9_]+\/followers_you_follow|i\/related_users+\/)/;

const run = async (settings, api) => {
    const { pathname } = window.location;

    if (pathname === '/' || pathname.match(skippableRoutes)) {
        console.log(`TODO: Handle route: "${pathname}"`);
        return;
    } else if (pathname.match(homeRoutes)) {
        await runHome(settings, api);
    } else if (pathname.match(/^\/[A-Za-z0-9_]+\/status/)) {
        // at the moment there is no difference in how
        // the home route is handled and how threads are
        // handled
        await runHome(settings, api);
    } else if (pathname.match(profilePreviewRoutes)) {
        await runProfilePreview(settings, api);
    } else if (pathname == '/notifications' || pathname == '/notifications/mentions') {
        await runNotifications(settings, api);
    } else if (pathname.match(/^\/[A-Za-z0-9_]+$/)) {
        const screenName = pathname.slice(1);
        await runProfile(settings, api, screenName);
    } else {
        throw new Error(`Unhandled route: ${pathname}`);
    }
};

const runNewDesign = async (settings, api) => {
    // This extension works by running a task every 2 seconds
    // that checks the current URL and runs an appropriate function
    // that injects relevant html on the page.
    initialiseIcons();
    const task = () => {
        const timeout = setTimeout(() => {
            run(settings, api);
            task();
        }, 2000);
        return timeout;
    };
    task();
};

export default runNewDesign;
