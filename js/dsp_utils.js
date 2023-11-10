
// dsp_utils.js

class FunctionObject {
    constructor() {
        this.params = {
            freq: 1,
            xrange: [-1., 1],
            range: [-1., 1],
            phase: 0,
            gain: 1,
            drawable: false,
            offset: 0,
            shape: undefined
            
        };

        this.window = {
            hanning: (x) => {
                //x = ((x - this.params.xrange[0]) / (this.params.xrange[1] - this.params.xrange[0])) * 2 * Math.PI; // hanning is based on cos so expects 0-TAU input
                let y = 0.5 * (1 - Math.cos(x * this.params.freq + this.params.phase)) + 0.5;
                return (y * (this.params.range[1] - this.params.range[0]) + this.params.range[0]) * this.params.gain + this.params.offset;
            }

        }
        this.gen = {
            sine: (x) => {
                let y = (Math.sin(x * this.params.freq + this.params.phase) / 2. + 0.5);
                return (y * (this.params.range[1] - this.params.range[0]) + this.params.range[0]) * this.params.gain + this.params.offset;
            },
            square: (x) => {
                let y = (Math.floor((x * this.params.freq + this.params.phase) / Math.PI) % 2);
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
    
    set_params(param_dict) {
        for (let key in param_dict) {
            this.params[key] = param_dict[key];
        }
    }
    y(x) {
        return this.y_func(x); 
    }
}

class Osc extends FunctionObject {
    constructor(arg) {
        super();
        this.xrange = [0, Math.PI*2];
        // If arg is a string, assume it's the 'shape' parameter
        if (typeof arg === 'string') {
            this.params.shape = arg;
            this.y_func = this.gen[arg];
        }
        // If arg is an object, assume it's a dictionary of parameters
        else if (typeof arg === 'object') {
            this.set_params(arg);
            this.y_func = this.gen[this.params.shape];
        }
    }


}

class Window extends FunctionObject {
    constructor(arg) {
        super();
        this.xrange = [0, Math.PI*2];
        this.range = [0, 1];
        // If arg is a string, assume it's the 'shape' parameter
        if (typeof arg === 'string') {
            this.params.shape = arg;
            this.y_func = this.window[arg];
        }
        // If arg is an object, assume it's a dictionary of parameters
        else if (typeof arg === 'object') {
            this.set_params(arg);
            this.y_func = this.window[this.params.shape];
        }
    }

}

class Sat extends FunctionObject {
    constructor(arg) {
        super();
        this.xrange = [-1., 1];
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
}


class Envelope {
    constructor(points) {
        // Ensure points are sorted by x-value
        this.points = points;
        this.env_length = this.get_length();
        this.px = 0;
        this.py = 0;
        this.integral = 0;
    }


    y(x) {
        let p = this.points;
        for (let i = 1; i < p.length; i++) {
            if (p[i][0] >= x) {
                let a = {x: p[i - 1][0], y: p[i - 1][1]};
                let b = {x: p[i][0], y: p[i][1]};
    
                if (b.x === a.x) {
                    // Avoid division by zero
                    return b.y;
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

    integrate_y(x) {
        let dt = x - this.px;  // Calculate the actual time step based on the new x-value
        if (dt <= 0) { // if x value is lower than previous call: reset
            this.integral = 0;
            this.px = 0;
            this.py = this.y(x);
            return this.integral;
        }
        let y = this.y(x); // get new y val
        // Trapezoidal rule to find area since the last call
        let area = (this.py + y) * dt / 2;
        this.integral += area; // accum area under curve
        this.px = x; // assign x to previous x for next iteration
        this.py = y; // assign y to previous y for next iteration

        return this.integral;
    }

}


class ADSR extends Envelope {
    constructor(attack, decay, sustain, release) {
        super([
            [0, 0],
            [attack, 1],
            [attack + decay, sustain],
            [attack + decay +  (attack + decay + release)/2, sustain],
            [attack + decay + (attack + decay + release)/2 + release, 0]
        ]);
        
        this.params = {
            attack: attack,
            decay: decay,
            sustain: sustain,
            sustain_time: (attack + decay + release)/2,
            release: release,
            length: attack + decay + (attack + decay + release)/2 + release,
            amount: 1
        }
        
        this.offsety = 0;
        this.xrange = [0., this.params.length];
        
    }

    set_params(param_dict) {
        for (let key in param_dict) {
            this.params[key] = param_dict[key];
        }

        this.points = [
            [0, 0],
            [this.params.attack, this.params.amount],
            [this.params.attack + this.params.decay, this.params.amount*this.params.sustain],
            [this.params.attack + this.params.decay + this.params.sustain_time, this.params.amount*this.params.sustain],
            [this.params.attack + this.params.decay + this.params.sustain_time + this.params.release, 0]
        ];

        this.xrange = [0., this.get_length()];
    }
    
}