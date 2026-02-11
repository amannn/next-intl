import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const manifestPath = join(
  rootDir,
  'node_modules/.cache/next-intl/client-manifest.json'
);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const snapshot = {
  '/': {
    hasLayoutProvider: true,
    namespaces: {
      jm1lmy: true,
      tQLRmz: true
    }
  },
  '/actions': {
    hasLayoutProvider: false,
    namespaces: {
      'RNB4/W': true
    }
  },
  '/catch-all/[...parts]': {
    hasLayoutProvider: false,
    namespaces: {
      xmCXAl: true
    }
  },
  '/dynamic-import': {
    hasLayoutProvider: false,
    namespaces: {
      TghmPk: true,
      cOlyBM: true
    }
  },
  '/dynamic-segment/[slug]': {
    hasLayoutProvider: false,
    namespaces: {
      mrNFad: true
    }
  },
  '/feed': {
    hasLayoutProvider: false,
    namespaces: {
      I6Uu2z: true
    }
  },
  '/feed/@modal': {
    hasLayoutProvider: false,
    namespaces: {
      Z2Vmmr: true
    }
  },
  '/feed/@modal/(..)photo/[id]': {
    hasLayoutProvider: false,
    namespaces: {
      Ax7uMP: true
    }
  },
  '/(group)/group-one': {
    hasLayoutProvider: false,
    namespaces: {
      '0A97lp': true
    }
  },
  '/(group)/group-two': {
    hasLayoutProvider: false,
    namespaces: {
      'ntVPJ+': true
    }
  },
  '/hook-translation': {
    hasLayoutProvider: false,
    namespaces: {
      'd4JN/R': true
    }
  },
  '/layout-template': {
    hasLayoutProvider: false,
    namespaces: {
      bowxvu: true,
      '30s0PJ': true
    }
  },
  '/loading': {
    hasLayoutProvider: false,
    namespaces: {
      o6jHkb: true
    }
  },
  '/optional/[[...parts]]': {
    hasLayoutProvider: false,
    namespaces: {
      bT9Pga: true
    }
  },
  '/parallel': {
    hasLayoutProvider: false,
    namespaces: {
      ox304v: true,
      '62nsdy': true,
      E8vtaB: true,
      fJxh6G: true
    }
  },
  '/parallel/@activity': {
    hasLayoutProvider: false,
    namespaces: {
      'zZQM/j': true,
      eoEXj3: true
    }
  },
  '/shared-component': {
    hasLayoutProvider: false,
    namespaces: {
      JdTriE: true
    }
  },
  '/type-imports': {
    hasLayoutProvider: false,
    namespaces: {
      GO9hSh: true
    }
  },
  '/use-translations': {
    hasLayoutProvider: false,
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
