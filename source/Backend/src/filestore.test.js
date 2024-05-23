const { FileStore, FileStoreProvider, DirectoryFileEntry, TextFileEntry, FileEntry } = require('./fileStore.js');

describe('FileStore System', () => {
    let store;
    let provider;

    beforeEach(() => {
        // Mock localStorage
        global.localStorage = {
            storage: {},
            setItem: function(key, value) {
                this.storage[key] = value;
            },
            getItem: function(key) {
                return this.storage[key] || null;
            }
        };
        provider = new FileStoreProvider(global.localStorage);
        store = new FileStore(provider);
    });

    test('FileStoreProvider save and load', () => {
        const data = JSON.stringify({ key: 'value' });
        provider.save(data);
        expect(provider.load()).toBe(data);
    });

    test('FileEntry methods', () => {
        const fileEntry = new FileEntry('fileEntry');
        expect(fileEntry.get_name()).toBe('fileEntry');
        expect(fileEntry.get_path()).toBe('fileEntry');
        expect(fileEntry.get_type()).toBe('file');
    });

    test('DirectoryFileEntry get_child_files and get_children', () => {
        const dir = new DirectoryFileEntry('dir');
        const file1 = new TextFileEntry('file1.txt', 'data1');
        const file2 = new TextFileEntry('file2.txt', 'data2');
        dir.add_child_file(file1);
        dir.add_child_file(file2);
        expect(dir.get_child_files()).toEqual({ 'file1.txt': file1, 'file2.txt': file2 });
        expect(dir.get_children()).toEqual([file1, file2]);
    });

    test('FileStore create and delete file', () => {
        store.create_directory('dir');
        store.create_file('dir/file.txt');
        const file = store.get_file('dir/file.txt');
        expect(file).toBeDefined();
        expect(file.get_name()).toBe('file.txt');
        store.delete_file('dir/file.txt');
        expect(store.get_file('dir/file.txt')).toBeNull();
    });

    test('FileStore create and get directory', () => {
        const dir = store.create_directory('dir');
        expect(dir).toBeDefined();
        expect(dir.get_name()).toBe('dir');
        const retrievedDir = store.get_file('dir');
        expect(retrievedDir).toBeDefined();
        expect(retrievedDir.get_name()).toBe('dir');
        expect(retrievedDir.get_type()).toBe('directory');
        expect(retrievedDir.get_path()).toBe('root/dir');  // Adjusted to check the full path
    });

    test('FileStore get_files and get_files_in_path', () => {
        const dir = store.create_directory('dir');
        const file1 = store.create_file('dir/file1.txt');
        const file2 = store.create_file('dir/file2.txt');

        const allFiles = store.get_files();
        expect(allFiles.length).toBe(4); // root, dir, file1, file2
        expect(allFiles).toEqual(expect.arrayContaining([store.root, dir, file1, file2]));

        const filesInPath = store.get_files_in_path('dir');
        expect(filesInPath.length).toBe(2); // file1, file2
        expect(filesInPath).toEqual(expect.arrayContaining([file1, file2]));
    });

    test('FileStore search_files', () => {
        const dir = store.create_directory('dir');
        const file1 = store.create_file('dir/file1.txt');
        file1.set_content('This is a test file.');
        const file2 = store.create_file('dir/file2.txt');
        file2.set_content('Another test file.');

        const results = store.search_files('test');
        expect(results).toContain(file1);
        expect(results).toContain(file2);

        const results2 = store.search_files('Another');
        expect(results2).toContain(file2);
        expect(results2).not.toContain(file1);
    });
});
