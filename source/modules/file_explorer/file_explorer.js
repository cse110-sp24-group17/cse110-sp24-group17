import { TextFileEntry, DirectoryFileEntry} from "../models/fileStore.js";
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
        this.deleteMode = false;

        fetch('./modules/file_explorer/file_explorer.html').then(x => x.text()).then(x => {
            this.shadowRoot.innerHTML = x;
            this.hideChildren(App.get_file_store().root); // Hide all except the top level nodes
            this.currentOpenFolder = App.get_file_store().root;
            this.currentOpenFile = null;
            this.render(); // Render the file explorer

            let newFileButton = this.shadowRoot.getElementById('file_display_header_button_new');
            /**
             * Creates a new file in the current directory
             */
            newFileButton.addEventListener('click', () => {
                let formName = this.shadowRoot.getElementById("add-file");
                formName.hidden = false;

                /**
                 * Adds a child file to the current open folder after a name is submitted
                 * @param {SubmitEvent} event - event created by pushing submit
                 */


                formName.addEventListener('submit', (event) => {
                    event.preventDefault();
                    let inputValue = this.shadowRoot.getElementById("new-file-name").value;

                    if (inputValue == "") { // If the input is empty, dont add anything.
                        formName.hidden = true;
                        return;
                    }

                    const newEntry = new TextFileEntry(inputValue + ".txt","");
                    App.get_file_store().root.add_child_file(newEntry);
                    formName.hidden = true;
                    this.render();                    
                });
            });

            let newFolderButton = this.shadowRoot.getElementById('folder_display_header_button_new');
            /**
             * Creates a new folder in the current directory
             */
            newFolderButton.addEventListener('click', () => {
                let formName = this.shadowRoot.getElementById("add-folder");
                formName.hidden = false;

                /**
                 * Adds a child folder to the current open folder after a name is submitted
                 * @param {SubmitEvent} event - event created by pushing submit
                 */
                formName.addEventListener('submit', (event) => {
                    event.preventDefault();
                    let inputValue = this.shadowRoot.getElementById("new-folder-name").value;
                    if (inputValue == "") { // If the input is empty, dont add anything.
                        formName.hidden = true;
                        return;
                    }
                    const newEntry = new DirectoryFileEntry(inputValue,"");
                    App.get_file_store().root.add_child_file(newEntry);
                    formName.hidden = true;
                    this.render();                    
                });
            });

            let deleteButton = this.shadowRoot.getElementById('file_display_header_button_delete');
            deleteButton.addEventListener('click', () => {
                if (this.deleteMode) {
                    this.exit_delete_mode();
                    deleteButton.innerHTML = "Delete:Off"
                } else {
                    this.enter_delete_mode();
                    deleteButton.innerHTML = "Delete:On"
                }
            });
        })



        

    }

    getAllNodes(node, nodes = []) {
        nodes.push(node);
        if (node.get_type() === 'directory') {
            const children = node.get_children();
            children.forEach(child => {
                this.getAllNodes(child, nodes);
            });
        }
        return nodes;
    }

    // Hide all except the top level nodes
    hideChildren(root) {
        let nodes = [];
        this.getAllNodes(root, nodes);

        nodes.forEach(node => {
            this.hiddenFiles.push(node);
        });

   
    }

    

    render() {
       
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
            if (node.get_type() === 'directory') {
                const children = node.get_children();
                if(children.length == 0){
                    return;
                }
            
                children.forEach(child => {
                    let childElement;


                    if (child.get_type() === 'directory') {
                        childElement = this.render_directory_to_dom(child);
                    } else if (child.get_type() === 'text') {
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
        
        App.get_file_store().sync();

        
    }


   /**
    * Creates a text-file entry element.
    * @param {any} file - the entry from fileStore
    * @returns the text-file element
    */
    render_text_file_to_dom(file) {
        const fileElement = document.createElement('div'); //create div element 
        fileElement.className = 'file-entry text-file'; //assign two classes -> 'file-entry' and 'text-file'
        fileElement.draggable = true;

        if(file == this.currentOpenFile){
            fileElement.classList.add('selected');
        }
        
        fileElement.innerText = file.get_name(); // assign file name
        fileElement.id = file.get_path();
        fileElement.addEventListener('click', () => this.handle_file_click(file)); // When the div is clicked, call function to implement render functionality

        fileElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData("text/plain", file.get_path());
            event.dataTransfer.effectAllowed = "move";
        });


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


        textElement.innerText = file.get_name(); // assign file name
        textElement.className = 'directory-name'; //assign class 'directory-name'
        textElement.draggable = true;

        textElement.id = file.get_path(); 
        textElement.addEventListener('click', () => this.handle_directory_click(file)); // When the div is clicked, call function to implement render functionality

        textElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData("text/plain", file.get_path());
            event.dataTransfer.effectAllowed = "move";
        });

        textElement.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
        });

        textElement.addEventListener('drop', (event) => {
            event.preventDefault();
            const draggedFilePath = event.dataTransfer.getData("text/plain");
            console.log(draggedFilePath);
            const draggedFile = App.get_file_store().get_file(draggedFilePath);
            console.log(draggedFile);
            App.get_file_store().move_file(draggedFile, file);
            this.render();
        });

        fileElement.appendChild(textElement);
        return fileElement;
    }

   

    /**
    * Sets delete mode to true which means clicking on file deletes it.
    */
    enter_delete_mode() {
;        this.deleteMode = true;
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
        /*const markdownEditor = document.getElementsByClassName('markdown-editor')[0];
        markdownEditor.innerHTML = file.content;
        markdownEditor.id = file.name;
        document.getElementsByTagName("body")[0].appendChild(markdownEditor);*/

    }

    /**
    * Returns the folder currently open.
    * @returns FolderFileEntry? - the currently opened file
    */
    get_current_open_folder() {
        return this.currentOpenFolder;
    }

    /**
    * Set the currently opened folder
    * @param {*} file
    */
    set_current_open_folder(folder) {
        this.currentOpenFolder = folder;
    }

    handle_file_click(file) {
        if (this.deleteMode) {
            file.parent.remove_child_file(file)
            this.render();
        } 
        else {
            this.set_current_open_file(file);
            this.render();
        }
    }

    handle_directory_click(directory) {
        console.log(directory);

        if (this.deleteMode) {
            directory.parent.remove_child_file(directory);
            this.render();
            return;
        } else {
    
        }

        if(this.hiddenFiles.includes(directory)){
            this.hiddenFiles = this.hiddenFiles.filter(item => item !== directory);
            this.set_current_open_folder(directory)
            this.render();
            return;
        }
        this.hiddenFiles.push(directory);
        this.render();
    }


}

customElements.define('file-explorer', FileExplorerComponent);