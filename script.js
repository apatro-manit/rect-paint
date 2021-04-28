// Constructor for rectangular shaped object
function rectShape(x, y, w, h, fill) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
    this.h = h || 1;
    this.fill = fill || '#e55039';
}

// Draws the rectangle on canvas
rectShape.prototype.draw = function(ctx) {
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h);
}
  
// Determine if a point already exists inside any rectangle
rectShape.prototype.contains = function(mx, my) {
    return  (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
}

// To maintain the state of canvas
function canvaState(canvas) {

    
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    
    //For pages with fixed-position bars
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;
    
    
    this.isValid = false; // canvas will redraw everything until it is valid
    this.shapes = [];  
    this.draggingOld = false; // true if already existing rectangle is dragged
    this.draggingNew = false; // true if a new rectangle is being created
    this.isDragged = false; 
    this.selection = null;  
    this.mouseX = 0; 
    this.mouseY = 0;
    this.newRect = {w:0 , h:0}; 
    this.randomColour = '#000';

    var cState = this; 
    cState.randomColour = randomColor(); 

    
    canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);

    canvas.addEventListener('mousedown', function(e) {
        var mouse = cState.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        var shapes = cState.shapes;
        var l = shapes.length;
        if(!cState.draggingNew){
            for (var i = l-1; i >= 0; i--) {
                if (shapes[i].contains(mx, my)) {
                    var mySel = shapes[i];          
                    cState.mouseX = mx - mySel.x;
                    cState.mouseY = my - mySel.y;
                    cState.draggingOld = true;
                    cState.selection = mySel;
                    cState.isValid = false;
                    return;
                }
            }
        }
        cState.mouseX = mx;    // begining position for the new rectangle shape
        cState.mouseY = my;
        cState.draggingNew = true;
        return; 
    }, true);

    
    canvas.addEventListener('mousemove', function(e) {
        var mouse = cState.getMouse(e);
        if (cState.draggingOld){    // if already existing rectangle is dragged
            cState.selection.x = mouse.x - cState.mouseX;
            cState.selection.y = mouse.y - cState.mouseY;   
            cState.isValid = false; 
        }
        if (cState.draggingNew) {   
            cState.ctx.clearRect(0, 0, 800, 400); // recreate all the shapes
            cState.isValid = false;
            cState.draw();
            cState.newRect.w = mouse.x - cState.mouseX;
            cState.newRect.h = mouse.y - cState.mouseY;
            cState.ctx.fillStyle = cState.randomColour;

            cState.ctx.fillRect(cState.mouseX, cState.mouseY, cState.newRect.w, cState.newRect.h, cState.randomColour);
            cState.isDragged = true;
        }
    }, false);

    
    canvas.addEventListener('mouseup', function(e) {
        var mouse = cState.getMouse(e);
        
        if (cState.isDragged) { 
            cState.addShape(new rectShape(cState.mouseX, cState.mouseY, cState.newRect.w, cState.newRect.h, cState.randomColour));
        }
        cState.randomColour = randomColor();    
        cState.draggingOld = false;
        cState.draggingNew = false;
        cState.isDragged = false;
        cState.selection = null;   
    }, false);

    canvas.addEventListener('dblclick', function(e) {
        var mouse = cState.getMouse(e);
        var shapes = cState.shapes;
        var l = shapes.length;
        for (var i = l-1; i >= 0; i--) {
            if (cState.shapes[i].contains(mouse.x, mouse.y)) {
                cState.shapes[i] = cState.shapes[l-1];
                cState.shapes.pop();
                cState.isValid = false;
                return;
            }
        }
    }, false);

    
    setInterval(function() { cState.draw(); }, cState.interval);
}


canvaState.prototype.addShape = function(shape) {
    this.shapes.push(shape);
    this.isValid = false;
}
  

canvaState.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
}
canvaState.prototype.draw = function() {
    if (!this.isValid) {
        var ctx = this.ctx;
        var shapes = this.shapes;
        this.clear();
        
        var l = shapes.length;
        for (var i = 0; i < l; i++) {
            shapes[i].draw(ctx);
        }
        
        this.isValid = true;
    }
}

canvaState.prototype.getMouse = function(e) {   
    var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }
    
    offsetX +=  this.htmlLeft;
    offsetY +=  this.htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;
    return {x: mx, y: my}; 
}

function randomColor() {
    var digits = '0123456789ABCDEF'; //hex digits
    var colorValue = '#';
    for (var i = 0; i < 6; i++) {
      colorValue += digits[Math.floor(Math.random() * 16)];
    }
    return colorValue;
}

function init() {
    var s = new canvaState(document.getElementById('canvas'));

    document.getElementById('clear').onclick = function (){
        s.shapes = [];
        s.isValid = false;
        s.draw();
    }
}
