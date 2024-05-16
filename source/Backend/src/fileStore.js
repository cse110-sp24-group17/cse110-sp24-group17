// fileStore.js

class FileStoreProvider {
    constructor(localStorage) {this.localStorage = localStorage}

    save(data) {
        this.localStorage.setItem("filestore", data);
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

    get_path() {
        return this.parent ? `${this.parent.get_path()}/${this.name}` : this.name;
    }

    get_type() {
        return 'file';
    }
}

class DirectoryFileEntry extends FileEntry {
    constructor(name, parent = null) {
        super(name, parent);
        this.children = {};
    }

    get_type() {
        return 'directory';
    }

    add_child_file(file) {
        this.children[file.name] = file;
        file.parent = this;
    }

    get_child_file(name) {
        return this.children[name] || null;
    }

    remove_child_file(file) {
        delete this.children[file.name];
    }

    get_children() {
        return Object.values(this.children);
    }
}

class TextFileEntry extends FileEntry {
    constructor(name, content = '', parent = null) {
        super(name, parent);
        this.content = content;
    }

    get_type() {
        return 'text';
    }

    get_content() {
        return this.content;
    }

    set_content(content) {
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
                type: entry.get_type(),
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
            if (entry.get_type() === 'directory' && obj.children) {
                obj.children.forEach(childObj => entry.add_child_file(deserialize(childObj, entry)));
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

export { FileStore, FileStoreProvider, FileEntry, DirectoryFileEntry, TextFileEntry };
