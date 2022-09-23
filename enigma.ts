import { parse } from 'https://deno.land/std@0.66.0/flags/mod.ts';
import { Enigma } from './mod.ts';

export class EnigmaCLI {
	public debug = false;
	protected enigma: EnigmaSimulator;

	constructor() {
		this.enigma = Enigma.Create();
	}

	public setConfig(config: ENIGMA_CONFIG) {
		this.enigma.setConfig(config);
		if (this.debug) {
			console.info('# Change config.');
			console.info(this.enigma.getConfig().get());
		}
	}

	public getConfig() {
		return this.enigma.getConfig().get();
	}

	public reset() {
		this.enigma.reset();
		return this;
	}

	// Before call before status.
	public rotate() {
		this.enigma.rotate();
	}

	protected convertEnigmaKey(char: string): ENIGMA_KEY | '' {
		const enigmaKeys = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
		char = String.fromCharCode(char.charCodeAt(0) & ~32);
		if (enigmaKeys.includes(char)) {
			return <ENIGMA_KEY> char;
		}

		return '';
	}

	public input(char: ENIGMA_KEY) {
		// Add positions.
		const key = this.convertEnigmaKey(char);

		if (key) {
			const result = this.enigma.input(key);

			return result.output;
		}

		return '';
	}

	protected printRoute(length: number, input?: number, output?: number) {
		const list: { length: number; char: string }[] = [];

		const inPosition = input === undefined ? 0 : input + 1;
		const outPosition = output === undefined ? 0 : output + 1;

		if (inPosition && outPosition) {
			// min & max
			const min = inPosition && outPosition ? Math.min(inPosition, outPosition) : Math.max(inPosition, outPosition);
			const max = inPosition && outPosition ? Math.max(inPosition, outPosition) : 0;

			list.push({ length: min - 1, char: '-' });
			list.push({ length: 1, char: min === inPosition ? 'v' : '^' });

			if (max - min) {
				list.push({ length: max - min - 1, char: '-' });
			}
			if (max) {
				list.push({ length: 1, char: max === outPosition ? '^' : 'v' });
			}
			list.push({ length: length - max, char: '-' });
		} else if (inPosition) {
			list.push({ length: inPosition - 1, char: '-' });
			list.push({ length: 1, char: 'v' });
			list.push({ length: length - inPosition, char: '-' });
		} else if (outPosition) {
			list.push({ length: outPosition - 1, char: '-' });
			list.push({ length: 1, char: '^' });
			list.push({ length: length - outPosition, char: '-' });
		} else {
			list.push({ length: length, char: '-' });
		}

		console.log(`+${
			list.map((item) => {
				if (item.length <= 0) {
					return '';
				}
				return ''.padStart(item.length, item.char);
			}).join('')
		}+`);
	}

	public status(char?: string) {
		const key = this.convertEnigmaKey(char || '');
		const status = this.enigma.status();
		const etw = this.enigma.getETW();

		// Add positions.
		const result = this.enigma.input(<ENIGMA_KEY> key);
		console.log(result);

		console.log(` ${etw.join('')} `);
		let p = 0;
		// Reflector <- Rotor1 <- Rotor2 <- Rotor3 <- Plugboard <- input
		// Reflector -> Rotor1 -> Rotor2 -> Rotor3 -> Plugboard -> output

		// Plugboard
		console.log(` ${
			etw.map((key) => {
				return status.plugboard[key] ? key : ' ';
			}).join('')
		} `);
		console.log(` ${
			etw.map((key) => {
				return status.plugboard[key] || ' ';
			}).join('')
		} `);

		// Rotor
		for (let i = status.rotors.length - 1; 0 <= i; --i) {
			const rotor = status.rotors[i];
			this.printRoute(etw.length, result.position[p++], result.position[result.position.length - p]);
			console.log(`|${
				rotor.table.map((item) => {
					return item.in;
				}).join('')
			}|`);
			console.log(`|${''.padStart(etw.length, ' ')}| ${rotor.name}`);
			console.log(`|${
				rotor.table.map((item) => {
					return item.out;
				}).join('')
			}|`);
			this.printRoute(etw.length, result.position[p], result.position[result.position.length - p - 1]);
		}

		// Reflector
		const reflector = status.reflector;
		this.printRoute(etw.length, result.position[p], result.position[++p]);
		console.log(`|${
			reflector.table.map((item) => {
				return item.in;
			}).join('')
		}|`);
		if (result.position[p - 1] !== undefined && result.position[p] !== undefined) {
			const min = Math.min(result.position[p - 1], result.position[p]);
			const max = Math.max(result.position[p - 1], result.position[p]);
			console.log(
				`|${''.padStart(min, ' ')}${''.padStart(1, '+')}${max - min === 1 ? '' : ''.padStart(max - min - 1, '-')}${''.padStart(1, '+')}${
					''.padStart(etw.length - max - 1, ' ')
				}| ${reflector.name}`,
			);
		} else {
			console.log(`|${''.padStart(etw.length, ' ')}| ${reflector.name}`);
		}
		console.log(`|${
			reflector.table.map((item) => {
				return item.out;
			}).join('')
		}|`);
		console.log(`+${''.padStart(etw.length, '-')}+`);

		// Result
		if (key) {
			console.log(`${key} => ${result.output}`);
		}

		return result.output;
	}
}

if (import.meta.main) {
	const args = parse(Deno.args);

	const config: ENIGMA_CONFIG = await (async (args) => {
		if (args.length <= 0) {
			return {};
		}

		for (const file of args) {
			if (typeof file !== 'string') {
				continue;
			}
			try {
				const text = await Deno.readTextFile(file);
				return JSON.parse(text);
			} catch (error) {
				console.error(error);
			}
		}

		return {};
	})(args._);

	const enigma = new EnigmaCLI();
	if (args.debug === true) {
		enigma.debug = true;
	}
	enigma.setConfig(config);

	enigma.reset();

	Deno.setRaw(0, true);

	const bufferSize = 16;
	const buf = new Uint8Array(bufferSize);

	let output = '';

	while (true) {
		const read = await Deno.stdin.read(buf);

		if (read === null) {
			break;
		}

		if (buf && buf[0] === 0x03) {
			break;
		}

		if (buf && buf[0] === 13) {
			break;
		}

		const char = new TextDecoder().decode(buf.subarray(0, read));
		enigma.rotate();
		const out = enigma.input(<ENIGMA_KEY> char);

		output = output + out;
		Deno.stdout.write(new TextEncoder().encode(`\r${output}`));
	}

	Deno.setRaw(0, false);
}
