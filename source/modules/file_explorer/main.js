window.addEventListener("DOMContentLoaded", init);

// Starts the program, all function calls trace back here
let folder_nodes = {
  0:{"name": "root", "text": "hello", "children": [1,3, 2], "parent": [],"folder":true},
  1:{"name": "first node", "text": "hi", "children": [], "parent": [0], "folder": false},
  3:{"name": "third node", "text": "what's good", "children": [5], "parent":[0],"folder":true},
  2:{"name": "second node", "text": "what's good", "children": [], "parent":[0],"folder":false},
  5:{"name": "fourth node", "text": "hiya", "children": [], "parent":[3],"folder":false},
}
function init() {
	// Get the recipes from localStorage
    document.getElementById("add-file").addEventListener("click", addFile);
    document.getElementById("delete-mode").addEventListener("click", deleteMode);
    let folder = DFS(0);
    document.getElementById("file-container").appendChild(folder);
	//let recipes = getRecipesFromStorage();
	// Add each recipe to the <main> element
	//addRecipesToDocument(recipes);
	// Add the event listeners to the form elements
	//initFormHandler();
}
function getAllChildren(node) {
}

function DFS(node) {
    let children = folder_nodes[node]["children"];
    if (folder_nodes[node] == null) {
        console.log("this is an element with nothing");
        console.log(folder_nodes[node]);
        return;
    }
    if (children.length == 0) {
        if (folder_nodes[node].folder == true){
            let folder = document.createElement("folder");
            folder.innerHTML = folder_nodes[node].name;
            folder.id = node;
            folder.onclick = function() {ifdeletemode(folder)};
            return folder;
        }
        else{
            let file = document.createElement("file");
            file.innerHTML = folder_nodes[node].name;
            file.value = folder_nodes[node].text;
            file.id = node;
            file.onclick = function() {ifdeletemode(file)};
            return file;
       }
    }
    if (folder_nodes[node]["folder"] == true) {
        let root = document.createElement("folder");
        root.innerHTML = folder_nodes[node].name;
        root.id=node;
        root.onclick = function() {ifdeletemode(folder)};
        for (let i = 0; i < children.length; i++) {
            let newEl = DFS(children[i]);
            if (newEl != null) {
                root.appendChild(newEl);
            }
        }
        return root;
    }
    /*else {
        let root = document.createElement("file");
        root.innerHTML = node.name;
        for (let i = 0; i < children.length; i++) {
            let newEl = DFS(children[i]);
            if (newEl != null) {
                root.appendChild(newEl);
            }
        }
    };*/
}


function addFileToDocument(fileName) {
    //let name = fileName;
    console.log(fileName);
    folder_nodes[3] = {"name": "third node", "text": "what's good", "children": [], "folder":false};
}

function deleteMode() {
    if (document.getElementById("delete-mode").innerHTML == "Delete Mode On") {
        document.getElementById("delete-mode").innerHTML = "Delete Mode Off";
    }
    else{
        document.getElementById("delete-mode").innerHTML = "Delete Mode On";
    }
}

function ifdeletemode(element){
    console.log("hi");
    let status = document.getElementById("delete-mode").innerHTML;
    if (status == "Delete Mode On") {
        element.remove();
    }
}


function addFile() {
    const mainel = document.getElementById("file-container");
    console.log(folder_nodes);
    let form = document.createElement("form");
    let input = document.createElement("input");
    input.type = "text";
    input.name = "fname";
    let submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Submit";
    submit.innerHTML="Submit";
    form.append(input);
    form.append(submit);
    mainel.append(form);
    form.onsubmit= addFileToDocument(input.innerHTML);
    //console.log(folder_nodes);
}

function setCurrentFolder(){

}