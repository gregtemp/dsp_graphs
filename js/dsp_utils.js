
// dsp_utils.js
let pi = 3.14159265359;
let twopi = pi * 2;

class Wave {
    // generic oscillator
    constructor(shape, freq, range) {
        this.shape = shape;
        this.freq = freq || 1;
        this.range = range || [-1., 1]
        this.phase = 0;
        this.input = undefined;
        this.gain = 1.;
        this.drawable = false;
        this.input_to = "phase";
    }

    plot(x) {
        if (this.input && this.input_to === "phase") {
            this.phase = this.input.plot(x);
        }
        else if (this.input && this.input_to === "gain") {
            this.gain = this.input.plot(x);
        }
        else if (this.input && this.input_to === "freq") {
            this.freq = this.input.plot(x);
        }

        let range = this.range;
        if (this.shape === 'sine') {
                let y = (Math.sin(x * this.freq + this.phase) / 2. + 0.5);
                return (y * (range[1] - range[0]) + range[0]) * this.gain;
        } else if (this.shape === 'square') {
                let y = 1.- (Math.floor((x*this.freq + this.phase) / pi) % 2)
                return (y * (range[1] - range[0]) + range[0]) * this.gain;
        } else if (this.shape === 'saw_up') {
                let y = 1. - (((x*this.freq + this.phase) / pi) % 1)
                return (y * (range[1] - range[0]) + range[0]) * this.gain;
        } else if (this.shape === 'saw_down') {
                let y = (((x*this.freq + this.phase) / pi) % 1);
                return (y * (range[1] - range[0]) + range[0]) * this.gain;
        }
    }
}

class Waveshaper{
    constructor (type, input, gain) {
        this.type = type || 'tanh';
        this.input = input || undefined;
        this.gain = 1. || gain;
        this.drawable = false;
    }

    plot(x) {
        if (this.input) {
            x = this.input.plot(x);
        }
        
        if (this.type === 'tanh') {
            return Math.tanh(x * this.gain)
        }
        else if (this.type === 'sine') {
            return Math.sin(x)
        }
        else if (this.type === 'hard_clip') {
            if (x >= 1) return 1.
            else if (x <= -1) return -1;
            else return x;
        }
    }
}


class ADSR {
    constructor(attack, sustain, decay, release) {
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
    }

    get_length() {
        return this.attack + this.decay + this.sustain_time + this.release;
    }

    pulse(x, start, end) {
        if (x >= start && x < end) {
            return 1;
        }
        else return 0;
    }

    line_segment(x, p1, p2) {
        let m = (p2[1] - p1[1])/(p2[0] - p1[0]); // slope = rise over run
        let b = p2[1] - m * p2[0]; // Using the point-slope form to find b (y-intercept)
        return (m * x + b) * this.pulse(x, p1[0], p2[0]);
    }

    plot(x){
        let env = this.line_segment(x, this.p[0], this.p[1]);  // Attack
        env += this.line_segment(x, this.p[1], this.p[2]); // Decay
        env += this.sustain * this.pulse(x, this.p[2][0], this.p[3][0])  // Sustain
        env += this.line_segment(x, this.p[3], this.p[4])  // Release
        env = (env * this.amount + this.offsety)*-1;
        if (this.input) {
            return env * this.input.plot(x);
        }
        else {
            return env;
        }
        
    }

}

// export default Wave;