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
        dir.addChildFile(file);
        store.root.addChildFile(dir);

        expect(store.root.getChildFile('dir')).toBe(dir);
        expect(dir.getChildFile('file.txt')).toBe(file);
    });

    test('should set and get content of a text file', () => {
        const file = new TextFileEntry('file.txt', 'initial');
        file.setContent('updated');
        expect(file.getContent()).toBe('updated');
    });

    test('should remove a child file', () => {
        const dir = new DirectoryFileEntry('dir');
        const file = new TextFileEntry('file.txt', 'data');
        dir.addChildFile(file);
        expect(dir.getChildFile('file.txt')).toBe(file);
        dir.removeChildFile(file);
        expect(dir.getChildFile('file.txt')).toBe(null);
    });

    test('should save and load the file system', () => {
        const dir = new DirectoryFileEntry('dir');
        const file = new TextFileEntry('file.txt', 'data');
        dir.addChildFile(file);
        store.root.addChildFile(dir);

        store.sync(); // Save state to local storage

        const newStore = new FileStore(new FileStoreProvider());
        newStore.load(); // Load state from local storage

        const loadedDir = newStore.root.getChildFile('dir');
        const loadedFile = loadedDir.getChildFile('file.txt');

        expect(loadedDir).toBeDefined();
        expect(loadedFile.getContent()).toBe('data');
    });
});
