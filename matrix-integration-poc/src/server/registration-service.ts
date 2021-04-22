import {
  IMatrixConfigurationProvider,
  IMatrixUser,
  IOperationalMatrixUser,
} from "./matrix-configuration-provider";
import { MatrixCryptographyProvider } from "./matrix-cryptography-provider";

class SynapseEndpoints {
  static REGISTRATION: string = "/_synapse/admin/v1/register";
}

export class MatrixRegistrationService {
  constructor(
    private configurationProvider: IMatrixConfigurationProvider,
    private cryptographyProvider: MatrixCryptographyProvider
  ) {}

  async register(user: IMatrixUser): Promise<IOperationalMatrixUser> {
    const url = `${
      this.configurationProvider.getClientConfiguration().baseUrl
    }${SynapseEndpoints.REGISTRATION}`;

    const nonceResponse = await fetch(url);
    const nonce = (await nonceResponse.json())["nonce"];

    const hmac = this.cryptographyProvider.generateUserHmac(user, nonce);

    const registrationResponse = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        nonce,
        username: user.name,
        password: user.password,
        mac: hmac,
      }),
    });
    
    if (
      registrationResponse.status >= 400 &&
      registrationResponse.status < 600
    ) {
      throw new Error("Bad response from server");
    }

    const response = await registrationResponse.json();

    return {
      name: user.name,
      password: user.password,
      username: response.user_id,
      accessToken: response.access_token,
    };
  }
}
