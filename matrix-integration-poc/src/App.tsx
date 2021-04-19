import React, { useEffect } from "react";
import "./App.css";
import ChatView from "./components/Chat";
import MatrixClientContext from "./contexts/matrix-client";
import useMatrixClient from "./hooks/useMatrixClient";
import useMatrixSso from "./hooks/useMatrixSso";
import matrix_config from "./matrix-config.json";
import * as sdk from "matrix-react-sdk";
import PlatformPeg from "matrix-react-sdk/src/PlatformPeg";
import { getScreenFromLocation } from "./utils/query";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
// import MatrixChat from "matrix-react-sdk/src/components/structures/MatrixChat";

let lastLocationHashSet: string = null;
function onNewScreen(screen: string, replaceLast = false) {
  console.log("newscreen " + screen);
  const hash = "#/" + screen;
  lastLocationHashSet = hash;

  if (replaceLast) {
    window.location.replace(hash);
  } else {
    window.location.assign(hash);
  }
}
// We use this to work out what URL the SDK should
// pass through when registering to allow the user to
// click back to the client having registered.
// It's up to us to recognise if we're loaded with
// this URL and tell MatrixClient to resume registration.
//
// If we're in electron, we should never pass through a file:// URL otherwise
// the identity server will try to 302 the browser to it, which breaks horribly.
// so in that instance, hardcode to use app.element.io for now instead.
function makeRegistrationUrl(params: object) {
  let url;
  if (window.location.protocol === "vector:") {
    url = "https://app.element.io/#/register";
  } else {
    url =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "#/register";
  }

  const keys = Object.keys(params);
  for (let i = 0; i < keys.length; ++i) {
    if (i === 0) {
      url += "?";
    } else {
      url += "&";
    }
    const k = keys[i];
    url += k + "=" + encodeURIComponent(params[k]);
  }
  return url;
}
function onTokenLoginCompleted() {
  // if we did a token login, we're now left with the token, hs and is
  // url as query params in the url; a little nasty but let's redirect to
  // clear them.
  const url = new URL(window.location.href);

  url.searchParams.delete("loginToken");

  console.log(`Redirecting to ${url.href} to drop loginToken from queryparams`);
  window.history.replaceState(null, "", url.href);
}

const MatrixChat = sdk.getComponent("structures.MatrixChat");

function App({ fragParams }) {
  const { authParams, config } = useMatrixSso();
  // const client = useMatrixClient({
  //   options: userId
  //     ? { ...matrix_config, userId, accessToken: authParams.loginToken }
  //     : null,
  // });

  const platform = PlatformPeg.get();
  const client = MatrixClientPeg.get();

  useEffect(() => {
    if (client) {
      client?.getRooms().forEach((room, i) => {
        console.log("room", i, room);
      });
    }
  }, [client]);

  if (!authParams) {
    return <div>Matrix client loading</div>;
  }

  return (
    <MatrixChat
      onNewScreen={onNewScreen}
      makeRegistrationUrl={makeRegistrationUrl}
      config={config}
      realQueryParams={authParams}
      startingFragmentQueryParams={fragParams}
      enableGuest={!config.disable_guests}
      onTokenLoginCompleted={onTokenLoginCompleted}
      initialScreenAfterLogin={getScreenFromLocation(window.location)}
      defaultDeviceDisplayName={platform.getDefaultDeviceDisplayName()}
    />
  );

  // return (
  //   <MatrixClientContext.Provider value={client}>
  //     <ChatView />
  //   </MatrixClientContext.Provider>
  // );
}

export default App;
