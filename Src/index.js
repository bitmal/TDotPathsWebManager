//**GLOBALS**
let imgMap;
let imgLoadResult;

let dataRawMerchant;

let jsonDoc;

let drawables = [];

let scrollBox = new DisplayBox();

let mapController = new MapController()

//**STATE**
const states = ["default", "section", "merchant", "addsection", 
    "addmerchant", "selectsection", "selectmerchant"]
let currentState;

//**SETTINGS**
const CANVAS_ZOOM = 0.75;

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

const IMG_MAP_URL = 'http://derekm.tech/tdot_paths-map.png'

const SCROLL_BOX_FILL_RGBA = new RGBA(100, 100, 255)
const SCROLL_BOX_FILL_TRANSPARENCY = 35
const SCROLL_BOX_BORDER_RGBA = new RGBA(100, 100, 255)
const SCROLL_BOX_STROKE_WEIGHT = 2

//**HTML/JS ELEMENTS**
const MAP_CANVAS_ID = "#mapcanvas"
const ADD_SECTION_INPUT_ID = "#add-section-input"
const ADD_SECTION_BUTTON_ID = "#add-section-button"
const MENU_TOGGLE_BUTTON_ID = "#menu-toggle-button"

//**STARTUP**
function preload()
{
    let resultCallback = function(result)
    {
        imgLoadResult = result;
    }

    imgMap = loadImage(IMG_MAP_URL, resultCallback);

    currentState = "default"

    jsonDoc = new JSONDocument()
    jsonDoc.pull('http://derekm.tech/test.json')
}

function setup() 
{
    let canvas = createCanvas(imgMap.width*CANVAS_ZOOM, imgMap.height*CANVAS_ZOOM);
    canvas.id(MAP_CANVAS_ID)

    canvas.parent('mycontent')

    scrollBox.fillRGB = SCROLL_BOX_FILL_RGBA;
    scrollBox.borderRGB = SCROLL_BOX_BORDER_RGBA;
    scrollBox.fillTransparency = SCROLL_BOX_FILL_TRANSPARENCY;
    scrollBox.startPos = createVector();
    scrollBox.endPos = createVector();

    $(ADD_SECTION_BUTTON_ID).click(function(e){
        //TODO (ASAP): cache new selectedSection to be added once the user inputs a name on
        // the scrollbar
    })

    $(document).on("keypress", ADD_SECTION_INPUT_ID, function(e){
        let value = e.target.value
        
        if (e.key === "Enter" && value !== "")
        {
            let width = scrollBox.endPos.x - scrollBox.startPos.x
            let height = scrollBox.endPos.y - scrollBox.startPos.y
            let position = scrollBox.startPos

            mapController.AddMapSection(value, position, width, height)
            
            //TODO: prompt user with search bar to insert section
            closeMainMenu()
        }
    })

    $(MENU_TOGGLE_BUTTON_ID).click(function(e){
        clearAllInputFields()
        closeMainMenu()
    })
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
    if (keyIsPressed && keyIsDown(CONTROL))
    {
        switch (currentState)
        {
            // case = default
            case states[0]:
            {
                // state = merchant
                currentState = states[2]
            }
            break
        }
    }
    else if (!keyIsPressed)
    {
        switch(currentState)
        {
            // state = merchant
            case states[2]:
            {
                // state = default
                currentState = states[0]
            }
            break
        }
    }
}

function update()
{
    switch (currentState)
    {
        // state = section
        case states[1]:
        {
            // dispatch drawable of objects to be drawn
            if (scrollBox.isActive)
            {
                append(drawables, scrollBox.drawable())
            }
        }
        break
        // state = merchant
        case states[2]:
        {
            // display map areas, so user can select a section to add a merchant
            mapController.merchantMapData.sectionLookupByID.forEach(function(section){
                let area = section.area
                let clickable = new ClickableBox(100, new RGBA(0, 0, 255), new RGBA(100, 100, 255),
                    new RGBA(255, 0, 0), new RGBA(255, 100, 100))
                clickable.SetPosition(area.position, createVector(area.position.x+area.width,
                    area.position.y+area.height))
                
                let drawable = clickable.drawable()
                
                drawables.push(drawable)
            })
        }
        break
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

// UI stuff
function closeMainMenu()
{
    $("#wrapper").toggleClass("toggled")
    scrollBox.isActive = false
    currentState = states[0]
    $(MAP_CANVAS_ID).focus()
}

function clearAllInputFields()
{
    let sectionInput = $(ADD_SECTION_INPUT_ID)[0]
    sectionInput.value = ""
}

//**MAP STUFF**

//**NETWORKING STUFF**
function httpRequest(path, responseType, resultCallback, type="GET", proxy=CORS_PROXY)
{
    // use proxy or jsonp to get around CORS
    // https://gist.github.com/jesperorb/6ca596217c8dfba237744966c2b5ab1e

    // fetches data from url
    let xmlreq = new XMLHttpRequest()
    
    xmlreq.onreadystatechange = function() {
        resultCallback(this)
    }

    xmlreq.open(type, CORS_PROXY+path, true)
    xmlreq.responseType = responseType
    xmlreq.send()
}

//**EVENTS**
function windowResized()
{
    
}

function mouseClicked()
{
    if (mouseButton === LEFT)
    {
        //print(jsonDoc.raw)

        switch(currentState)
        {
            // state = merchant
            case states[2]:
            {
                //TODO: check for mouse overlap, and if so, set to the appropriate state

                // state = default
                currentState = states[4]
            }
            break
        }
    }
}

function mousePressed()
{
    //append(drawables, new Drawable(createVector(mouseX, mouseY), true, true, color(255), color(255)))
    if (mouseButton === LEFT)
    {
        switch (currentState)
        {
            // case = default
            case states[0]:
            {
                scrollBox.startPos = createVector(mouseX, mouseY);
                scrollBox.endPos = createVector(mouseX, mouseY);
                scrollBox.isActive = true;

                // state = section
                currentState = states[1]
            }
            break
        }
    }
    else if (mouseButton === RIGHT)
    {
        
    }
}

function mouseDragged()
{
    if (mouseButton === LEFT)
    {
        switch (currentState)
        {
            // state = "section"
            case states[1]:
            {
                scrollBox.endPos = createVector(mouseX, mouseY);
            }
            break
            case states[2]:
            {
                //TODO: check whether mouse is over map area,
                // and set 'areaHovered' accordingly
            }
            break
        }
    }
}

function mouseReleased()
{
    if (mouseButton === LEFT)
    {
        switch (currentState)
        {
            // state = section
            case states[1]:
            {
                //TODO: prompt user to create a section
                $("#wrapper").toggleClass("toggled")
                $(ADD_SECTION_INPUT_ID).focus()
                currentState = states[3]
            }
            break
            
        }
    }
}

//**TYPES**
function Rect(position, width, height)
{
    this.position = position
    this.width = width
    this.height = height

    this.getArea = function()
    {
        return {topLeft: [this.position.x, this.position.y], bottomLeft: [this.position.x, this.position.y+this.height],
            bottomRight: [this.position.x+this.width], topRight: [this.position.x+this.width, this.position.y]}
    }
}

function MapController()
{
    this.merchantMapData = new MerchantMap()

    this.isLoaded = false
    this.selectedSection = null

    this.LoadMapData = function()
    {
        //TODO: store json map data in here instead of globally
        //TEMP
        // let section = merchantMapData.AddMapSection("First Canadien Place", new Rect());
        // MapData.AddMapMerchant("Calli Love", section.id);
        // section = MapData.AddMapSection("Commerce Court East", new SkiaSharp.SKRect(400, 400, 600, 600));
        // MapData.AddMapMerchant("Marcellos", section.id);
    }

    this.AddMapSection = function(name, position, width, height)
    {
        let area = new Rect(position, width, height)
        let section = this.merchantMapData.AddMapSection(name, area, true);
    }
}

function SectionMap(name, id, area, isActive=true)
{
    this.name = name
    this.id = id
    this.area = area
    this.isActive = isActive
}

function MapMerchant(name, id, sectionId, isMerchant=false)
{
    this.name = name
    this.id = id
    this.sectionId = sectionId
    this.isMerchant = isMerchant
}

function MerchantMap()
{
    this.sectionLookupByID = new Map();
    this.merchantIDLookupByName = new Map();
    this.merchantLookupByID = new Map();

    // Properties
    this.isLoaded = false

    this.LoadMapData = function(dataFileAssembly)
    {
        // Clear out old data
        sectionLookupByID.Clear();
        merchantIDLookupByName.Clear();
        merchantLookupByID.Clear();
        
        //TODO: query server for map data
        
        //TODO: parse data (json still needs to be implemented)

        //TODO: store data in dictionaries
        //1) AddSection foreach section datum
        //2) AddMapMerchant foreach merchant datum

        isLoaded = true;
    }

    this.AddMapSection = function(name, area, isActive = true, id=null)
    {
        let sectionID = id == null ? name.replace(/ /g, '') : id;

        if (sectionID == null)
        {
            print("Map.AddSection: Section name cannot be null!");
            return null
        }
        else if (this.sectionLookupByID.has(sectionID))
        {
            print("Map.AddSection: Section '" + sectionID + "' already exists!");
            return null
        }

        let section = new SectionMap(name, sectionID, area, isActive);
        this.sectionLookupByID.set(section.id, section);

        return section;
    }

    this.AddMapMerchant = function(name, sectionID, id=null, isMerchant=false)
    {
        let merchantID = id == null ? name.replace(/ /g, '') : id;

        if (id == null)
        {
            let merchantIDNumber = 0;
            while (merchantIDLookupByName.has(merchantID+merchantIDNumber))
            {
                ++merchantIDNumber;
            }

            merchantID += merchantIDNumber;
        }

        let merchant = new MapMerchant(name, merchantID, sectionID, isMerchant);

        let merchants = null;

        if (merchantIDLookupByName.has(merchant.name))
        {
            merchants = merchantIDLookupByName.get(merchant.name)
        }
        else
        {
            merchants = []
            merchantIDLookupByName.set(merchant.name, merchants);
        }

        merchants.Add(merchant.id);
        merchantLookupByID.Add(merchant.id, merchant);

        return merchant;
    }

    // gets the available merchant IDs
    // returns NULL if not found
    this.GetMapMerchantIDListByName = function(name)
    {
        let merchantIDList = null;

        if (merchantIDLookupByName.has(name))
        {
            merchantIDList = merchantIDLookupByName.get(name);
        }

        return merchantIDList;
    }

    // section id will be null if section was not located
    this.GetMapSectionByID = function(id)
    {
        if (sectionLookupByID.has(id))
        {
            return sectionLookupByID.get(id);
        }

        return new MapSection();
    }

    // merchant id will be null if merchant was not located
    this.GetMapMerchantByID = function(id)
    {
        if (merchantLookupByID.has(id))
        {
            return merchantLookupByID.get(id);
        }

        return new MapMerchant();
    }

    this.ContainsSection = function(id)
    {
        return sectionLookupByID.has(id);
    }

    this.ContainsMerchant = function(id)
    {
        return merchantLookupByID.has(id);
    }
}

function JSONDocument()
{
    this.isLoaded = false

    this.path = null
    this.raw = null
    this.data = null

    this.pull = function(path)
    {
        httpRequest(path, "", function(data){
            if (data.status === 200)
            {
                this.isLoaded = true

                this.path = data.responseURL
                this.raw = data.response;
                print(data.response)
                this.data = JSON.parse(data.response)
            }
        })
    }

    this.push = function(path)
    {

    }

    this.write = function(data)
    {
    }
}

function RGBA(r, g, b, a)
{
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

function ClickableBox(fillTransparency, borderRGB, fillRGB, clickBorderRGB, clickFillRGB, hoverBorderRGB, hoverFillRGB)
{
    this.displayBox = new DisplayBox(fillTransparency, borderRGB, fillRGB)
    this.fillTransparency = fillTransparency
    this.borderRGB = borderRGB
    this.fillRGB = fillRGB
    this.clickBorderRGB = clickBorderRGB
    this.clickFillRGB = clickFillRGB 
    this.hoverBorderRGB = hoverBorderRGB
    this.hoverFillRGB = hoverFillRGB

    this.SetPosition = function(startPos, endPos)
    {
        this.displayBox.startPos = startPos
        this.displayBox.endPos = endPos
    }

    this.StartClick = function(callback=function(){})
    {
        this.displayBox.borderRGB = clickBorderRGB
        this.displayBox.fillRGB = clickFillRGB
        callback()
    }

    this.EndClick = function(callback=function(){})
    {
        this.displayBox.borderRGB = borderRGB
        this.displayBox.fillRGB = fillRGB
        callback()
    }

    this.StartHover = function(callback=function(){})
    {
        this.displayBox.borderRGB = hoverBorderRGB
        this.displayBox.fillRGB = hoverFillRGB
        callback()
    }

    this.EndHover = function(callback=function(){})
    {
        this.displayBox.borderRGB = borderRGB
        this.displayBox.fillRGB = fillRGB
        callback()
    }

    this.drawable = function()
    {
        let drawable = this.displayBox.drawable()
        drawable.startPos = this.startPos
        drawable.endPos = this.endPos

        return drawable
    }
}

function DisplayBox(fillTransparency, borderRGB, fillRGB)
{
    this.startPos;
    this.endPos;
    this.fillTransparency = fillTransparency;
    this.borderRGB = borderRGB;
    this.fillRGB = fillRGB;

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
