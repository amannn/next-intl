import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const manifestPath = join(
  rootDir,
  'node_modules/.cache/next-intl-client-manifest.json'
);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const snapshot = {
  '/group-one': {
    hasProvider: false,
    namespaces: {
      '0A97lp': true
    }
  },
  '/group-two': {
    hasProvider: false,
    namespaces: {
      'ntVPJ+': true
    }
  },
  '/actions': {
    hasProvider: false,
    namespaces: {
      'RNB4/W': true
    }
  },
  '/catch-all/[...parts]': {
    hasProvider: false,
    namespaces: {
      xmCXAl: true
    }
  },
  '/dynamic-import': {
    hasProvider: false,
    namespaces: {
      TghmPk: true,
      cOlyBM: true
    }
  },
  '/dynamic-segment/[slug]': {
    hasProvider: false,
    namespaces: {
      mrNFad: true
    }
  },
  '/feed/[id]': {
    hasProvider: false,
    namespaces: {
      Ax7uMP: true
    }
  },
  '/feed': {
    hasProvider: false,
    namespaces: {
      I6Uu2z: true,
      i43YkF: true
    }
  },
  '/hook-translation': {
    hasProvider: false,
    namespaces: {
      'd4JN/R': true
    }
  },
  '/layout-template': {
    hasProvider: false,
    namespaces: {
      bowxvu: true,
      '30s0PJ': true
    }
  },
  '/loading': {
    hasProvider: false,
    namespaces: {
      o6jHkb: true
    }
  },
  '/optional/[[...parts]]': {
    hasProvider: false,
    namespaces: {
      bT9Pga: true
    }
  },
  '/': {
    hasProvider: true,
    namespaces: {
      jm1lmy: true,
      tQLRmz: true
    }
  },
  '/parallel': {
    hasProvider: false,
    namespaces: {
      'zZQM/j': true,
      eoEXj3: true,
      ox304v: true,
      '62nsdy': true,
      E8vtaB: true,
      fJxh6G: true
    }
  },
  '/shared-component': {
    hasProvider: false,
    namespaces: {
      JdTriE: true
    }
  },
  '/type-imports': {
    hasProvider: false,
    namespaces: {
      GO9hSh: true,
      MmAwwP: true
    }
  },
  '/use-translations': {
    hasProvider: false,
    namespaces: {
      UseTranslationsPage: {
        title: true
      },
      GlobalNamespace: {
        title: true
      },
      DynamicKey: true
    }
  }
};

const manifestStr = JSON.stringify(manifest, null, 2);
const snapshotStr = JSON.stringify(snapshot, null, 2);

if (manifestStr !== snapshotStr) {
  console.error('Error: Manifest does not match snapshot');
  console.error('\nExpected:');
  console.error(snapshotStr);
  console.error('\nActual:');
  console.error(manifestStr);
  process.exit(1);
}

console.log('✓ Manifest matches snapshot');
