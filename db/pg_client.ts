export class PGClient {
  static pgInstance: any;

  static connectPG() {
    try {
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
      PGClient.connectPG();
      return PGClient.pgInstance;
    }
  }
}
