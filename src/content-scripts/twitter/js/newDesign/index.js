import runProfile from './runProfile';
import runHome from './runHome';
import runProfilePreview from './runProfilePreview';
import runNotifications from './runNotifications';
import { initialiseIcons, errorHandle } from './utils';

// TODO: Handle popup showing who retweeted and who liked

const skippableRoutes = /^\/(messages|compose|settings|i+\/events+\/[A-Za-z0-9_])/;
const homeRoutes = /^\/(home|explore|i+\/+interactions|(^i\/related_users+\/)|[A-Za-z0-9_]+\/with_replies|[A-Za-z0-9_]+\/media|[A-Za-z0-9_]+\/likes|[A-Za-z0-9_]+\/lists+\/[A-Za-z0-9_])/;
const profilePreviewRoutes = /^\/([A-Za-z0-9_]+\/followers|[A-Za-z0-9_]+\/following|[A-Za-z0-9_]+\/followers_you_follow|i\/related_users+\/)/;

const run = async (settings, api) => {
    const { pathname } = window.location;

    if (pathname === '/' || pathname.match(skippableRoutes)) {
        console.log(`TODO: Handle route: "${pathname}"`);
        return;
    } else if (pathname.match(homeRoutes)) {
        runHome(settings, api);
        runProfilePreview(settings, api);
    } else if (pathname.match(/^\/[A-Za-z0-9_]+\/status/)) {
        // at the moment there is no difference in how
        // the home route is handled and how threads are
        // handled
        runHome(settings, api);
        runProfilePreview(settings, api);
    } else if (pathname.match(profilePreviewRoutes)) {
        // runProfilePreview(settings, api);
    } else if (pathname == '/notifications' || pathname == '/notifications/mentions') {
        runNotifications(settings, api);
        runProfilePreview(settings, api);
    } else if (pathname.match(/^\/[A-Za-z0-9_]+$/)) {
        const screenName = pathname.slice(1);
        runProfile(settings, api, screenName);
        runProfilePreview(settings, api);
    } else {
        return errorHandle(`Unhandled route: ${pathname}`);
    }
};

const runNewDesign = async (settings, api) => {
    // This extension works by running a task every 200 milliseconds
    // that checks the current URL and runs an appropriate function
    // that injects relevant html on the page.
    initialiseIcons();
    const task = () => {
        const timeout = setTimeout(() => {
            run(settings, api);
            task();
        }, 200);
        return timeout;
    };
    task();
};

export default runNewDesign;
