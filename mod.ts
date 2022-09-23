import { EnigmaSimulator } from "./src/simulator.ts";
import { EnigmaConfig } from "./src/config.ts";
import { EnigmaPlugboard } from './src/plugboard.ts';
import { EnigmaGenerate } from './src/generate.ts';
import { EnigmaRotor } from "./src/rotor.ts";
import { EnigmaReflector } from "./src/reflector.ts";

export const Enigma: EnigmaMod = (() => {
	const generator = new EnigmaGenerate(EnigmaRotor, EnigmaReflector);

	return {
		Create: (config?: ENIGMA_CONFIG) => {
	
			const conf = new EnigmaConfig();
			if (config) {
				conf.set(config);
			}
	
			const plugboard = new EnigmaPlugboard();
	
			return new EnigmaSimulator(conf, generator).setPlugboard(plugboard);
		},
	
		Generate: generator,
	
		Simulator: EnigmaSimulator,
		Config: EnigmaConfig,
	}
})();
