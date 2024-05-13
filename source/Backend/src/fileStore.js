// fileStore.js

class FileStoreProvider {
    constructor() {}

    save(data) {
        localStorage.setItem("filestore", data);
    }

    load() {
        return localStorage.getItem("filestore");
    }
}

class FileEntry {
    constructor(name, parent = null) {
        this.name = name;
        this.parent = parent;
    }

    getPath() {
        return this.parent ? `${this.parent.getPath()}/${this.name}` : this.name;
    }

    getType() {
        return 'file';
    }
}

class DirectoryFileEntry extends FileEntry {
    constructor(name, parent = null) {
        super(name, parent);
        this.children = {};
    }

    getType() {
        return 'directory';
    }

    addChildFile(file) {
        this.children[file.name] = file;
        file.parent = this;
    }

    getChildFile(name) {
        return this.children[name] || null;
    }

    removeChildFile(file) {
        delete this.children[file.name];
    }

    getChildren() {
        return Object.values(this.children);
    }
}

class TextFileEntry extends FileEntry {
    constructor(name, content = '', parent = null) {
        super(name, parent);
        this.content = content;
    }

    getType() {
        return 'text';
    }

    getContent() {
        return this.content;
    }

    setContent(content) {
        this.content = content;
    }
}

class FileStore {
    constructor(provider) {
        this.provider = provider;
        this.root = new DirectoryFileEntry('root');
    }

    _saveToJSON() {
        const serialize = (entry) => {
            const obj = {
                name: entry.name,
                type: entry.getType(),
                content: entry.content || '',
                children: entry.children ? Object.values(entry.children).map(serialize) : undefined
            };
            return obj;
        };
        return JSON.stringify(serialize(this.root));
    }

    _loadFromJSON(json) {
        const deserialize = (obj, parent = null) => {
            const entry = obj.type === 'directory' ? new DirectoryFileEntry(obj.name, parent) : new TextFileEntry(obj.name, obj.content, parent);
            if (entry.getType() === 'directory' && obj.children) {
                obj.children.forEach(childObj => entry.addChildFile(deserialize(childObj, entry)));
            }
            return entry;
        };

        this.root = deserialize(JSON.parse(json));
    }

    sync() {
        const json = this._saveToJSON();
        this.provider.save(json);
    }

    load() {
        const json = this.provider.load();
        if (json) {
            this._loadFromJSON(json);
        }
    }
}

// Exporting modules
module.exports = { FileStore, FileStoreProvider, DirectoryFileEntry, TextFileEntry };
