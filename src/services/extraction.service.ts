export class ExtractionService {
  /**
   * Extrait la valeur après un pattern dans un texte, selon une regex.
   * @param text Le texte à analyser
   * @param regex La regex à utiliser
   * @returns La valeur extraite ou null
   */
  static extractValue(text: string, regex: RegExp): string | null {
    const match: RegExpMatchArray | null = text.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Extraction flexible : valeur après pattern ou à la ligne suivante.
   * @param text Le texte à analyser
   * @param regex La regex à utiliser
   * @param pattern Le pattern à chercher
   * @param maxLength Longueur max de la valeur
   * @returns La valeur extraite ou null
   */
  static extractValueFlexible(text: string, regex: RegExp, pattern: string, maxLength: number): string | null {
    const match = text.match(regex);
    if (match) return match[1];
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].toLowerCase().includes(pattern.toLowerCase())) {
        const candidate = lines[i + 1].trim().slice(0, maxLength);
        if (candidate.length > 0) return candidate;
      }
    }
    return null;
  }
} 