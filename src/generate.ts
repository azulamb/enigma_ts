/// <reference path="./types.d.ts" />

export class EnigmaGenerate implements EnigmaGenerator {
	protected rotor: { new (output: string, etw?: string): EnigmaRotor };
	protected reflector: { new (output: string, etw?: string): EnigmaReflector };

	constructor(rotor: { new (output: string, etw?: string): EnigmaRotor }, reflector: { new (output: string, etw?: string): EnigmaReflector }) {
		this.rotor = rotor;
		this.reflector = reflector;
	}

	protected rotorEnigmaI(type: ROTOR_ENIGMA_I) {
		const rotor: {
			[key in ROTOR_ENIGMA_I]: {
				table: string;
				notch: ENIGMA_KEY;
				turnover: ENIGMA_KEY;
			};
		} = {
			'I': { table: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Y', turnover: 'Q' },
			'II': { table: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'M', turnover: 'E' },
			'III': { table: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'D', turnover: 'V' },
			'IV': { table: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'R', turnover: 'J' },
			'V': { table: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'H', turnover: 'Z' },
		};

		return new this.rotor(rotor[type].table).setType(type).setTurnover(rotor[type].turnover);
	}

	public Rotor(model: ENIGMA_MODEL, type: ROTOR_ALL) {
		try {
			switch (model) {
				case 'EnigmaI':
					return this.rotorEnigmaI(<ROTOR_ENIGMA_I> type);
			}
		} catch (error) {
			console.error(error);
		}

		return new this.rotor('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
	}

	public Reflector(model: ENIGMA_MODEL, type: REFLECTOR_TYPE) {
		const rotor = {
			'A': 'EJMZALYXVBWFCRQUONTSPIKHGD',
			'B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
			'C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
		};

		return new this.reflector(rotor[type]).setType(type);
	}
}
