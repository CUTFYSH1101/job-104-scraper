# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Vue 3 job search visualization application (job-104-scraper) that displays job data from CSV files with D3.js-powered charts and force-directed graphs. Supports desktop and mobile views.

## Commands

  ```bash
  npm run dev       # Start development server (Vite)
  npm run build     # Production build
  npm run preview   # Preview production build
  npm run format    # Run custom code formatter (format-code.js)
  npm run deploy    # Build and deploy to GitHub Pages

  Architecture

  Entry Point

  - src/main.js - Creates Vue app, mounts to #app, loads initial job data

  Core Components Structure

  - App.vue - Root component with split-screen layout (Site + DetailPreview)
  - Site.vue - Main container with tabs: JobSearch, KeywordCoverage, SkillRecommend, BookmarksView
  - components/results/ - Tab content components (JobSearchResult, KeywordCoverageResult, etc.)
  - components/detail/ - Job detail preview panels (desktop/mobile variants)
  - components/utils/ - Reusable UI components (AlertDialog, HorizontalBar, MouseTracker)

  JavaScript Modules (src/js/)

  - jobsLoader.js - Loads CSV job data via PapaParse, manages reactive jobs state
  - keyword.js - Keyword search/filtering logic
  - utils.js - Shared utilities including loadJobs() for CSV parsing
  - graphDonut.js - D3 donut chart rendering
  - mobile/ - Mobile-specific logic (RWD, touch events, swipe gestures)
  - relation/ - Force-directed graph system:
    - graphRelation.js - Main graph class coordinating simulation, rendering, and interaction
    - forceSimulation.js - D3 force simulation wrapper
    - canvasRenderer.js - Canvas-based link rendering
    - interaction.js - Node hover/drag interactions
    - calcuBetweenRelation.js - Calculates node/link relationships from job data
    - multithreading/ - Web workers for heavy computations

  Data Flow

  1. CSV files loaded from data/ directory via PapaParse
  2. jobsLoader.js parses and stores jobs in Vue reactive state
  3. Components access jobs via computed property from jobsLoader.js
  4. Multiple modules receive path updates via setCurrentPath callbacks

  Key Patterns

  - Use @ alias for src/ imports (configured in vite.config.js)
  - Arrow functions for D3 callbacks to preserve this context in classes
  - Force simulation links transform from {source: 'id'} to {source: {id, x, y...}} after simulation runs
  - Mobile detection via src/js/mobile/rwd.js

  Code Style

  - Single quotes for strings (enforced by format-code.js)
  - No semicolons at line ends
  - SASS for component styles with scoped attribute
  - Tailwind CSS v4 for utility classes
