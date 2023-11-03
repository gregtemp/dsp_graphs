

// ui_utils.js
class Graph {
    constructor(input, pos, size){
        this.pos = pos || [0, 0];
        this.size = size || [400, 100]
        this.input = input || undefined;
        this.strokeWeight = 3;
        this.stroke = 255;
        this.show_axis = true;
        this.drawable = true;
        this.mouse_inside = false;
        this.show_trace = false;
        this.trace = [0,0];
        this.xrange = [0, TWO_PI];
        
    }

    draw(){
        push();

        translate(this.pos[0] - this.size[0]/2, this.pos[1]);

        if (this.show_axis === true) this.draw_axis();
        // waveform colors
        fill(0, 0);
        stroke(this.stroke);
        strokeWeight(this.strokeWeight);
        
        // waveform
        beginShape();
        for (let i = 0; i < int(this.size[0]); i ++) {
            let x = float(i)/this.size[0];
            vertex(x * this.size[0], (this.input.plot(x*this.range[1]+this.range[0]) * this.size[1]/2));
        }
        endShape();

        if (this.show_trace === true && this.mouse_inside === true) {
            stroke("#FF5A5F");
            fill("#FF5A5F");
            ellipse(this.trace[0], this.trace[1]*this.size[1]/2, 10, 10);
        }

        pop();
    }

    draw_axis(){
        // axis
        strokeWeight(1);
        stroke(70);
        line(0, 0, this.size[0], 0);
        line(0, -this.size[1]*.7, 0, this.size[1]*.7);
    }

    handle_mouse(mx, my){
        if (mx >= this.pos[0] - this.size[0]/2
        && mx <= this.pos[0] + this.size[0]/2
        && my >= this.pos[1] - this.size[1]/2 - 1
        && my <= this.pos[1] + this.size[1]/2 + 1){
            mx += this.size[0]/2;

            if (mouseIsPressed===true) {
                ///
            }
            this.mouse_inside = true;
        }
        else {
            this.mouse_inside = false;
        }
        if (this.show_trace === true && this.mouse_inside === true) {
            this.trace = [mx, this.input.plot(mx/this.size[0] * this.range[1] + this.range[0])];
        }
    }
}

class Slider {
    constructor(label, size, pos) {
        this.size = size || [40, 150];
        this.pos = pos || [0, 0];
        this.amt = 0;
        this.value = this.amt / this.size[1];
        this.label = label || " ";
        this.range = [0., 1.];
        this.drawable = true;
        this.mouse_inside = false;
    }

    draw () {
        push();
        translate(this.pos[0], this.pos[1]);
        // label
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        let labels = this.label.split(" ");
        
        text(labels[0], 0, - this.size[1]/2 - 25);
        text(labels[1], 0, - this.size[1]/2 - 10);
        text(this.value.toFixed(2), 0, this.size[1]/2 + 15);
        
        
        // slider
        stroke(255);
        if (this.mouse_inside === true) {
            fill("#585563");
        }
        else{
            fill(0,0);
        }
        rectMode(CENTER);
        strokeWeight(1);
        rect(0, 0, this.size[0], this.size[1]);
        
        // set value
        this.value = constrain(-this.amt / this.size[1], 0., 1.) * (this.range[1]-this.range[0]) + this.range[0];
        
        strokeWeight(3);
        line(-this.size[0]/2, this.amt + this.size[1]/2, this.size[0]/2, this.amt + this.size[1]/2);
        //line(this.pos[0]-this.size[0]/2, this.pos[0] - this.size[0]/2,this.pos[0] + this.size[0]/2, this.pos[0] - this.size[0]/2);
        pop();
    }

    handle_mouse(mx, my) {
        mx -= this.pos[0];
        my -= this.pos[1];
        if (mx >= -this.size[0]/2
        && mx <= this.size[0]/2
        && my >= - this.size[1]/2 - 1
        && my <= + this.size[1]/2 + 1){
            if (mouseIsPressed===true) {
                this.set_amt(my);
            }
            //console.log(mouseX, mouseY);
            this.mouse_inside = true;
        }
        else {
            this.mouse_inside = false;
        }
        
    }

    set_amt(my) {
        my = my - this.pos[1] - this.size[1]/2;
        this.amt = my;
    }

}


class Container {
    constructor() {
        this.pos = [0,0];
        this.operators = {};
    }

    draw() {
        push();
        translate(this.pos[0], this.pos[1]);
        for (let key in this.operators) {
            let operator = this.operators[key];
            if (operator.drawable===true) {
                operator.handle_mouse(mouseX - this.pos[0], mouseY - this.pos[1]);
                operator.draw();
            }
        }
        pop();
    }

    arrange(){
        let prev_pos = 0;
        for (let key in this.operators) {
            let operator = this.operators[key];
            
            if (operator.drawable === true) {
                operator.pos[0] = prev_pos;
                prev_pos -= operator.size[0]/2 + 40;
                //console.log(operator.pos[0], operator.size[0]);
            }
            
        }
    }

    connect(key1, key2) {
        let op1 = this.operators[key2];
        let op2 = this.operators[key1];
        
        op1.input = op2;
    }
    
    update(update_string) {
        let commands = update_string.split(" ");
        this.operators[commands[0]][commands[1]] = this.operators[commands[2]][commands[3]];

    }

    op(key){
        return this.operators[key];
    }

}

