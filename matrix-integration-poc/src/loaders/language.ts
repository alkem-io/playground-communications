import * as languageHandler from "matrix-react-sdk/src/languageHandler";
import SettingsStore from "matrix-react-sdk/src/settings/SettingsStore";

export async function loadLanguage() {
  const prefLang = SettingsStore.getValue(
    "language",
    null,
    /*excludeDefault=*/ true
  );
  let langs = [];

  if (!prefLang) {
    languageHandler.getLanguagesFromBrowser().forEach((l) => {
      langs.push(...languageHandler.getNormalizedLanguageKeys(l));
    });
  } else {
    langs = [prefLang];
  }
  try {
    await languageHandler.setLanguage(langs);
    document.documentElement.setAttribute(
      "lang",
      languageHandler.getCurrentLanguage()
    );
  } catch (e) {
    console.error("Unable to set language", e);
  }
}
