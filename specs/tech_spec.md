# View

(journal view)

## JournalViewComponent

Journal view component that shows the journal for today and have ability to switch the date through prev/next buttons or calendar date switch. It has no specific attribute and will access App instance simply through the global instance from app module.

It's okay to implement all journal view functionalities in this component except for the calendar component, but if it's desirable to split up into more components, that is fine too.

_attributes_

- No attribute for journal view component.

_methods_

- `get_current_date() -> Date:` Get the selected date.
- `set_current_date(date: Date):` Set the selected date. Calls `set_current_md_file` to change the opened markdown file, if date has changed.
- `open_calendar_tab() -> void:` Open the calendar tab by modifying calendar tab DOM element's className. (i.e. set CSS class that has visibility: visible;)
- `close_calendar_tab() -> void:` Close the calendar tab by modifying calendar tab DOM element's className. (i.e. set CSS class that has visibility: hidden;)
- `prev_date() -> void:` Change current date to one day before current date.
- `next_date() -> void:` Change current date to one day after current date.
- `set_current_md_file(file: string):` Change the current open markdown file. Recreate markdown editor DOM element.
- `set_calendar_date(date: Date) -> void:` Set the date displayed in calendar.

_one possible DOM structure_

```html
<div id="switch-section">
  <button>Prev Date</button>
  <button>Open Calendar</button>
  <button>Next Date</button>
</div>
<markdown-editor filename="journal/2024-05-03.md"></markdown-editor>
<div id="calendar-tab" class="tab-hidden">
  <calendar date="2024-05-03"></calendar>
</div>
```

## CalendarComponent

Calendar component shows up the dates of the month and calls the specified callback function.

_attributes_

- `date:` The month of this date will be displayed.
- `onselected:` The callback of type `(date: Date) -> void` that will be called when date was selected.

_methods_

- Internal functions to implement calendar. As we already have calendar implementation from our warmup activity, this will be omitted.

```html
<calendar date="hello">
  <!-- onselected attribute must be set through javascript --></calendar
>
```

## CodeBlockComponent (optional)

Code block displays the code in highlighted text. For now, we simply just highlight the javascript keywords like "var, let, if" and the quoted texts. (not trying to implement any level of javascript parsing here)

_attribute_

- `language:` The language of the provided code. Only 'javascript' supported for now.

```html
<code-block language="javascript">
function hello() {
	let a = "HII"
}
</<code-block>
<!-- onselected attribute must be set through javascript -->
```

Will be displayed like:

```javascript
function hello() {
  let a = "HII";
}
```

Some note on implementation, you can create new DOM elements by just iterating through the "words" of code string splitted by space. Set highlighting css className to the DOM element that matches the keyword or enclosed by quotes.

(file explorer)

## FileExplorerComponent

Files explorer component that shows the markdown files in file system. It has no specific attribute and will access App instance simply through the global instance from app module.

It's okay to implement all journal view functionalities in this component except for the markdown editory component, but if it's desirable to split up into more components, that is fine too.

_attributes_

- No attribute for journal view component.

_methods_

- `render_file_to_dom(file: FileEntry) -> DOMElement:` Render file entry into DOM element.
- `renderDirectoryToDom(directory_file: DirectoryFileEntry) -> DOMElement:` Render directory file entry into DOM element.
- `renderTextFileToDom(file: TextFileEntry) -> DOMElement:`Render text file entry into DOM element.
- `render() -> void:` Redraw the filer explorer part by using render_file_to_dom.
- `enterDeleteMode() -> void` Enter "delete mode" where clicking file on explorer tab will delete the file.
- `exitDeleteMode() -> void` Exit "delete mode" where clicking file on explorer tab will delete the file.
- `open_createFile_dialog(path: string) -> void:` Open create file dialog that will create file at destination path.
- `close_createFile_dialog() -> void:` Close create file dialog.
- `getCurrentOpenFile() -> TextFileEntry?:` Return the currently opened file.
- `setCurrentOpenFile(file: TextFileEntry) -> void:` Set the currently opened file. Set filename attribute of markdown-editor to switch the file.

_file exploring logic implementation note_

Note that in order to render directory structure within file system clearly, we need to traverse down the file tree given by FileStore in structured manner. One efficient way to do this is through DFS (depth-first search) on the file tree. Get the root file node by calling FileStore.getFile("/"). This is gurantted to be the root directory. Then, you can implement the DOM rendering as follows:

- render_file_to_dom(file: FileEntry)
  - if file is directory
    - return renderDirectoryToDom(file)
  - else
    - return renderTextFileToDom(file)
- renderDirectoryToDom(directory_file: DirectoryFileEntry)
  - rendered_element = create div element with CSS class "directory_node"
  - set rendered_element text to directory_file.getName()
  - for each child file of directory_file
    - rendered_element.append_child(render_file_to_dom(child file))
  - return rendered_element
- renderTextFileToDom(file: TextFileEntry)
  - rendered_element = create div element with CSS class "file_node"
  - add click event listener to rendered_element that will switch markdown file
  - set rendered_element text to file.getName()
  - return rendered_element

_one possible DOM structure_

```html
<div id="createFile_dialog" class="dialog_hidden"></div>
<div id="file_explorer_tab">
  <button>Create file</button>
  <button>Enter delete file mode</button>
  <!-- DOM element created by render_file_to_dom is inserted here -->
</div>
<div id="editory_tab">
  <markdown-editor filename="project/documentation.md"></markdown-editor>
</div>
```

(makrdown editor)

## Markdown Editor Component

### "Lowering" AST node to view components

Each AST node will be lowered into web components following hireachy. Each component will have associated text range within file buffer. Also, we will maintain the list of markdown AST node separetly from MDFile class to assist unwrapping process.

### Unwrapping of makrdown block

When any element of certain markdown block gets selected by user, it will unwrap the block into plain text view. In this process, only the relevant elements will be eliminated from DOM and get replaced by text component.

Figuring out which element is selected will be done through mapping of cursor position of texteditable to markdown block.

# Core model

We can totally embed business logic within each web native component through context. But, as most of our team members are not really familiar with this way of coding, we decided to go with classical and simple "model and view" architecture.

## App

A class that represents the web app.

- `get_journal_store() -> JournalStore:` Get JournalStore instance.
- `getFileStore() -> FileStore:` Get FileStore instance.

There will be a global instance of App that can be accessed by view components. i.e.

```javascript
const app_instance = new App();
export default app_instance;
```

## FileStore

File store is a virtual file system class which can be used to save / load / search files. For simplicity, all files reside in memory and periodic "sync" will dump all file contents to actual disk using FileStoreProvider.

- `constructor(provider: FileStoreProvider)`: Constructs new FileStore instance.
- `createFile(path: string) -> FileEntry?`: Create file at the specified path.
- `createDirectory(path: string) -> DirectoryFileEntry?`: Create directory at the specified path.
- `deleteFile(path: string) -> void`: Delete file at specified path.
- `getFile(path: string) -> FileEntry?`: Gets file entry corresponding to the path. Returns null if it doesn't exist.
- `getFiles() -> FileEntry[]`: List every file within entire file system.
- `getFilesInPath(path: string) -> FileEntry[]`: List every file in the specified directory
- `searchFiles(keyword: string) -> FileEntry[]`:
- `sync() -> void`: Syncs all file contents in the file store to the actual disk using the FileStoreProvider.
- `_save_to_JSON() -> string`: Serialize the root directory node to JSON string.
- `_load_from_JSON(json: string):` Load the root directory node from JSON string.
- `move_file(sourceFile, destinationDirectory) -> void`: move file from its parent to another directory.
- `sortFiles() -> void`: sort files in natural order and have directories appear before actual text files.

For simplicity, we are going to naively implement the file system using an explicit tree where directory nodes contains their children directories or files. FileStore will only hold the instance of "root" directory file entry node.

When saving to disk, we will serialize the root directory node using JSON to compress every files into one string. Then, we call FileStoreProvider.save() to save that string into disk. Loading is done in similar manner.

### FileStoreProvider (Abstract)

Abstraction for the actual storage device that provides file storage. We are only going to implement the "web browser local storage provider" for now, but we make this into abstract class interface so that we can easily support other provider such as google drive.

- `save(data: str) -> void`: Save a string to the disk
- `load() -> string?`: Loads a string from the disk

### LocalStorageFileStoreProvider

Implements FileStoreProvider interface by using web browser's local storage.

### FileEntry

Each file entry within file system.

- `constructor(parent: DirectoryFileEntry?, name: string, directory: bool)`: Create a file entry. Parent is null if it's root node.
- `getName() -> string`: Returns the name of the file entry.
- `getPath() -> string`: Returns the full path of the file entry.
- `getType() -> string`: 'text' or 'directory'

### DirectoryFileEntry

Subclass of FileEntry for representing directory.

- `getChildFiles() -> FileEntry[]`: Returns the files that this directory contains.
- `addChildFile(child: FileEntry)`: Adds a file entry as a child.
- `getChildFile(name: string) -> FileEntry?`: Gets a child file entry given the file name.
- `removeChildFile(child: FileEntry)`: Removes a file entry from this directory.

### TextFileEntry

Subclass of FileEntry for representing text file.

- `getContent() -> string`: Returns the content of the file entry.
- `setContent(content: string) -> void`: Sets the content of the file entry.
- `getType() -> string`: Returns the type of file.

For simplicity, the data encoding will always be UTF-8 plain text encoding. (i.e. it's just javascript String) When binary data is stored, we are simply going to use base64 to encode that into ASCII data and store it. But, base64 encoding will be done by the user of the FileEntry API; FileEntry only knows to deal with plain text string data.

## JournalStore

Utility class that manages journal markdown files using FileStore.

- `constructor(file_store: FileStore):` Create a JournalStore.
- `get_or_create_etnry(date: Date) -> JournalEntry`: Create or get the journal entry for given day.

### JournalEntry

Single journal entry with associated markdown file and date.

- `get_date() -> Date`: The date of the journal entry.
- `getFile() -> FileEntry`: Return the associated markdown file.

(markdown related classes)

## MDFile

Parsed markdown file. It's array of blocks each with root node of syntax tree of markdown laguages.

## MDFileParser

Actually parse text buffer into MDFile

### MDASTNode

Abstract syntax tree of markdown language. Each node has its range on text buffer
