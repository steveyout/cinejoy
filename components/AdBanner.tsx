'use client';

import { useEffect, useRef } from 'react';

interface AdUnit {
  key: string;
  width: number;
  height: number;
}

const AD_UNITS: AdUnit[] = [
  { key: '05508544d23e33392d7fe51d5ef31bf1', width: 160, height: 300 },
  { key: 'e6f6685c31de0eb79456be3f9d6b273d', width: 160, height: 600 },
];

function loadAd(unit: AdUnit): Promise<void> {
  return new Promise((resolve) => {
    (window as any).atOptions = {
      key: unit.key,
      format: 'iframe',
      height: unit.height,
      width: unit.width,
      params: {},
    };

    const script = document.createElement('script');
    script.src = `https://directoryeditorweep.com/${unit.key}/invoke.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export function AdBanner() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    (async () => {
      for (const unit of AD_UNITS) {
        await loadAd(unit);
      }
    })();
  }, []);

  return (
    <div className="hidden xl:flex flex-col gap-4 flex-shrink-0 w-[160px] items-center">
      {AD_UNITS.map((unit) => (
        <div
          key={unit.key}
          id={`ad-container-${unit.key}`}
          style={{ width: unit.width, height: unit.height }}
        />
      ))}
    </div>
  );
}
