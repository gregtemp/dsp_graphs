# DSP Graphs Project

This is a little lib for making some pretty graphs, here's what I have so far.
This works with P5JS
it doesnt make any sound, just pretty graphs


DSP Utilities
  - Osc
  - Sat
  - Envelope

UI Utilities
  - Graph
  - Slider


Here's some brief documentation chat gpt wrote

# DSP Utilities

This file defines several classes for digital signal processing.

## Osc (Oscillator)

### Description
The `Osc` class extends `FunctionObject` and represents an oscillator which generates waveforms of different shapes.

### Constructor
The `Osc` class can be instantiated with either a string representing the waveform shape or an object containing parameters.

```javascript
let osc = new Osc('sine');
// or
let osc = new Osc({shape: 'sine', freq: 440});
```

### Methods
- `y(x)`: Computes and returns the y-value of the waveform at the given x position.
- `get_x_range()`: Returns the range of x values for the oscillator.

## Sat (Saturation)

### Description
The `Sat` class extends `FunctionObject` and represents a saturation effect applied to a signal.

### Constructor
The `Sat` class can be instantiated with either a string representing the saturation shape or an object containing parameters.

```javascript
let sat = new Sat('tanh');
// or
let sat = new Sat({shape: 'tanh', gain: 2});
```

### Methods
- `y(x)`: Computes and returns the y-value of the saturated signal at the given x position.
- `get_x_range()`: Returns the range of x values for the saturation effect.

## ADSR (Attack, Decay, Sustain, Release)

### Description
The `ADSR` class extends `Envelope` and represents an ADSR envelope generator.

### Constructor
The `ADSR` class can be instantiated with values for attack, decay, sustain, and release.

```javascript
let adsr = new ADSR(10, 50, 0.5, 100);
```

### Methods
- `y(x)`: Computes and returns the y-value of the envelope at the given x position.
- `get_length()`: Returns the total length of the envelope.




# UI Utilities

## `Slider`

### Overview
`Slider` is a UI element that lets users adjust a value within a range.

### Usage
Create a slider, set its position, and draw it on the canvas.
```javascript
let mySlider = new Slider("Osc1 Freq", [0, 1]); // put "Osc1 Freq" as the label, and set the range to 0 to 1
mySlider.pos = [10, 20];
mySlider.draw();
```

## `Graph`

### Overview
`Graph` visualizes functions on a canvas, allowing for real-time interactive exploration.

### Usage
You can use pre-defined functions from `dsp_utils` or compose your own.

**Example 1: Using Pre-defined Functions**
```javascript
let viz = new Graph();
let osc1 = new Osc('sine');
viz.setup(osc1); // this should go in your setup
viz.draw(osc1); // this goes in your draw if you want to make it interactive (obvs)
```

**Example 2: Composing Custom Functions**
Create a custom function object and pass it to the graph.
```javascript
let osc1 = new Osc('sine');
let osc2 = new Osc('square');
let obj = {
    y: (x) => {
        return osc1.y(x + osc2.y(x)); // the output of osc2 modulates the phase of osc1
    },
    xrange: osc1.xrange
};

let viz = new Graph();
viz.setup(obj);
viz.draw(obj);
```

**Example 3: A bit more stuff so you can get a feel for how it works**
Yes hi its me again, the stuff above is chatgpt and now I'm back

```javascript
let osc1 = new Osc("sine");
let osc2 = new Osc({shape: "square", freq: 2, gain:1.});
let adsr = new ADSR(2, 10, 0.7, 20);

let viz = new Graph();
let viz2 = new Graph();

let slide = new Slider("Osc2 Phase");


let obj = {
    y: (x) => {
        return osc1.y(x + osc2.y(x));
    },
    xrange: osc1.xrange
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    
    viz.size = [600, 300];
    viz.pos = [width/2, height/2];
    slide.pos = [viz.pos[0]- (viz.size[0]/2 + 40), viz.pos[1]];

    viz.setup(obj);

    viz2.size[0] = viz.size[0];
    viz2.pos = [...viz.pos];
    viz2.pos[1] += 300;
    viz2.setup(osc2);

}
  

function draw() {
    background(0);

    
    osc2.params.phase = slide.value * TAU;
    //osc2.gain = 0.5;
    viz.draw(obj);
    viz2.draw(osc2);

    slide.draw();

}
```
