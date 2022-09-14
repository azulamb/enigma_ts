import { parse } from "https://deno.land/std@0.66.0/flags/mod.ts";
import {Enigma} from './src/enigma.ts'

class EnigmaCLI {
	public debug = false;
	protected enigma: Enigma;

	constructor() {
		this.enigma = new Enigma();
	}

	public setConfig(config: ENIGMA_CONFIG) {
		this.enigma.setConfig(config);
		if (this.debug) {
			console.info('# Change config.');
			console.info(this.enigma.getConfig());
		}
	}

	public getConfig() {
		return this.enigma.getConfig();
	}
}

const args = parse(Deno.args);

const config: ENIGMA_CONFIG = await (async(args) => {
	if (args.length<=0) {
		return {};
	}
	for(const file of args) {
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
