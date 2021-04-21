import serverConfig from "../server-config.json";

export interface IMatrixConfigurationProvider {
  getSharedKey(): string;
  getClientConfiguration(): {
    baseUrl: string;
    idBaseUrl: string;
  };
}

export class MatrixJsonConfigurationProvider
  implements IMatrixConfigurationProvider {
  private _clientConfiguration: {
    baseUrl: string;
    idBaseUrl: string;
  };

  constructor() {
    this._clientConfiguration = {
      baseUrl: serverConfig.baseUrl,
      idBaseUrl: serverConfig.idBaseUrl,
    };
  }

  getSharedKey(): string {
    return serverConfig.shared_secret;
  }

  getClientConfiguration(): { baseUrl: string; idBaseUrl: string } {
    return this._clientConfiguration;
  }
}

export interface IMatrixUser {
  name: string;
  username: string;
  password: string;
}

export interface IOperationalMatrixUser extends IMatrixUser {
  accessToken: string;
}
