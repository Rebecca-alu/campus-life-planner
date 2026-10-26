Campus Life Planner

Section 1 : Project overview

Campus life planner is  a web applicationthqt helps students organize academic tasks, campus events, and study time.


Section 2: Technologies I used

HTML - to create the structure of the website,
CSS -to style the website and makes it responsive.
Javascript - to add functionality and handle all data
Local storage - to save data in the browser.

Section 3: Project Files

index.html - Basically the main website.
style.css - the website's design.
app.js - thats the main javascript functionality.
test.html - runs tests to check the code.
seed.json - contains sample activity data.
README.md - explain the whole project.

Section 4: How to run

Website Link

https://rebecca-alu.github.io/campus-life-planner/

Demo video : This demo helps you to understand how the website works

https://youtu.be/cNT8XKnA7PY

Section 3: Features

Task management: Add, edit, and delete academic tasks.
Task details: Record a task title, due date, estimated duration, and tag.
Dashboard: Display task statistics and study-duration information.
Validation: Check user input before saving records.
Regex search: Search for records using regular expression patterns.
Sorting: Organize records using supported sorting options.
Local storage: Save records in the browser using localStorage.
JSON import and export: Transfer records using JSON files, with validation before imported data is accepted.
Settings: Configure the supported planner preferences and targets.
Responsive layout: Adapt the interface to different screen sizes.
Accessibility: Support clear form labels, keyboard focus, semantic structure, and status messages.

 Section 4: Regular Expression Catalog

The following patterns illustrate the types of validation and search used in the project. Confirm that each pattern appears in the final JavaScript before treating it as part of the implemented code.

| Purpose | Pattern | Explanation |
|---|---|---|
| Title spacing | `/^\S(?:.*\S)?$/` | Prevents leading or trailing whitespace for non-empty titles. |
| Duration | `/^(0\|[1-9]\d*)$/` | Accepts a non-negative whole number without unnecessary leading zeros. |
| Date format | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | Checks the basic YYYY-MM-DD format and numeric ranges. |
| Tag format | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Allows words separated by spaces or hyphens. |
| Duplicate words | `/\b(\w+)\s+\1\b/i` | Detects a repeated word next to itself, ignoring case. |
| Tag search | `/^@tag:\w+/` | Matches a search expression beginning with `@tag:` followed by a word. |

Section 6: Accessibility Notes
The project aims to make the website usable by people with different access needs.
Semantic HTML: Use elements such as header, nav, main, and section to organize the page.
Form labels: Associate labels with their corresponding input fields.
Keyboard navigation: Keep interactive controls reachable using the keyboard.
Visible focus: Make the currently focused control visually clear.
Status messages: Use appropriate live regions to communicate updates and validation errors.
Color contrast: Use readable text and background combinations.
Responsive design: Support different screen sizes without unnecessary horizontal scrolling.
Safe text display: Display user-provided text as text rather than interpreting it as HTML.
Accessibility should be checked in the running application, not just documented in this file.

Section 7: Testing Instructions

Manual testing
Open the website in a browser.
Add a task with valid information and check that it appears.
Try submitting incomplete or invalid information.
Edit an existing task and confirm the changes appear.
Delete a task and verify that it is removed.
Test sorting and regex search using matching and non-matching patterns.
Enter an invalid regex and check that the application handles it without crashing.
Refresh the page and verify that saved records remain available.
Export records to JSON and inspect the downloaded file.
Import a valid JSON file and check that its records appear.
Try importing invalid JSON or an incorrect data structure and verify that it is rejected safely.
Test the website at mobile and desktop screen sizes.
Navigate through the interface using only the keyboard.
Automated tests
If a separate tests.html page is included, open it in the browser and run the available validation and functionality checks. Record which tests pass and investigate any failures.
Do not claim that automated tests pass until they have actually been run.

Section 8: Project Structure

campus-life-planner/
├── index.html
├── style.css
├── app.js
├── tests.html
├── seed.json
└── README.md
This is the expected structure if all the listed files are present in the repository. Update it to match your actual project.

Section 9: Author

Rebecca Umuragwa
GitHub: https://github.com/Rebecca-alu
Project: Campus Life Planner

Section 10: Conclusion

Campus Life Planner demonstrates how HTML, CSS, and JavaScript can work together to build a practical student productivity tool. The project applies responsive design, input validation, regular expressions, browser storage, data management, and accessibility principles to help students organize their academic work.


