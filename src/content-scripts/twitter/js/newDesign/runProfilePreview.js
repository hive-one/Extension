import OnProfilePreviewInjector from './OnProfilePreviewInjector';
import OnProfilePopupPreviewInjector from './OnProfilePopupPreviewInjector';

const runProfilePreview = async (settings, api) => {
    const profilePreviewInjector = new OnProfilePreviewInjector(settings, api);
    profilePreviewInjector.run();

    const profilePopupPreviewInjector = new OnProfilePopupPreviewInjector(settings, api);
    profilePopupPreviewInjector.run();
};

export default runProfilePreview;
