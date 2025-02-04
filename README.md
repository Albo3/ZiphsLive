# ZiphsLive

A Chrome extension that analyzes webpage content and visualizes Zipf's law distribution in real-time. Features a Counter-Strike 1.6 inspired interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)

## Features

- Real-time text analysis of web pages
- Interactive word frequency distribution graph
- Top 10 most frequent words display
- Zipf's law correlation score
- CS1.6-inspired user interface

## Installation

1. Clone the repository
2. Install dependencies with: npm install
3. Build the extension with: npm run build
4. Open Chrome and go to chrome://extensions/
5. Enable "Developer mode"
6. Click "Load unpacked" and select the build folder

## Development

Available commands:
- npm run build: Create a production build
- npm run watch: Watch for changes during development

## Tech Stack

- React 18
- Chart.js for data visualization
- Webpack for building
- Chrome Extension Manifest V3

## How It Works

ZiphsLive analyzes webpage content by:
1. Extracting meaningful text content
2. Processing and counting word frequencies
3. Calculating correlation with Zipf's distribution
4. Displaying results in an interactive chart

## Use Cases

- Linguistics Research: Analyze text patterns
- Content Analysis: Study word distribution
- SEO Analysis: Check keyword frequency
- Educational: Demonstrate Zipf's law
