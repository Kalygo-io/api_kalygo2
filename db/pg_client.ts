export class PGClient {
  static pgInstance: any;

  static connectPG() {
    try {
      // const pgClient = new algosdk.Algodv2(
      //   network === "localhost"
      //     ? supportedNetworks[network]?.algod.token
      //     : {
      //         "X-API-key": supportedNetworks[network]?.algod.token,
      //       },
      //   supportedNetworks[network]?.algod.server,
      //   supportedNetworks[network]?.algod.port
      // );

      PGClient.pgInstance = null;
    } catch (err: any) {
      console.log(err.stack);
      PGClient.pgInstance = null;
    }
  }

  static setPG() {
    PGClient.connectPG();
  }

  static getPG(): any {
    if (PGClient.pgInstance) {
      return PGClient.pgInstance;
    } else {
      console.log("connectPG");

      PGClient.connectPG();
      return PGClient.pgInstance;
    }
  }
}
