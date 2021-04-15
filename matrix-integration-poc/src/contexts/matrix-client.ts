import { createContext } from "react";
import { MatrixClient } from "matrix-js-sdk/src/client";

const MatrixClientContext = createContext<MatrixClient>(undefined);

export default MatrixClientContext;
