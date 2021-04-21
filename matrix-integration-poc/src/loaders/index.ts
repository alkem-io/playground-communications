import { initRageshake, initRageshakeStore } from "./rageshake";
import { loadOlm } from "./olm";
// import { loadTheme } from "./theme";
import loadConfig from "./config";
import { loadLanguage } from "./language";
import PlatformPeg from "matrix-react-sdk/src/PlatformPeg";
import WebPlatform from "../platform/web";
import { parseQsFromFragment } from "../utils/query";

export async function bootstrap() {
  try {
    // await initRageshake();

    const fragparts = parseQsFromFragment(window.location);
    const preventRedirect =
      fragparts.params.client_secret || fragparts.location.length > 0;
    if (!preventRedirect) {
      const isIos =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      if (isIos || isAndroid) {
        if (
          document.cookie.indexOf("element_mobile_redirect_to_guide=false") ===
          -1
        ) {
          window.location.href = "mobile_guide/";
          return;
        }
      }
    }

    await loadOlm();

    PlatformPeg.set(new WebPlatform());

    await loadConfig();
    // await initRageshakeStore();
    await Promise.all([loadLanguage()]);
    // await loadTheme();

    return fragparts;
  } catch (ex) {
    console.log(ex);
  }
}
