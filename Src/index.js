//**GLOBALS**
let imgMap;
let imgLoadResult;

let dataRawMerchant;

let drawables = [];

let scrollBox = new ScrollBox();

//**SETTINGS**
const CANVAS_ZOOM = 0.75;

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

const IMG_MAP_URL = 'http://derekm.tech/tdot_paths-map.png'

const SCROLL_BOX_FILL_RGBA = new RGBA(100, 100, 255)
const SCROLL_BOX_FILL_TRANSPARENCY = 35
const SCROLL_BOX_BORDER_RGBA = new RGBA(100, 100, 255)
const SCROLL_BOX_STROKE_WEIGHT = 2

//**STARTUP**
function preload()
{
    let resultCallback = function(result)
    {
        imgLoadResult = result;
    }

    imgMap = loadImage(IMG_MAP_URL, resultCallback);
    httpRequest("http://derekm.tech/index.html", resultCallback = function(data){
        dataRawMerchant = data.response
    })
}

function setup() 
{
    let canvas = createCanvas(imgMap.width*CANVAS_ZOOM, imgMap.height*CANVAS_ZOOM);
    canvas.id("mapcanvas")

    canvas.parent('mycontent')

    scrollBox.fillRGB = SCROLL_BOX_FILL_RGBA;
    scrollBox.borderRGB = SCROLL_BOX_BORDER_RGBA;
    scrollBox.fillTransparency = SCROLL_BOX_FILL_TRANSPARENCY;
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
        print(dataRawMerchant)
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
            strokeWeight(SCROLL_BOX_STROKE_WEIGHT)
            fill(fillColor)

            rect(d.pos.x, d.pos.y, d.width, d.height);

            pop()
        }

        // clear drawable list for next round
        drawables = []
    }
}

//**NETWORKING STUFF**
function httpRequest(path, resultCallback, type="GET", proxy=CORS_PROXY)
{
    // use proxy or jsonp to get around CORS
    // https://gist.github.com/jesperorb/6ca596217c8dfba237744966c2b5ab1e

    // fetches data from url
    let xmlreq = new XMLHttpRequest()
    
    xmlreq.onreadystatechange = function() {
        resultCallback(this)
    }

    xmlreq.open("GET", CORS_PROXY+path, true)
    xmlreq.send()
}

function parseData(data)
{
    // parses serialized data, and packages into data structure
}

//**EVENTS**
function windowResized()
{
    
}

function mousePressed()
{
    //append(drawables, new Drawable(createVector(mouseX, mouseY), true, true, color(255), color(255)))
    if (mouseButton === LEFT)
    {
        scrollBox.startPos = createVector(mouseX, mouseY);
        scrollBox.endPos = createVector(mouseX, mouseY);
        scrollBox.isActive = true;
    }
}

function mouseDragged()
{
    if (mouseButton === LEFT)
    {
        scrollBox.endPos = createVector(mouseX, mouseY);
    }
}

function mouseReleased()
{
    if (mouseButton === LEFT)
    {
        scrollBox.isActive = false;

        //TODO: prompt user to create a section
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
