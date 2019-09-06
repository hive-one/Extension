export class ExtensionIcons {
    initialize() {
        const ICONS_DEFINITION_ID = 'HiveExtension-icons-definition';

        if (document.getElementById(ICONS_DEFINITION_ID)) {
            return;
        }

        document.body.insertAdjacentHTML(
            'afterbegin',
            `
            <svg id="${ICONS_DEFINITION_ID}" style="display:none;">
            <symbol id="hive-icon">
                <g><path d="M31.6,18.2l-2.4-1.1c1.2-3.3,0.4-6.9-1.7-9.4L30,5.3C30.3,5,30.3,4.4,30,4c-0.3-0.4-0.9-0.4-1.3,0 l-2.5,2.4c-0.6-0.5-1.3-0.9-2-1.2c-0.7-0.3-1.5-0.6-2.2-0.7L22.2,1c0-0.5-0.3-0.9-0.8-1c-0.5,0-0.9,0.3-1,0.8l-0.2,3.4 c-3.3,0-6.6,1.7-8.3,4.7L9.5,7.9c-3.3-1.6-7.3-0.1-8.9,3.2S0.5,18.5,3.9,20l2.6,1.2c-0.7,3.9,1.1,7.9,4.6,10l-1.4,3 c-0.2,0.5,0,1,0.4,1.2c0.5,0.2,1,0,1.2-0.4l1.4-3c3.8,1.4,8.1,0.1,10.6-2.9l2.6,1.2c3.3,1.6,7.3,0.1,8.9-3.2S34.9,19.7,31.6,18.2z M23.5,6.8c3.9,1.8,5.6,6.5,3.8,10.4l-0.4,0.9l-1.4-0.7c-0.5-0.2-1,0-1.2,0.4c-0.2,0.5,0,1,0.4,1.2l1.4,0.7l-0.9,1.9L11,15l0.9-1.9 l9.7,4.5c0.5,0.2,1,0,1.2-0.4c0.2-0.5,0-1-0.4-1.2l-9.7-4.5l0.4-0.9C14.9,6.6,19.6,4.9,23.5,6.8z M7,19.4l-2.3-1.1 c-2.4-1.1-3.5-4-2.4-6.5s4-3.5,6.5-2.4l2.3,1.1l-3.9,8.3L7,19.4z M12.6,30c-3.7-1.7-5.4-6.1-4-9.9l3.1,1.5c0.5,0.2,1,0,1.2-0.4 c0.2-0.5,0-1-0.4-1.2l-3.1-1.5l0.9-1.9l14.1,6.6l-0.9,1.9l-7.7-3.6c-0.5-0.2-1,0-1.2,0.4c-0.2,0.5,0,1,0.4,1.2l7.7,3.6 C20.8,30.3,16.4,31.7,12.6,30z M26.7,28.7l-2.3-1.1l0.3-0.6l3.9-8.3l2.3,1.1c2.4,1.1,3.5,4,2.4,6.5S29.1,29.8,26.7,28.7z"></path></g>
            </symbol>
            <symbol id="hive-icon-small">
              <g id="Content-Element-/-Icon-/-Hive-/-Emblem" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="Group" fill="#FFFFFF">
                    <rect id="Rectangle" x="0" y="0" width="8" height="30" rx="4"></rect>
                    <rect id="Rectangle-Copy-4" x="22" y="11" width="8" height="19" rx="4"></rect>
                    <rect id="Rectangle-Copy-5" x="22" y="0" width="8" height="8" rx="4"></rect>
                    <rect id="Rectangle" x="11" y="11" width="8" height="8" rx="4"></rect>
                  </g>
              </g>
            </symbol>
            </svg>
        `,
        );
    }
}
