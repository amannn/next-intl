import Image from 'next/image';
import adidasRunningLogo from './adidas-running.svg';
import bigcommerceLogo from './bigcommerce-logo.svg';
import boleroLogo from './bolero-logo.svg';
import boltLogo from './bolt-logo.svg';
import ethereumLogo from './ethereum-logo.svg';
import mistralLogo from './mistral-logo.svg';
import nodejsLogo from './nodejs-logo.svg';
import qasaLogo from './qasa-logo.svg';
import solanaLogo from './solana-logo.svg';
import soundtrackLogo from './soundtrack-logo.svg';
import speechifyLogo from './speechify-logo.svg';
import ubisoftLogo from './ubisoft-logo.svg';

const companies = [
  {name: 'Adidas Running', logo: adidasRunningLogo, scale: 0.7},
  {name: 'BigCommerce', logo: bigcommerceLogo, scale: 1.2},
  {name: 'Bolt', logo: boltLogo, translateY: 2},
  {name: 'Bolero', logo: boleroLogo},
  {name: 'Ethereum', logo: ethereumLogo, scale: 1.2},
  {name: 'Mistral', logo: mistralLogo, scale: 1.1},
  {name: 'Node.js', logo: nodejsLogo, translateY: -2},
  {name: 'Qasa', logo: qasaLogo, scale: 0.9, translateY: 3},
  {name: 'Solana', logo: solanaLogo, scale: 0.75},
  {name: 'Speechify', logo: speechifyLogo, scale: 0.9},
  {name: 'Soundtrack', logo: soundtrackLogo, scale: 0.9},
  {name: 'Ubisoft', logo: ubisoftLogo}
];

export default function UserCompanies() {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Used by
      </h2>
      <div className="mt-6 flex max-h-[180px] flex-wrap items-center gap-6 overflow-y-hidden md:mt-2 md:max-h-12 md:flex-nowrap md:justify-between md:overflow-x-auto">
        {companies.map((company) => (
          <Image
            key={company.name}
            alt={company.name}
            className="inline-block opacity-40 grayscale invert"
            priority
            src={company.logo}
            style={{
              height: `${(company.scale || 1) * 24}px`,
              transform: `translateY(${company.translateY || 0}px)`
            }}
          />
        ))}
      </div>
    </div>
  );
}
