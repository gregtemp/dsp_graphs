




// let osc1 = new Wave("sine");
// let osc2 = new Wave("sine");
// let softclip = new Waveshaper("tanh");

// let graph1 = new Graph();


let osc1 = new Osc("sine");
let osc2 = new Osc("sine");
let adsr = new ADSR(0.1, 100, 0.2, 20);


function setup() {
    createCanvas(windowWidth, windowHeight);
    
    osc2.params.range = [0., 1];
    console.log(adsr.get_length());
}
  

function draw() {
    background(0);
    push();
    stroke(255);
    strokeWeight(3);
    fill(0,0);
    
    translate(width/2 - 300, height/2);
    beginShape();
    for (let i = 0; i <= 1; i+= 0.001) {
        let out = osc1.y(i * osc1.get_x_range()[1]);
        
        out = osc2.y(out * osc1.get_x_range()[1]);
        let out2 = adsr.y(i * adsr.length);
        vertex(i * 600, -out2);
    } 
    endShape();

    for (let p of adsr.p) {
        point(p[0], p[1]);
    }
    pop();

}


  
