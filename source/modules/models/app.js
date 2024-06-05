import {FileStore, FileStoreProvider, DirectoryFileEntry, TextFileEntry } from "./fileStore.js";

class App {
  constructor() {
    try{
      this.store = new FileStore(new FileStoreProvider(window.localStorage));
      this.store.load();
    }
   catch {
    
   }
    // const dir = new DirectoryFileEntry('dir');
    // const file = new TextFileEntry('file.txt', 'data');

    // dir.add_child_file(file);
    // const dir2 = new DirectoryFileEntry('dir2');
    // dir.add_child_file(dir2);
    // const file2 = new TextFileEntry('inner.txt', 'data2');
    // dir2.add_child_file(file2);
    // this.store.root.add_child_file(dir);
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
