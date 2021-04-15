import React from "react";
import "./App.css";
import ChatView from "./components/Chat";
import MatrixClientContext from "./contexts/matrix-client";
import useMatrixClient from "./hooks/useMatrixClient";
import matrix_config from "./matrix-config.json";

function App() {
  const client = useMatrixClient({ options: matrix_config });

  return (
    <MatrixClientContext.Provider value={client}>
      <ChatView />
    </MatrixClientContext.Provider>
  );
}

export default App;
