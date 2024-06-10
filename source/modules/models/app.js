import {
  FileStore,
  FileStoreProvider,
} from "./fileStore.js";

class App extends EventTarget {
  constructor() {
    super();
    this.store = new FileStore(new FileStoreProvider(window.localStorage));
    this.tabs = [];
    if (!this.store.load()) {
      (async () => {
        const resp = await fetch("assets/data.json");
        const content = await resp.text();
        this.store._loadFromJSON(content);
      })();
    }
  }

  getFileStore() {
    return this.store;
  }

  getCurrentTabs() {
    return this.tabs;
  }

  closeFile(path) {
    this.tabs.splice(this.tabs.indexOf(path), 1);
  }

  openFile(path) {
    if (this.tabs.includes(path)) {
      this.tabs.splice(this.tabs.indexOf(path), 1);
    }
    this.tabs = [path, ...this.tabs];
    this.dispatchEvent(new CustomEvent("tab-open", { detail: { path: path } }));
  }

  async compressImage(file, maxWidth) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const elem = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          elem.width = width;
          elem.height = height;
          const ctx = elem.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(ctx.canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = (e) => {
          reject(e);
        };
        img.src = event.target.result;
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsDataURL(file);
    });
  }
}

const app_instance = new App();
export default app_instance;
