/// <reference path="./types.d.ts" />

export class EnigmaConfig implements EnigmaConfig {
	protected config: ENIGMA_ENABLE_CONFIG = {
		model: 'EnigmaI',
		reflector: 'C',
		rotors: ['V', 'I', 'III'],
		rings: ['S', 'R', 'E'],
		plugboard: ['CS', 'ER'],
		position: ['E', 'H', 'S'],
	};

	constructor(config?: ENIGMA_CONFIG) {
		if (config) {
			this.set(config);
		}
	}

	public get() {
		return Object.assign({}, this.config);
	}

	public set(config: ENIGMA_CONFIG) {
		if (config.model) {
			this.setModel(config.model);
		}

		if (config.reflector) {
			this.setReflector(config.reflector);
		}

		if (config.rotors) {
			this.setRotors(config.rotors);
		}

		if (config.rings) {
			this.setRings(config.rings);
		}

		if (config.plugboard) {
			this.setPlugboard(config.plugboard);
		}

		if (config.position) {
			this.setPosition(config.position);
		}

		return this;
	}

	public getModel(): ENIGMA_MODEL {
		return this.config.model;
	}

	public setModel(model: ENIGMA_MODEL) {
		this.config.model = model;
		return this;
	}

	public setReflector(reflector: REFLECTOR_TYPE) {
		this.config.reflector = reflector;
		return this;
	}

	public getReflector() {
		return this.config.reflector;
	}

	public setRotors(rotors: ROTOR_ALL[]) {
		this.config.rotors = rotors;
		return this;
	}

	public getRotors() {
		return this.config.rotors.map((rotor, index) => {
			return this.getRotor(index);
		});
	}

	public getRotor(position: number) {
		if (position < 0) {
			throw new Error(`Invalid rotor position: ${position}`);
		}
		if (this.config.rotors.length <= position) {
			throw new Error(`Notfound rotor: ${position}`);
		}
		return {
			model: this.config.model,
			rotor: this.config.rotors[position],
		};
	}

	public setRings(rings: string[]) {
		this.config.rings = rings;
		return this;
	}

	public getRings() {
		return this.config.rings.concat();
	}

	public getRing(index: number) {
		return <ENIGMA_KEY> this.config.rings[index] || '';
	}

	public setPlugboard(plugboard: string[]) {
		this.config.plugboard = plugboard;
		return this;
	}

	public getPlugboard() {
		return <{ a: ENIGMA_KEY; b: ENIGMA_KEY }[]> this.config.plugboard.map((piar) => {
			const keys = piar.split('');
			if (keys.length < 2) {
				return null;
			}
			return { a: keys[0], b: keys[1] };
		}).filter((pair) => {
			return pair !== null;
		});
	}

	public setPosition(position: string[]) {
		this.config.position = position;
		return this;
	}

	public getPositions() {
		return this.config.position.concat();
	}

	public getPosition(index: number) {
		return <ENIGMA_KEY> this.config.position[index] || '';
	}
}
