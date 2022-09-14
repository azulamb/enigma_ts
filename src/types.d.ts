type ENIGMA_MODEL = 'CommercialEnigma' | 'GermanRailway' | 'SwissK' | 'EnigmaI' | 'M3Army' | 'M4Naval';
type REFLECTOR_TYPE = 'Beta' | 'Gamma' | 'A' | 'B' | 'C' | 'ThinB' | 'ThinC' | 'ETW';
// deno-fmt-ignore
type ENIGMA_KEY = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
type ROTOR_ENIGMA_I = 'I' | 'II' | 'III';
type ROTOR_COMMERCIAL_ENIGMA = ROTOR_ENIGMA_I;
type ROTOR_GERMAN_RAILWAY = ROTOR_ENIGMA_I | 'UKW' | 'ETW';
type ROTOR_SWISS_K = ROTOR_GERMAN_RAILWAY;
type ROTOR_M3_ARMY = ROTOR_ENIGMA_I | 'IV' | 'V';
type ROTOR_M4_NAVAL = ROTOR_M3_ARMY | 'VI' | 'VII' | 'VIII';
type ROTOR_ALL = ROTOR_M4_NAVAL | ROTOR_GERMAN_RAILWAY;

interface ENIGMA_CONFIG {
	model?: ENIGMA_MODEL;
	reflector?: REFLECTOR_TYPE;
	rotors?: ROTOR_ALL[];
	rings?: string[];
	plugboard?: string[];
	position?: string[];
}
