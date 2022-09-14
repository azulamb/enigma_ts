/// <reference path="./types.d.ts" />
/// <reference path="./rotor.ts" />

interface ENIGMA_ENABLE_CONFIG {
	model: ENIGMA_MODEL;
	reflector: REFLECTOR_TYPE;
	rotors: ROTOR_ALL[];
	rings: string[];
	plugboard: string[];
	position: string[];
}

export class Enigma {
	protected config: ENIGMA_ENABLE_CONFIG = {
		model: 'M3Army',
		reflector: 'C',
		rotors: ['V', 'I', 'III'],
		rings: ['S', 'R', 'E'],
		plugboard: ['CS', 'ER'],
		position: ['E', 'H', 'S'],
	};

	constructor(config?: ENIGMA_CONFIG) {
		if (config) {
			this.setConfig(config);
		}
	}

	public setConfig(config: ENIGMA_CONFIG) {
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

	public setModel(model: ENIGMA_MODEL) {
		this.config.model = model;
		return this;
	}

	public setReflector(reflector: REFLECTOR_TYPE) {
		this.config.reflector = reflector;
		return this;
	}

	public setRotors(rotors: ROTOR_ALL[]) {
		this.config.rotors = rotors;
		return this;
	}

	public setRings(rings: string[]) {
		this.config.rings = rings;
		return this;
	}

	public setPlugboard(plugboard: string[]) {
		this.config.plugboard = plugboard;
		return this;
	}

	public setPosition(position: string[]) {
		this.config.position = position;
		return this;
	}

	public getConfig() {
		return Object.assign({}, this.config);
	}

	public status() {
	}
}
