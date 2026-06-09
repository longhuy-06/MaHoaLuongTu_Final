import { Basis, Bit, Photon, BB84Step, SimulationResult } from '../types';

const getRandomBit = (): Bit => (Math.random() < 0.5 ? 0 : 1);
const getRandomBasis = (): Basis => (Math.random() < 0.5 ? '+' : 'x');

const encodePhoton = (bit: Bit, basis: Basis): Photon => {
  if (basis === '+') return bit === 0 ? '↑' : '→';
  return bit === 0 ? '↗' : '↘';
};

const measurePhoton = (photon: Photon, basis: Basis): Bit => {
  if (basis === '+') {
    if (photon === '↑') return 0;
    if (photon === '→') return 1;
    return getRandomBit();
  } else {
    if (photon === '↗') return 0;
    if (photon === '↘') return 1;
    return getRandomBit();
  }
};

export const runBB84Simulation = (numBits: number, evePresent: boolean): SimulationResult => {
  const steps: BB84Step[] = [];
  let matchingBasesCount = 0;
  let errorCount = 0;
  const aliceKey: Bit[] = [];
  const bobKey: Bit[] = [];

  for (let i = 0; i < numBits; i++) {
    const aliceBit = getRandomBit();
    const aliceBasis = getRandomBasis();
    
    let currentPhoton = encodePhoton(aliceBit, aliceBasis);
    const alicePhoton = currentPhoton;

    let eveBasis: Basis | undefined;
    let eveBit: Bit | undefined;
    let evePhoton: Photon | undefined;

    if (evePresent) {
      eveBasis = getRandomBasis();
      eveBit = measurePhoton(currentPhoton, eveBasis);
      currentPhoton = encodePhoton(eveBit, eveBasis);
      evePhoton = currentPhoton;
    }

    const bobBasis = getRandomBasis();
    const bobBit = measurePhoton(currentPhoton, bobBasis);

    const basisMatch = aliceBasis === bobBasis;
    
    let isError = false;
    if (basisMatch) {
      aliceKey.push(aliceBit);
      bobKey.push(bobBit);
      matchingBasesCount++;
      if (aliceBit !== bobBit) {
         isError = true;
         errorCount++;
      }
    }

    steps.push({
      index: i + 1,
      aliceBit,
      aliceBasis,
      alicePhoton,
      eveBasis,
      eveBit,
      evePhoton,
      bobBasis,
      bobBit,
      basisMatch,
      isError,
    });
  }

  const qber = matchingBasesCount > 0 ? errorCount / matchingBasesCount : 0;
  const eavesdropperDetected = qber >= 0.11;

  return {
    steps,
    aliceKey,
    bobKey,
    matchingBasesCount,
    errorCount,
    qber,
    eavesdropperDetected,
  };
};

export const convertBitsToAESKey = (bits: Bit[]): string => {
  const bitString = bits.join('');
  return bitString;
};
