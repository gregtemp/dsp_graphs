




// let osc1 = new Wave("sine");
// let osc2 = new Wave("sine");
// let softclip = new Waveshaper("tanh");

// let graph1 = new Graph();


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
    
    
    //osc2.params.gain = 1.5;
    viz.size = [600, 300];
    viz.pos = [width/2, height/2];
    slide.pos = [viz.pos[0]- (viz.size[0]/2 + 40), viz.pos[1]];
    //viz.xrange = [0, adsr.length];
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





  
