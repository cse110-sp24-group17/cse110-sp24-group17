import App from "../models/app.js"


/**
* Creates the list of folders/files in file_explorer.html.
* @constructor
*/
class FileExplorerComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.hiddenFiles = [];

        fetch('./modules/file_explorer/file_explorer.html').then(x => x.text()).then(x => {
            this.shadowRoot.innerHTML = x;
            this.render();
        })
    }

    render() {
       /* const fileEntry = App.get_file_store();
        console.log('File Entry:', fileEntry);
        console.log('Root Children:', fileEntry.root.getChildren());

        const fileElement = this.shadowRoot.getElementById('file');
        console.log('File Element:', fileElement);

        const newEle = document.createElement('div');
        newEle.innerText = "I'm file";
        fileElement.appendChild(newEle);

        if (fileElement) {
            
            const children = fileEntry.root.getChildren();
            for (const child of children) {
                const childElement = document.createElement('div');
                childElement.className = 'file-entry';
                childElement.innerText = child.name;

                if (child.getType() === 'directory') {
                    childElement.classList.add('directory');
                } else {
                    childElement.classList.add('file');
                }

                console.log('Child Element:', childElement);
                fileElement.appendChild(childElement);
            }
        } else {
            console.error('Element with ID "file" not found');
        }
        */

   
        const fileEntry = App.get_file_store();
        const rootElement = this.shadowRoot.getElementById('file');
        rootElement.innerHTML = ''; // Clear previous contents

        const treeRoot = fileEntry.root

        /**
        * Displays the elements by appending children recursively.
        * @param {HTMLElement} element - The HTML element representing the root
        * @param {any} node - The highest level entry
        */
        const loadTree = (element, node) => {
            if (node.getType() === 'directory') {
                const children = node.getChildren();
                if(children.length == 0){
                    return;
                }
            
                children.forEach(child => {
                    let childElement;


                    if (child.getType() === 'directory') {
                        childElement = this.render_directory_to_dom(child);
                    } else if (child.getType() === 'text') {
                        childElement = this.render_text_file_to_dom(child);
                    } else {
                        throw new Error('Unknown file type');
                    }
                    element.appendChild(childElement);
                    

                    if(!this.hiddenFiles.includes(child)){
                        loadTree(childElement, child);
                    }
                
                });
            }
        }

        loadTree(rootElement, treeRoot);
        


        /*render_file_to_dom(file: FileEntry) -> DOMElement: Render file entry into DOM element.
        render_directory_to_dom(directory_file: DirectoryFileEntry) -> DOMElement: Render directory file entry into DOM element.
        render_text_file_to_dom(file: TextFileEntry) -> DOMElement:Render text file entry into DOM element.
        render() -> void: Redraw the filer explorer part by using render_file_to_dom.
        enter_delete_mode() -> void Enter "delete mode" where clicking file on explorer tab will delete the file.
        exit_delete_mode() -> void Exit "delete mode" where clicking file on explorer tab will delete the file.
        open_create_file_dialog(path: string) -> void: Open create file dialog that will create file at destination path.
        close_create_file_dialog() -> void: Close create file dialog.
        get_current_open_file() -> TextFileEntry?: Return the currently opened file.
        set_current_open_file(file: TextFileEntry) -> void: Set the currently opened file. Set filename attribute of markdown-editor to switch the file.*/
    }
   /**
    * Creates a text-file entry element.
    * @param {any} file - the entry from fileStore
    * @returns the text-file element
    */
    render_text_file_to_dom(file) {
        const fileElement = document.createElement('div'); //create div element
        fileElement.className = 'file-entry text-file'; //assign two classes -> 'file-entry' and 'text-file'
        fileElement.innerText = file.name; // assign file name
        fileElement.addEventListener('click', () => this.handle_file_click(file)); // When the div is clicked, call function to implement render functionality
        return fileElement;
    }

   /**
    * Creates a directory entry element
    * @param {any} file - the folder from fileStore
    * @returns the directory element
    */
    render_directory_to_dom(file) {
        const fileElement = document.createElement('div'); //create div element
        fileElement.className = 'file-entry directory'; //assign two classes -> 'file-entry' and 'text-file'
        const textElement = document.createElement('div'); //create div element
        textElement.innerText = file.name; // assign file name
        textElement.addEventListener('click', () => this.handle_directory_click(file)); // When the div is clicked, call function to implement render functionality
        fileElement.appendChild(textElement);
        return fileElement;
    }

    /*render() {
        const fileEntry = App.get_file_store();
        const rootElement = this.shadowRoot.getElementById('file');
        rootElement.innerHTML = ''; // Clear previous contents

        const children = fileEntry.root.getChildren();
        children.forEach(child => {
            let childElement;
            if (child.type === 'directory') {
                childElement = this.render_directory_to_dom(child);
            } else if (child.type === 'text') {
                childElement = this.render_text_file_to_dom(child);
            } else {
                childElement = this.render_file_to_dom(child);
            }
            rootElement.appendChild(childElement);
        });
    }*/

    /**
    * Sets delete mode to true which means clicking on file deletes it.
    */
    enter_delete_mode() {
        this.deleteMode = true;
    }


   /**
    * Sets delete mode to false which means clicking on file opens it.
    */
    exit_delete_mode() {
        this.deleteMode = false;
    }

   /**
    * Open create file dialog that will create file at destination path.
    * @param {string} path - the destination path for the file
    */
    open_create_file_dialog(path) {
        // Logic to open the create file dialog
    }

   /**
    * Close create file dialog.
    */
    close_create_file_dialog() {
        // Logic to close the create file dialog
    }

    /**
    * Returns the file currently open.
    * @returns TextFileEntry? - the currently opened file
    */
    get_current_open_file() {
        return this.currentOpenFile;
    }

   /**
    * Set the currently opened file
    * @param {*} file
    */
    set_current_open_file(file) {
        this.currentOpenFile = file;
        const markdownEditor = document.querySelector('markdown-editor');
        markdownEditor.setAttribute('filename', file.get_name());
    }

    handle_file_click(file) {
        if (this.deleteMode) {
            // Logic to delete the file
        } else {
            this.set_current_open_file(file);
        }
    }

    handle_directory_click(directory) {
        console.log(directory);

        if(this.hiddenFiles.includes(directory)){
            this.hiddenFiles = this.hiddenFiles.filter(item => item !== directory);
            this.render();
            return;
        }
        this.hiddenFiles.push(directory);
        this.render();
        if (this.deleteMode) {
            // Logic to delete the directory
        } else {
            // Logic to open the directory
        }
    }


}

customElements.define('file-explorer', FileExplorerComponent);