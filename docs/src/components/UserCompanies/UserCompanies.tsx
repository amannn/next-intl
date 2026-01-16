import Image from 'next/image';
import Link from 'next/link';
import adidasRunningLogo from './adidas-running.svg';
import bigcommerceLogo from './bigcommerce-logo.svg';
import billivLogo from './billiv-logo.svg';
import boleroLogo from './bolero-logo.svg';
import boltLogo from './bolt-logo.svg';
import ethereumLogo from './ethereum-logo.svg';
import hashicorpLogo from './hashicorp-logo.svg';
import icelandairLogo from './icelandair-logo.svg';
import mistralLogo from './mistral-logo.svg';
import nodejsLogo from './nodejs-logo.svg';
import qasaLogo from './qasa-logo.svg';
import solanaLogo from './solana-logo.svg';
import soundtrackLogo from './soundtrack-logo.svg';
import speechifyLogo from './speechify-logo.svg';
import todoistLogo from './todoist-logo.svg';
import ubisoftLogo from './ubisoft-logo.svg';
import vintedgoLogo from './vintedgo-logo.svg';
import watershedLogo from './watershed-logo.svg';

const companies = [
  {
    name: 'Adidas Running',
    logo: adidasRunningLogo,
    scale: 0.9,
    url: 'https://www.runtastic.com/'
  },
  {
    name: 'BigCommerce Catalyst',
    logo: bigcommerceLogo,
    scale: 1.1,
    url: 'https://www.catalyst.dev/'
  },
  {
    name: 'Billiv',
    logo: billivLogo,
    scale: 0.65,
    url: 'https://billiv.fr'
  },
  {
    name: 'Bolt',
    logo: boltLogo,
    scale: 0.85,
    url: 'https://bolt.eu'
  },
  {
    name: 'Bolero',
    logo: boleroLogo,
    scale: 0.8,
    url: 'https://www.boleromusic.com'
  },
  {
    name: 'Ethereum',
    logo: ethereumLogo,
    scale: 1.1,
    url: 'https://ethereum.org'
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
    name: 'Mistral',
    logo: mistralLogo,
    scale: 1.1,
    url: 'https://mistral.ai'
  },
  {
    name: 'Node.js',
    logo: nodejsLogo,
    scale: 1.3,
    url: 'https://nodejs.org'
  },
  {
    name: 'Qasa',
    logo: qasaLogo,
    scale: 0.75,
    url: 'https://qasa.com'
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
    name: 'Soundtrack',
    logo: soundtrackLogo,
    scale: 1.1,
    url: 'https://www.soundtrack.io'
  },
  {
    name: 'Todoist',
    logo: todoistLogo,
    scale: 0.9,
    url: 'https://todoist.com'
  },
  {
    name: 'Ubisoft',
    logo: ubisoftLogo,
    scale: 0.95,
    url: 'https://www.ubisoft.com'
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
