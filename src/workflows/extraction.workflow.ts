import { PdfService } from '../services/pdf.service';
import { ExtractionService } from '../services/extraction.service';
import path from 'path';

export interface ExtractionOptions {
  pattern: string;
  maxLength: number;
  regex: RegExp;
  files: string[];
  ignoreSpaces?: boolean;
  caseSensitive?: boolean;
  charType?: string;
  customRegex?: string;
}

export class ExtractionWorkflow {
  /**
   * Orchestration de l'extraction sur plusieurs fichiers PDF.
   * @param options Options d'extraction
   * @returns Résultats de l'extraction
   */
  static async run(options: ExtractionOptions): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const file of options.files) {
      try {
        const text = await PdfService.extractText(file);
        const value = ExtractionService.extractValueFlexible(text, options.regex, options.pattern, options.maxLength);
        result[path.basename(file)] = value ? value : 'Value not found';
      } catch (e) {
        result[path.basename(file)] = `Error: ${(e as Error).message}`;
      }
    }
    return result;
  }
} 