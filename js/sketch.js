




// let osc1 = new Wave("sine");
// let osc2 = new Wave("sine");
// let softclip = new Waveshaper("tanh");

// let graph1 = new Graph();


let osc1 = new Osc("sine");
let osc2 = new Osc({shape: "saw_up", freq: 0.5, gain:1.});

let hanning = new Window("hanning");

let adsr = new ADSR(2, 10, 0.7, 20);

let viz = new Graph();
let viz2 = new Graph();

let slide = new Slider("Osc2 Phase");
let slide2 = new Slider("Osc2 Amplitude");


let obj = {
    y: (x) => {
        return osc1.y(x + osc2.y(x));
    },
    xrange: osc1.xrange
}

let osc2hanning = {
    y: (x) => {
        return osc2.y(x) * hanning.y(x);
    },
    xrange: osc2.xrange
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    
    viz.size = [600, 300];
    viz.pos = [width/2, height/3];
    

    viz.setup(obj);

    viz2.size[0] = viz.size[0];
    viz2.pos = [...viz.pos];
    viz2.pos[1] *= 2;
    viz2.setup(hanning);

    slide.pos = [viz2.pos[0]- (viz2.size[0]/2 + 40), viz2.pos[1]];
    slide2.pos = [slide.pos[0]- (slide.size[0]/2 + 40), slide.pos[1]];

}
  

function draw() {
    background(0);

    fill(255);
    textAlign(CENTER);
    text("Osc1 Phase is modulated by Osc2", width/2, 20);
    
    osc2.params.phase = slide.value * TAU;
    osc2.params.gain = slide2.value;
    //osc2.gain = 0.5;
    viz.draw(obj);
    viz2.draw(osc2hanning);

    slide.draw();
    slide2.draw();


}





  
