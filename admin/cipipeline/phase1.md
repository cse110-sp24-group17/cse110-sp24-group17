# CI/CD Pipeline

### Current Status:
#### Implemented:
- Currently, we enforce code quality and checks for potential issues automatically when pushing/merging pull requests using Codacy.
- Code quality via human review is done by making sure we make our changes to a different branch before pushing to main, and that we always open a pull request for reviews and see the results of automated tests.
- We have set up a very basic unit test template done using Jest, the set of tests is to be expanded.
- We will also use JSDoc to automate documentation generation during development.
#### Planned:
- Currently, JSDoc is used semi-manually to generate documentation using the jsdoc command during development. This could potentially be automated into the pipeline so that the documentation page could be automatically generated when pushing.
- The current example of unit tesst implemented is only for demonstration purpose since we don't really have any code to test yet, more tests will be continuously implemented during the development process and the format of the pipeline may be adjusted accordingly.
- We will add e2e and pixel testing later on when we have more content to work with.
- Other tests such as code coverage report may be added depending on how the project goes.

### Research/notes for future plans:
### 1. Linting and Code Style Enforcement
- Code style enforcement/check: Tools available (e.g. CSharpier) to both check and correct code locally, or check code style in CI pipelines. May need to choose specific tools depending on the language we use (javascript).
- "Linting is concerned with code quality, potential issues, and adherence to coding standards and best practices. Linters use predefined rules or configurations to identify and report code issues, such as unused variables, potential bugs, non-standard coding practices, etc."
	
TLDR: Checks code risks such as redundant variables.
- Consult Lab 5 and 6 for implementation examples: general test setup should be very similar, with specific code style checking tools.

### 2. Code Quality via Tool (Codacy)
- Codacy is a code style/quality checking tool that can be configured for Github repos, automatically testing all source code for code quality on pull requests.

Consult Codacy Documentation [here]( https://docs.codacy.com/getting-started/integrating-codacy-with-your-git-workflow/#integrating-codacy-with-your-git-workflow).
### 3. Code Quality via Human Review (Pull Requests)
- Small incremental PR
    - Include good **title** and concise but useful **description**
    - Include contributors 
    - Make PR from protected branch to **isolate** changes / errors 
- Tie Issue to PR
    - If a PR addresses issue then should tie them together
### 4. Unit Tests via Automation
- Jest
    - Useful for testing functions 
    - Can simulate dependencies
    - Tell you how many lines of code were tested
- Tape
  - Minimalist Testing
  - Has less features than Jest -> no dependency sims
- AVA
    - Similar to Tape 
    - Allows parallel testing
    - Good for testing quickly 
- Cyprus 
    - Test UI
    - E2E Testing 
    - Time Travel Debugging (similar to GDB)
- Mocha / Chai
    - Very similar to TAPE and AVA
    - Has more plugins and integrations though
  
Research Opinion: I think for what we are doing we should use JEST in the case we use many dependencies. It seems like it has strong support for it and can do all the things the other tools can do. (Besides Cyprus which is E2E testing). The JEST tests are also written in JavaScript.

***

Example:

- https://github.com/cse110-sp24-group17/warmup-exercise/blob/main/modules/date_util.test.js -> thanks **Sunho** for writing this test 
- https://github.com/cse110-sp24-group17/warmup-exercise/blob/main/.github/workflows/run_test.yml -> YML file that runs these test on push

***

### 5. Documentation Generation via Automation (JSDocs)
- Documentation generation via automation involves automatically creating documentation for our project based on comments and annotations within the code.
> JSDoc is a documentation tool for JavaScript code, similar to Javadoc. It works by adding documentation comments directly within the source code, alongside the code itself. JSDoc comments follow a specific format and include tags like **‘@param’**, **‘@returns’**, and **‘@description’**.

- Why JSDocs is helpful:
  - Helps developers understand the purpose, and usage of code elements
  - Encourages developers to maintain consistent documentation
  - Supports automation of the documentation generation
- JSDoc comments example:
    ```

    /**
    * Calculate the sum of two numbers.
    * 
    * @param {number} a - The first number.
    * @param {number} b - The second number.
    * @returns {number} The sum of the two numbers.
    */
    function add(a, b) {
        return a + b;
    }

    ```
- Installing JSDoc: can install it by running ‘npm install --save-dev jsdoc’
  
    More information [here](https://jsdoc.app/).
- Create a configuration file (e.g., jsdoc.conf.json) to specify options for JSDoc generation, here is an example:
  ```
  {
    "source": {
      "include": ["src/"],  
      "exclude": ["node_modules/"]  
    },
    "opts": {
      "destination": "docs/", 
      "recurse": true 
    },
    "templates": {
      "cleverLinks": true,  
      "monospaceLinks": false 
    }
  }

  ```
- Running JSDocs: When running JSDoc, it parses the source files of your project based on the configuration specified in the JSDoc configuration file (jsdoc.conf.json).

### 6. Other Testing Including E2E (end to end) and Pixel Testing
- Pixel testing verifies the visual appearance of a UI by comparing screenshots of the UI before and after changes.
  - Percy: captures screenshots of web pages and automatically detects visual changes
  - BackstopJS (also a visual regression testing tool by screenshots)
- E2E testing evaluates an application's functionality by simulating real user scenarios from start to finish, ensuring all components work together as intended.
  - Cypress: it includes time-travel debugging, allowing for real-time feedback during test execution. Also, it automatically waits for commands and assertions before moving on.

### Diagram of Pipeline:


![](/admin/cipipeline/phase1.drawio.png)











