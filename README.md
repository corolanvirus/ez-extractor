# ez-extractor

This tool extracts the number following 'financement n°' from one or more PDF files with a consistent structure, using Node.js and TypeScript.

## How it works

- Place your PDF files in the `input` directory at the project root.
- For each PDF, the script extracts all text and searches for the number after 'financement n°'.
- The output is a JSON mapping:

```json
{
  "filename.pdf": "Number: 123456"
}
```

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

The script will automatically process all PDF files in the `input` directory.

## Configuration

- The input directory path and the extraction regex are defined as constants at the top of `src/index.ts`.
- To change the extraction pattern, modify the `REGEX_NUMBER` constant.

## Dependencies
- [pdf-parse](https://github.com/modesty/pdf-parse) for PDF text extraction
- [TypeScript](https://www.typescriptlang.org/) for type safety

---