# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Frontend Development
```bash
# Install dependencies (use legacy peer deps due to React 19)
npm install --legacy-peer-deps

# Run development server (port 3000)
npm run dev

# Lint code
npm run lint

# Auto-fix linting issues
npm run check

# Build production version
npm run build
```

### Python Tools Development
```bash
# Navigate to tools directory
cd tools

# Install dependencies
poetry install

# Lint Python code
poetry run ruff check .

# Auto-fix Python linting issues
poetry run ruff check --fix .

# Format Python code
poetry run ruff format .

# Type check Python code
poetry run pyright .

# Run tests
poetry run pytest
```

### Data Processing Workflow
```bash
# 1. Download political fund reports (example: fiscal year R5)
cd tools && python -m downloader.main -y R5

# 2. Convert PDF to images
python pdf_to_images.py <pdf_file> -o output_images

# 3. Analyze images with Gemini API (requires GOOGLE_API_KEY env var)
python analyze_image_gemini.py -d output_images -o output_json

# 4. Merge JSONs into single file
python merge_jsons.py

# 5. Convert to frontend data structure
npx tsx data/converter.ts -i data/sample_input.json -o data/sample_output.json
```

## Architecture Overview

### Frontend (Next.js + TypeScript)
- **Framework**: Next.js 15 with React 19
- **UI Library**: Chakra UI v3 with emotion
- **Data Visualization**: Nivo charts (pie, sankey)
- **Styling**: Global CSS with CSS-in-JS
- **Type System**: Strict TypeScript with defined models in `models/type.d.ts`

### Python Tools
- **PDF Processing**: pdf2image for converting political fund reports
- **OCR/Analysis**: Google Gemini API for extracting structured data from images
- **Data Pipeline**: Download → PDF to Images → OCR → JSON merge → Frontend conversion

### Development Workflow
- **Git Hooks**: Pre-commit hooks via lefthook for both JS/TS (biome) and Python (ruff, pyright)
- **Code Style**: Biome for JS/TS, Ruff for Python
- **Issue Management**: GitHub Projects with specific workflow (see PROJECTS.md)
- **Contribution Process**: Requires CLA agreement, issue discussion before implementation

## Key Data Models

### Profile
Political figure profile with name, title, party, district, and image.

### Report
Political fund report summary including income, expenses, organization details, and metadata.

### Flow
Hierarchical income/expense flow data for visualization.

### Transaction
Detailed transaction records with category, purpose, and amount.

## Important Considerations

1. **Port Configuration**: Frontend runs on port 3000, backend API on port 8000
2. **Branch Strategy**: Never commit directly to main branch
3. **Testing**: Run tests before committing, ensure all checks pass
4. **Pre-commit Hooks**: Automatically run linting and formatting
5. **API Keys**: Set GOOGLE_API_KEY for Gemini API usage
6. **Legacy Dependencies**: Use `--legacy-peer-deps` due to React 19 compatibility

## Architecture Decision Process
Major architectural decisions follow ADR process documented in `docs/adr/ADR.md`. New decisions are proposed via GitHub Discussions, reviewed by maintainers, and documented when accepted.