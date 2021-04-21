import { ICreateClientOpts } from "matrix-js-sdk";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import createMatrixClient from "matrix-react-sdk/src/utils/createMatrixClient";
import PlatformPegRoot from "matrix-react-sdk/src/PlatformPeg";
import { useEffect, useState } from "react";
import VectorBasePlatform from "../platform/VectorBasePlatform";
import { createClient } from "matrix-js-sdk/src";

export default function useMatrixClient({
  options,
}: {
  options: ICreateClientOpts | null;
}): MatrixClient {
  const [client, setClient] = useState<MatrixClient>();

  useEffect(() => {
    async function bootstrapClient() {
      let matrix_client: MatrixClient | null = null;

      try {
        // MatrixClientPeg.setIndexedDbWorkerScript(vectorIndexeddbWorkerScript);

        // const platform = PlatformPegRoot.get();
        // (platform as VectorBasePlatform).startUpdater();

        matrix_client = createClient(options);
        // await matrix_client.startClient();
        // await matrix_client.initCrypto();
        setClient(matrix_client);
      } catch (ex) {
        console.error(ex);
      }

      matrix_client?.once("sync", function (state, prevState, res) {
        console.info("state", state, prevState, res); // state will be 'PREPARED' when the client is ready to use
      });
    }

    if (!client && options) {
      bootstrapClient();
    }
  });

  return client;
}
