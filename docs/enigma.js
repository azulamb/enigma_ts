// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class EnigmaSimulator {
    config;
    generator;
    plugboard;
    rotors = [];
    reflector;
    etw = [
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    ];
    constructor(config, generator){
        this.config = config;
        this.generator = generator;
    }
    getConfig() {
        return this.config;
    }
    setConfig(config) {
        this.config.set(config);
        this.updateConfig();
        return this;
    }
    updateConfig() {
        this.plugboard.reset();
        this.config.getPlugboard().forEach((pair)=>{
            this.plugboard.set(pair.a, pair.b);
        });
        this.setRotors(this.config.getRotors().map((config, index)=>{
            const rotor = this.generator.Rotor(config.model, config.rotor);
            const reset = this.config.getPosition(index);
            const ring = this.config.getRing(index);
            rotor.reset(reset, ring);
            return rotor;
        }));
        this.setReflector(this.generator.Reflector(this.config.getModel(), this.config.getReflector()));
        return this;
    }
    getETW() {
        return this.etw.concat();
    }
    setETW(entryWheels) {
        this.etw = [
            ...[
                entryWheels
            ].flat().join('')
        ];
        return this;
    }
    setPlugboard(plugboard) {
        this.plugboard = plugboard;
        return this;
    }
    getRotor(index) {
        return this.rotors[index];
    }
    setRotors(rotors) {
        this.rotors = rotors;
        return this;
    }
    setReflector(reflector) {
        this.reflector = reflector;
        return this;
    }
    reset() {
        for(let i = 0; i < this.rotors.length; ++i){
            this.rotors[i].reset(this.config.getPosition(i), this.config.getRing(i));
        }
        return this;
    }
    rotate() {
        let rotate = true;
        for(let i = this.rotors.length - 1; 0 <= i; --i){
            rotate = this.rotors[i].rotate();
            if (!rotate) {
                break;
            }
        }
        return this;
    }
    input(key) {
        const result = {
            input: key || '',
            output: '',
            position: [],
            position_str: []
        };
        let position = key ? this.etw.indexOf(this.plugboard.convert(key)) : -1;
        if (position < 0) {
            return result;
        }
        result.position.push(position);
        result.position_str.push(key);
        for(let i = this.rotors.length - 1; 0 <= i; --i){
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
        position = this.reflector.inout(position);
        if (position < 0) {
            result.output = '';
            return result;
        }
        const r1 = this.reflector.getKey(position);
        if (!r1) {
            result.output = '';
            return result;
        }
        result.position.push(position);
        result.position_str.push(r1.out);
        result.output = r1.out;
        for(let i1 = 0; i1 < this.rotors.length; ++i1){
            position = this.rotors[i1].outin(position);
            if (position < 0) {
                result.output = '';
                return result;
            }
            const r2 = this.rotors[i1].getKey(position);
            if (!r2) {
                result.output = '';
                return result;
            }
            result.position.push(position);
            result.position_str.push(r2.in);
            result.output = r2.in;
        }
        result.output = this.plugboard.convert(this.etw[position]);
        return result;
    }
    status() {
        return {
            plugboard: this.plugboard.status(),
            rotors: this.rotors.map((rotor)=>{
                return rotor.status();
            }),
            reflector: this.reflector.status()
        };
    }
}
class EnigmaConfig {
    config = {
        model: 'EnigmaI',
        reflector: 'C',
        rotors: [
            5,
            1,
            3
        ],
        rings: [
            'S',
            'R',
            'E'
        ],
        plugboard: [
            'CS',
            'ER'
        ],
        position: [
            'E',
            'H',
            'S'
        ]
    };
    constructor(config){
        if (config) {
            this.set(config);
        }
    }
    get() {
        return Object.assign({}, this.config);
    }
    set(config) {
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
    getModel() {
        return this.config.model;
    }
    setModel(model) {
        this.config.model = model;
        return this;
    }
    setReflector(reflector) {
        this.config.reflector = reflector;
        return this;
    }
    getReflector() {
        return this.config.reflector;
    }
    setRotors(rotors) {
        this.config.rotors = rotors;
        return this;
    }
    getRotors() {
        return this.config.rotors.map((rotor, index)=>{
            return this.getRotor(index);
        });
    }
    getRotor(position) {
        if (position < 0) {
            throw new Error(`Invalid rotor position: ${position}`);
        }
        if (this.config.rotors.length <= position) {
            throw new Error(`Notfound rotor: ${position}`);
        }
        return {
            model: this.config.model,
            rotor: this.config.rotors[position]
        };
    }
    setRings(rings) {
        this.config.rings = rings;
        return this;
    }
    getRings() {
        return this.config.rings.concat();
    }
    getRing(index) {
        return this.config.rings[index] || '';
    }
    setPlugboard(plugboard) {
        this.config.plugboard = plugboard;
        return this;
    }
    getPlugboard() {
        return this.config.plugboard.map((piar)=>{
            const keys = piar.split('');
            if (keys.length < 2) {
                return null;
            }
            return {
                a: keys[0],
                b: keys[1]
            };
        }).filter((pair)=>{
            return pair !== null;
        });
    }
    setPosition(position) {
        this.config.position = position;
        return this;
    }
    getPositions() {
        return this.config.position.concat();
    }
    getPosition(index) {
        return this.config.position[index] || '';
    }
}
class EnigmaPlugboard {
    table = {};
    constructor(){}
    reset() {
        this.table = {};
        return this;
    }
    set(a, b) {
        this.table[a] = b;
        this.table[b] = a;
        return this;
    }
    convert(key) {
        return this.table[key] || key;
    }
    status() {
        return Object.assign({}, this.table);
    }
}
class EnigmaGenerate {
    rotor;
    reflector;
    constructor(rotor, reflector){
        this.rotor = rotor;
        this.reflector = reflector;
    }
    rotorEnigmaI(type) {
        const rotor = [
            {
                table: 'ABCDEFGHIJKLMNOPQRSTUVQXYZ',
                notch: 'A',
                turnover: 'Z'
            },
            {
                table: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
                notch: 'Y',
                turnover: 'Q'
            },
            {
                table: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
                notch: 'M',
                turnover: 'E'
            },
            {
                table: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
                notch: 'D',
                turnover: 'V'
            },
            {
                table: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
                notch: 'R',
                turnover: 'J'
            },
            {
                table: 'VZBRGITYUPSDNHLXAWMJQOFECK',
                notch: 'H',
                turnover: 'Z'
            }, 
        ];
        return new this.rotor(rotor[type].table).setType(type).setTurnover(rotor[type].turnover);
    }
    Rotor(model, type) {
        try {
            switch(model){
                case 'EnigmaI':
                    return this.rotorEnigmaI(type);
            }
        } catch (error) {
            console.error(error);
        }
        return new this.rotor('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    }
    Reflector(model, type) {
        const rotor = {
            'A': 'EJMZALYXVBWFCRQUONTSPIKHGD',
            'B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
            'C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
        };
        return new this.reflector(rotor[type]).setType([
            ...'ABC'
        ].indexOf(type) + 1);
    }
}
class EnigmaConverter {
    name = 'Converter';
    type = 0;
    offset = 0;
    get fullName() {
        return `${this.name}(${this.type})[${this.offset}]`;
    }
    outputs;
    inputs;
    table = [];
    constructor(output, etw = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){
        this.outputs = [
            ...etw
        ];
        this.inputs = [
            ...output.replace(/[a-z]/g, (__char)=>{
                return String.fromCharCode(__char.charCodeAt(0) & ~32);
            }).replace(/[^A-Z]+/g, ''), 
        ];
        if (this.outputs.length !== this.inputs.length) {
            throw new Error(`${this.name} setting error:`);
        }
        this.generate();
    }
    generate(offset = 0) {
        if (offset < 0) {
            offset = 0;
        }
        const alphabet = [
            ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        ];
        this.table = [];
        for(let i = 0; i < this.outputs.length; ++i){
            this.table.push({
                in: alphabet[(alphabet.indexOf(this.inputs[i]) + offset) % this.inputs.length],
                out: alphabet[(alphabet.indexOf(this.outputs[i]) + offset) % this.outputs.length]
            });
        }
    }
    setType(type) {
        this.type = type;
        return this;
    }
    inputPosition(key) {
        const input = this.outputs.indexOf(key);
        return input;
    }
    getKey(position) {
        if (position < 0 || this.table.length <= position) {
            throw new Error(`Invalid ${this.fullName} position: ${position}`);
        }
        return this.table[position];
    }
    inout(position) {
        if (position < 0 || this.table.length <= position) {
            return -1;
        }
        const set = this.getKey(position);
        const search = set.in;
        for(let i = 0; i < this.table.length; ++i){
            if (this.table[i].out === search) {
                return i;
            }
        }
        return -1;
    }
    outin(position) {
        if (position < 0 || this.table.length <= position) {
            return -1;
        }
        const set = this.getKey(position);
        const search = set.out;
        for(let i = 0; i < this.table.length; ++i){
            if (this.table[i].in === search) {
                return i;
            }
        }
        return -1;
    }
    status() {
        return {
            table: this.table.map((item)=>{
                return Object.assign({}, item);
            }),
            offset: this.offset,
            name: this.fullName
        };
    }
}
class EnigmaRotor extends EnigmaConverter {
    name = 'Rotor';
    turnover = [
        'A'
    ];
    getTurnover() {
        return this.turnover.concat();
    }
    setTurnover(keys) {
        if (!Array.isArray(keys)) {
            keys = [
                keys
            ];
        }
        for (const key of keys){
            const position = this.outputs.indexOf(key);
            if (position < 0) {
                throw new Error(`Invalid turnover: ${key}`);
            }
        }
        this.turnover = keys;
        return this;
    }
    input(key) {
        const position = typeof key === 'string' ? this.inputPosition(key) : key;
        if (position < 0) {
            throw new Error(`Invalid input: ${key}`);
        }
    }
    rotate() {
        if (this.table.length <= 0) {
            return false;
        }
        const turnover = this.turnover.includes(this.table[0].out);
        this.table.push(this.table.shift());
        return turnover;
    }
    reset(reset, ring) {
        this.offset = [
            ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        ].indexOf(ring);
        this.generate(this.offset);
        for(let i = 0; i < this.table.length; ++i){
            if (this.table[0].out === reset) {
                return this;
            }
            this.rotate();
        }
        throw new Error(`Notfound reset key: ${reset}`);
    }
}
class EnigmaReflector extends EnigmaConverter {
    name = 'Reflector';
}
const Enigma = (()=>{
    const generator = new EnigmaGenerate(EnigmaRotor, EnigmaReflector);
    return {
        Create: (config)=>{
            const conf = new EnigmaConfig();
            const plugboard = new EnigmaPlugboard();
            const enigma = new EnigmaSimulator(conf, generator).setPlugboard(plugboard);
            if (config) {
                enigma.setConfig(config);
            }
            return enigma;
        },
        Generate: generator,
        Simulator: EnigmaSimulator,
        Config: EnigmaConfig
    };
})();
(()=>{
    window.Enigma = Enigma;
})();
