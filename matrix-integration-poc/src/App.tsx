import React, { useEffect, useState } from "react";
import "./App.scss";
import ChatView from "./components/Chat";
import MatrixCommunicationFacadeContext from "./contexts/matrix-client";
import { MatrixCommunicationFacade } from "./server/communications-facade";
import { MatrixLoginService } from "./server/login-service";
import {
  IMatrixUser,
  IOperationalMatrixUser,
  MatrixJsonConfigurationProvider,
} from "./server/matrix-configuration-provider";
import { MatrixCryptographyProvider } from "./server/matrix-cryptography-provider";
import { MatrixRegistrationService } from "./server/registration-service";
import users from "./users.json";
// import MatrixChat from "matrix-react-sdk/src/components/structures/MatrixChat";

const configurationProvider = new MatrixJsonConfigurationProvider();
const cryptographyProvider = new MatrixCryptographyProvider(
  configurationProvider
);
const registrationService = new MatrixRegistrationService(
  configurationProvider,
  cryptographyProvider
);
const loginService = new MatrixLoginService(configurationProvider);

function App({ fragParams }) {
  const clients = users.clients as IMatrixUser[];
  const [operators, setOperators] = useState<IOperationalMatrixUser[]>([]);
  const [matrixCommunicators, setMatrixCommunicators] = useState<
    MatrixCommunicationFacade[]
  >([]);

  useEffect(() => {
    async function bootstrapOperators() {
      let users = [];
      for (var client of clients) {
        try {
          console.log(
            `Attempting to register ${client.name} with password ${client.password}`
          );
          const operationalClient = await registrationService.register(client);
          users.push(operationalClient);
        } catch (ex) {
          console.log(
            `The user is already registered, falling back to login ${client.name} with password ${client.password}`
          );
          const operationalClient = await loginService.login(client);
          users.push(operationalClient);
        }
      }

      setOperators(users);
    }

    bootstrapOperators();
  }, [clients, setOperators]);

  useEffect(() => {
    async function boostrapCommunicators() {
      setMatrixCommunicators(
        operators.map(
          (o) => new MatrixCommunicationFacade(o, configurationProvider)
        )
      );
    }

    boostrapCommunicators();

    return () =>
      setMatrixCommunicators((x) => {
        x.forEach((c) => c.dispose());
        return [];
      });
  }, [operators, setMatrixCommunicators]);

  return (
    <div style={{ flexGrow: 1, height: "100%", display: "flex" }}>
      {matrixCommunicators.map((c, i) => (
        <div style={{ flexGrow: 1, height: "100%", display: "flex" }} key={i}>
          <MatrixCommunicationFacadeContext.Provider value={c}>
            <ChatView users={i === 0 ? [operators[1]] : [operators[0]]} />
          </MatrixCommunicationFacadeContext.Provider>
        </div>
      ))}
    </div>
  );
}

export default App;
