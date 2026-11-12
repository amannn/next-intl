import Image from 'next/image';
import Link from 'next/link';
import autodeskLogo from './autodesk-logo.svg';
import bigcommerceLogo from './bigcommerce-logo.svg';
import boltLogo from './bolt-logo.svg';
import chanelLogo from './chanel-logo.svg';
import coderabbitLogo from './coderabbit-logo.svg';
import deepseekLogo from './deepseek-logo.svg';
import elevenlabsLogo from './elevenlabs-logo.svg';
import ethereumLogo from './ethereum-logo.svg';
import grafanaLogo from './grafana-logo.svg';
import hashicorpLogo from './hashicorp-logo.svg';
import icelandairLogo from './icelandair-logo.svg';
import nodejsLogo from './nodejs-logo.svg';
import philipsLogo from './philips-logo.svg';
import postmanLogo from './postman-logo.svg';
import solanaLogo from './solana-logo.svg';
import speechifyLogo from './speechify-logo.svg';
import starbucksLogo from './starbucks-logo.svg';
import supercellLogo from './supercell-logo.svg';
import teamviewerLogo from './teamviewer-logo.svg';
import uberLogo from './uber-logo.svg';
import ubisoftLogo from './ubisoft-logo.svg';
import unityLogo from './unity-logo.svg';
import vintedgoLogo from './vintedgo-logo.svg';
import watershedLogo from './watershed-logo.svg';

const companies = [
  {
    name: 'Autodesk',
    logo: autodeskLogo,
    scale: 1.1,
    url: 'https://www.autodesk.com'
  },
  {
    name: 'BigCommerce Catalyst',
    logo: bigcommerceLogo,
    scale: 1.1,
    url: 'https://www.catalyst.dev/'
  },
  {
    name: 'Bolt',
    logo: boltLogo,
    scale: 0.8,
    url: 'https://bolt.eu'
  },
  {
    name: 'Chanel',
    logo: chanelLogo,
    scale: 0.9,
    url: 'https://www.chanel.com'
  },
  {
    name: 'CodeRabbit',
    logo: coderabbitLogo,
    scale: 1.1,
    url: 'https://www.coderabbit.ai'
  },
  {
    name: 'DeepSeek',
    logo: deepseekLogo,
    scale: 1.1,
    url: 'https://www.deepseek.com'
  },
  {
    name: 'ElevenLabs',
    logo: elevenlabsLogo,
    scale: 1.1,
    url: 'https://elevenlabs.io'
  },
  {
    name: 'Ethereum',
    logo: ethereumLogo,
    scale: 1.1,
    url: 'https://ethereum.org'
  },
  {
    name: 'Grafana Labs',
    logo: grafanaLogo,
    scale: 1.1,
    url: 'https://grafana.com'
  },
  {
    name: 'HashiCorp',
    logo: hashicorpLogo,
    url: 'https://www.hashicorp.com'
  },
  {
    name: 'Icelandair',
    logo: icelandairLogo,
    scale: 1.1,
    url: 'https://www.icelandair.com'
  },
  {
    name: 'Node.js',
    logo: nodejsLogo,
    scale: 1.3,
    url: 'https://nodejs.org'
  },
  {
    name: 'Philips',
    logo: philipsLogo,
    scale: 1.1,
    url: 'https://www.philips.com'
  },
  {
    name: 'Postman',
    logo: postmanLogo,
    url: 'https://www.postman.com'
  },
  {
    name: 'Solana',
    logo: solanaLogo,
    scale: 0.9,
    url: 'https://solana.com'
  },
  {
    name: 'Speechify',
    logo: speechifyLogo,
    scale: 1.15,
    url: 'https://speechify.com'
  },
  {
    name: 'Starbucks',
    logo: starbucksLogo,
    scale: 1.1,
    url: 'https://www.starbucks.co.uk'
  },
  {
    name: 'Supercell',
    logo: supercellLogo,
    scale: 0.8,
    url: 'https://supercell.com'
  },
  {
    name: 'TeamViewer',
    logo: teamviewerLogo,
    url: 'https://www.teamviewer.com'
  },
  {
    name: 'Uber',
    logo: uberLogo,
    scale: 0.7,
    url: 'https://jobs.uber.com'
  },
  {
    name: 'Ubisoft',
    logo: ubisoftLogo,
    scale: 0.95,
    url: 'https://www.ubisoft.com'
  },
  {
    name: 'Unity',
    logo: unityLogo,
    scale: 0.9,
    url: 'https://unity.com'
  },
  {
    name: 'VintedGo',
    logo: vintedgoLogo,
    scale: 0.85,
    url: 'https://vintedgo.com'
  },
  {
    name: 'Watershed',
    logo: watershedLogo,
    url: 'https://watershed.com'
  }
];

export default function UserCompanies() {
  return (
    <div className="grid grid-cols-2 items-center sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
      {companies.map((company) => (
        <Link
          key={company.name}
          className="flex items-center justify-center p-4 opacity-40 grayscale transition-opacity hover:opacity-100"
          href={company.url}
          target="_blank"
        >
          <Image
            alt={company.name}
            className="max-h-8 w-auto max-w-24 object-contain dark:invert lg:max-h-11 lg:max-w-36"
            src={company.logo}
            style={{transform: `scale(${company.scale || 1})`}}
            title={company.name}
          />
        </Link>
      ))}
    </div>
  );
}
