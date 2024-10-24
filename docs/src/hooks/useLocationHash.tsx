import {useEffect, useState} from 'react';

function getHash() {
  return decodeURIComponent(window.location.hash.replace('#', ''));
}

export default function useLocationHash() {
  const [hash, setHash] = useState<string>();

  useEffect(() => {
    function updateHash() {
      setHash(getHash());
    }

    window.addEventListener('hashchange', updateHash);

    updateHash();

    return () => {
      window.removeEventListener('hashchange', updateHash);
    };
  }, []);

  return hash;
}
