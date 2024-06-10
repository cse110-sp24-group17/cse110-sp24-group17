import {setTimeout} from "node:timers/promises";

describe('Basic user flow for Website', () => {
    beforeAll(async () => {
        await page.goto('https://cse110-sp24-group17.github.io/cse110-sp24-group17/source/main');
    });


     // Add a note to the journal notepad //CURRENTLY THIS FUNCTIONALITY HAS NOT BEEN ADDED - delete if it does not get completed
     it('Adding a note to the scratch pad', async () => {
        console.log('Writing into scratch pad...');
  
        const scratchPad = await page.$('#scratchPadInput');
        await scratchPad.click()
        await page.keyboard.type("I am writing a note that is very important!");
        const newNote = await page.$eval("#scratchPadInput", el => el.value)
        const calendar = await page.$("#calendar");
        await calendar.click();
        expect(newNote).toBe("I am writing a note that is very important!");
      }, 50000); 

    // Switch from file explorer view to project view
    it('Switching from file explorer view to project view', async () => {
        console.log('Switching view...');
  
        const addFileButton = await page.$('#addFile'); // Grab an element from the file explorer that can be dragged to flip to Journal View
        let rect1 = await addFileButton.boundingBox();
        await page.mouse.move(rect1.x, rect1.y);
        await page.mouse.down();
        await page.mouse.move(500,0, {delay: 20000});
        await page.mouse.up();
        await setTimeout(999);
  
        let journalStatus = await page.$eval("#JournalView", el => el.style["z-index"]);
        expect(journalStatus).toBe("10");
      }, 50000); 
    
  
    // Check to make sure that the file starts off with a root directory
    it('Initial File Explorer - it is empty ', async () => {
        console.log('Checking files...');
        const fileExplorer = await page.$('file-explorer');  // Query select the shadow root of the file explorer
        const shadow = await fileExplorer.getProperty("shadowRoot");
        const root = await shadow.$(".root"); // Get the root directory

      expect(root).not.toBeNull(); // Check if the root exists
    }, 50000);

    // Check to make sure that a file can be added
    it('Adding to File Explorer', async () => {
        console.log('Adding files...');

        const addFileButton = await page.$('#addFile'); // Query the addFile button
        await addFileButton.click();
        

        const fileExplorer = await page.$('file-explorer');  // Get the shadow root of the file explorer
        const shadow = await fileExplorer.getProperty("shadowRoot");
        const files = await shadow.$$(".text-file");
        console.log(files);

        const form = await shadow.$("#add-file"); // Submit the new file name 
        await form.click();
        await page.keyboard.type("ThisIsANewFile");
        const submit = await form.$('input[type=submit]')
        await submit.click();

        const newFiles = await shadow.$$(".text-file");
        expect(Object.keys(newFiles).length).toBe(Object.keys(files).length + 1);
      }, 50000);
    
    // Check to make sure that a folder is added correctly
    it('Adding to Folder Explorer', async () => {
        console.log('Adding folder...');

        const addFolderButton = await page.$('#addFolder');
        await addFolderButton.click();

        const fileExplorer = await page.$('file-explorer');
        const shadow = await fileExplorer.getProperty("shadowRoot");
        const directories = await shadow.$$(".directory");

        const form = await shadow.$("#add-folder"); // Submit the new folder name 
        await form.click();
        await page.keyboard.type("ThisIsANewFolder");
        const submit = await form.$('input[type=submit]')
        await submit.click();

        await addFolderButton.click();  // Submit another folder
        await form.click();
        await page.keyboard.type("ThisIsAnotherFolder");
        await submit.click();

        const newDirectories = await shadow.$$(".directory");
        expect(Object.keys(newDirectories).length).toBe(Object.keys(directories).length + 2);
      }, 50000);

    // Check to make sure that a element in the directory can be deleted
    it('Deleting from File Explorer', async () => {
        console.log('Deleting an element from file explorer...');

        const fileExplorer = await page.$('file-explorer');
        const shadow = await fileExplorer.getProperty("shadowRoot");
        let children = await shadow.$eval("#file", el=>el.children);
        const numChildren = Object.keys(children).length;

        const deleteButton = await page.$('#trashIcon'); // Query the button to delete elements
        await deleteButton.click();

        const childToDelete =await shadow.$(".file-entry"); // Get the first text file and delete it  
        await childToDelete.click();
    
        let newChildren = await shadow.$eval("#file", el =>el.children);
        expect(numChildren - 1).toBe(Object.keys(newChildren).length);

      }, 50000);

    // Check to make sure that information in the file explorer stays on reload
    it('Reloading the page', async () => {
      console.log('Reloading the page...');

      const fileExplorer = await page.$('file-explorer'); 
      const shadow = await fileExplorer.getProperty("shadowRoot");
      let children = await shadow.$eval("#file", el=>el.children);
      const numChildren = Object.keys(children).length;

      await page.reload();

      const newfileExplorer = await page.$('file-explorer');
      const newshadow = await newfileExplorer.getProperty("shadowRoot");
      let newChildren = await newshadow.$eval("#file", el =>el.children);

      expect(numChildren).toBe(Object.keys(newChildren).length);
    }, 50000);
  });