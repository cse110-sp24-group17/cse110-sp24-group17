import { TextFileEntry, DirectoryFileEntry} from "../models/fileStore.js";
import App from "../models/app.js"


/**
* Class representing the file explorer component. Creates file and folder elements and handles their interactions.
* @extends HTMLElement
*/
class FileExplorerComponent extends HTMLElement {

    /**
     * Constructor for the file explorer component
     * @constructor
     */
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.hiddenFiles = [];
        this.deleteMode = false;

        /**
         * Fetches the file explorer html and sets the shadow root to the html
         */
        fetch('./modules/file_explorer/file_explorer.html').then(x => x.text()).then(x => {
            this.shadowRoot.innerHTML = x;
            this.hideChildren(App.get_file_store().root); // Hide all except the top level nodes
            this.currentOpenFolder = App.get_file_store().root; // Set the current open folder to the root
            this.currentOpenFile = null; // Set the current open file to null
            this.render(); // Render the file explorer

            let newFileButton = document.getElementById('addFile');

            /**
             * Creates a new file in the current directory
             * @param {ClickEvent} event - event created by clicking the button
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

            let newFolderButton = document.getElementById('addFolder');

            /**
             * Creates a new folder in the current directory
             * @param {ClickEvent} event - event created by clicking the button
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

            let deleteButton = document.getElementById('trashIcon'); // Get the delete button

            /**
             * Toggles delete mode on and off
             * @param {ClickEvent} event - event created by clicking the button
             */
            deleteButton.addEventListener('click', () => {
                if (this.deleteMode) {
                    this.exit_delete_mode();
                } else {
                    this.enter_delete_mode();
                }
            });
        

            /*deleteButton.addEventListener('drop', (event) => {
                event.preventDefault();
                const draggedFilePath = event.dataTransfer.getData("text/plain");
                console.log("sus", draggedFilePath);
                const draggedFile = App.get_file_store().get_file(draggedFilePath);
                console.log(draggedFile);
                draggedFile.parent.remove_child_file(draggedFile);
                this.render();
            });*/
        })



        

    }

    /**
     * Recursively gets all the nodes in the tree.
     * @param {*} node - the node to get all children from.
     * @param {*} nodes - the array to store all the nodes in.
     * @returns an array of all the nodes in the tree.
     */
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

    
    /**
     * Renders the file explorer by creating the file and folder elements and appending them to the DOM
     */
    render() {
       
        const fileEntry = App.get_file_store();
        const rootElement = this.shadowRoot.getElementById('file');
        rootElement.innerHTML = ''; // Clear previous contents

        const treeRoot = fileEntry.root // Get the root of the file store


        /**
        * Displays the elements by appending children recursively.
        * @param {HTMLElement} element - The HTML element representing the root.
        * @param {any} node - The highest level entry.
        */
        const loadTree = (element, node) => {
            if (node.get_type() === 'directory') {
                const children = node.get_children();
                if(children.length == 0){
                    return;
                }
            
                children.forEach(child => {
                    let childElement;


                    /**
                     * If the child is a directory, render the directory to the DOM
                     * If the child is a text file, render the text file to the DOM
                     * If the child is neither, throw an error
                     */
                    if (child.get_type() === 'directory') {
                        childElement = this.render_directory_to_dom(child);
                    } else if (child.get_type() === 'text') {
                        childElement = this.render_text_file_to_dom(child);
                    } else {
                        throw new Error('Unknown file type');
                    }
                    element.appendChild(childElement); // Append the child element to the parent element
                    

                    // If the child is hidden, do not render it
                    if(!this.hiddenFiles.includes(child)){
                        loadTree(childElement, child);
                    }
                
                });
            }
        }

       let rootDiv = this.render_root_div_to_dom();
        rootElement.appendChild(rootDiv);
        loadTree(rootElement, treeRoot); // Load the tree starting from the root
        
        App.get_file_store().sync(); // Sync the file store

        
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
        fileElement.addEventListener('mouseenter', () => {
            if (this.onFileMouseEnter) {
                this.onFileMouseEnter(file);
            }
        });
        fileElement.addEventListener('mouseleave', () => {
            if (this.onFileMouseLeave) {
                this.onFileMouseLeave(file);
            }
        });
        // Drag functionality
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

        // Drag functionality
        textElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData("text/plain", file.get_path());
            event.dataTransfer.effectAllowed = "move";
        });

        // Drag over functionality
        textElement.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
        });

        // Drop functionality
        textElement.addEventListener('drop', (event) => {
            event.preventDefault();
            const draggedFilePath = event.dataTransfer.getData("text/plain");
            console.log("sus", draggedFilePath);
            const draggedFile = App.get_file_store().get_file(draggedFilePath);
            console.log(draggedFile);
            App.get_file_store().move_file(draggedFile, file); // Move the file to the new location. Called from fileStore.
            this.render();
        });

        textElement.addEventListener('mouseenter', () => {
            if (this.onFileMouseEnter) {
                this.onFileMouseEnter(file);
            }
        });
        textElement.addEventListener('mouseleave', () => {
            if (this.onFileMouseLeave) {
                this.onFileMouseLeave(file);
            }
        });

        fileElement.appendChild(textElement);
        return fileElement;
    }



    render_root_div_to_dom() {
        const fileElement = document.createElement('div'); //create div element
        fileElement.className = 'root'; 


        // Drag over functionality
        fileElement.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
        });

        // Drop functionality
        fileElement.addEventListener('drop', (event) => {
            event.preventDefault();
            const draggedFilePath = event.dataTransfer.getData("text/plain");
            console.log(draggedFilePath);
            const draggedFile = App.get_file_store().get_file(draggedFilePath);
            console.log(draggedFile);


            // Remove the source file from the source directory
            draggedFile.parent.remove_child_file(draggedFile);

            // Add the source file to the root
            App.get_file_store().root.add_child_file(draggedFile);

            this.render();
        });

        fileElement.addEventListener('mouseenter', () => {
            if (this.onFileMouseEnter) {
                this.onFileMouseEnter(file);
            }
        });
        fileElement.addEventListener('mouseleave', () => {
            if (this.onFileMouseLeave) {
                this.onFileMouseLeave(file);
            }
        });

        return fileElement;
    }

   

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
    * Returns the file currently open.
    * @returns the currently opened file.
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
    * @param {*} file - the folder to set as the current open folder
    */
    set_current_open_folder(folder) {
        this.currentOpenFolder = folder;
    }


    /**
     * When a file is clicked, it is either openned or deleted depending on the mode
     * @param {*} file - the file being picked 
     */
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

     /**
     * When a folder is clicked, it is either openned or deleted (including it's children) depending on the mode
     * @param {*} directory - the directory being picked 
     */
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