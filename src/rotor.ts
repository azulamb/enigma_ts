/// <reference path="./types.d.ts" />

class Rotor {
	static CommercialEnigma(type: ROTOR_COMMERCIAL_ENIGMA) {
		const rotor = {
			'I': 'DMTWSILRUYQNKFEJCAZBPGXOHV',
			'II': 'HQZGPJTMOBLNCIFDYAWVEUSRKX',
			'III': 'UQNTLSZFMREHDPXKIBVYGJCWOA',
		};

		return new Rotor(rotor[type]);
	}

	static GermanRailway(type: ROTOR_GERMAN_RAILWAY) {
		const rotor = {
			'I': 'JGDQOXUSCAMIFRVTPNEWKBLZYH',
			'II': 'NTZPSFBOKMWRCJDIVLAEYUXHGQ',
			'III': 'JVIUBHTCDYAKEQZPOSGXNRMWFL',
			'UKW': 'QYHOGNECVPUZTFDJAXWMKISRBL',
			'ETW': 'QWERTZUIOASDFGHJKPYXCVBNML',
		};

		return new Rotor(rotor[type]);
	}

	static SwissK(type: ROTOR_SWISS_K) {
		const rotor = {
			'I': 'PEZUOHXSCVFMTBGLRINQJWAYDK',
			'II': 'ZOUESYDKFWPCIQXHMVBLGNJRAT',
			'III': 'EHRVXGAOBQUSIMZFLYNWKTPDJC',
			'UKW': 'IMETCGFRAYSQBZXWLHKDVUPOJN',
			'ETW': 'QWERTZUIOASDFGHJKPYXCVBNML',
		};

		return new Rotor(rotor[type]);
	}

	static EnigmaI(type: ROTOR_ENIGMA_I) {
		const rotor = {
			'I': 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
			'II': 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
			'III': 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
		};

		return new Rotor(rotor[type]);
	}

	static M3Army(type: ROTOR_M3_ARMY) {
		const rotor = {
			'I': 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
			'II': 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
			'III': 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
			'IV': 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
			'V': 'VZBRGITYUPSDNHLXAWMJQOFECK',
		};

		return new Rotor(rotor[type]);
	}

	static M4Naval(type: ROTOR_M4_NAVAL) {
		const rotor = {
			'I': 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
			'II': 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
			'III': 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
			'IV': 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
			'V': 'VZBRGITYUPSDNHLXAWMJQOFECK',
			'VI': 'JPGVOUMFYQBENHZRDKASXLICTW',
			'VII': 'NZJHGRCXMYSWBOUFAIVLPEKQDT',
			'VIII': 'FKQHTLXOCBJSPDZRAMEWNIUYGV',
		};

		return new Rotor(rotor[type]);
	}

	static Reflector(type: REFLECTOR_TYPE, model?: 'EnigmaI' | 'M4R1' | 'M4R2') {
		const rotor = {
			'Beta': 'LEYJVCNIXWPBQMDRTAKZGFUHOS',
			'Gamma': 'FSOKANUERHMBTIYCWLQPZXVGJD',
			'A': 'EJMZALYXVBWFCRQUONTSPIKHGD',
			'B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
			'C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
			'ThinB': 'ENKQAUYWJICOPBLMDXZVFTHRGS',
			'ThinC': 'RDOBJNTKVEHMLFCWZAXGYIPSUQ',
			'ETW': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		};

		if (model === 'EnigmaI' && type === 'ETW') {
			return new Rotor(rotor.ETW);
		}

		if (model === 'M4R1' && (type === 'ThinB' || type === 'ThinC')) {
			return new Rotor(rotor[type]);
		}

		if (model === 'M4R2' && (type === 'Beta' || type === 'Gamma')) {
			return new Rotor(rotor[type]);
		}

		return new Rotor(rotor[type]);
	}

	protected inputs = <ENIGMA_KEY[]> [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

	protected rotor!: { [key in ENIGMA_KEY]: number };

	constructor(rotor: string) {
		const base = <ENIGMA_KEY[]> [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
		const convert = [
			...rotor.replace(/[a-z]/g, (char) => {
				return String.fromCharCode(char.charCodeAt(0) & ~32);
			}).replace(/[^A-Z]+/g, ''),
		];
		if (base.length !== convert.length) {
			throw new Error('Rotor setting error.');
		}
		for (const key of base) {
			this.rotor[key] = convert.indexOf(key);
		}
	}

	// Input key -> key position.
	protected inputPosition(key: ENIGMA_KEY) {
		const input = this.inputs.indexOf(key);
		return input;
	}

	public input(key: ENIGMA_KEY | number) {
		const position = typeof key === 'string' ? this.inputPosition(key) : key;
		if (position < 0) {
			throw new Error('Input invalid.');
		}
	}
}
