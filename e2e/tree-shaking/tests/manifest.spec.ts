import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect, test as it, type Page} from '@playwright/test';

type ManifestNamespaces = true | Record<string, ManifestNamespaces>;
type ManifestEntry = {
  hasLayoutProvider: boolean;
  namespaces: ManifestNamespaces;
};
type Manifest = Record<string, ManifestEntry>;
type ManifestPollResult = Manifest | null;

const ROUTES_TO_PRIME: Array<string> = [
  '/',
  '/loading',
  '/dynamic-segment/test',
  '/catch-all/a/b/c',
  '/optional/x/y',
  '/actions',
  '/type-imports',
  '/group-one',
  '/group-two',
  '/parallel',
  '/dynamic-import',
  '/hook-translation',
  '/layout-template',
  '/shared-component',
  '/use-translations'
];

const EXPECTED_MANIFEST: Manifest = {
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
};

function readManifest(manifestPath: string): ManifestPollResult {
  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
  } catch {
    return null;
  }
}

async function primeManifestRoutes(page: Page) {
  for (const pathname of ROUTES_TO_PRIME) {
    await page.goto(pathname);
    await expect(page).toHaveURL(pathname);
  }

  await page.goto('/feed');
  await expect(page).toHaveURL('/feed');
  await page.locator('a[href="/photo/alpha"]').first().click();
  await expect(page).toHaveURL('/photo/alpha');

  await page.goto('/photo/alpha');
  await expect(page).toHaveURL('/photo/alpha');
}

it('matches client manifest snapshot', async ({page}) => {
  const manifestPath = join(
    process.cwd(),
    'node_modules/.cache/next-intl/client-manifest.json'
  );

  await primeManifestRoutes(page);

  await expect
    .poll(() => readManifest(manifestPath), {
      message: 'manifest should be generated with expected entries',
      timeout: 30_000
    })
    .toEqual(EXPECTED_MANIFEST);
});
