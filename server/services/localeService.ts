import fs from 'fs';
import glob from 'glob';
import path from 'path';
import util from 'util';
import { deepMerge } from '../utils/utils'

export default class LocaleService {
  private localeMap: Map<string, string> = new Map()
  private globAsync = util.promisify(glob);
  private commonLocaleName = 'common'

  constructor() {}

  async loadLocales(pattern: string): Promise<void> {
    try {
      const files = await this.globAsync(pattern);

      for (const filePath of files) {
        const content = await fs.promises.readFile(filePath, 'utf8')
        const baseName = path.basename(filePath).split('.')[0]
        this.localeMap.set(baseName, content)
      }
    } catch (error) {
      console.error('Failed to load locales:', error)
    }
  }

  getCommonLocale(replacements: string[][]) {
    let commonLocaleString = this.localeMap.get(this.commonLocaleName);

    for (const [placeholder, value] of replacements) {
      commonLocaleString = commonLocaleString.replace(new RegExp(placeholder, 'g'), value);
    }

    return JSON.parse(commonLocaleString);
  }

  getLocale(fileName: string, replacements: string[][] = [], language: "en" | "cy" = "en"): any {
    if (!this.localeMap.has(fileName)) {
      throw new Error(`No locale found named ${fileName}`);
    }

    let localeString = this.localeMap.get(fileName);

    for (const [placeholder, value] of replacements) {
      localeString = localeString.replace(new RegExp(placeholder, 'g'), value);
    }

    try {
      return deepMerge(this.getCommonLocale(replacements), JSON.parse(localeString))[language]
    } catch (e) {
      throw new Error('Failed to parse locale string into JSON');
    }
  }
}