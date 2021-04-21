import * as Lifecycle from "matrix-react-sdk/src/Lifecycle";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import React, { useEffect, useState } from "react";

export default function LoginContainer({
  config,
  authParams,
  startingFragmentQueryParams,
  onTokenLoginCompleted,
  children,
}) {
  const isSoftLogout = Lifecycle.isSoftLogout();
  const [hasToken, setHasToken] = useState<Boolean>(false);

  useEffect(() => {
    async function performLogin() {
      if (isSoftLogout) {
        await Lifecycle.loadSession();
      } else {
        const loggedIn = await Lifecycle.attemptTokenLogin(
          authParams,
          "cherrytwist-client",
          "/"
        );

        if (authParams?.loginToken) {
          onTokenLoginCompleted();
        }

        if (loggedIn) {
          setHasToken(true);
          // Create and start the client
          await Lifecycle.restoreFromLocalStorage({
            ignoreGuest: true,
          });

          const client = MatrixClientPeg.get();
          console.log("created client", client);
        }
      }
    }

    performLogin();
  }, [isSoftLogout, authParams, onTokenLoginCompleted, setHasToken]);

  if (!hasToken) {
    return <div>Attempting to resolve token</div>;
  }

  return <>{children}</>;
}
