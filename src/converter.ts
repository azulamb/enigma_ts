/// <reference path="./types.d.ts" />

export class EnigmaConverter implements EnigmaConverter {
	protected name = 'Converter';
	protected type = 0;
	protected offset = 0;

	get fullName() {
		return `${this.name}(${this.type})[${this.offset}]`;
	}

	protected outputs: ENIGMA_KEY[];
	protected inputs: ENIGMA_KEY[];
	protected table: { in: ENIGMA_KEY; out: ENIGMA_KEY }[] = [];

	constructor(output: string, etw: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
		this.outputs = <ENIGMA_KEY[]> [...etw];
		this.inputs = <ENIGMA_KEY[]> [
			...output.replace(/[a-z]/g, (char) => {
				return String.fromCharCode(char.charCodeAt(0) & ~32);
			}).replace(/[^A-Z]+/g, ''),
		];

		if (this.outputs.length !== this.inputs.length) {
			throw new Error(`${this.name} setting error:`);
		}

		this.generate();
	}

	protected generate(offset = 0) {
		if (offset < 0) {
			offset = 0;
		}
		const alphabet = <ENIGMA_KEY[]> [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
		this.table = [];
		for (let i = 0; i < this.outputs.length; ++i) {
			this.table.push({
				//in: this.exw[i],
				//out: this.etw[(i + offset) % this.etw.length],
				in: alphabet[(alphabet.indexOf(this.inputs[i]) + offset) % this.inputs.length],
				out: alphabet[(alphabet.indexOf(this.outputs[i]) + offset) % this.outputs.length],
			});
		}
	}

	public setType(type: number) {
		this.type = type;
		return this;
	}

	// Input key -> key position.
	protected inputPosition(key: ENIGMA_KEY) {
		const input = this.outputs.indexOf(key);
		return input;
	}

	public getKey(position: number) {
		if (position < 0 || this.table.length <= position) {
			throw new Error(`Invalid ${this.fullName} position: ${position}`);
		}

		//return this.table[position];
		return this.table[position];
	}

	public inout(position: number) {
		if (position < 0 || this.table.length <= position) {
			return -1;
		}

		const set = this.getKey(position);
		const search = set.in;
		for (let i = 0; i < this.table.length; ++i) {
			if (this.table[i].out === search) {
				return i;
			}
		}

		return -1;
	}

	public outin(position: number) {
		if (position < 0 || this.table.length <= position) {
			return -1;
		}

		const set = this.getKey(position);
		const search = set.out;
		for (let i = 0; i < this.table.length; ++i) {
			if (this.table[i].in === search) {
				return i;
			}
		}

		return -1;
	}

	public status() {
		return {
			table: this.table.map((item) => {
				return Object.assign({}, item);
			}),
			offset: this.offset,
			name: this.fullName,
		};
	}
}
