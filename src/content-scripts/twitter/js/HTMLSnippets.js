import escapeHTML from 'escape-html';
import moment from 'moment';

const POPUP_CLASS = 'HiveExtension-Twitter_popup-profile';

// eslint-disable-next-line no-unused-vars
const createPodcastsSection = podcasts => {
    const createPodcast = ({ node }) => {
        const { name, episodeUrl, published, episodeName, hosts } = node;
        const safePodcastName = escapeHTML(name);
        const safeEpisodeName = escapeHTML(episodeName);
        const hostsList = hosts.edges.map(item => item.node.name).join(', ');

        const truncateText = input => (input.length > 50 ? `${input.substring(0, 50)}...` : input);

        let date = moment.unix(published);

        return `
            <a class="${POPUP_CLASS}_podcasts_podcast" rel="noopener noreferrer" href="${episodeUrl}" target='__blank'>
                <div class="${POPUP_CLASS}_podcasts_podcast_info">
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_podcast_name">${safePodcastName}</span>
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_episode_name">${truncateText(
            safeEpisodeName,
        )}</span>
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_host_list">${hostsList}<span>
                </div>
                <div class="${POPUP_CLASS}_podcasts_podcast_info_date">
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_date_day">${date.format('D')}</span>
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_date_month_year">${date.format('MMM YY')}</span>
                </div>
            </a>
        `;
    };
    return `
        <div class="${POPUP_CLASS}_podcasts">
            ${podcasts.map(createPodcast).join('')}
        </div>
    `;
};
