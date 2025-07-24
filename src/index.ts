import { getPdfFiles, writeOutput, OUTPUT_FILE } from './io';
import { printBanner, promptExtractionParams, printExtractionSummary, printResults } from './cli';
import chalk from 'chalk';
import { ExtractionWorkflow, ExtractionOptions } from './workflows/extraction.workflow';

function buildRegex(pattern: string, maxLength: number, ignoreSpaces: boolean, caseSensitive: boolean, charType: string, customRegex?: string): RegExp {
  let regexStr = '';
  if (charType === 'custom' && customRegex) {
    regexStr = customRegex;
  } else {
    let valueGroup = '';
    switch (charType) {
      case 'letters':
        valueGroup = `[a-zA-ZéèàùâêîôûçëïüœæÉÈÀÙÂÊÎÔÛÇËÏÜŒÆ]{1,${maxLength}}`;
        break;
      case 'digits':
        valueGroup = `\\d{1,${maxLength}}`;
        break;
      case 'all':
      default:
        valueGroup = `[\w\d ]{1,${maxLength}}`;
        break;
    }
    let pat = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (ignoreSpaces) {
      pat = pat.replace(/\s+/g, '\\s*');
    }
    regexStr = `${pat}[\s\n\r]*(${valueGroup})`;
  }
  return new RegExp(regexStr, caseSensitive ? '' : 'i');
}

async function main(): Promise<void> {
  printBanner(chalk);
  const { pattern, maxLength, ignoreSpaces, caseSensitive, charType, customRegex } = await promptExtractionParams(chalk);

  const regex = buildRegex(pattern, maxLength, ignoreSpaces, caseSensitive, charType, customRegex);
  printExtractionSummary(chalk, pattern, maxLength, regex);

  let files: string[];
  try {
    files = getPdfFiles();
  } catch (e) {
    console.error(chalk.red((e as Error).message));
    process.exit(1);
  }

  const options: ExtractionOptions = { pattern, maxLength, regex, files, ignoreSpaces, caseSensitive, charType, customRegex };
  const result = await ExtractionWorkflow.run(options);
  writeOutput(result);
  printResults(chalk, OUTPUT_FILE, result);
}

main(); 