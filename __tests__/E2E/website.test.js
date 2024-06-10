import {setTimeout} from "node:timers/promises";

describe('Basic user flow for Website', () => {
    beforeAll(async () => {
        await page.goto('https://cse110-sp24-group17.github.io/cse110-sp24-group17/source/main');
        await page.evaluate(() => {
          localStorage.setItem('filestore', `{"name":"","type":"directory","content":"","children":[]}`);
        });
        await page.reload();
    });
  
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
        const journalView = await page.$('#JournalView'); // Grab an element from the file explorer that can be dragged to flip to Journal View
        let rect1 = await journalView.boundingBox(); await page.mouse.move(rect1.x, rect1.y);
        await page.mouse.down();
        await page.mouse.move(500,0, {delay: 20000});
        await page.mouse.up();
        await setTimeout(999);

        const addFileButton = await page.$('#addFile'); // Query the addFile button
        await addFileButton.click();

        const fileExplorer = await page.$('file-explorer');  // Get the shadow root of the file explorer
        const shadow = await fileExplorer.getProperty("shadowRoot");
        const ogChildren = await shadow.$eval("#file", el => el.children);

        const form = await shadow.$("#add-file"); // Submit the new file name 
        await form.click();
        await page.keyboard.type("ThisIsANewFile");
        const submit = await form.$('input[type=submit]')
        await submit.click();

        await addFileButton.click();
         await form.click();
         await page.keyboard.type("Another file");
         await submit.click();

        const childrenFiles = await shadow.$eval("#file", el => el.children);
        expect(Object.keys(childrenFiles).length).toBe(Object.keys(ogChildren).length + 2);
      }, 50000);
    
    // Check to make sure that a folder is added correctly
    it('Adding to Folder Explorer', async () => {
        console.log('Adding folder...');
        const addFolderButton = await page.$('#addFolder');
        await addFolderButton.click();

        const fileExplorer = await page.$('file-explorer');
        const shadow = await fileExplorer.getProperty("shadowRoot");
        const ogChildren = await shadow.$eval("#file", el => el.children);

        const form = await shadow.$("#add-folder"); // Submit the new folder name 
        await form.click();
        await page.keyboard.type("ThisIsANewFolder");
        const submit = await form.$('input[type=submit]')
        await submit.click();

        await addFolderButton.click();  // Submit another folder
        await form.click();
        await page.keyboard.type("ThisIsAnotherFolder");
        await submit.click();

        const childrenFiles = await shadow.$eval("#file", el => el.children);
        expect(Object.keys(childrenFiles).length).toBe(Object.keys(ogChildren).length + 2);
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

    // Switch from file explorer view to project view
    it('Switching from file explorer view to project view', async () => {
      console.log('Switching view...');

      const addFileButton = await page.$('#JournalView'); // Grab an element from the file explorer that can be dragged to flip to Journal View
      let rect1 = await addFileButton.boundingBox();
      await page.mouse.move(rect1.x, rect1.y);
      await page.mouse.down();
      await page.mouse.move(500,0, {delay: 20000});
      await page.mouse.up();
      await setTimeout(999);

      const zIndex = await page.evaluate(() => {
        const element = document.querySelector('#ProjectView');
        if (element) {
          return element.style.zIndex;
        }
        return null;
      });

      expect(zIndex).toBe("20");
    }, 50000); 

    // Add a note to the journal notepad //CURRENTLY THIS FUNCTIONALITY HAS NOT BEEN ADDED - delete if it does not get completed
    /*it('Switching from file explorer view to project view', async () => {
      console.log('Switching view...');

      const scratchPad = await page.$('#scratchPadInput');
      await scratchPad.click()
      await page.keyboard.type("I am writing a note that is very important!");
      const newNote = await page.$eval("#scratchPadInput", el => el.innerHTML)
      const calendar = await page.$("#calendar");
      await calendar.click();
      expect(newNote).toBe("I am writing a note that is very important!");
    }, 50000); */
  
  });
