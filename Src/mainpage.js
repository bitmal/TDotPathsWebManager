//**GLOBALS**
let imgMap;
let imgLoadResult;

let drawables = [];

let scrollBox = new ScrollBox();

//**SETTINGS**
const IMG_ZOOM = 0.75;

//**STARTUP**
function preload()
{
    let resultCallback = function(result)
    {
        imgLoadResult = result;
    }

    url = 'http://derekm.tech/tdot_paths-map.png';
    imgMap = loadImage(url, resultCallback);
}

function setup() 
{
    createCanvas(imgMap.width*IMG_ZOOM, imgMap.height*IMG_ZOOM);

    scrollBox.fillRGB = new RGBA(100, 100, 255);
    scrollBox.borderRGB = new RGBA(0, 0, 255);
    scrollBox.fillTransparency = 100;
    scrollBox.startPos = createVector();
    scrollBox.endPos = createVector();
}

//**BODY**
function draw() 
{
    input()
    update()
    render()
}

function input()
{

}

function update()
{
    // dispatch drawable of objects to be drawn
    if (scrollBox.isActive)
    {
        append(drawables, scrollBox.drawable())
    }
}

function render()
{
    if (imgLoadResult)
    {
        // display map
        image(imgMap, 0, 0, canvas.width, canvas.height);

        // draw code goes here
        for (let i=0; i < drawables.length; i++)
        {
            let d = drawables[i];
            let borderColor = color(d.borderRGBA.r, d.borderRGBA.g, d.borderRGBA.b, d.borderRGBA.a)
            let fillColor = color(d.fillRGBA.r, d.fillRGBA.g, d.fillRGBA.b, d.fillRGBA.a)

            push()

            stroke(borderColor)
            strokeWeight(4)
            fill(fillColor)

            rect(d.pos.x, d.pos.y, d.width, d.height);

            pop()
        }

        // clear drawable list for next round
        drawables = []
    }
}

//**EVENTS**
function mousePressed()
{
    //append(drawables, new Drawable(createVector(mouseX, mouseY), true, true, color(255), color(255)))
    if (mouseButton === LEFT)
    {
        scrollBox.startPos = createVector(mouseX, mouseY);
        scrollBox.endPos = createVector(mouseX, mouseY);
        scrollBox.isActive = true;

        print("pressed")
    }
}

function mouseDragged()
{
    if (mouseButton === LEFT)
    {
        scrollBox.endPos = createVector(mouseX, mouseY);
        print("dragged")
    }
}

function mouseReleased()
{
    if (mouseButton === LEFT)
    {
        scrollBox.isActive = false;
        print("released")
    }
}

//**TYPES**
function RGBA(r, g, b, a)
{
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

function ScrollBox(fillTransparency, borderRGB, fillRGB)
{
    this.startPos;
    this.endPos;
    this.fillTransparency = fillTransparency;
    this.borderRGB = borderRGB;
    this.fillRGB = fillRGB;
    
    this.isActive = false;

    this.drawable = function()
    {
        let width = this.endPos.x - this.startPos.x
        let height = this.endPos.y - this.startPos.y

        this.fillRGB.a = this.fillTransparency

        return new Drawable(this.startPos, width, height, false, true, this.borderRGB, this.fillRGB)
    }
}

function Drawable(pos, width, height, isCentre, isFill, borderRGBA, fillRGBA)
{
    this.pos = pos;
    this.width = width;
    this.height = height;
    this.isCentre = isCentre;
    this.isFill = isFill;
    this.borderRGBA = borderRGBA;
    this.fillRGBA = fillRGBA;
}
