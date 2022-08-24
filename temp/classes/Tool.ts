export class Tool {
  code: Function;
  constructor(code: Function) {
    this.code = code;
  }

  execute(args: any[]) {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(await this.code(...args));
      } catch (e) {
        reject(e);
      }
    });
  }
}
