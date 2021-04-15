import { createClient, ICreateClientOpts } from "matrix-js-sdk";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { useEffect, useState } from "react";

export default function useMatrixClient({
  options,
}: {
  options: ICreateClientOpts;
}): MatrixClient {
  const [client, setClient] = useState<MatrixClient>();

  useEffect(() => {
    async function bootstrapClient() {
      const matrix_client = createClient(options);
      await matrix_client.startClient();

      matrix_client.once("sync", function (state, prevState, res) {
        setClient(matrix_client);
        console.info("state", state, prevState, res); // state will be 'PREPARED' when the client is ready to use
      });
    }

    if (!client) {
      bootstrapClient();
    }
  });

  return client;
}
