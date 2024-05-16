// filestore.test.js

const { FileStore, FileStoreProvider, DirectoryFileEntry, TextFileEntry } = require('./fileStore');

describe('FileStore System', () => {
    let store;

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
        store = new FileStore(new FileStoreProvider(global.localStorage));
    });

    test('should create a text file and directory', () => {
        const dir = new DirectoryFileEntry('dir');
        const file = new TextFileEntry('file.txt', 'data');
        dir.add_child_file(file);
        store.root.add_child_file(dir);

        expect(store.root.get_child_file('dir')).toBe(dir);
        expect(dir.get_child_file('file.txt')).toBe(file);
    });

    test('should set and get content of a text file', () => {
        const file = new TextFileEntry('file.txt', 'initial');
        file.set_content('updated');
        expect(file.get_content()).toBe('updated');
    });

    test('should remove a child file', () => {
        const dir = new DirectoryFileEntry('dir');
        const file = new TextFileEntry('file.txt', 'data');
        dir.add_child_file(file);
        expect(dir.get_child_file('file.txt')).toBe(file);
        dir.remove_child_file(file);
        expect(dir.get_child_file('file.txt')).toBe(null);
    });

    test('should save and load the file system', () => {
        const dir = new DirectoryFileEntry('dir');
        const file = new TextFileEntry('file.txt', 'data');
        dir.add_child_file(file);
        store.root.add_child_file(dir);

        store.sync(); // Save state to local storage

        const newStore = new FileStore(new FileStoreProvider());
        newStore.load(); // Load state from local storage

        const loadedDir = newStore.root.get_child_file('dir');
        const loadedFile = loadedDir.get_child_file('file.txt');

        expect(loadedDir).toBeDefined();
        expect(loadedFile.get_content()).toBe('data');
    });
});
