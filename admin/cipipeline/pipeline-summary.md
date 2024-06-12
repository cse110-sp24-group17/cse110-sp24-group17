# CI/CD Pipeline Summary

## This is a brief summary of the final pipeline that is implemented for our project, particularly those implemented through GitHub Actions.

### Implemented Features:

- Unit Tests: Unit Tests are automatically ran using Jest under jsdom environment on push.
- E2E Tests: E2E Tests are automatically ran using jest-puppeteer, babel and Xvfb (to simulate the E2E process in pipeline).
- Coverage Reporting: The results of the Unit Tests are collected and used to generate Coverage Report, which is sent to Codacy and displayed on the repository dashboard.
- Code Linting, Styling and Quality Checks: Codacy is set up for the project with a set of configured coding patterns, which checks for common linting, quality and styling issues.
- JSDoc Generation: JSDoc comments in our code are automatically used to generate documentation page, which is pushed to a special branch named update-jsdoc and with a pull request generated to merge the changes to main. This is done to ensure documentation is only changed when we are sure a component is correctly implemented.
- Protected main: Branch protection is set up on main to ensure all changes are made through pull requests with review from another developer, and basic testings including E2E and Unit tests must pass.
- Build and Deployment: Done through GitHub Pages.
