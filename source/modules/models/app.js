import {FileStore, FileStoreProvider, DirectoryFileEntry, TextFileEntry } from "./fileStore.js";
class App {
  constructor() {
    this.store = new FileStore(new FileStoreProvider(window.localStorage));
    this.store.load();
  }
  /*
    dir
      dir2
        inner.txt
      file.txt
  */

  get_file_store() {
    return this.store;
  }
}

const app_instance = new App();
export default app_instance;
