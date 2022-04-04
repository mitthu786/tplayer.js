import Plyr from "plyr";
import Hls from "hls.js";
import plyrOptions from "../helpers/plyrOptions";

export default function hlsJS(configs) {
  if (Hls.isSupported()) {
    let hlsInstanceConfig = {
      maxMaxBufferLength: 100,
    };

    if (configs.sourceHeaders.hls) {
      hlsInstanceConfig.xhrSetup = (xhr, url) => {
        Object.keys(configs.sourceHeaders.hls).forEach((key) => {
          xhr.setRequestHeader(key, configs.sourceHeaders.hls[key]);
        });
      };
    }

    const hlsInstance = new Hls(hlsInstanceConfig);
    const playerOptions = plyrOptions(configs);

    hlsInstance.loadSource(configs.source);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function (n, l) {
      const availableQualities = hlsInstance.levels.map((e) => e.height);

      playerOptions.quality = {
        default: availableQualities[0],
        options: availableQualities,
        forced: true,
        onChange: (e) =>
          (function (e) {
            window.hls.levels.forEach((n, i) => {
              n.height === e && (window.hls.currentLevel = i);
            });
          })(e),
      };

      const player = new Plyr(configs.playerElem, playerOptions);
      window[`tplayer_${configs.refId}_player`] = player;
    });

    hlsInstance.attachMedia(configs.playerElem);
    window.hls = hlsInstance;
  } else {
    throw new Error("HLS.js is not supported");
  }
}
