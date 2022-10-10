/// <reference path="../src/types.d.ts" />

declare const Enigma: EnigmaMod;

interface ConverterData {
	[keys: string]: {
		back: SVGRectElement;
		text: SVGTextElement;
	};
}

interface LineData {
	[keys: string]: SVGPathElement;
}

((script, init) => {
	if (document.readyState !== 'loading') {
		return init(script);
	}
	document.addEventListener('DOMContentLoaded', () => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	const tagname = 'enigma-sim';
	if (customElements.get(tagname)) {
		return;
	}
	const KEYS = <ENIGMA_KEY[]> [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
	const ROMANUM = [...'ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ'];
	customElements.define(
		tagname,
		class extends HTMLElement {
			protected enigma: EnigmaSimulator;
			protected svg: SVGSVGElement;
			protected reflector: { group: SVGGElement; type: SVGTextElement; in: ConverterData; line: LineData };
			protected rotors: {
				group: SVGGElement;
				name: SVGTextElement;
				type: SVGTextElement;
				ring: SVGTextElement;
				in: ConverterData;
				out: ConverterData;
				line: LineData;
			}[];
			protected plugboard: { group: SVGGElement; in: ConverterData; out: ConverterData; line: LineData };
			protected entry: { group: SVGGElement; in: ConverterData };

			protected inputArea: HTMLInputElement;
			protected outputArea: HTMLInputElement;
			protected config: {
				reflector: HTMLSelectElement;
				rotors: HTMLSelectElement[];
				rings: HTMLSelectElement[];
				positions: HTMLSelectElement[];
				plugboard: HTMLTextAreaElement;
			};

			constructor() {
				super();

				this.enigma = Enigma.Create({
					'model': 'EnigmaI',
					'reflector': 'C',
					'rotors': [5, 1, 3],
					'rings': ['S', 'R', 'E'],
					'plugboard': ['CS', 'ER'],
					'position': ['E', 'H', 'S'],
				});

				const svg = this.createSVG();
				this.rotate();
				this.update();

				const shadow = this.attachShadow({ mode: 'open' });

				const style = document.createElement('style');
				style.innerHTML = [
					':host { display: block; width: 100%; height: fit-content; }',
					':host > div { display: grid; grid-template-rows: 1fr 1.5rem 1.5rem; position: relative; }',
					':host > div > button { top: 0; right: 0; width: 1rem; height: 1rem; position: absolute; padding: 0; font-size: 1rem; line-height: 1rem; }',
					':host > div > button::before { content: "⚙"; }',
					'svg {display: block; margin: auto; }',
					'input { font-family: monospace; box-sizing: border-box; }',
					'button { cursor: pointer; box-sizing: border-box; }',
					'dialog { border: none; background: transparent; padding: 0; }',
					'dialog > div { background: #fff; border-radius: 0.5rem; padding: 0.5rem; }',
					'dialog > div > h3 { margin: 0 0 1rem; text-align: center; }',
					'dialog::backdrop { background: rgba(0, 0, 0, 0.6); }',
				].join('');

				this.inputArea = document.createElement('input');
				this.inputArea.readOnly = true;
				this.outputArea = document.createElement('input');
				this.outputArea.readOnly = true;

				const dialog = this.createConfig();

				const button = document.createElement('button');
				button.addEventListener('click', () => {
					const config = this.enigma.getConfig();
					for (const option of this.config.reflector.options) {
						if (option.value !== config.getReflector()) {
							continue;
						}
						option.selected = true;
						break;
					}

					this.config.rotors.forEach((rotor, index) => {
						for (const option of rotor.options) {
							if (option.value !== config.getRotor(index).rotor + '') {
								continue;
							}
							option.selected = true;
							break;
						}
					});

					this.config.positions.forEach((rotor, index) => {
						for (const option of rotor.options) {
							if (option.value !== config.getPosition(index)) {
								continue;
							}
							option.selected = true;
							break;
						}
					});

					this.config.rings.forEach((rotor, index) => {
						for (const option of rotor.options) {
							if (option.value !== config.getRing(index)) {
								continue;
							}
							option.selected = true;
							break;
						}
					});

					this.config.plugboard.value = config.getPlugboard().map((pear) => {
						return `${pear.a}${pear.b}`;
					}).join('\n');

					dialog.showModal();
				});

				const contents = document.createElement('div');
				contents.appendChild(svg);
				contents.appendChild(this.inputArea);
				contents.appendChild(this.outputArea);
				contents.appendChild(button);
				contents.appendChild(dialog);

				shadow.appendChild(style);
				shadow.appendChild(contents);
			}

			protected createConfig() {
				const config = this.enigma.getConfig();

				const title = document.createElement('h3');
				title.textContent = 'Enigma config';

				const select = (values: string[] | { label: string; value: string }[]) => {
					const select = document.createElement('select');

					for (const value of values) {
						const option = document.createElement('option');
						select.appendChild(option);

						if (typeof value === 'string') {
							option.value = value;
							option.textContent = value;
						} else {
							option.value = value.value;
							option.textContent = value.label;
						}
					}

					return select;
				};
				const dt = (title: string) => {
					const dt = document.createElement('dt');
					dt.textContent = title;
					return dt;
				};
				const dd = (child: HTMLElement) => {
					const dd = document.createElement('dd');
					dd.appendChild(child);

					return dd;
				};

				const dl = document.createElement('dl');

				this.config = {
					reflector: select([
						{ label: 'UKW-A', value: 'A' },
						{ label: 'UKW-B', value: 'B' },
						{ label: 'UKW-C', value: 'C' },
					]),
					rotors: [],
					rings: [],
					positions: [],
					plugboard: document.createElement('textarea'),
				};

				// Reflector
				dl.appendChild(dt('Reflector'));
				dl.appendChild(dd(this.config.reflector));

				// Rotor
				const rotors = config.getRotors();
				for (let i = 0; i < rotors.length; ++i) {
					dl.appendChild(dt(`Rotor${i + 1}`));
					const type = select([
						{ label: 'Ⅰ', value: '1' },
						{ label: 'Ⅱ', value: '2' },
						{ label: 'Ⅲ', value: '3' },
						{ label: 'Ⅳ', value: '4' },
						{ label: 'Ⅴ', value: '5' },
					]);
					type.title = 'Type.';
					const position = select([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']);
					position.title = 'Position.';
					const ring = select([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']);
					ring.title = 'Ring.';
					const parent = document.createElement('div');
					parent.appendChild(type);
					parent.appendChild(position);
					parent.appendChild(ring);
					dl.appendChild(dd(parent));
					this.config.rotors.push(type);
					this.config.positions.push(position);
					this.config.rings.push(ring);
				}

				// Plugboard
				dl.appendChild(dt('Plugboard'));
				dl.appendChild(dd(this.config.plugboard));

				const button = document.createElement('button');
				button.textContent = 'Update';
				button.addEventListener('click', () => {
					const plugboard: string[] = [];
					let pear: string = '';
					const memo: string[] = [];
					[
						...this.config.plugboard.value.replace(/[a-z]/g, (char) => {
							return String.fromCharCode(char.charCodeAt(0) & ~32);
						}).replace(/[^A-Z]/g, ''),
					].forEach((str) => {
						if (memo.includes(str)) {
							return;
						}
						memo.push(str);
						pear += str;
						if (pear.length !== 2) {
							return;
						}
						plugboard.push(pear);
						pear = '';
					});

					config.setPlugboard(plugboard);
					config.setRotors(this.config.rotors.map((select) => {
						return parseInt(select.options[select.selectedIndex].value);
					}));
					config.setPosition(this.config.positions.map((select) => {
						return select.options[select.selectedIndex].value;
					}));
					config.setRings(this.config.rings.map((select) => {
						return select.options[select.selectedIndex].value;
					}));
					config.setReflector(<REFLECTOR_TYPE> this.config.reflector.options[this.config.reflector.selectedIndex].value);

					this.enigma.updateConfig();
					this.rotate();
					this.update();
					this.hover();
					this.inputArea.value = '';
					this.outputArea.value = '';

					dialog.close();
				});

				const contents = document.createElement('div');
				contents.addEventListener('click', (event) => {
					event.stopPropagation();
				});
				contents.appendChild(title);
				contents.appendChild(dl);
				contents.appendChild(button);

				const dialog = document.createElement('dialog');
				dialog.addEventListener('click', () => {
					dialog.close();
				});
				dialog.appendChild(contents);

				return dialog;
			}

			protected createConverterData(baseX: number) {
				const data: ConverterData = {};

				for (let i = 0; i < KEYS.length; ++i) {
					const key = KEYS[i];
					const back = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					back.setAttributeNS(null, 'x', baseX + '');
					back.setAttributeNS(null, 'y', `${50 + 30 * i}`);
					back.setAttributeNS(null, 'width', '20');
					back.setAttributeNS(null, 'height', '30');
					back.classList.add(i % 2 ? 'odd' : 'even');

					const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
					text.setAttributeNS(null, 'x', `${baseX + 10}`);
					text.setAttributeNS(null, 'y', `${50 + 30 * i + 15}`);
					text.textContent = key;

					data[key] = {
						back: back,
						text: text,
					};
				}

				return data;
			}

			protected createLineData(baseX: number, length: number, max = KEYS.length) {
				const data: LineData = {};

				for (let i = 0; i < max; ++i) {
					const key = KEYS[i];

					const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
					line.setAttributeNS(null, 'd', `M ${0},${baseX} ${baseX},${65 + 30 * i} ${baseX + length},${65 + 30 * i}`);
					line.setAttributeNS(null, 'stroke-width', '4');

					data[key] = line;
				}

				return data;
			}

			protected createSVG() {
				this.reflector = {
					group: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
					type: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
					in: this.createConverterData(140),
					line: this.createLineData(0, 100, KEYS.length / 2),
				};

				this.rotors = [
					{
						group: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
						name: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
						type: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
						ring: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
						out: this.createConverterData(20),
						in: this.createConverterData(140),
						line: this.createLineData(40, 100),
					},
					{
						group: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
						name: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
						type: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
						ring: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
						out: this.createConverterData(20),
						in: this.createConverterData(140),
						line: this.createLineData(40, 100),
					},
					{
						group: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
						name: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
						type: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
						ring: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
						out: this.createConverterData(20),
						in: this.createConverterData(140),
						line: this.createLineData(40, 100),
					},
				];

				this.plugboard = {
					group: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
					out: this.createConverterData(20),
					in: this.createConverterData(80),
					line: this.createLineData(40, 40),
				};

				this.entry = {
					group: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
					in: this.createConverterData(20),
				};

				// Reflector.
				this.reflector.group.classList.add('reflector');
				const rback = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				rback.setAttributeNS(null, 'x', '0');
				rback.setAttributeNS(null, 'y', '50');
				rback.setAttributeNS(null, 'width', '160');
				rback.setAttributeNS(null, 'height', '780');
				rback.classList.add('box');
				this.reflector.group.appendChild(rback);
				const rtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				rtext.setAttributeNS(null, 'x', '80');
				rtext.setAttributeNS(null, 'y', '20');
				rtext.textContent = 'Reflector';
				this.reflector.group.appendChild(rtext);
				this.reflector.type.setAttributeNS(null, 'x', '80');
				this.reflector.type.setAttributeNS(null, 'y', '40');
				this.reflector.type.textContent = '';
				this.reflector.group.appendChild(this.reflector.type);
				Object.keys(this.reflector.line).forEach((key) => {
					this.reflector.line[key].classList.add('line');
					this.reflector.group.appendChild(this.reflector.line[key]);
				});
				Object.keys(this.reflector.in).forEach((key) => {
					this.reflector.in[key].back.classList.add('back');
					this.reflector.in[key].text.classList.add('text');
					this.reflector.group.appendChild(this.reflector.in[key].back);
					this.reflector.group.appendChild(this.reflector.in[key].text);
				});

				// Rotor.
				let r = 0;
				for (const rotor of this.rotors) {
					const name = `rotor${r++}`;

					rotor.group.classList.add('rotor', name);
					rotor.group.setAttributeNS(null, 'transform', `translate(${r * 160},0)`);

					const back = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					back.setAttributeNS(null, 'x', <string> rotor.out.A.back.getAttributeNS(null, 'x'));
					back.setAttributeNS(null, 'y', '50');
					back.setAttributeNS(null, 'width', '140');
					back.setAttributeNS(null, 'height', '780');
					back.classList.add('box');
					rotor.group.appendChild(back);

					rotor.name.setAttributeNS(null, 'x', '90');
					rotor.name.setAttributeNS(null, 'y', '20');
					rotor.name.textContent = 'Rotor[]';
					rotor.group.appendChild(rotor.name);

					rotor.type.setAttributeNS(null, 'x', '50');
					rotor.type.setAttributeNS(null, 'y', '40');
					rotor.type.textContent = '';
					rotor.group.appendChild(rotor.type);

					rotor.ring.setAttributeNS(null, 'x', '130');
					rotor.ring.setAttributeNS(null, 'y', '40');
					rotor.ring.textContent = '';
					rotor.group.appendChild(rotor.ring);

					Object.keys(rotor.out).forEach((key) => {
						rotor.line[key].classList.add('line');
						rotor.line[key].dataset.key = key;
						rotor.group.appendChild(rotor.line[key]);
					});
					Object.keys(rotor.out).forEach((key) => {
						rotor.out[key].back.classList.add('back');
						rotor.out[key].text.classList.add('text');
						rotor.out[key].back.dataset.key = key;
						rotor.out[key].text.dataset.key = key;
						rotor.group.appendChild(rotor.out[key].back);
						rotor.group.appendChild(rotor.out[key].text);
					});
					Object.keys(rotor.in).forEach((key) => {
						rotor.in[key].back.classList.add('back');
						rotor.in[key].text.classList.add('text');
						rotor.in[key].back.dataset.key = key;
						rotor.in[key].text.dataset.key = key;
						rotor.group.appendChild(rotor.in[key].back);
						rotor.group.appendChild(rotor.in[key].text);
					});
				}

				// Plugboard.
				this.plugboard.group.classList.add('plugboard');
				this.plugboard.group.setAttributeNS(null, 'transform', `translate(${160 + r * 160},0)`);
				const pback = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				pback.setAttributeNS(null, 'x', '20');
				pback.setAttributeNS(null, 'y', '50');
				pback.setAttributeNS(null, 'width', '80');
				pback.setAttributeNS(null, 'height', '780');
				pback.classList.add('box');
				this.plugboard.group.appendChild(pback);
				const ptext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				ptext.setAttributeNS(null, 'x', '60');
				ptext.setAttributeNS(null, 'y', '20');
				ptext.textContent = 'Plugboard';
				this.plugboard.group.appendChild(ptext);
				Object.keys(this.plugboard.out).forEach((key) => {
					this.plugboard.line[key].classList.add('line');
					this.plugboard.line[key].dataset.key = key;
					this.plugboard.group.appendChild(this.plugboard.line[key]);
				});
				Object.keys(this.plugboard.out).forEach((key) => {
					this.plugboard.out[key].back.classList.add('back');
					this.plugboard.out[key].text.classList.add('text');
					this.plugboard.out[key].back.dataset.key = key;
					this.plugboard.out[key].text.dataset.key = key;
					this.plugboard.group.appendChild(this.plugboard.out[key].back);
					this.plugboard.group.appendChild(this.plugboard.out[key].text);
				});
				Object.keys(this.plugboard.in).forEach((key) => {
					this.plugboard.in[key].back.classList.add('back');
					this.plugboard.in[key].text.classList.add('text');
					this.plugboard.in[key].back.dataset.key = key;
					this.plugboard.in[key].text.dataset.key = key;
					this.plugboard.group.appendChild(this.plugboard.in[key].back);
					this.plugboard.group.appendChild(this.plugboard.in[key].text);
				});

				// Entry.
				this.entry.group.classList.add('entry');
				this.entry.group.setAttributeNS(null, 'transform', `translate(${160 + 100 + r * 160},0)`);
				let y = 35;
				Object.keys(this.entry.in).forEach((key) => {
					y += 30;
					const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
					line.classList.add('line');
					line.setAttributeNS(null, 'd', `M 0,${y} 20,${y}`);
					line.setAttributeNS(null, 'stroke-width', '4');
					line.dataset.key = key;
					this.entry.group.appendChild(line);

					this.entry.in[key].back.classList.add('back');
					this.entry.in[key].text.classList.add('text');
					this.entry.in[key].back.dataset.key = key;
					this.entry.in[key].text.dataset.key = key;
					this.entry.group.appendChild(this.entry.in[key].back);
					this.entry.group.appendChild(this.entry.in[key].text);

					this.entry.in[key].back.addEventListener('mouseover', () => {
						this.hover(<ENIGMA_KEY> key);
					});

					this.entry.in[key].back.addEventListener('click', () => {
						this.input(<ENIGMA_KEY> key);
						this.hover(<ENIGMA_KEY> key);
					});

					this.entry.in[key];
				});

				const width = 780;
				const height = 840;
				const style = document.createElement('style');
				style.innerHTML = [
					'.back { fill: #fff; }',
					'.box { fill: #e6e6e6; }',
					'.odd { fill: #b3b3b3; }',
					'.even { fill: #cccccc; }',
					'text { text-anchor: middle; dominant-baseline: central; font-family: monospace; font-weight: bold; pointer-events: none; }',
					'path { stroke: #99999980; fill: none; }',
					'.in { stroke: red; }',
					'.out { stroke: blue; }',
					'.ref { stroke: purple; }',
					...KEYS.map((key) => {
						return `g[data-in="${key}"] path[data-key="${key}"] { stroke: #cf321c; }`;
					}),
					...KEYS.map((key) => {
						return `g[data-out="${key}"] path[data-key="${key}"] { stroke: #1c56cf; }`;
					}),
					'.reflector path.convert { stroke: #cf1c9b; }',
					'.entry rect { cursor: pointer; }',
				].join('');

				const back = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				back.setAttributeNS(null, 'x', '0');
				back.setAttributeNS(null, 'y', '0');
				back.setAttributeNS(null, 'width', `${width}`);
				back.setAttributeNS(null, 'height', `${height}`);
				back.classList.add('back');

				const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttributeNS(null, 'width', `${width}px`);
				svg.setAttributeNS(null, 'height', `${height}px`);
				svg.setAttributeNS(null, 'viewBox', `0 0 ${width} ${height}`);

				svg.appendChild(style);
				svg.appendChild(back);
				svg.appendChild(this.reflector.group);
				for (const rotor of this.rotors) {
					svg.appendChild(rotor.group);
				}
				svg.appendChild(this.plugboard.group);
				svg.appendChild(this.entry.group);

				this.svg = svg;

				return svg;
			}

			protected hover(key?: ENIGMA_KEY) {
				if (!key) {
					[...this.svg.querySelectorAll('[data-in]')].forEach((element: SVGElement) => {
						element.dataset.in = '';
					});
					[...this.svg.querySelectorAll('[data-out]')].forEach((element: SVGElement) => {
						element.dataset.out = '';
					});
					[...this.svg.querySelectorAll('.convert')].forEach((element: SVGElement) => {
						element.classList.remove('convert');
					});
					return;
				}

				const result = this.enigma.input(key);

				this.entry.group.dataset.in = result.input;
				this.entry.group.dataset.out = result.output;

				this.plugboard.group.dataset.in = this.entry.group.dataset.in;
				this.plugboard.group.dataset.out = this.entry.group.dataset.out;

				for (let i = 1; i <= this.rotors.length; ++i) {
					const rotor = this.rotors[this.rotors.length - i];
					rotor.group.dataset.in = result.position_str[i];
				}

				for (const line of this.reflector.group.querySelectorAll('.convert')) {
					line.classList.remove('convert');
				}
				const key1 = result.position[result.position.length / 2 - 1];
				const key2 = result.position[result.position.length / 2];
				const ref = key1 < key2 ? KEYS[key1] + KEYS[key2] : KEYS[key2] + KEYS[key1];
				const target = this.reflector.group.querySelector(`[data-pear="${ref}"]`);
				if (target) {
					target.classList.add('convert');
				}

				for (let i = 0; i < this.rotors.length; ++i) {
					const rotor = this.rotors[i];
					rotor.group.dataset.out = result.position_str[i + this.rotors.length + 2];
				}
			}

			protected input(key: ENIGMA_KEY) {
				const result = this.enigma.input(key);
				console.log(`${result.input}->${result.output}`);
				this.rotate();
				this.update();
				this.inputArea.value = this.inputArea.value + result.input;
				this.outputArea.value = this.outputArea.value + result.output;
			}

			protected resetLine() {
				this.entry.group.dataset.in = '';
				this.entry.group.dataset.out = '';

				this.plugboard.group.dataset.in = '';
				this.plugboard.group.dataset.out = '';

				for (let i = 1; i <= this.rotors.length; ++i) {
					const rotor = this.rotors[this.rotors.length - i];
					rotor.group.dataset.in = '';
					rotor.group.dataset.out = '';
				}

				for (const line of this.reflector.group.querySelectorAll('.convert')) {
					line.classList.remove('convert');
				}
			}

			protected rotate() {
				this.resetLine();
				this.enigma.rotate();
			}

			protected update() {
				const status = this.enigma.status();

				[
					...this.querySelectorAll('.in'),
					...this.querySelectorAll('.out'),
					...this.querySelectorAll('.ref'),
				].forEach((path) => {
					path.classList.remove('in', 'out', 'ref');
				});

				// Rotor.
				for (let i = 0; i < this.rotors.length; ++i) {
					const data = status.rotors[i].table;
					const linePos: { [keys: string]: { in: number; out: number } } = {};
					const rotor = this.rotors[i];
					rotor.name.textContent = `Rotor(${ROMANUM[this.enigma.getConfig().getRotor(i).rotor - 1]})`;
					rotor.type.textContent = `Pos:${this.enigma.getConfig().getPosition(i)}`;
					rotor.ring.textContent = `Ring:${this.enigma.getConfig().getRing(i)}`;
					for (let n = 0; n < KEYS.length; ++n) {
						const key = KEYS[n];
						rotor.in[key].text.textContent = data[n].in;
						rotor.out[key].text.textContent = data[n].out;
						rotor.in[key].text.dataset.key = data[n].in;
						rotor.out[key].text.dataset.key = data[n].out;
						if (!linePos[data[n].in]) {
							linePos[data[n].in] = { in: -1, out: -1 };
						}
						if (!linePos[data[n].out]) {
							linePos[data[n].out] = { in: -1, out: -1 };
						}
						linePos[data[n].in].in = n;
						linePos[data[n].out].out = n;
					}
					for (const key of KEYS) {
						const pos = (<string> rotor.line[key].getAttributeNS(null, 'd')).split(' ');
						pos[1] = [pos[1].split(',')[0], 65 + 30 * linePos[key].out].join(',');
						pos[2] = [pos[2].split(',')[0], 65 + 30 * linePos[key].out].join(',');
						pos[3] = [pos[3].split(',')[0], 65 + 30 * linePos[key].in].join(',');
						rotor.line[key].setAttributeNS(null, 'd', pos.join(' '));
					}
				}

				// Reflector.
				this.reflector.type.textContent = this.enigma.getConfig().getReflector();
				const plugboard = KEYS.map(() => {
					return 0;
				});
				const lines: SVGPathElement[] = [];
				Object.keys(this.reflector.line).forEach((key) => {
					const line = this.reflector.line[key];
					if (!lines.includes(line)) {
						lines.push(line);
					}
				});
				const map: string[][] = KEYS.map(() => {
					return [];
				});
				const table = status.reflector.table;
				table.sort((a, b) => {
					return KEYS.indexOf(<ENIGMA_KEY> a.in) - KEYS.indexOf(<ENIGMA_KEY> b.in);
				});
				for (const item of table) {
					const a = KEYS.indexOf(<ENIGMA_KEY> item.in);
					const b = KEYS.indexOf(<ENIGMA_KEY> item.out);
					if (b < a) {
						continue;
					}
					plugboard[a] = b;
					plugboard[b] = a;
					const length = map[a].length;
					for (let i = a; i <= b; ++i) {
						while (map[i].length < length) {
							map[i].push('');
						}
						map[i].push(item.in);
					}
				}
				for (let i = 0; i < KEYS.length; ++i) {
					if (KEYS[i] !== map[i][map[i].length - 1]) {
						continue;
					}
					let vertical = i;
					for (; vertical < KEYS.length; ++vertical) {
						if (map[i][map[i].length - 1] !== map[vertical][map[i].length - 1]) {
							break;
						}
					}
					--vertical;
					const length = map[i].length;
					const line = <SVGPathElement> lines.shift();
					line.setAttributeNS(null, 'd', `M 140,${65 + 30 * i} h ${-10 * length} v ${30 * (vertical - i)} h ${10 * length}`);
					this.reflector.line[KEYS[i]] = line;
					this.reflector.line[KEYS[vertical]] = line;
					line.dataset.pear = i < vertical ? KEYS[i] + KEYS[vertical] : KEYS[vertical] + KEYS[i];
				}

				// Plugboard.
				for (let i = 0; i < KEYS.length; ++i) {
					const key = KEYS[i];
					if (status.plugboard[key]) {
						const v = KEYS.indexOf(status.plugboard[key]);
						const path = (<string> this.plugboard.line[key].getAttributeNS(null, 'd')).split(' ');
						path[1] = [path[1].split(',')[0], 65 + 30 * v].join(',');
						path[2] = [path[2].split(',')[0], 65 + 30 * v].join(',');
						path[3] = [path[3].split(',')[0], 65 + 30 * i].join(',');
						this.plugboard.line[key].setAttributeNS(null, 'd', path.join(' '));
					} else {
						const path = (<string> this.plugboard.line[key].getAttributeNS(null, 'd')).replace(/,\d+/g, `,${65 + 30 * i}`);
						this.plugboard.line[key].setAttributeNS(null, 'd', path);
					}
				}
			}
		},
	);
});
