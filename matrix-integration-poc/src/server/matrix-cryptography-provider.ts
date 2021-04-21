import { IMatrixConfigurationProvider } from "./matrix-configuration-provider";
const CryptoJS = require("crypto-js");

export class MatrixCryptographyProvider {
  constructor(private configurationProvider: IMatrixConfigurationProvider) {}
  generateUserHmac(
    user: { name: string; password: string; isAdmin?: boolean },
    nonce: string
  ) {
    let mac = CryptoJS.enc.Utf8.parse(
      this.configurationProvider.getSharedKey()
    );
    const hmac = new CryptoJS.algo.HMAC.init(CryptoJS.algo.SHA1, mac);

    hmac.update(CryptoJS.enc.Utf8.parse(nonce));
    hmac.update(CryptoJS.enc.Utf8.parse("\x00"));
    hmac.update(CryptoJS.enc.Utf8.parse(user.name));
    hmac.update(CryptoJS.enc.Utf8.parse("\x00"));
    hmac.update(CryptoJS.enc.Utf8.parse(user.password));
    hmac.update(CryptoJS.enc.Utf8.parse("\x00"));
    hmac.update(user.isAdmin ? "admin" : "notadmin");

    return CryptoJS.enc.Hex.stringify(hmac.finalize());
  }
}
