import { createContext } from "react";
import { ICommunicationFacade } from "../server/communications-facade";

const MatrixCommunicationFacadeContext = createContext<ICommunicationFacade>(
  undefined
);

export default MatrixCommunicationFacadeContext;
