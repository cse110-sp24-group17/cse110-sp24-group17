import { TextFileEntry, DirectoryFileEntry } from "../models/fileStore.js";
import App from "../models/app.js";

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

    window.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    window.addEventListener("drop", () => {
      this.render();
    });

    /**
     * Fetches the file explorer html and sets the shadow root to the html
     */
    fetch("./modules/file_explorer/file_explorer.html")
      .then((x) => x.text())
      .then((x) => {
        this.shadowRoot.innerHTML = x;
        this.hideChildren(App.getFileStore().root); // Hide all except the top level nodes
        this.currentOpenFolder = App.getFileStore().root; // Set the current open folder to the root
        this.currentOpenFile = null; // Set the current open file to null
        this.render(); // Render the file explorer

        let newFileButton = document.getElementById("addFile");

        /**
         * Creates a new file in the current directory
         * @param {ClickEvent} event - event created by clicking the button
         */
        newFileButton.addEventListener("click", () => {
          let formName = this.shadowRoot.getElementById("add-file");
          formName.hidden = false;

          /**
           * Adds a child file to the current open folder after a name is submitted
           * @param {SubmitEvent} event - event created by pushing submit
           */
          formName.addEventListener("submit", (event) => {
            event.preventDefault();
            let inputValue =
              this.shadowRoot.getElementById("new-file-name").value;

            if (inputValue == "") {
              // If the input is empty, dont add anything.
              formName.hidden = true;
              return;
            }

            const newEntry = new TextFileEntry(inputValue + ".md", "");
            App.getFileStore().root.addChildFile(newEntry);
            this.shadowRoot.getElementById("new-file-name").value = "";
            formName.hidden = true;
            this.render();
          });
        });

        let newFolderButton = document.getElementById("addFolder");

        /**
         * Creates a new folder in the current directory
         * @param {ClickEvent} event - event created by clicking the button
         */
        newFolderButton.addEventListener("click", () => {
          let formName = this.shadowRoot.getElementById("add-folder");
          formName.hidden = false;

          /**
           * Adds a child folder to the current open folder after a name is submitted
           * @param {SubmitEvent} event - event created by pushing submit
           */
          formName.addEventListener("submit", (event) => {
            event.preventDefault();
            let inputValue =
              this.shadowRoot.getElementById("new-folder-name").value;
            if (inputValue == "") {
              // If the input is empty, dont add anything.
              formName.hidden = true;
              return;
            }
            const newEntry = new DirectoryFileEntry(inputValue, "");
            App.getFileStore().root.addChildFile(newEntry);
            this.shadowRoot.getElementById("new-folder-name").value = "";
            formName.hidden = true;
            this.render();
          });
        });

        let deleteButton = document.getElementById("trashIcon"); // Get the delete button
        let deleteButtonOpen = document.getElementById("trashIconOpen"); // Get the delete button

        /**
         * Toggles delete mode on and off
         * @param {ClickEvent} event - event created by clicking the button
         */
        deleteButton.addEventListener("click", () => {
          if (this.deleteMode) {
            this.exitDeleteMode();
          } else {
            this.enterDeleteMode();
          }
        });

        deleteButtonOpen.addEventListener("click", () => {
          if (this.deleteMode) {
            this.exitDeleteMode();
          } else {
            this.enterDeleteMode();
          }
        });

        deleteButtonOpen.addEventListener("dragover", (event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        });

        deleteButtonOpen.addEventListener("drop", (event) => {
          event.preventDefault();
          const draggedFilePath = event.dataTransfer.getData("text/plain");
          const draggedFile = App.getFileStore().getFile(draggedFilePath);
          console.log(draggedFile);
          draggedFile.parent.removeChildFile(draggedFile);
          this.render();
        });
      });
  }

  /**
   * Recursively gets all the nodes in the tree.
   * @param {*} node - the node to get all children from.
   * @param {*} nodes - the array to store all the nodes in.
   * @returns an array of all the nodes in the tree.
   */
  getAllNodes(node, nodes = []) {
    nodes.push(node);
    if (node.getType() === "directory") {
      const children = node.getChildren();
      children.forEach((child) => {
        this.getAllNodes(child, nodes);
      });
    }
    return nodes;
  }

  // Hide all except the top level nodes
  hideChildren(root) {
    let nodes = [];
    this.getAllNodes(root, nodes);

    nodes.forEach((node) => {
      this.hiddenFiles.push(node);
    });
  }

  /**
   * Renders the file explorer by creating the file and folder elements and appending them to the DOM
   */
  render() {
    const fileEntry = App.getFileStore();
    const rootElement = this.shadowRoot.getElementById("file");
    rootElement.innerHTML = ""; // Clear previous contents
    App.getFileStore().sortFiles(); // Sort the files in the file store

    const treeRoot = fileEntry.root; // Get the root of the file store

    let deleteButton = document.getElementById("trashIcon"); // Get the delete button
    let deleteButtonOpen = document.getElementById("trashIconOpen"); // Get the delete button

    if (deleteButton.classList.contains("hidden") && !this.deleteMode) {
      deleteButton.classList.remove("hidden");
      deleteButtonOpen.classList.add("hidden");
    }

    /**
     * Displays the elements by appending children recursively.
     * @param {HTMLElement} element - The HTML element representing the root.
     * @param {any} node - The highest level entry.
     */
    const loadTree = (element, node) => {
      if (node.getType() === "directory") {
        const children = node.getChildren();
        if (children.length == 0) {
          return;
        }

        children.forEach((child) => {
          let childElement;

          /**
           * If the child is a directory, render the directory to the DOM
           * If the child is a text file, render the text file to the DOM
           * If the child is neither, throw an error
           */
          if (child.getType() === "directory") {
            childElement = this.renderDirectoryToDom(child);
          } else if (child.getType() === "text") {
            childElement = this.renderTextFileToDom(child);
          } else {
            throw new Error("Unknown file type");
          }
          element.appendChild(childElement); // Append the child element to the parent element

          // If the child is hidden, do not render it
          if (!this.hiddenFiles.includes(child)) {
            loadTree(childElement, child);
          }
        });
      }
    };

    let rootDiv = this.renderRootDivToDom();
    rootElement.appendChild(rootDiv);
    loadTree(rootElement, treeRoot); // Load the tree starting from the root

    App.getFileStore().sync(); // Sync the file store
  }

  /**
   * Creates a text-file entry element.
   * @param {any} file - the entry from fileStore
   * @returns the text-file element
   */
  renderTextFileToDom(file) {
    const fileElement = document.createElement("div"); //create div element
    fileElement.className = "file-entry text-file"; //assign two classes -> 'file-entry' and 'text-file'
    fileElement.draggable = true;

    if (file == this.currentOpenFile) {
      fileElement.classList.add("selected");
    }

    fileElement.innerText = file.getName(); // assign file name
    fileElement.id = file.getPath();
    fileElement.addEventListener("click", () => this.handleFileClick(file)); // When the div is clicked, call function to implement render functionality
    fileElement.addEventListener("mouseenter", () => {
      if (this.onFileMouseEnter) {
        this.onFileMouseEnter(file);
      }
    });
    fileElement.addEventListener("mouseleave", () => {
      if (this.onFileMouseLeave) {
        this.onFileMouseLeave(file);
      }
    });
    // Drag functionality
    fileElement.addEventListener("dragstart", (event) => {
      let deleteButton = document.getElementById("trashIcon"); // Get the delete button
      let deleteButtonOpen = document.getElementById("trashIconOpen"); // Get the delete button

      deleteButton.classList.add("hidden");
      deleteButtonOpen.classList.remove("hidden");

      event.dataTransfer.setData("text/plain", file.getPath());
      event.dataTransfer.effectAllowed = "move";
    });

    fileElement.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    fileElement.addEventListener("drop", (event) => {
      event.preventDefault();
      console.log("DROP2");
      this.render();
    });

    return fileElement;
  }

  /**
   * Creates a directory entry element
   * @param {any} file - the folder from fileStore
   * @returns the directory element
   */
  renderDirectoryToDom(file) {
    const fileElement = document.createElement("div"); //create div element
    fileElement.className = "file-entry directory"; //assign two classes -> 'file-entry' and 'text-file'
    const textElement = document.createElement("div"); //create div element

    textElement.innerText = file.getName(); // assign file name
    textElement.className = "directory-name"; //assign class 'directory-name'
    textElement.draggable = true;

    textElement.id = file.getPath();
    textElement.addEventListener("click", () =>
      this.handleDirectoryClick(file),
    ); // When the div is clicked, call function to implement render functionality

    // Drag functionality
    textElement.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", file.getPath());
      event.dataTransfer.effectAllowed = "move";
    });

    // Drag over functionality
    textElement.addEventListener("dragover", (event) => {
      let deleteButton = document.getElementById("trashIcon"); // Get the delete button
      let deleteButtonOpen = document.getElementById("trashIconOpen"); // Get the delete button

      deleteButton.classList.add("hidden");
      deleteButtonOpen.classList.remove("hidden");

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    // Drop functionality
    textElement.addEventListener("drop", (event) => {
      event.preventDefault();
      const draggedFilePath = event.dataTransfer.getData("text/plain");
      console.log("sus", draggedFilePath);
      const draggedFile = App.getFileStore().getFile(draggedFilePath);
      console.log(draggedFile);
      App.getFileStore().move_file(draggedFile, file); // Move the file to the new location. Called from fileStore.

      this.render();
    });

    textElement.addEventListener("mouseenter", () => {
      if (this.onFileMouseEnter) {
        this.onFileMouseEnter(file);
      }
    });
    textElement.addEventListener("mouseleave", () => {
      if (this.onFileMouseLeave) {
        this.onFileMouseLeave(file);
      }
    });

    fileElement.appendChild(textElement);
    return fileElement;
  }

  renderRootDivToDom() {
    const fileElement = document.createElement("div"); //create div element
    fileElement.className = "root"; //assign two classes -> 'file-entry' and 'text-file'
    const textElement = document.createElement("div"); //create div element

    // Drag over functionality
    fileElement.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    // Drop functionality
    fileElement.addEventListener("drop", (event) => {
      event.preventDefault();
      const draggedFilePath = event.dataTransfer.getData("text/plain");
      console.log(draggedFilePath);
      const draggedFile = App.getFileStore().getFile(draggedFilePath);
      console.log(draggedFile);

      // Remove the source file from the source directory
      draggedFile.parent.removeChildFile(draggedFile);
      if (this.onDeleteFile) {
        this.onDeleteFile(draggedFile);
      }

      // Add the source file to the root
      App.getFileStore().root.addChildFile(draggedFile);

      this.render();
    });

    textElement.addEventListener("mouseenter", () => {
      if (this.onFileMouseEnter) {
        this.onFileMouseEnter(draggedFile);
      }
    });
    textElement.addEventListener("mouseleave", () => {
      if (this.onFileMouseLeave) {
        this.onFileMouseLeave(draggedFile);
      }
    });

    fileElement.appendChild(textElement);
    return fileElement;
  }

  /**
   * Sets delete mode to true which means clicking on file deletes it.
   */
  enterDeleteMode() {
    this.deleteMode = true;
    let deleteButton = document.getElementById("trashIcon"); // Get the delete button
    let deleteButtonOpen = document.getElementById("trashIconOpen"); // Get the delete button

    deleteButtonOpen.classList.remove("hidden");
    deleteButton.classList.add("hidden");
  }

  /**
   * Sets delete mode to false which means clicking on file opens it.
   */
  exitDeleteMode() {
    this.deleteMode = false;
    let deleteButton = document.getElementById("trashIcon"); // Get the delete button
    let deleteButtonOpen = document.getElementById("trashIconOpen"); // Get the delete button

    deleteButtonOpen.classList.add("hidden");
    deleteButton.classList.remove("hidden");
  }

  /**
   * Returns the file currently open.
   * @returns the currently opened file.
   */
  getCurrentOpenFile() {
    return this.currentOpenFile;
  }

  /**
   * Set the currently opened file
   * @param {*} file
   */
  setCurrentOpenFile(file) {
    this.currentOpenFile = file;
    if (this.onFileOpen) {
      this.onFileOpen(file);
    }
  }

  /**
   * Returns the folder currently open.
   * @returns FolderFileEntry? - the currently opened file
   */
  getCurrentOpenFolder() {
    return this.currentOpenFolder;
  }

  /**
   * Set the currently opened folder
   * @param {*} file - the folder to set as the current open folder
   */
  setCurrentOpenFolder(folder) {
    this.currentOpenFolder = folder;
  }

  /**
   * When a file is clicked, it is either openned or deleted depending on the mode
   * @param {*} file - the file being picked
   */
  handleFileClick(file) {
    if (this.deleteMode) {
      file.parent.removeChildFile(file);
      if (this.onDeleteFile) {
        this.onDeleteFile(file);
      }
      this.render();
    } else {
      this.setCurrentOpenFile(file);
      this.render();
    }
  }

  /**
   * When a folder is clicked, it is either openned or deleted (including it's children) depending on the mode
   * @param {*} directory - the directory being picked
   */
  handleDirectoryClick(directory) {
    console.log(directory);

    if (this.deleteMode) {
      directory.parent.removeChildFile(directory);
      if (this.onDeleteFile) {
        this.onDeleteFile(directory);
      }
      this.render();
      return;
    } else {
    }

    if (this.hiddenFiles.includes(directory)) {
      this.hiddenFiles = this.hiddenFiles.filter((item) => item !== directory);
      this.setCurrentOpenFolder(directory);
      this.render();
      return;
    }
    this.hiddenFiles.push(directory);
    this.render();
  }
}

customElements.define("file-explorer", FileExplorerComponent);
