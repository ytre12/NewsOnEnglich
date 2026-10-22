<h1 align="center">News in English by Levels</h1>



<p align="center">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&amp;logo=react&amp;logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&amp;logo=javascript&amp;logoColor=%23F7DF1E" alt="JavaScript" />
  <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&amp;logo=html5&amp;logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge&amp;logo=css&amp;logoColor=white" alt="CSS" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&amp;logo=vite&amp;logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&amp;logo=npm&amp;logoColor=white" alt="npm" />
  <img src="https://img.shields.io/badge/github_pages-%23222222.svg?style=for-the-badge&amp;logo=githubpages&amp;logoColor=white&amp;logoSize=auto" alt="GitHub Pages" />
  <img src="https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&amp;logo=figma&amp;logoColor=white" alt="Figma" />
</p>

<p align="center">
  A React application for practising English at three difficulty levels. Built as an educational and portfolio project.
</p>

<p align="center">
  <a href="https://ytre12.github.io/NewsOnEnglich/"><strong>Open live demo</strong></a>
  &nbsp;·&nbsp;
  <a href="#features">Features</a>
  &nbsp;·&nbsp;
  <a href="#run-locally">Run locally</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/ytre12/NewsOnEnglich/actions/workflows/deploy.yml">Deployment status</a>
</p>

## Screenshots

![News in English app showcase](docs/portfolio-showcase.png)

## Features

- Read articles at Levels 1, 2, and 3, with vocabulary explanations.
- Filter articles by today's date.
- Browse news with pagination: 10 articles per page.
- Add and remove favorites, saved in the current browser.
- Use responsive layouts on mobile and desktop.

## Built with

- React for the user interface
- Vite for development and production builds
- Tailwind CSS for styling
- Node.js and Cheerio for scraping news
- localStorage for favorite article IDs
- Oxlint for static code checks
- GitHub Actions and GitHub Pages for automation and hosting

## How it works

1. A Node.js scraper collects articles and their difficulty levels from News in Levels.
2. It merges the results with the existing dataset and writes `data/news.json`.
3. The React app fetches that JSON from this repository's `main` branch through GitHub's raw-content URL.
4. Users browse articles, select levels, and save favorite IDs in localStorage.

The frontend is a static application: it does not require a running Node.js backend. Node.js is used for development, builds, and scraping.

The news-update workflow is scheduled every six hours (UTC) and can also be started manually. Scheduled execution does not guarantee immediate availability of new articles.

## Run locally

### Requirements

- Node.js 24, matching the scraper workflow. The installed Vite version requires `^20.19.0 || >=22.12.0`; not every Node.js 20 release is supported.
- npm and Git
- Internet access to install dependencies and load news

### Installation

Clone the repository:

```bash
git clone https://github.com/ytre12/NewsOnEnglich.git
```

Navigate to the project directory:

```bash
cd NewsOnEnglich
```

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal.

## Project structure

```text
NewsOnEnglich/
├── .github/
│   └── workflows/       # Deployment and news updates
├── data/                # Scraped news dataset
├── docs/                # Screenshots and project showcase
├── src/
│   ├── components/      # UI components and article views
│   ├── App.jsx          # Application state and screen rendering
│   ├── fetch.js         # Remote news loading
│   └── localSotre.js     # Favorites stored in localStorage
├── scraper.js           # News collection and dataset updates
└── vite.config.js       # Build settings and GitHub Pages base path
```

## Content source

Articles and vocabulary are sourced from [News in Levels](https://www.newsinlevels.com/).
This independent educational project is not affiliated with or endorsed by News in Levels.

## License

A license for this project's original code has not yet been selected. No `LICENSE` file is currently included.
Third-party news content is separate from the application code and is not covered by a code license for this project.

