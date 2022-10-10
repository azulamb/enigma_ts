/// <reference path="./types.d.ts" />

export class EnigmaSimulator implements EnigmaSimulator {
	protected config: EnigmaConfig;
	protected generator: EnigmaGenerator;
	protected plugboard!: EnigmaPlugboard;
	protected rotors: EnigmaRotor[] = [];
	protected reflector!: EnigmaReflector;
	protected etw: string[] = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

	constructor(config: EnigmaConfig, generator: EnigmaGenerator) {
		this.config = config;
		this.generator = generator;
	}

	public getConfig() {
		return this.config;
	}

	public setConfig(config: ENIGMA_CONFIG) {
		this.config.set(config);

		this.updateConfig();

		return this;
	}

	public updateConfig() {
		this.plugboard.reset();
		this.config.getPlugboard().forEach((pair) => {
			this.plugboard.set(pair.a, pair.b);
		});

		this.setRotors(
			this.config.getRotors().map((config, index) => {
				const rotor = this.generator.Rotor(config.model, config.rotor);
				const reset = this.config.getPosition(index);
				const ring = this.config.getRing(index);
				rotor.reset(reset, ring);
				return rotor;
			}),
		);

		this.setReflector(this.generator.Reflector(this.config.getModel(), this.config.getReflector()));

		return this;
	}

	public getETW() {
		return this.etw.concat();
	}

	public setETW(entryWheels: string | string[]) {
		this.etw = [...[entryWheels].flat().join('')];
		return this;
	}

	public setPlugboard(plugboard: EnigmaPlugboard) {
		this.plugboard = plugboard;
		return this;
	}

	public getRotor(index: number): EnigmaRotor | undefined {
		return this.rotors[index];
	}

	public setRotors(rotors: EnigmaRotor[]) {
		this.rotors = rotors;
		return this;
	}

	public setReflector(reflector: EnigmaReflector) {
		this.reflector = reflector;
		return this;
	}

	public reset() {
		for (let i = 0; i < this.rotors.length; ++i) {
			this.rotors[i].reset(this.config.getPosition(i), this.config.getRing(i));
		}
		return this;
	}

	public rotate() {
		let rotate = true;
		for (let i = this.rotors.length - 1; 0 <= i; --i) {
			rotate = this.rotors[i].rotate();
			if (!rotate) {
				break;
			}
		}
		return this;
	}

	public input(key?: ENIGMA_KEY) {
		const result: {
			input: string;
			output: string;
			position: number[];
			position_str: ENIGMA_KEY[];
		} = {
			input: key || '',
			output: '',
			position: [],
			position_str: [],
		};

		// Plugboard
		let position = key ? this.etw.indexOf(this.plugboard.convert(key)) : -1;
		if (position < 0) {
			return result;
		}

		// Input
		result.position.push(position);
		result.position_str.push(<ENIGMA_KEY> key);

		// First rotor.
		for (let i = this.rotors.length - 1; 0 <= i; --i) {
			position = this.rotors[i].inout(position);
			if (position < 0) {
				result.output = '';
				return result;
			}
			const r = this.rotors[i].getKey(position);
			if (!r) {
				result.output = '';
				return result;
			}
			result.position.push(position);
			result.position_str.push(r.out);
			result.output = r.out;
		}

		// Reflector
		position = this.reflector.inout(position);
		if (position < 0) {
			result.output = '';
			return result;
		}
		const r = this.reflector.getKey(position);
		if (!r) {
			result.output = '';
			return result;
		}
		result.position.push(position);
		result.position_str.push(r.out);
		result.output = r.out;

		// Next rotor
		for (let i = 0; i < this.rotors.length; ++i) {
			position = this.rotors[i].outin(position);
			if (position < 0) {
				result.output = '';
				return result;
			}
			const r = this.rotors[i].getKey(position);
			if (!r) {
				result.output = '';
				return result;
			}
			result.position.push(position);
			result.position_str.push(r.in);
			result.output = r.in;
		}

		// Plugboard
		result.output = this.plugboard.convert(this.etw[position]);

		return result;
	}

	public status() {
		return {
			plugboard: this.plugboard.status(),
			rotors: this.rotors.map((rotor) => {
				return rotor.status();
			}),
			reflector: this.reflector.status(),
		};
	}
}
