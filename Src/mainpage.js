let img;
let loadResult;

function preload()
{
    url = 'https://www.balisafarimarinepark.com/wp-content/uploads/2017/11/19437535_10154869044788931_4755399083724169206_n-671.jpg';

    resultCallback = function(result) { loadResult = result; }
    
    img = loadImage(url, resultCallback(true));
}

function setup() 
{
    createCanvas(640, 480);
}

function draw() 
{
    if (loadResult)
    {
        image(img, 0, 0, canvas.width, canvas.height);
    }
}