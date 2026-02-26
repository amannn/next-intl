import path from 'path';
import enhancedResolve from 'enhanced-resolve';
import SourceFileFilter from '../scanner/SourceFileFilter.js';

const EXTENSIONS = SourceFileFilter.EXTENSIONS.map((ext) => `.${ext}`);

export type CreateResolverOptions = {
  projectRoot: string;
  tsconfigPath?: string;
};

export default function createModuleResolver(options: CreateResolverOptions) {
  const {projectRoot, tsconfigPath} = options;
  const resolver = enhancedResolve.create({
    conditionNames: ['import', 'require', 'module', 'node'],
    extensions: EXTENSIONS,
    mainFields: ['module', 'main', 'browser'],
    tsconfig: tsconfigPath ?? path.join(projectRoot, 'tsconfig.json')
  });

  return function resolve(
    context: string,
    request: string
  ): Promise<string | null> {
    return new Promise((done) => {
      resolver(
        {},
        context,
        request,
        {},
        (err: Error | null, res: string | false | undefined) => {
          if (err || typeof res !== 'string') {
            done(null);
            return;
          }
          done(path.normalize(res));
        }
      );
    });
  };
}
