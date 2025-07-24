import prompts from 'prompts';
import { PdfService } from './services/pdf.service';
import path from 'path';

/**
 * Displays a welcome banner with ASCII art and colors.
 * @param chalk - The chalk instance for coloring
 */
export function printBanner(chalk: any): void {
  console.log(chalk.cyanBright(`
  ░██████████ ░█████████    ░██████████ ░██    ░██ ░██████████░█████████     ░███      ░██████  ░██████████  ░██████   ░█████████  
  ░██               ░██     ░██          ░██  ░██      ░██    ░██     ░██   ░██░██    ░██   ░██     ░██     ░██   ░██  ░██     ░██ 
  ░██              ░██      ░██           ░██░██       ░██    ░██     ░██  ░██  ░██  ░██            ░██    ░██     ░██ ░██     ░██ 
  ░█████████     ░███       ░█████████     ░███        ░██    ░█████████  ░█████████ ░██            ░██    ░██     ░██ ░█████████  
  ░██           ░██         ░██           ░██░██       ░██    ░██   ░██   ░██    ░██ ░██            ░██    ░██     ░██ ░██   ░██   
  ░██          ░██          ░██          ░██  ░██      ░██    ░██    ░██  ░██    ░██  ░██   ░██     ░██     ░██   ░██  ░██    ░██  
  ░██████████ ░█████████    ░██████████ ░██    ░██     ░██    ░██     ░██ ░██    ░██   ░██████      ░██      ░██████   ░██     ░██  
`));
  console.log(chalk.magentaBright.bold('                        PDF Pattern Extractor - Interactive CLI\n'));
}

/**
 * Affiche le texte extrait d'un PDF (préparation pour la sélection interactive du pattern).
 * @param chalk - Instance chalk pour la couleur
 * @param fileName - Nom du fichier PDF
 * @param text - Texte extrait du PDF
 * @param pageNum - Numéro de la page actuelle (optionnel)
 * @param totalPages - Nombre total de pages (optionnel)
 */
export function printPdfText(chalk: any, fileName: string, text: string, pageNum?: number, totalPages?: number): void {
  console.log(chalk.blueBright(`\n--- PDF: ${fileName}${typeof pageNum === 'number' && typeof totalPages === 'number' ? ` (page ${pageNum + 1}/${totalPages})` : ''} ---`));
  console.log(text);
  console.log(chalk.blueBright('-----------------------------\n'));
}

/**
 * Prompt interactif enrichi : navigation page par page sur le texte extrait du PDF avant saisie du pattern et options avancées.
 * @param chalk - Instance chalk pour la couleur
 * @returns {Promise<{pattern: string, maxLength: number, ignoreSpaces: boolean, caseSensitive: boolean, charType: string, customRegex?: string}>}
 */
export async function promptExtractionParams(chalk: any): Promise<{pattern: string, maxLength: number, ignoreSpaces: boolean, caseSensitive: boolean, charType: string, customRegex?: string}> {
  // Récupérer le premier PDF pour prévisualisation
  const { getPdfFiles } = await import('./io');
  let files: string[] = [];
  try {
    files = getPdfFiles();
  } catch (e) {
    console.log(chalk.red((e as Error).message));
    process.exit(1);
  }
  const firstFile = files[0];
  let textPreview = '';
  try {
    textPreview = await PdfService.extractText(firstFile);
  } catch (e) {
    console.log(chalk.red(`Erreur lors de l'extraction du texte du PDF pour prévisualisation : ${(e as Error).message}`));
  }
  // Découper le texte par pages (\f = saut de page)
  const pages = textPreview.split(/\f/);
  let currentPage = 0;
  let done = false;
  while (!done) {
    printPdfText(chalk, path.basename(firstFile), pages[currentPage], currentPage, pages.length);
    const nav = await prompts({
      type: 'select',
      name: 'action',
      message: chalk.yellow('Navigation dans le PDF :'),
      choices: [
        { title: 'Page précédente', value: 'prev', disabled: currentPage === 0 },
        { title: 'Page suivante', value: 'next', disabled: currentPage === pages.length - 1 },
        { title: 'Choisir cette page pour le pattern', value: 'choose' }
      ]
    });
    if (nav.action === 'prev' && currentPage > 0) currentPage--;
    else if (nav.action === 'next' && currentPage < pages.length - 1) currentPage++;
    else if (nav.action === 'choose') done = true;
  }
  // L'utilisateur a choisi la page courante pour le pattern
  console.log(chalk.yellowBright("Copiez/collez une portion du texte ci-dessus comme pattern d'extraction."));
  const response = await prompts([
    {
      type: 'text',
      name: 'pattern',
      message: chalk.green('Entrez le pattern (copié du texte ci-dessus) avant la valeur à extraire :'),
      initial: '',
      validate: (val: string) => val.length > 0 ? true : 'Le pattern ne peut pas être vide.'
    },
    {
      type: 'number',
      name: 'maxLength',
      message: chalk.green('Longueur maximale de la valeur à extraire :'),
      initial: 6,
      min: 1,
      validate: (val: number) => val > 0 ? true : 'La longueur doit être positive.'
    },
    {
      type: 'toggle',
      name: 'ignoreSpaces',
      message: chalk.green('Faut-il ignorer les espaces dans la recherche ?'),
      initial: true,
      active: 'Oui',
      inactive: 'Non'
    },
    {
      type: 'toggle',
      name: 'caseSensitive',
      message: chalk.green('Recherche sensible à la casse ?'),
      initial: false,
      active: 'Oui',
      inactive: 'Non'
    },
    {
      type: 'select',
      name: 'charType',
      message: chalk.green('Quel type de caractères souhaitez-vous extraire ?'),
      choices: [
        { title: 'Lettres uniquement', value: 'letters' },
        { title: 'Chiffres uniquement', value: 'digits' },
        { title: 'Tous caractères', value: 'all' },
        { title: 'Regex personnalisée', value: 'custom' }
      ],
      initial: 2
    },
    {
      type: prev => prev === 'custom' ? 'text' : null,
      name: 'customRegex',
      message: chalk.green('Entrez votre regex personnalisée (groupe capturant la valeur) :'),
      validate: (val: string) => val && val.length > 0 ? true : 'Regex requise.'
    }
  ]);
  if (!response.pattern || !response.maxLength) {
    console.log(chalk.red('Abandon.'));
    process.exit(1);
  }
  return response;
}

/**
 * Prints extraction summary to the console.
 * @param chalk - The chalk instance for coloring
 * @param pattern - The pattern used
 * @param maxLength - The max length used
 * @param regex - The regex used
 */
export function printExtractionSummary(chalk: any, pattern: string, maxLength: number, regex: RegExp): void {
  console.log(chalk.yellowBright(`\nExtraction pattern: ${chalk.bold(pattern)}`));
  console.log(chalk.yellowBright(`Max value length: ${chalk.bold(maxLength)}`));
  console.log(chalk.yellowBright(`Regex used: ${chalk.bold(regex.toString())}\n`));
}

/**
 * Prints the final results to the console.
 * @param chalk - The chalk instance for coloring
 * @param outputFile - The output file path
 * @param result - The result object
 */
export function printResults(chalk: any, outputFile: string, result: Record<string, string>): void {
  console.log(chalk.greenBright(`\nResults written to ${outputFile}\n`));
  console.log(chalk.cyanBright(JSON.stringify(result, null, 2)));
} 