import React, { useEffect, useState } from "react";
import "./App.scss";
import useMatrixClient from "./hooks/useMatrixClient";
import matrix_config from "./matrix-config.json";
var CryptoJS = require("crypto-js");
// import MatrixChat from "matrix-react-sdk/src/components/structures/MatrixChat";

function App({ fragParams }) {
  // const { userId, authParams, config } = useMatrixSso();
  // need to resolve the CT
  // console.log(userId, authParams, config, fragParams);
  const [admin, setAdmin] = useState(null);
  const loginClient = useMatrixClient({
    options: { ...matrix_config },
  });

  // if (!authParams) {
  //   return <div>Matrix client loading</div>;
  // }

  useEffect(() => {
    async function login() {
      await loginClient.loginWithPassword(
        "@ct-admin:cherrytwist.matrix.host",
        "ct-admin-pass",
        (error, response) => {
          setAdmin(response);
        }
      );
    }

    if (loginClient) {
      login();
    }
  }, [loginClient]);

  return admin && <AdminApp admin={admin} />;
  // return (
  //   <MatrixClientContext.Provider value={client}>
  //     <ChatView />
  //   </MatrixClientContext.Provider>
  // );
}

export function AdminApp({ admin }) {
  const client = useMatrixClient({
    options: {
      ...matrix_config,
      userId: admin.user_id,
      accessToken: admin.access_token,
    },
  });

  useEffect(() => {
    const username = "nevelichkoff";
    const password = "ct-admin-pass";

    async function register() {
      const url = `${client.baseUrl}/_synapse/admin/v1/register`;
      const r = await fetch(url);
      const rjson = await r.json();
      const nonce = rjson["nonce"];

      let mac = CryptoJS.enc.Utf8.parse(
        "T0.VmXT3PF.=4QwzTw~6ZAJ0MDK:DqP6PUQwCVwe:INH~oU#JA"
      );

      let hmac = new CryptoJS.algo.HMAC.init(CryptoJS.algo.SHA1, mac);
      // hmac.init(CryptoJS.algo.SHA1, mac);

      hmac.update(CryptoJS.enc.Utf8.parse(nonce));
      hmac.update(CryptoJS.enc.Utf8.parse("\x00"));
      hmac.update(CryptoJS.enc.Utf8.parse(username));
      hmac.update(CryptoJS.enc.Utf8.parse("\x00"));
      hmac.update(CryptoJS.enc.Utf8.parse(password));
      hmac.update(CryptoJS.enc.Utf8.parse("\x00"));
      hmac.update("notadmin");

      let hexHmac = CryptoJS.enc.Hex.stringify(hmac.finalize());
      // const hexHmac = toHexString(hmac.digest());
      console.log(mac, hmac, hexHmac);
      const registration = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          nonce,
          username: username,
          password: password,
          mac: hexHmac,
        }),
      });

      const registrationJson = await registration.json();
    }
    if (client) {
      register();
    }
  }, [client, admin]);
  return <div></div>;
}

export default App;
