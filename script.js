let moulds = [];
let xResolution = 300;
let yResolution = 300;

let sensorDistance = 10;
let sensorSize = 3; // Side of square
let sensorAngle = Math.PI / 6;
let angleAdjustmentAfterSensorReading = Math.PI / 7;
let amountGreaterForAngleAdjustement = 100;

let viewCanvas = document.getElementById("viewCanvas");
let viewCTX = viewCanvas.getContext("2d");
let rawCanvasData = new Uint8ClampedArray(xResolution * yResolution * 4);


viewCanvas.width = xResolution ;
viewCanvas.height = yResolution ;

class mouldCell {
  constructor() {
    this.cellType = "mould";
    this.x = Math.floor(Math.random() * xResolution);
    this.y = Math.floor(Math.random() * xResolution);

    this.angle = Math.random() * 2 * Math.PI;
    this.speed = 1;


  }
}


function initalizeMoulds() {
  for (let y = 0; y < yResolution; y++) {
    for (let x = 0; x < xResolution; x++) {
      if (Math.random() > 0.5) {
        let mould = new mouldCell();
        moulds.push(mould);
      }
    }
  }
}


function drawMouldsWithImageData() {
  // Create a copy of the existing canvas data
  const imageData = viewCTX.getImageData(0, 0, xResolution , yResolution );
  rawCanvasData = imageData.data;
  const canvasDataArray = new Uint8ClampedArray(imageData.data.buffer);

  for (let i = 0; i < moulds.length; i++) {
    const mould = moulds[i];
    const index = (Math.floor(mould.y) * xResolution  + Math.floor(mould.x)) * 4;

    // Modify the canvas data to change the color where the mold cell is located
    canvasDataArray[index] = 0; // Red
    canvasDataArray[index + 1] = 210; // Green
    canvasDataArray[index + 2] = 200; // Blue
    canvasDataArray[index + 3] = 255; // Alpha
  }

  // Put the modified canvas data back on the canvas
  viewCTX.putImageData(imageData, 0, 0);
}

function getLeftSensorValue(mould) {
  let leftSensorX = ~~(mould.x + Math.cos(mould.angle - sensorAngle) * sensorDistance);
  let leftSensorY = ~~(mould.y + Math.sin(mould.angle - sensorAngle) * sensorDistance);
  
  return sensorValueCalculation(leftSensorX, leftSensorY);
}

function sensorValueCalculation(sensorX, sensorY) {
  let sensorValue = 0;
  const maxY = Math.min(sensorY + sensorSize , yResolution);
  const maxX = Math.min(sensorX + sensorSize , xResolution);

  for (let y = Math.max(sensorY, 0); y < maxY; y++) {
    for (let x = Math.max(sensorX, 0); x < maxX; x++) {
      sensorValue += rawCanvasData[(y*xResolution + x)*4];
      sensorValue += rawCanvasData[(y*xResolution + x)*4+1];
      sensorValue += rawCanvasData[(y*xResolution + x)*4+1];
    }
  }

  return sensorValue;
}

function getRightSensorValue(mould) {
  let rightSensorX = ~~(mould.x + Math.cos(mould.angle + sensorAngle) * sensorDistance);
  let rightSensorY = ~~(mould.y + Math.sin(mould.angle + sensorAngle) * sensorDistance);

  return sensorValueCalculation(rightSensorX, rightSensorY);
}
function detect(mould) {
  let leftSensorValue = getLeftSensorValue(mould);
  let rightSensorValue = getRightSensorValue(mould);
  if (leftSensorValue + amountGreaterForAngleAdjustement > rightSensorValue) {
    mould.angle -= angleAdjustmentAfterSensorReading;
  } else if (leftSensorValue < rightSensorValue + amountGreaterForAngleAdjustement) {
    mould.angle += angleAdjustmentAfterSensorReading;
  }


}


function updateMouldPositions() {
  for (let i = 0; i < moulds.length; i++) {
    updateMouldPosition(moulds[i]);

  }
}

function updateMouldPosition(mould) {
  let mouldXSpeed = Math.cos(mould.angle) * mould.speed;
  let mouldYSpeed = Math.sin(mould.angle) * mould.speed;

  if (mould.x + mouldXSpeed > xResolution - 1 || mould.x + mouldXSpeed < 0) {
    // Reflect the mold at the canvas boundaries
    mouldXSpeed = mouldXSpeed * -1;
    mould.angle = Math.PI - mould.angle;
  }

  if (mould.y + mouldYSpeed > yResolution - 1 || mould.y + mouldYSpeed < 0) {
    // Reflect the mold at the canvas boundaries
    mouldYSpeed = mouldYSpeed * -1;
    mould.angle = -mould.angle;
  }

  mould.x += mouldXSpeed;
  mould.y += mouldYSpeed;
}



let previousTickTime = performance.now();
let currentTickTime = performance.now();
let running = false;

function tick() {

  if (running) {
    currentTickTime = performance.now();
    document.getElementById("FPS").innerHTML = "FPS: " + (1000 / (currentTickTime - previousTickTime)).toFixed(2);;
    

    viewCTX.fillStyle = getRandomRGBColor();
    
    viewCTX.fillRect(0, 0, viewCanvas.width, viewCanvas.height)
    
    drawMouldsWithImageData();

    for (let i = 0; i < moulds.length; i++) {
      detect(moulds[i]);
    }
    updateMouldPositions();

    previousTickTime = currentTickTime;
  }
  


  requestAnimationFrame(tick);
}
function getRandomRGBColor() {
  var r = Math.floor(Math.random() * 50);
  var g = Math.floor(Math.random() * 50);
  var b = Math.floor(Math.random() * 50);
  return `rgb(${r}, ${g}, ${b})`;
}

function toggleRunning() {
  // setInterval(tick, 100);
  // running = true;
  running = !running;
}
viewCTX.fillStyle = "rgb(0, 0, 0)";
viewCTX.globalAlpha = 1;
viewCTX.fillRect(0, 0, viewCanvas.width, viewCanvas.height);
viewCTX.globalAlpha = 0.05;
initalizeMoulds();
drawMouldsWithImageData();
tick();


