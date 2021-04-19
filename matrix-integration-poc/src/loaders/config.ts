import SdkConfig from "matrix-react-sdk/src/SdkConfig";
import PlatformPeg from "matrix-react-sdk/src/PlatformPeg";

export default async function loadConfig() {
  SdkConfig.put(await PlatformPeg.get().getConfig());
}
