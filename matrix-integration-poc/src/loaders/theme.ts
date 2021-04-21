import { setTheme } from "matrix-react-sdk/src/theme";
import { components } from "../component-index";

export async function loadSkin() {
  const sdk = await import(
    /* webpackChunkName: "matrix-react-sdk" */
    /* webpackPreload: true */
    "matrix-react-sdk"
  );
  sdk.loadSkin({ components });
}

export async function loadTheme() {
  setTheme();
}
