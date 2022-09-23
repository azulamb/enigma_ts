/// <reference path="./types.d.ts" />

export class EnigmaPlugboard implements EnigmaPlugboard {
	protected table: { [keys: string]: ENIGMA_KEY } = {};

	constructor() {}

	public reset() {
		this.table = {};
		return this;
	}

	public set(a: ENIGMA_KEY, b: ENIGMA_KEY) {
		this.table[a] = b;
		this.table[b] = a;

		return this;
	}

	public convert(key: string) {
		return this.table[key] || key;
	}

	public status() {
		return Object.assign({}, this.table);
	}
}
