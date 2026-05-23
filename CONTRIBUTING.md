# 🤝 Contributing to MapperScrape

Thank you for showing interest in contributing to **MapperScrape**! We are thrilled to welcome your support. Whether you're fixing a minor UI alignment, improving scraper speed, adding anti-bot protection layers, or polishing documentation—your contributions are highly valued.

Please take a few moments to review this guide to ensure a smooth, fast, and successful review process for your changes.

---

## 📖 Table of Contents
1. [Code of Conduct](#-code-of-conduct)
2. [How Can I Contribute?](#-how-can-i-contribute)
3. [Local Development Setup](#-local-development-setup)
4. [Coding Guidelines & Standards](#-coding-guidelines--standards)
5. [Commit Message Conventions](#-commit-message-conventions)
6. [Pull Request (PR) Submission Checklist](#-pull-request-pr-submission-checklist)

---

## 🛡️ Code of Conduct

By participating in this project, you agree to uphold friendly, inclusive, and professional communication. We strive to maintain a welcoming environment for developers of all skill levels.

---

## 💡 How Can I Contribute?

### 1. Reporting Bugs 🐛
If you encounter a scraper crash, layout breakage, or a bug:
- Check the existing **GitHub Issues** to see if it has already been reported.
- If not, open a new issue detailing:
  - What search query/parameters triggered the error.
  - The browser/OS version you are running.
  - Exact error logs from the terminal panel.
  - Step-by-step instructions to reproduce the issue.

### 2. Suggesting Enhancements 🚀
Have an idea to make MapperScrape better?
- Open a feature request issue.
- Describe the feature's utility and why it would benefit other users.
- Outline your proposed design or backend architecture if applicable.

### 3. Submitting Pull Requests (PRs) 📥
If you want to write code to solve an issue:
1. Find an open issue (or create one) and claim it.
2. Fork the repository and build your changes locally.
3. Submit a Pull Request following the guidelines below.

---

## 🛠️ Local Development Setup

Set up your workspace locally in a few easy steps:

### 1. Fork and Clone
Fork the repository on GitHub and clone your fork:
```bash
git clone https://github.com/<your-username>/GoogleMap-Scrapping-Application.git
cd GoogleMap-Scrapping-Application
```

### 2. Configure Remote Upstream
Keep your local branch in sync with the primary repository:
```bash
git remote add upstream https://github.com/Raman0925/GoogleMap-Scrapping-Application.git
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create a Working Branch
Create a descriptive branch for your changes:
```bash
# For a new feature
git checkout -b feat/add-proxy-rotation

# For a bug fix
git checkout -b fix/scroll-stuck-resolution
```

### 5. Run the Local Development Environment
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to live test your edits.

---

## 📏 Coding Guidelines & Standards

To maintain high code quality, we ask all contributors to follow these conventions:

### TypeScript & React
*   Write type-safe code; avoid utilizing `any` unless absolutely necessary (e.g. handling dynamic scraper DOM objects).
*   Follow **React 19** best practices (e.g., standard hooks, proper ref usage, dependency arrays in `useEffect`).
*   Keep components small, modular, and focused.

### Styling & CSS
*   We use **Vanilla CSS** (`src/app/globals.css`) alongside custom component classes for premium UI styles and fluid micro-animations. Avoid adding inline layout styling.

### 🧪 Writing and Running Tests
Our application utilizes **Jest** for robust unit testing. Every code change should be covered by corresponding tests.

*   To run existing tests:
    ```bash
    npm test
    ```
*   To check test coverage stats:
    ```bash
    npm run test:coverage
    ```
*   Please ensure that **all tests pass successfully** and your code coverage does not decrease before creating a Pull Request.

---

## 📝 Commit Message Conventions

We follow the **Semantic Commit Messages** standard. This keeps the git history clean, informative, and easily searchable:

Each commit should use the following format:
```
<type>(<scope>): <short description>
```

### Supported Types:
*   `feat`: A new feature (e.g., `feat(scraper): add custom browser proxy config`)
*   `fix`: A bug fix (e.g., `fix(parser): resolve phone parser index error`)
*   `docs`: Documentation changes only (`docs(readme): add troubleshooting section`)
*   `style`: Formatting, semi-colons, aesthetic updates (no code logic changes)
*   `refactor`: Code reorganization that neither fixes a bug nor adds a feature
*   `test`: Adding missing tests or correcting existing ones (`test(parser): increase DOM boundary coverage`)
*   `chore`: Updating build tasks, package dependencies, config files (`chore(deps): upgrade Puppeteer`)

---

## 📋 Pull Request (PR) Submission Checklist

Before requesting a review, verify that your PR fulfills all the checkmarks below:

- [ ] Your code merges cleanly with the current `main` branch.
- [ ] TypeScript compiles cleanly with no compiler warnings (`npm run build`).
- [ ] No ESLint violations are present (`npm run lint`).
- [ ] All unit and integration tests pass successfully (`npm test`).
- [ ] You have added corresponding tests covering your new feature or bug fix.
- [ ] The `README.md` has been updated if your change introduces new options or flags.
- [ ] Your commit messages adhere to the semantic structure.

---

## 💬 Need Help?

If you ever get stuck or have questions about the scraper engine internals, open a draft PR and ask for help in the comments, or open a discussion thread. We are here to support you!

Thank you again for making **MapperScrape** awesome! Happy coding! 🚀
