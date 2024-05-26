import {FileStore, FileStoreProvider, DirectoryFileEntry, TextFileEntry } from "./fileStore.js";

class App {
  constructor() {
    this.store = new FileStore(new FileStoreProvider(window.localStorage));
    const dir = new DirectoryFileEntry('dir');
    const file = new TextFileEntry('file.txt', 'data');

    dir.addChildFile(file);
    const dir2 = new DirectoryFileEntry('dir2');
    dir.addChildFile(dir2);
    const file2 = new TextFileEntry('inner.txt', 'data2');
    dir2.addChildFile(file2);
    this.store.root.addChildFile(dir);
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
