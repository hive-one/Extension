const run = () => {
    console.log('running in the new design...');
};

const rerunOnUrlChange = oldUrl => {
    let newUrl = window.location.href;
    if (oldUrl === newUrl) {
        setTimeout(() => rerunOnUrlChange(newUrl), 200);
    } else {
        run();
        setTimeout(() => rerunOnUrlChange(window.location.href), 200);
    }
};

const runNewDesign = () => {
    rerunOnUrlChange(window.location.href);
    run();
};

export default runNewDesign;
