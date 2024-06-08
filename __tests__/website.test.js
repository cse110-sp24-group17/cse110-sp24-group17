describe('Basic user flow for Website', () => {
    beforeAll(async () => {
        await page.goto('https://cse110-sp24-group17.github.io/cse110-sp24-group17/source/main');
    });
  
    // Check to make sure that the file starts off with a root directory
    it('Initial File Explorer - it is empty ', async () => {
        console.log('Checking files...');
        // Query select the shadow root of the file explorer
        const fileExplorer = await page.$('file-explorer');
        const shadow = await fileExplorer.getProperty("shadowRoot");
        // Get the root directory
        const root = await shadow.$(".root");

      // Check if the root exists
      expect(root).not.toBeNull();
    }, 50000);

    // Check to make sure that a file can be added
    it('Adding to File Explorer', async () => {
        console.log('Adding files...');

        // Query the addFile button
        const addFileButton = await page.$('#addFile');
        await addFileButton.click();

        // Get the shadow root of the file explorer
        const fileExplorer = await page.$('file-explorer');
        const shadow = await fileExplorer.getProperty("shadowRoot");

        // Record children files and folders from the beginning
        const ogChildren = await shadow.$eval("#file", el => el.children);

        // Submit the new file name 
        const form = await shadow.$("#add-file");
        await form.click();
        await page.keyboard.type("ThisIsANewFile");
        const submit = await form.$('input[type=submit]')
        await submit.click();

        // Check that one element was added
        const childrenFiles = await shadow.$eval("#file", el => el.children);
        expect(Object.keys(childrenFiles).length).toBe(Object.keys(ogChildren).length + 1);
      }, 50000);
    
    // Check to make sure that a folder is added correctly
    it('Adding to Folder Explorer', async () => {
        console.log('Adding folder...');

        // Query the addFolder button
        const addFolderButton = await page.$('#addFolder');
        await addFolderButton.click();

        // Get the shadow root of the file explorer
        const fileExplorer = await page.$('file-explorer');
        const shadow = await fileExplorer.getProperty("shadowRoot");

        // Record children files and folders from the beginning
        const ogChildren = await shadow.$eval("#file", el => el.children);

        // Submit the new folder name 
        const form = await shadow.$("#add-folder");
        await form.click();
        await page.keyboard.type("ThisIsANewFolder");
        const submit = await form.$('input[type=submit]')
        await submit.click();

        // Check that one element was added
        const childrenFiles = await shadow.$eval("#file", el => el.children);
        expect(Object.keys(childrenFiles).length).toBe(Object.keys(ogChildren).length + 1);
      }, 50000);

    // Check to make sure that a element in the directory can be deleted
    it('Deleting from File Explorer', async () => {
        console.log('Deleting an element from file explorer...');

        // Get the shadow root of the file explorer
        const fileExplorer = await page.$('file-explorer');
        const shadow = await fileExplorer.getProperty("shadowRoot");

        // Record children files and folders from the beginning
        let children = await shadow.$eval("#file", el=>el.children);
        const numChildren = Object.keys(children).length;

        // Query the button to delete elements
        const deleteButton = await page.$('#trashIcon');
        await deleteButton.click();

        // Get the first text file and delete it  
        const childToDelete =await shadow.$(".file-entry");
        await childToDelete.click();
    
        let newChildren = await shadow.$eval("#file", el =>el.children);
        expect(numChildren - 1).toBe(Object.keys(newChildren).length);

      }, 50000);

    // FIXME
    // Switch from file explorer view to project view
    it('Switching from file explorer view to project view', async () => {
        console.log('Switching view...');

        let moveObj = await page.$('#ProjectView');
        const fileOffset = await page.$eval('#ProjectView', el => el.getAttribute("class"));
        const journalOffset = await page.$eval('#JournalView', el => el.getAttribute("class"));
        console.log(journalOffset);
        console.log(fileOffset);
       
        if (fileOffset == "swiper-slide swiper-slide-next") {
            moveObj = await page.$('#JournalView');
        }

        let rect = await moveObj.boundingBox();
        console.log(rect);
        page.mouse.move(0,0);
        await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
        await page.mouse.down();
        await page.mouse.move(0, 0);
        await page.mouse.up();
        
        const file = await page.$eval('#ProjectView', el => el.getAttribute("class"));
        expect(file).toBe(journalOffset);
      }, 50000); 
  
  });