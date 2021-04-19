import { MatrixClient } from "matrix-js-sdk/src/client";
import * as Lifecycle from "matrix-react-sdk/src/Lifecycle";
import PlatformPegRoot from "matrix-react-sdk/src/PlatformPeg";
import SdkConfig from "matrix-react-sdk/src/SdkConfig";
import { ParsedUrlQuery } from "node:querystring";
import { useEffect, useState } from "react";
import createMatrixClient from "../loaders/matrix";
import { getScreenFromLocation, parseQs } from "../utils/query";

export default function useMatrixSso(): MatrixClient {
  const [userId, setUserId] = useState<string>();
  const [authParams, setAuthParams] = useState<ParsedUrlQuery>();
  const config = SdkConfig.get();

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const [userId] = await Lifecycle.getStoredSessionOwner();
        const params = parseQs(window.location);

        const hasPossibleToken = !!userId;
        const isReturningFromSso = !!params.loginToken;
        const autoRedirect = config["sso_immediate_redirect"] === true;
        if (!hasPossibleToken && !isReturningFromSso && autoRedirect) {
          console.log("Bypassing app load to redirect to SSO");
          const tempCli = createMatrixClient({
            options: {
              baseUrl: config["validated_server_config"].hsUrl,
              idBaseUrl: config["validated_server_config"].isUrl,
            },
          });
          PlatformPegRoot.get().startSingleSignOn(
            tempCli,
            "sso",
            `/${getScreenFromLocation(window.location).screen}`
          );
          // We return here because startSingleSignOn() will asynchronously redirect us. We don't
          // care to wait for it, and don't want to show any UI while we wait (not even half a welcome
          // page). As such, just don't even bother loading the MatrixChat component.
          return;
        } else {
          setUserId(userId);
          setAuthParams(params);
        }
      } catch (ex) {
        console.error(ex);
      }
    }

    bootstrapSession();
  });

  return { userId, authParams, config };
}
