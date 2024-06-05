describe('Basic user flow for Website', () => {
    beforeAll(async () => {
        
        
        await page.goto('https://cse110-sp24-group17.github.io/cse110-sp24-group17/source/main');
    });
  
    // Check to make sure that the file starts off with an empty directory
    it('Initial File Explorer - it is empty ', async () => {
      console.log('Checking files...');
      // Query select to make sure the directory is present
      const children= await page.$eval('.directoryContainer', el => el.children);
      // Expect there there to be a project view 
      expect(Object.keys(children).length).toBe(0);
    }, 50000);

    // Check to make sure that a file is added correctly
    it('Adding to File Explorer', async () => {
        console.log('Adding files...');

        // Query the button to add a file and click on it
        const addFileButton = await page.$('#addFile');
        await addFileButton.click();
        const form = await page.$("#new-file-name");

        try{
            // Fill in name for the new file and submit it
            await form.click();
            await page.keyboard.type("ThisIsANewFile");
            const submit = await page.$('input[type=submit]')
            await submit.click();

            // Check that a new file was added
            const children= await page.$eval('.directoryContainer', el => el.children);
            expect(Object.keys(children).length).toBe(1);
        } 
        catch (err){
            console.error(err);
            console.log("The form to submit a name currently is not implemented");
            expect(0).toBe(1);
        }
      }, 50000);

    // Check to make sure that a folder is added correctly
    it('Adding to Folder Explorer', async () => {
        console.log('Adding folder...');

        const ogFileNum = await page.$eval('.directoryContainer', el => el.children.length);

        // Query the button to add a folder
        const addFileButton = await page.$('#addFolder');
        await addFileButton.click();

        // Fill in the new name of the folder and submit it 
        const form = await page.$("#new-folder-name");
        try{
            await form.click();
            await page.keyboard.type("ThisIsANewFolder");
            const submit = await page.$('input[type=submit]')
            await submit.click();
            const children= await page.$eval('.directoryContainer', el => el.children);

            // Check that the folder was added
            expect(Object.keys(children).length).toBe(ogFileNum + 1);
        } 
        catch (err){
            console.error(err);
            console.log("The form to submit a name currently is not implemented");
            expect(0).toBe(1);
        }
      }, 50000);

      // Check to make sure that a element in the directory can be deleted
    it('Deleting from File Explorer', async () => {
        console.log('Deleting an element from file explorer...');

        const ogFiles = await page.$eval('.directoryContainer', el => el.children);
        const ogFilesLength = ogFiles.length;

        // Query the button to delete elements
        const addFileButton = await page.$('#trashIcon');
        await addFileButton.click();

        // Fill in the new name of the folder and submit it 
        try{
            await ogFiles[0].click();
            expect(ogFiles.length).toBe(ogFilesLength - 1);
        } 
        catch (err){
            console.error(err);
            console.log("No elements can be added atm")
            expect(0).toBe(1);
        }
      }, 50000);

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