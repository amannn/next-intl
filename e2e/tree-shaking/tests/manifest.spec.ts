import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect, test as it} from '@playwright/test';

const EXPECTED_MANIFEST = {
  '/': {
    hasLayoutProvider: true,
    namespaces: {}
  },
  '/(group)': {
    hasLayoutProvider: true,
    namespaces: {}
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
  '/(home)': {
    hasLayoutProvider: true,
    namespaces: {
      jm1lmy: true,
      tQLRmz: true
    }
  },
  '/actions': {
    hasLayoutProvider: true,
    namespaces: {
      'RNB4/W': true
    }
  },
  '/catch-all/[...parts]': {
    hasLayoutProvider: true,
    namespaces: {
      xmCXAl: true
    }
  },
  '/dynamic-import': {
    hasLayoutProvider: true,
    namespaces: {
      TghmPk: true,
      cOlyBM: true
    }
  },
  '/dynamic-segment/[slug]': {
    hasLayoutProvider: true,
    namespaces: {
      mrNFad: true
    }
  },
  '/explicit-id': {
    hasLayoutProvider: true,
    namespaces: {
      carousel: {
        next: true
      }
    }
  },
  '/feed': {
    hasLayoutProvider: true,
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
    hasLayoutProvider: true,
    namespaces: {
      Ax7uMP: true
    }
  },
  '/hook-translation': {
    hasLayoutProvider: true,
    namespaces: {
      'd4JN/R': true
    }
  },
  '/layout-template': {
    hasLayoutProvider: true,
    namespaces: {
      bowxvu: true,
      '30s0PJ': true
    }
  },
  '/linked-dependency': {
    hasLayoutProvider: true,
    namespaces: {
      'Cq+Nds': true
    }
  },
  '/loading': {
    hasLayoutProvider: true,
    namespaces: {
      o6jHkb: true
    }
  },
  '/optional/[[...parts]]': {
    hasLayoutProvider: true,
    namespaces: {
      bT9Pga: true
    }
  },
  '/parallel': {
    hasLayoutProvider: true,
    namespaces: {
      '62nsdy': true,
      E8vtaB: true,
      fJxh6G: true,
      ox304v: true
    }
  },
  '/parallel/@activity': {
    hasLayoutProvider: false,
    namespaces: {
      'zZQM/j': true,
      eoEXj3: true
    }
  },
  '/photo/[id]': {
    hasLayoutProvider: true,
    namespaces: {
      o25lsU: true
    }
  },
  '/shared-component': {
    hasLayoutProvider: true,
    namespaces: {
      JdTriE: true
    }
  },
  '/type-imports': {
    hasLayoutProvider: true,
    namespaces: {
      GO9hSh: true
    }
  },
  '/use-translations': {
    hasLayoutProvider: true,
    namespaces: {
      DynamicKey: true,
      GlobalNamespace: {
        title: true
      },
      UseTranslationsPage: {
        title: true
      }
    }
  }
} as const;

function readManifest(manifestPath: string): Record<string, unknown> | null {
  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;
    if (
      manifest == null ||
      Array.isArray(manifest) ||
      typeof manifest !== 'object'
    ) {
      return null;
    }

    return manifest as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readManifestEntryCount(manifestPath: string): number {
  const manifest = readManifest(manifestPath);
  if (manifest == null) {
    return 0;
  }
  return Object.keys(manifest).length;
}

it('writes a non-empty client manifest with expected content', async () => {
  const manifestPath = join(
    process.cwd(),
    'node_modules/.cache/next-intl/client-manifest.json'
  );

  await expect
    .poll(() => readManifestEntryCount(manifestPath), {
      message: 'manifest should be generated and non-empty',
      timeout: 30_000
    })
    .toBeGreaterThan(0);

  expect(readManifest(manifestPath)).toEqual(EXPECTED_MANIFEST);
});
