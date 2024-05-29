// fileStore.js

class FileStoreProvider {
    /**
     * Represents a FileStoreProvider.
     * @constructor
     * @param {Object} localStorage - The local storage object for saving/loading data.
     */
    constructor(localStorage) {
        this.localStorage = localStorage;
    }

    /**
     * Save data to local storage.
     * @param {string} data - The data to be saved.
     */
    save(data) {
        this.localStorage.setItem("filestore", data);
    }

    /**
     * Load data from local storage.
     * @returns {string} The loaded data.
     */
    load() {
        return this.localStorage.getItem("filestore");
    }
}

class FileEntry {
    /**
     * Represents a FileEntry.
     * @constructor
     * @param {string} name - The name of the file.
     * @param {DirectoryFileEntry} [parent=null] - The parent directory of the file.
     */
    constructor(name, parent = null) {
        this.name = name;
        this.parent = parent;
    }

    /**
     * Get the name of the file entry.
     * @returns {string} The name of the file entry.
     */
    get_name() {
        return this.name;
    }

    /**
     * Get the path of the file entry.
     * @returns {string} The path of the file entry.
     */
    get_path() {
        return this.parent ? `${this.parent.get_path()}/${this.name}` : this.name;
    }

    /**
     * Get the type of the file entry.
     * @returns {string} The type of the file entry ('file').
     */
    get_type() {
        return 'file';
    }
}

class DirectoryFileEntry extends FileEntry {
    /**
     * Represents a DirectoryFileEntry.
     * @constructor
     * @param {string} name - The name of the directory.
     * @param {DirectoryFileEntry} [parent=null] - The parent directory.
     */
    constructor(name, parent = null) {
        super(name, parent);
        this.children = {};
    }

    /**
     * Get the type of the file entry.
     * @returns {string} The type of the file entry ('directory').
     */
    get_type() {
        return 'directory';
    }

    /**
     * Add a child file to the directory.
     * @param {FileEntry} file - The file to be added as a child.
     */
    add_child_file(file) {
        this.children[file.name] = file;
        file.parent = this;
    }

    /**
     * Get a child file by name.
     * @param {string} name - The name of the child file.
     * @returns {FileEntry|null} The child file entry, or null if not found.
     */
    get_child_file(name) {
        return this.children[name] || null;
    }

    /**
     * Get all child files.
     * @returns {Object} An object containing all child files.
     */
    get_child_files() {
        return this.children;
    }

    /**
     * Remove a child file from the directory.
     * @param {FileEntry} file - The file to be removed.
     */
    remove_child_file(file) {
        delete this.children[file.name];
    }

    /**
     * Get all children of the directory.
     * @returns {FileEntry[]} An array of all child file entries.
     */
    get_children() {
        return Object.values(this.children);
    }
}

class TextFileEntry extends FileEntry {
    /**
     * Represents a TextFileEntry.
     * @constructor
     * @param {string} name - The name of the text file.
     * @param {string} [content=''] - The content of the text file.
     * @param {DirectoryFileEntry} [parent=null] - The parent directory.
     */
    constructor(name, content = '', parent = null) {
        super(name, parent);
        this.content = content;
    }

    /**
     * Get type of the file entry.
     * @returns {string} The type of the file entry ('text').
     */
    get_type() {
        return 'text';
    }

    /**
     * Get the content of the text file.
     * @returns {string} The content of the text file.
     */
    get_content() {
        return this.content;
    }

    /**
     * Set the content of the text file.
     * @param {string} content - The new content of the text file.
     */
    set_content(content) {
        this.content = content;
    }
}


class FileStore {
    /**
     * Represents a FileStore.
     * @constructor
     * @param {Object} provider - The provider for saving/loading data.
     */
    constructor(provider) {
        this.provider = provider;
        this.root = new DirectoryFileEntry('root');
    }

  
    /**
     * Serialize the file structure to JSON.
     * @returns {string} JSON representation of the file structure.
     * @private
     */
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

    /**
     * Deserialize JSON back to file structure.
     * @param {string} json - JSON representation of the file structure.
     * @private
     */
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

    /**
     * Save the current file structure to the provider.
     */
    sync() {
        const json = this._saveToJSON();
        this.provider.save(json);
    }

    /**
     * Load the file structure from the provider.
     */
    load() {
        const json = this.provider.load();
        if (json) {
            this._loadFromJSON(json);
        }
    }

    /**
     * Search for files whose names or contents contain the specified keyword.
     * @param {string} keyword - The keyword to search for.
     * @returns {FileEntry[]} An array of matching file entries.
     */
    search_files(keyword) {
        const results = [];
    
        const search = (entry) => {
        if (entry.get_name().includes(keyword) || (entry instanceof TextFileEntry && entry.get_content().includes(keyword))) {
                results.push(entry);
            }
            if (entry instanceof DirectoryFileEntry) {
                for (const child of entry.get_children()) {
                    search(child);
                }
            }
        };
    
        search(this.root);
        return results;
    }

    /**
     * Create a file at the specified path.
     * @param {string} path - The path where the file will be created.
     * @returns {FileEntry} The created file entry, or null if the path is invalid.
     */
     create_file(path) {
        const segments = path.split('/');
        const fileName = segments.pop();
        const directory = this.get_file(segments.join('/'));
        
        if (directory && directory.get_type() === 'directory') {
            const file = new TextFileEntry(fileName, '', directory);
            directory.add_child_file(file);
            return file;
        }
        return null;
    }

    /**
     * Create a directory at the specified path.
     * @param {string} path - The path where the directory will be created.
     * @returns {DirectoryFileEntry} The created directory entry, or null if the path is invalid.
     */
    create_directory(path) {
        const segments = path.split('/');
        const dirName = segments.pop();
        const parentDirectory = this.get_file(segments.join('/'));

        if (parentDirectory && parentDirectory.get_type() === 'directory') {
            const directory = new DirectoryFileEntry(dirName, parentDirectory);
            parentDirectory.add_child_file(directory);
            return directory;
        }
        return null;
    }

    /**
     * Delete a file at the specified path.
     * @param {string} path - The path of the file to delete.
     */
    delete_file(path) {
        const file = this.get_file(path);
        if (file && file.parent) {
            file.parent.remove_child_file(file);
        }
    }

    /**
     * Get the file entry corresponding to the path.
     * @param {string} path - The path of the file entry.
     * @returns {FileEntry} The file entry, or null if it doesn't exist.
     */
    get_file(path) {
        const segments = path.split('/');
        let current = this.root;
    
        for (const segment of segments) {
            if (segment === '') continue; // Skip empty segments (e.g., leading slash)
            if (current instanceof DirectoryFileEntry) {
                current = current.get_child_file(segment);
                if (!current) {
                    return null;
                }
            } else {
                return null;
            }
        }
        return current;
    }
    

    /**
     * List every file within the entire file system.
     * @returns {FileEntry[]} An array of all file entries.
     */
    get_files() {
        const results = [];
        const traverse = (entry) => {
            results.push(entry);
            if (entry instanceof DirectoryFileEntry) {
                for (const child of entry.get_children()) {
                    traverse(child);
                }
            }
        };
        traverse(this.root);
        return results;
    }

    /**
     * List every file in the specified directory.
     * @param {string} path - The path of the directory.
     * @returns {FileEntry[]} An array of file entries in the specified directory.
     */
    get_files_in_path(path) {
        const directory = this.get_file(path);
        if (directory && directory.get_type() === 'directory') {
            return directory.get_children();
        }
        return [];
    }

    /**
     * Search for files whose names or contents contain the specified keyword.
     * @param {string} keyword - The keyword to search for.
     * @returns {FileEntry[]} An array of matching file entries.
     */
    search_files(keyword) {
        const results = [];

        const search = (entry) => {
            if (entry.get_name().includes(keyword) || (entry instanceof TextFileEntry && entry.get_content().includes(keyword))) {
                results.push(entry);
            }
            if (entry instanceof DirectoryFileEntry) {
                for (const child of entry.get_children()) {
                    search(child);
                }
            }
        };

        search(this.root);
        return results;
    }
}

export { FileStore, FileStoreProvider, FileEntry, DirectoryFileEntry, TextFileEntry };
