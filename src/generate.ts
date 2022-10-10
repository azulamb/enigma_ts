/// <reference path="./types.d.ts" />

export class EnigmaGenerate implements EnigmaGenerator {
	protected rotor: { new (output: string, etw?: string): EnigmaRotor };
	protected reflector: { new (output: string, etw?: string): EnigmaReflector };

	constructor(rotor: { new (output: string, etw?: string): EnigmaRotor }, reflector: { new (output: string, etw?: string): EnigmaReflector }) {
		this.rotor = rotor;
		this.reflector = reflector;
	}

	protected rotorEnigmaI(type: number) {
		const rotor: {
			table: string;
			notch: ENIGMA_KEY;
			turnover: ENIGMA_KEY;
		}[] = [
			{ table: 'ABCDEFGHIJKLMNOPQRSTUVQXYZ', notch: 'A', turnover: 'Z' }, // Invalid.
			{ table: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Y', turnover: 'Q' },
			{ table: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'M', turnover: 'E' },
			{ table: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'D', turnover: 'V' },
			{ table: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'R', turnover: 'J' },
			{ table: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'H', turnover: 'Z' },
		];

		return new this.rotor(rotor[type].table).setType(type).setTurnover(rotor[type].turnover);
	}

	public Rotor(model: ENIGMA_MODEL, type: number) {
		try {
			switch (model) {
				case 'EnigmaI':
					return this.rotorEnigmaI(type);
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

		return new this.reflector(rotor[type]).setType((<REFLECTOR_TYPE[]> [...'ABC']).indexOf(type) + 1);
	}
}
