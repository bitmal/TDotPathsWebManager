//**GLOBALS**
let imgMap;
let imgLoadResult;

let dataRawMerchant;

let jsonDoc;

let drawables = [];

let scrollBox = new DisplayBox();

let mapController = new MapController()

//**STATE**
const states = ["default", "addSectionModal", "addMerchantModal", "createSection", "selectSection"]
let currentState;

//**SETTINGS**
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

const IMG_MAP_URL = 'path-map.png'

const SCROLL_BOX_FILL_RGBA = new RGBA(100, 100, 255)
const SCROLL_BOX_FILL_TRANSPARENCY = 35
const SCROLL_BOX_BORDER_RGBA = new RGBA(100, 100, 255)
const SCROLL_BOX_STROKE_WEIGHT = 2

//**HTML/JS ELEMENTS**
let CONTENT_CLASS = ".content"
let MAP_CANVAS_CLASS = ".mapCanvas"

let CONTENT
let CANVAS
let ADD_SECTION_BTN
let ADD_MERCHANT_BTN
let NAV
let DETAILS_MODAL
let DETAILS_MODAL_CONTENT

let mouseDown = false

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
    CONTENT = document.getElementsByClassName("content")[0]
    
    CANVAS = createCanvas(imgMap.width, imgMap.height);
    CANVAS.parent(CONTENT)
    
    ADD_SECTION_BTN = document.createElement("button")
    ADD_SECTION_BTN.setAttribute("class", "navItem")
    ADD_SECTION_BTN.innerHTML = "Add Section"
    ADD_SECTION_BTN.onclick = function() {
        // TODO: trigger modal
        DETAILS_MODAL.style.display = "block"
        addSectionDiv.style.display = "block"
        addMerchantDiv.style.display = "none"
        currentState = "addSectionModal"
    }

    ADD_MERCHANT_BTN = document.createElement("button")
    ADD_MERCHANT_BTN.setAttribute("class", "navItem")
    ADD_MERCHANT_BTN.innerHTML = "Add Merchant"
    ADD_MERCHANT_BTN.onclick = function() {
        // TODO: trigger modal
        DETAILS_MODAL.style.display = "block"
        addSectionDiv.style.display = "none"
        addMerchantDiv.style.display = "block"
        currentState = "addMerchantModal"
    }
    
    let modalClose = document.getElementsByClassName("modalClose")[0]
    modalClose.onclick = function() {
        DETAILS_MODAL.style.display = "none"
        resetState()
    }

    window.onclick = function(event) {
        if (event.target == DETAILS_MODAL) {
            DETAILS_MODAL.style.display = "none"
            resetState()
        }
    }

    NAV = document.getElementsByClassName("nav")[0] 
    NAV.appendChild(ADD_SECTION_BTN)    
    NAV.appendChild(ADD_MERCHANT_BTN) 
    
    DETAILS_MODAL = document.getElementsByClassName("modal")[0]
    DETAILS_MODAL_CONTENT = document.getElementsByClassName("modalContent")[0]
    
    let addSectionDiv = document.createElement("div")
    addSectionDiv.style.display = "none"
    addSectionDiv.setAttribute("class", "modalItem")
    let addSectionNameLabel = document.createElement("label")
    addSectionNameLabel.innerHTML = "Name: "
    addSectionDiv.appendChild(addSectionNameLabel)
    let addSectionNameInput = document.createElement("input")
    addSectionNameInput.setAttribute("class", "modalItem")
    addSectionNameInput.setAttribute("type", "text")
    addSectionDiv.appendChild(addSectionNameInput)
    let addSectionIDLabel = document.createElement("label")
    addSectionIDLabel.innerHTML = "ID: "
    addSectionDiv.appendChild(addSectionIDLabel)
    let addSectionIDInput = document.createElement("input")
    addSectionIDInput.setAttribute("class", "modalItem")
    addSectionIDInput.setAttribute("type", "text")
    addSectionDiv.appendChild(addSectionIDInput)

    DETAILS_MODAL_CONTENT.appendChild(addSectionDiv)

    let addMerchantDiv = document.createElement("div")
    addMerchantDiv.style.display = "none"
    addMerchantDiv.setAttribute("class", "modalItem")
    let addMerchantNameLabel = document.createElement("label")
    addMerchantNameLabel.innerHTML = "Name: "
    addMerchantDiv.appendChild(addMerchantNameLabel)
    let addMerchantNameInput = document.createElement("input")
    addMerchantNameInput.setAttribute("class", "modalItem")
    addMerchantNameInput.setAttribute("type", "text")
    addMerchantDiv.appendChild(addMerchantNameInput)
    let addMerchantIDLabel = document.createElement("label")
    addMerchantIDLabel.innerHTML = "ID: "
    addMerchantDiv.appendChild(addMerchantIDLabel)
    let addMerchantIDInput = document.createElement("input")
    addMerchantIDInput.setAttribute("class", "modalItem")
    addMerchantIDInput.setAttribute("type", "text")
    addMerchantDiv.appendChild(addMerchantIDInput)
    let addMerchantSectionLabel = document.createElement("label")
    addMerchantSectionLabel.innerHTML = "Section: "
    addMerchantDiv.appendChild(addMerchantSectionLabel)
    let addMerchantSectionInput = document.createElement("input")
    addMerchantSectionInput.setAttribute("class", "modalItem")
    addMerchantSectionInput.setAttribute("type", "text")
    addMerchantDiv.appendChild(addMerchantSectionInput)

    DETAILS_MODAL_CONTENT.appendChild(addMerchantDiv)
    
    let modalSubmit = document.createElement("button")
    modalSubmit.setAttribute("class", "modalItem")
    modalSubmit.innerHTML = "Submit"
    modalSubmit.onclick = function() {
        let success = false

        switch (currentState)
        {
        case "addSectionModal":
            {
                if (addSectionNameInput.value !== "" &&
                addSectionIDInput.value !== "")
                {
                    currentState = "createSection"
                    addSectionNameInput.value = null
                    addSectionIDInput.value = null
                    success = true
                }
            }
            break
        case "addMerchantModal":
            {
                if (addMerchantNameInput.value !== "" &&
                addMerchantIDInput.value !== "" &&
                addMerchantSectionInput.value !== "")
                {
                    currentState = "selectSection"
                    addMerchantNameInput.value = null
                    addMerchantIDInput.value = null
                    addMerchantSectionInput.value = null
                    success = true
                }
            }
            break
        }
        if (success === true)
        {
            DETAILS_MODAL.style.display = "none"
        }
    }
    DETAILS_MODAL_CONTENT.appendChild(modalSubmit)

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
    switch (currentState)
    {
        // state = section
        case "createSection":
        {
            // dispatch drawable of objects to be drawn
            if (scrollBox.isActive)
            {
                append(drawables, scrollBox.drawable())
            }
        }
        break
    }  

    // display map areas, so user can select a section to add a merchant
    // mapController.merchantMapData.sectionLookupByID.forEach(function(section){
    //     let area = section.area
    //     let clickable = new ClickableBox(100, new RGBA(0, 0, 255), new RGBA(100, 100, 255),
    //         new RGBA(0, 0, 255), new RGBA(0, 0, 255), new RGBA(0, 0, 255), new RGBA(50, 50, 255))
    //     clickable.SetPosition(area.position, createVector(area.position.x+area.width,
    //         area.position.y+area.height))
    //     if (clickable.Overlaps(createVector(mouseX, mouseY)))
    //     {
    //         if (!mouseDown)
    //         {
    //             clickable.StartHover(function() 
    //             {
    //                 print(section.id)
    //             })
    //         }
    //         else
    //         {
    //             clickable.StartClick(function() 
    //             {
    //                 print(section.id)
    //             })
    //         }
    //     }
        
    //     let drawable = clickable.drawable()
        
    //     drawables.push(drawable)
    // })
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

function resetState()
{
    // TODO: called to reset to default state, and to clear out any necessary buffered data
    currentState = "default"
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
        switch(currentState)
        {
            case "selectSection":
            {
                // TODO: user selects section while adding merchant
            }
            break
        }
    }
}

function mousePressed()
{
    mouseDown = true
    if (mouseButton === LEFT)
    {
        switch (currentState)
        {
            case "createSection":
            {
                scrollBox.startPos = createVector(mouseX, mouseY);
                scrollBox.endPos = createVector(mouseX, mouseY);
                scrollBox.isActive = true;
            }
            break
        }
    }
}

function mouseDragged()
{
    if (mouseButton === LEFT)
    {
        switch (currentState)
        {
            case "createSection":
            {
                scrollBox.endPos = createVector(mouseX, mouseY)
            }
            break
        }
    }
}

function mouseReleased()
{
    mouseDown = false
    
    if (mouseButton === LEFT)
    {
        switch (currentState)
        {
            case "createSection":
            {
                // TODO: trigger back modal
                scrollBox.isActive = false
                currentState = "default"
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

    this.Overlaps = function(pos)
    {
        let startPos = this.displayBox.startPos
        let endPos = this.displayBox.endPos

        return (pos.x > startPos.x && pos.x < endPos.x &&
            pos.y > startPos.y && pos.y < endPos.y)
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
