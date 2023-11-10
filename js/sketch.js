


// 
// maybe oscs and sliders and stuff should be set
// up automatically in the graph and connected
//


let osc1 = new Osc({shape: "sine", freq: 1});
let osc2 = new Osc({shape: "saw_up", freq: 2, gain:1.});

let hanning = new Window("hanning");

let adsr = new ADSR(1, 15, 0.2, 75);
adsr.set_params({sustain_time: 10});

let adsr2 = new ADSR(1, 30, 0.8, 60);
adsr2.set_params({sustain_time: 10});

let viz = new Graph();
let viz2 = new Graph();

let slide = new Slider("PE Amt");
slide.range = [1., 5];




obj = {
    y: (x) => {
        return osc1.y((adsr.integrate_y(x))*slide.value) * adsr2.y(x);
    },
    xrange: adsr.xrange
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    
    viz.size = [600, 200];
    viz.pos = [width/2, height/3];
    

    viz.setup(adsr2);

    viz2.size = [...viz.size];
    viz2.pos = [...viz.pos];
    viz2.pos[1] *= 2;
    viz2.setup(adsr2);

    slide.pos = [viz2.pos[0]- (viz2.size[0]/2 + 40), viz2.pos[1]];
   
}
  

function draw() {
    background(0);

    fill(255);
    textAlign(CENTER);
    text("Osc1 pitch is controlled with ADSR", width/2, 20);
    
    //osc1.params.freq = slide2.value;
    // osc2.params.gain = slide2.value;


    //osc2.gain = 0.5;
    viz.draw(obj);
    viz2.draw(adsr);

    slide.draw();



}





  
