import path from 'path';
import {fileURLToPath} from 'url';

export type ExtractorConfigInput = {
  sourceLocale: string;
  messagesPath: string;
  srcPath: string;
  formatter: 'json';
};

const formatters = {
  json: () => import('./formatters/JSONFormatter.ts')
};

export default class ExtractorConfig {
  static async loadConfig(input: ExtractorConfigInput) {
    const projectRoot = this.getProjectRoot();
    const srcPath = path.join(projectRoot, input.srcPath);
    const messagesDir = path.join(projectRoot, input.messagesPath);

    const FormatterImpl = (await formatters[input.formatter]()).default;
    const formatter = new FormatterImpl(messagesDir, input.sourceLocale);

    return {
      srcPath,
      formatter
    };
  }

  private static getProjectRoot() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.resolve(__dirname, '..');
  }
}
