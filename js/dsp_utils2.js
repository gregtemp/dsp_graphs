
// dsp_utils.js

class FunctionObject {
    constructor() {
        this.params = {
            freq: 1,
            range: [-1., 1],
            phase: 0,
            gain: 1,
            drawable: false,
            offset: 0,
            shape: undefined
        };

        this.gen = {
            sine: (x) => {
                let y = (Math.sin(x * this.params.freq + this.params.phase) / 2. + 0.5);
                return (y * (this.params.range[1] - this.params.range[0]) + this.params.range[0]) * this.params.gain + this.params.offset;
            },
            square: (x) => {
                let y = 1 - (Math.floor((x * this.params.freq + this.params.phase) / Math.PI) % 2);
                return (y * (this.params.range[1] - this.params.range[0]) + this.params.range[0]) * this.params.gain + this.params.offset;
            },
            saw_up: (x) => {
                let y = 1 - (((x * this.params.freq + this.params.phase) / Math.PI) % 1);
                return (y * (this.params.range[1] - this.params.range[0]) + this.params.range[0]) * this.params.gain + this.params.offset;
            },
            saw_down: (x) => {
                let y = (((x * this.params.freq + this.params.phase) / Math.PI) % 1);
                return (y * (this.params.range[1] - this.params.range[0]) + this.params.range[0]) * this.params.gain + this.params.offset;
            }
        };
    
        this.sat = {
            tanh: (x) => {
                return Math.tanh(x * this.params.gain + this.params.offset) * (this.params.range[1] - this.params.range[0]) + this.params.range[0];
            },
            sine: (x) => {
                return Math.sin(x * this.params.gain + this.params.offset) * (this.params.range[1] - this.params.range[0]) + this.params.range[0];
            },
            clip: (x) => {
                x = x * this.params.gain + this.params.offset;
                if (x >= this.params.range[1]) return 1;
                else if (x <= this.params.range[0]) return -1;
                else return x;
            }
        };

    }
}

class Osc extends FunctionObject {
    constructor(arg) {
        super();

        // If arg is a string, assume it's the 'shape' parameter
        if (typeof arg === 'string') {
            this.params.shape = arg;
            this.y_func = this.gen[arg];
        }
        // If arg is an object, assume it's a dictionary of parameters
        else if (typeof arg === 'object') {
            this.params(arg);
            this.y_func = this.gen[this.params.shape];
        }
    }

    params(param_dict) {
        for (let key in param_dict) {
            this.params[key] = param_dict[key];
        }
    }
    y(x) {
        return this.y_func(x);
    }

    get_x_range() {
        return [0, Math.PI * 2];
    }
}

class Sat extends FunctionObject {
    constructor(arg) {
        super();

        // If arg is a string, assume it's the 'shape' parameter
        if (typeof arg === 'string') {
            this.params.shape = arg;
            this.y_func = this.sat[arg];
        }
        // If arg is an object, assume it's a dictionary of parameters
        else if (typeof arg === 'object') {
            this.params(arg);
            this.y_func = this.sat[this.params.shape];
        }
    }

    params(param_dict) {
        for (let key in param_dict) {
            this.params[key] = param_dict[key];
        }
    }
    y(x) {
        return this.y_func(x);
    }

    get_x_range() {
        return [-1., 1.];
    }
}


class Envelope {
    constructor(points) {
        // Ensure points are sorted by x-value
        this.points = points;
        this.env_length = this.get_length();
    }


    y(x) {
        let p = this.points;
        for (let i = 1; i < p.length; i++) {
            if (p[i][0] >= x) {
                let a = {x: p[i - 1][0], y: p[i - 1][1]};
                let b = {x: p[i][0], y: p[i][1]};
    
                if (b.x === a.x) {
                    // Avoid division by zero
                    return a.y;
                }
    
                let y = a.y + (x - a.x) * (b.y - a.y) / (b.x - a.x);
                return y;
            }
        }
        return 0;  // Return 0 if x is out of range
    }

    get_length() {
        return this.points[this.points.length-1][0];
    }

}


class ADSR {
    constructor(attack, decay, sustain, release) {
        this.attack = attack || 10;
        this.decay = decay || 50;
        this.sustain = sustain || 0.5;
        this.sustain_time = 100;
        this.release = release || 100;
        this.length = this.attack + this.decay + this.sustain_time + this.release;
        this.amount = 1;
        this.offsety = 0;
        this.input = undefined;
        

        this.p = [
            [0, 0],
            [this.attack, 1],
            [this.attack + this.decay, this.sustain],
            [this.attack + this.decay + this.sustain_time, this.sustain],
            [this.attack + this.decay + this.sustain_time + this.release, 0]
        ];

        this.envelope = new Envelope(this.p);
    }
    
    y(x) {
        return this.envelope.y(x);
    }

    get_length() {
        return this.envelope.env_length;
    }

}