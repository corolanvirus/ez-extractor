import fs from 'fs';
import pdf from 'pdf-parse';

export class PdfService {
  /**
   * Extrait tout le texte d'un fichier PDF.
   * @param filePath Chemin absolu du fichier PDF
   * @returns Le texte extrait du PDF
   */
  static async extractText(filePath: string): Promise<string> {
    const dataBuffer: Buffer = fs.readFileSync(filePath);
    const pdfData: { text: string } = await pdf(dataBuffer);
    return pdfData.text;
  }
} 