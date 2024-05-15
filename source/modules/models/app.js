import {FileStore, FileStoreProvider, DirectoryFileEntry, TextFileEntry } from "../../Backend/src/fileStore.js";

class App {
  constructor() {
    this.store = new FileStore(new FileStoreProvider(window.localStorage));
    const dir = new DirectoryFileEntry('dir');
    const file = new TextFileEntry('file.txt', 'data');
    dir.addChildFile(file);
    this.store.root.addChildFile(dir);
  }

  get_file_store() {
    return this.store;
  }
}

const app_instance = new App();
export default app_instance;
