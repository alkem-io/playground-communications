import React from "react";
import "./App.scss";
import ChatView from "./components/Chat";
import MatrixClientContext from "./contexts/matrix-client";
import useMatrixClient from "./hooks/useMatrixClient";
import useMatrixSso from "./hooks/useMatrixSso";
import matrix_config from "./matrix-config.json";
// import MatrixChat from "matrix-react-sdk/src/components/structures/MatrixChat";

function App({ fragParams }) {
  const { userId, authParams, config } = useMatrixSso();
  // need to resolve the CT
  console.log(userId, authParams, config, fragParams);
  const client = useMatrixClient({
    options: userId
      ? { ...matrix_config, userId, accessToken: config.accessToken }
      : null,
  });

  if (!authParams) {
    return <div>Matrix client loading</div>;
  }

  return (
    <MatrixClientContext.Provider value={client}>
      <ChatView />
    </MatrixClientContext.Provider>
  );
}

export default App;
