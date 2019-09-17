import runProfile from './runProfile';
import runHome from './runHome';
import { initialiseIcons } from './utils';

const skippableRoutes = /^\/(notifications|explore|messages|i\/|compose|settings|[A-Za-z0-9_]+\/lists)/;

const run = async (settings, api) => {
    const { pathname } = window.location;

    if (pathname === '/' || pathname.match(skippableRoutes)) {
        console.log(`TODO: Handle route: "${pathname}"`);
        return;
    } else if (pathname === '/home') {
        await runHome(settings, api);
    } else if (pathname.match(/^\/[A-Za-z0-9_]+\/status/)) {
        // at the moment there is no difference in how
        // the home route is handled and how threads are
        // handled
        await runHome(settings, api);
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
