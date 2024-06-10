import {
  FileStore,
  FileStoreProvider,
  DirectoryFileEntry,
  TextFileEntry,
  FileEntry,
} from "../../source/modules/models/fileStore.js";

describe("FileStore System", () => {
  let store;
  let provider;

  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      storage: {},
      setItem: function (key, value) {
        this.storage[key] = value;
      },
      getItem: function (key) {
        return this.storage[key] || null;
      },
    };
    provider = new FileStoreProvider(global.localStorage);
    store = new FileStore(provider);
  });

  test("FileStoreProvider save and load", () => {
    const data = JSON.stringify({ key: "value" });
    provider.save(data);
    expect(provider.load()).toBe(data);
  });

  test("FileEntry methods", () => {
    const fileEntry = new FileEntry("fileEntry");
    expect(fileEntry.getName()).toBe("fileEntry");
    expect(fileEntry.getPath()).toBe("fileEntry");
    expect(fileEntry.getType()).toBe("file");
  });

  test("DirectoryFileEntry getChildFiles and getChildren", () => {
    const dir = new DirectoryFileEntry("dir");
    const file1 = new TextFileEntry("file1.txt", "data1");
    const file2 = new TextFileEntry("file2.txt", "data2");
    dir.addChildFile(file1);
    dir.addChildFile(file2);
    expect(dir.getChildFiles()).toEqual({
      "file1.txt": file1,
      "file2.txt": file2,
    });
    expect(dir.getChildren()).toEqual([file1, file2]);
  });

  test("FileStore create and delete file", () => {
    store.createDirectory("dir");
    store.createFile("dir/file.txt");
    const file = store.getFile("dir/file.txt");
    expect(file).toBeDefined();
    expect(file.getName()).toBe("file.txt");
    store.deleteFile("dir/file.txt");
    expect(store.getFile("dir/file.txt")).toBeNull();
  });

  test("FileStore create and get directory", () => {
    const dir = store.createDirectory("dir");
    expect(dir).toBeDefined();
    expect(dir.getName()).toBe("dir");
    const retrievedDir = store.getFile("dir");
    expect(retrievedDir).toBeDefined();
    expect(retrievedDir.getName()).toBe("dir");
    expect(retrievedDir.getType()).toBe("directory");
    expect(retrievedDir.getPath()).toBe("/dir"); // Adjusted to check the full path
  });

  test("FileStore getFiles and getFilesInPath", () => {
    const dir = store.createDirectory("dir");
    const file1 = store.createFile("dir/file1.txt");
    const file2 = store.createFile("dir/file2.txt");

    const allFiles = store.getFiles();
    expect(allFiles.length).toBe(4); // root, dir, file1, file2
    expect(allFiles).toEqual(
      expect.arrayContaining([store.root, dir, file1, file2]),
    );

    const filesInPath = store.getFilesInPath("dir");
    expect(filesInPath.length).toBe(2); // file1, file2
    expect(filesInPath).toEqual(expect.arrayContaining([file1, file2]));
  });

  test("FileStore searchFiles", () => {
    store.createDirectory("dir");
    const file1 = store.createFile("dir/file1.txt");
    file1.setContent("This is a test file.");
    const file2 = store.createFile("dir/file2.txt");
    file2.setContent("Another test file.");

    const results = store.searchFiles("test");
    expect(results).toContain(file1);
    expect(results).toContain(file2);

    const results2 = store.searchFiles("Another");
    expect(results2).toContain(file2);
    expect(results2).not.toContain(file1);
  });

  test("FileStore moveFile", () => {
    // Create initial directories and files
    const sourceDir = store.createDirectory("source");
    const destDir = store.createDirectory("dest");
    const file = store.createFile("source/file.txt");

    expect(sourceDir).toBeDefined();
    expect(destDir).toBeDefined();
    expect(file).toBeDefined();

    // Move the file from 'source' to 'dest'
    const moved = store.moveFile(file, destDir);

    // Check if the move was successful
    expect(moved).toBe(true);
    expect(store.getFile("source/file.txt")).toBeNull();
    expect(store.getFile("dest/file.txt")).toBeDefined();
    expect(store.getFile("dest/file.txt").getName()).toBe("file.txt");
    expect(store.getFile("dest/file.txt").parent).toBe(destDir);
  });

  test("FileStore sortFiles natural order", () => {
    const dir = store.createDirectory("dir");
    const subdir1 = store.createDirectory("dir/subdir1");
    const subdir2 = store.createDirectory("dir/subdir2");
    const file1 = store.createFile("dir/file1.txt");
    const file2 = store.createFile("dir/file2.txt");
    const file10 = store.createFile("dir/file10.txt");
    const file20 = store.createFile("dir/file20.txt");

    store.sortFiles();

    const filesInRoot = store.getFilesInPath("");
    const filesInDir = store.getFilesInPath("dir");

    // Check sorting in root (should be: root -> dir)
    expect(filesInRoot.map((file) => file.getName())).toEqual(["dir"]);

    // Check sorting in 'dir' (should be: subdir1, subdir2, file1, file2, file10, file20)
    expect(filesInDir.map((file) => file.getName())).toEqual([
      "subdir1",
      "subdir2",
      "file1.txt",
      "file2.txt",
      "file10.txt",
      "file20.txt",
    ]);
  });
});
