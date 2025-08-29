// Documentation page for the next-intl design system

import DesignColorSwatch from './DesignColorSwatch';
import DesignSection from './DesignSection';

export default function DesignPage() {
  return (
    <div>
      <div className="mx-auto max-w-6xl p-20">
        <p className="text-6xl font-semibold tracking-tight text-gray-900">
          Design system
        </p>
        <div className="mt-20 space-y-16">
          <DesignSection title="Colors">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-900">
                  Blue (primary)
                </p>
                <div className="flex items-center space-x-1">
                  <DesignColorSwatch className="bg-gray-100" value="50" />
                  <DesignColorSwatch className="bg-gray-100" value="100" />
                  <DesignColorSwatch className="bg-gray-100" value="200" />
                  <DesignColorSwatch className="bg-blue-300" value="300" />
                  <DesignColorSwatch className="bg-gray-100" value="400" />
                  <DesignColorSwatch className="bg-gray-100" value="500" />
                  <DesignColorSwatch className="bg-gray-100" value="600" />
                  <DesignColorSwatch className="bg-blue-700" value="700" />
                  <DesignColorSwatch className="bg-gray-100" value="800" />
                  <DesignColorSwatch className="bg-gray-100" value="900" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-900">Gray</p>
                <div className="flex items-center space-x-1">
                  <DesignColorSwatch className="bg-gray-50" value="50" />
                  <DesignColorSwatch className="bg-gray-100" value="100" />
                  <DesignColorSwatch className="bg-gray-200" value="200" />
                  <DesignColorSwatch className="bg-gray-300" value="300" />
                  <DesignColorSwatch className="bg-gray-400" value="400" />
                  <DesignColorSwatch className="bg-gray-500" value="500" />
                  <DesignColorSwatch className="bg-gray-600" value="600" />
                  <DesignColorSwatch className="bg-gray-700" value="700" />
                  <DesignColorSwatch className="bg-gray-800" value="800" />
                  <DesignColorSwatch className="bg-gray-900" value="900" />
                </div>
              </div>
            </div>
          </DesignSection>
          <DesignSection title="Typography">
            <div className="grid grid-cols-2">
              <div className="bg-white py-8">
                <div className="space-y-6">
                  <p className="text-6xl font-semibold tracking-tight text-gray-900">
                    Title large
                  </p>
                  <p className="text-5xl font-semibold tracking-tight text-gray-900">
                    Title normal
                  </p>
                  <p className="text-xl text-gray-600">Title description</p>
                  <p className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
                    Title caption
                  </p>
                  <p className="text-3xl font-semibold text-gray-900">
                    Title small
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    Headline
                  </p>
                  <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                    Headline caption
                  </p>
                  <p className="text-lg text-gray-700">Body large</p>
                  <p className="text-lg text-gray-500">Body large muted</p>
                  <p className="text-base text-gray-700">
                    Body with{' '}
                    <a
                      href="#"
                      className="font-semibold text-gray-900 underline decoration-blue-700 underline-offset-2"
                    >
                      a link
                    </a>
                  </p>
                  <p className="text-base text-gray-500">Body muted</p>
                  <p className="text-sm font-semibold text-gray-900">Label</p>
                  <p className="text-sm font-semibold text-gray-500">
                    Label muted
                  </p>
                  <p className="inline-block rounded border border-gray-100 bg-gray-50 px-1 py-0.5 font-mono text-base text-[0.9em] whitespace-pre">
                    Inline code
                  </p>
                </div>
              </div>
              <div className="bg-gray-900 p-8">
                <div className="space-y-6">
                  <p className="text-6xl font-semibold tracking-tight text-white">
                    Title large
                  </p>
                  <p className="text-5xl font-semibold tracking-tight text-white">
                    Title normal
                  </p>
                  <p className="text-xl text-gray-200">Title description</p>
                  <p className="text-sm font-semibold tracking-wide text-blue-300 uppercase">
                    Title caption
                  </p>
                  <p className="text-3xl font-semibold text-white">
                    Title small
                  </p>
                  <p className="text-xl font-semibold text-white">Headline</p>
                  <p className="text-xs font-semibold tracking-wide text-blue-300 uppercase">
                    Headline caption
                  </p>
                  <p className="text-lg text-white">Body large</p>
                  <p className="text-lg text-gray-300">Body large muted</p>
                  <p className="text-base text-gray-100">
                    Body with{' '}
                    <a
                      href="#"
                      className="font-semibold text-white underline decoration-blue-300 underline-offset-2"
                    >
                      a link
                    </a>
                  </p>
                  <p className="text-base text-gray-300">Body muted</p>
                  <p className="text-sm font-semibold text-white">Label</p>
                  <p className="text-sm font-semibold text-gray-200">
                    Label muted
                  </p>
                  <p className="inline-block rounded border border-gray-700 bg-gray-800 px-1 py-0.5 font-mono text-base text-[0.9em] whitespace-pre text-white">
                    Inline code
                  </p>
                </div>
              </div>
            </div>
          </DesignSection>
          <DesignSection title="Surfaces">
            <div className="grid grid-cols-2">
              <div className="bg-white py-8 pr-8">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-8">
                  <p className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
                    Title caption
                  </p>
                  <p className="mt-2 text-5xl font-semibold tracking-tight text-gray-900">
                    Title normal
                  </p>
                  <p className="mt-4 text-xl text-gray-600">
                    Title description
                  </p>
                </div>
              </div>
              <div className="bg-gray-900 p-8">
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-8">
                  <p className="text-sm font-semibold tracking-wide text-blue-300 uppercase">
                    Title caption
                  </p>
                  <p className="mt-2 text-5xl font-semibold tracking-tight text-white">
                    Title normal
                  </p>
                  <p className="mt-4 text-xl text-gray-200">
                    Title description
                  </p>
                </div>
              </div>
            </div>
          </DesignSection>
        </div>
      </div>
    </div>
  );
}
