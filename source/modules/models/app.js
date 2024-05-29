import {FileStore, FileStoreProvider, DirectoryFileEntry, TextFileEntry } from "./fileStore.js";

class App {
  constructor() {
    this.store = new FileStore(new FileStoreProvider(window.localStorage));
    const dir = new DirectoryFileEntry('dir');
    const file = new TextFileEntry('file.txt', 'data');
    dir.add_child_file(file);
    this.store.root.add_child_file(dir);
  }

  get_file_store() {
    return this.store;
  }
}

const app_instance = new App();
export default app_instance;
