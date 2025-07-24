import fs from 'fs';
import path from 'path';

export const INPUT_DIR: string = path.join(__dirname, '../input');
export const OUTPUT_DIR: string = path.join(__dirname, '../output');
export const OUTPUT_FILE: string = path.join(OUTPUT_DIR, 'output.json');

/**
 * Reads all PDF file paths from the input directory.
 * @returns {string[]} Array of absolute file paths
 */
export function getPdfFiles(): string[] {
  if (!fs.existsSync(INPUT_DIR)) {
    throw new Error(`The 'input' directory does not exist. Please create it and add your PDF files.`);
  }
  const files: string[] = fs.readdirSync(INPUT_DIR)
    .filter((f: string) => f.toLowerCase().endsWith('.pdf'))
    .map((f: string) => path.join(INPUT_DIR, f));
  if (files.length === 0) {
    throw new Error(`No PDF files found in the 'input' directory.`);
  }
  return files;
}

/**
 * Writes the result object to the output JSON file.
 * @param {Record<string, string>} result - The mapping to write
 */
export function writeOutput(result: Record<string, string>): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');
} 