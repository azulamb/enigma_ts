type ENIGMA_MODEL = 'EnigmaI';
type REFLECTOR_TYPE = 'A' | 'B' | 'C';
// deno-fmt-ignore
type ENIGMA_KEY = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
type ROTOR_ENIGMA_I = 'I' | 'II' | 'III' | 'IV' | 'V';
type ROTOR_ALL = ROTOR_ENIGMA_I;

interface ENIGMA_CONFIG {
	model?: ENIGMA_MODEL;
	reflector?: REFLECTOR_TYPE;
	rotors?: ROTOR_ALL[];
	rings?: string[];
	plugboard?: string[];
	position?: string[];
}

interface ENIGMA_ENABLE_CONFIG {
	model: ENIGMA_MODEL;
	reflector: REFLECTOR_TYPE;
	rotors: ROTOR_ALL[];
	rings: string[];
	plugboard: string[];
	position: string[];
}

interface EnigmaConfig {
	get(): ENIGMA_ENABLE_CONFIG;

	set(config: ENIGMA_CONFIG): this;

	getModel(): ENIGMA_MODEL;
	setModel(model: ENIGMA_MODEL): this;

	setReflector(reflector: REFLECTOR_TYPE): this;

	getReflector(): REFLECTOR_TYPE;

	setRotors(rotors: ROTOR_ALL[]): this;

	getRotors(): {
		model: ENIGMA_MODEL;
		rotor: ROTOR_ALL;
	}[];

	getRotor(position: number): {
		model: ENIGMA_MODEL;
		rotor: ROTOR_ALL;
	};

	setRings(rings: string[]): this;

	getRings(): string[];

	getRing(index: number): ENIGMA_KEY | '';

	setPlugboard(plugboard: string[]): this;

	getPlugboard(): { a: ENIGMA_KEY; b: ENIGMA_KEY }[];

	setPosition(position: string[]): this;

	getPositions(): string[];

	getPosition(index: number): ENIGMA_KEY | '';
}

interface EnigmaPlugboard {
	reset(): this;

	set(a: ENIGMA_KEY, b: ENIGMA_KEY): this;

	convert(key: string): ENIGMA_KEY;

	status(): { [keys: string]: ENIGMA_KEY };
}

interface EnigmaConverter {
	readonly fullName: string;

	setType(type: string): this;

	getKey(position: number): { in: string; out: string };

	inout(position: number): number;

	outin(position: number): number;

	status(): {
		table: { in: string; out: string }[];
		offset: number;
		name: string;
	};
}

interface EnigmaReflector extends EnigmaConverter {
}

interface EnigmaRotor extends EnigmaConverter {
	setTurnover(keys: ENIGMA_KEY | ENIGMA_KEY[]): this;
	rotate(): boolean;
	reset(reset: ENIGMA_KEY | '', ring: ENIGMA_KEY | ''): this;
}

interface EnigmaSimulator {
	getConfig(): EnigmaConfig;
	setConfig(config: ENIGMA_CONFIG): this;

	getETW(): string[];
	setETW(entryWheels: string | string[]): this;

	setPlugboard(plugboard: EnigmaPlugboard): this;

	setRotors(rotors: EnigmaRotor[]): this;

	setReflector(reflector: EnigmaConverter): this;

	reset(): this;

	/**
	 * Call this method before call input().
	 */
	rotate(): this;

	input(key?: ENIGMA_KEY): {
		input: string;
		output: string;
		position: number[];
	};

	status(): {
		plugboard: { [keys: string]: ENIGMA_KEY };
		rotors: {
			table: { in: string; out: string }[];
			offset: number;
			name: string;
		}[];
		reflector: {
			table: { in: string; out: string }[];
			offset: number;
			name: string;
		};
	};
}

interface EnigmaGenerator {
	Rotor(model: ENIGMA_MODEL, type: ROTOR_ALL): EnigmaRotor;
	Reflector(model: ENIGMA_MODEL, type: REFLECTOR_TYPE): EnigmaReflector;
}

interface EnigmaMod {
	Create(config?: ENIGMA_CONFIG): EnigmaSimulator;

	Generate: EnigmaGenerator;

	Simulator: { new (config: EnigmaConfig, generator: EnigmaGenerator): EnigmaSimulator };
	Config: { new (config?: ENIGMA_CONFIG): EnigmaConfig };
}
