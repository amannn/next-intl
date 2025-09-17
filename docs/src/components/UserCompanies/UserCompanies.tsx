import Image from 'next/image';
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
  {name: 'Adidas Running', logo: adidasRunningLogo, scale: 0.9},
  {name: 'BigCommerce', logo: bigcommerceLogo, scale: 1.1},
  {name: 'Billiv', logo: billivLogo, scale: 0.65},
  {name: 'Bolt', logo: boltLogo, scale: 0.85},
  {name: 'Bolero', logo: boleroLogo, scale: 0.8},
  {name: 'Ethereum', logo: ethereumLogo, scale: 1.1},
  {name: 'HashiCorp', logo: hashicorpLogo, scale: 1.1},
  {name: 'Icelandair', logo: icelandairLogo, scale: 1.1},
  {name: 'Mistral', logo: mistralLogo, scale: 1.1},
  {name: 'Node.js', logo: nodejsLogo, scale: 1.3},
  {name: 'Qasa', logo: qasaLogo, scale: 0.75},
  {name: 'Solana', logo: solanaLogo, scale: 0.9},
  {name: 'Speechify', logo: speechifyLogo, scale: 1.15},
  {name: 'Soundtrack', logo: soundtrackLogo, scale: 1.1},
  {name: 'Todoist', logo: todoistLogo, scale: 0.9},
  {name: 'Ubisoft', logo: ubisoftLogo, scale: 0.95},
  {name: 'VintedGo', logo: vintedgoLogo, scale: 0.85},
  {name: 'Watershed', logo: watershedLogo}
];

export default function UserCompanies() {
  return (
    <div className="grid grid-cols-2 items-center sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
      {companies.map((company) => (
        <div
          key={company.name}
          className="flex items-center justify-center p-4 opacity-40 grayscale"
        >
          <Image
            alt={company.name}
            className="max-h-8 w-auto max-w-24 object-contain lg:max-h-11 lg:max-w-36"
            src={company.logo}
            style={{transform: `scale(${company.scale || 1})`}}
            title={company.name}
          />
        </div>
      ))}
    </div>
  );
}
