import { createClient } from "matrix-js-sdk/src";
import { MatrixClient } from "matrix-js-sdk/src/client";
import {
  IMatrixConfigurationProvider,
  IMatrixUser,
  IOperationalMatrixUser,
} from "./matrix-configuration-provider";

export class MatrixLoginService {
  private _client: MatrixClient;
  constructor(configurationProvider: IMatrixConfigurationProvider) {
    const serverConfig = configurationProvider.getClientConfiguration();

    this._client = createClient({
      baseUrl: serverConfig.baseUrl,
      idBaseUrl: serverConfig.idBaseUrl,
    });
  }

  async login(user: IMatrixUser): Promise<IOperationalMatrixUser> {
    const operationalUser = await new Promise<any>((resolve, reject) =>
      this._client.loginWithPassword(
        user.username,
        user.password,
        (error, response) => {
          if (error) {
            reject(error);
          }
          resolve(response);
        }
      )
    );

    return {
      name: user.name,
      password: user.password,
      username: operationalUser.user_id,
      accessToken: operationalUser.access_token,
    };
  }
}
