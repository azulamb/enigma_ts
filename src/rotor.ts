import { EnigmaConverter } from './converter.ts';

export class EnigmaRotor extends EnigmaConverter implements EnigmaRotor {
	protected name = 'Rotor';

	protected turnover: ENIGMA_KEY[] = ['A'];
	public setTurnover(keys: ENIGMA_KEY | ENIGMA_KEY[]) {
		if (!Array.isArray(keys)) {
			keys = [keys];
		}

		for (const key of keys) {
			const position = this.outputs.indexOf(key);
			if (position < 0) {
				throw new Error(`Invalid turnover: ${key}`);
			}
		}
		this.turnover = keys;

		return this;
	}

	public input(key: ENIGMA_KEY | number) {
		const position = typeof key === 'string' ? this.inputPosition(key) : key;
		if (position < 0) {
			throw new Error(`Invalid input: ${key}`);
		}
	}

	public rotate() {
		if (this.table.length <= 0) {
			return false;
		}
		const turnover = this.turnover.includes(<ENIGMA_KEY> this.table[0].out);
		this.table.push(<{ in: string; out: string; print: string }> this.table.shift());

		return turnover;
	}

	public reset(reset: ENIGMA_KEY | '', ring: ENIGMA_KEY | '') {
		this.offset = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].indexOf(ring);

		this.generate(this.offset);

		for (let i = 0; i < this.table.length; ++i) {
			if (this.table[0].out === reset) {
				return this;
			}
			this.rotate();
		}

		throw new Error(`Notfound reset key: ${reset}`);
	}
}
