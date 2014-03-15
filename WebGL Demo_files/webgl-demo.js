var canvas;
var gl;
var squareVerticesBuffer;
var squareVerticesColorBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var vertexColorAttribute;
var perspectiveMatrix;

//
// start
//
// Called when the canvas is created to get the ball rolling.
// Figuratively, that is. There's nothing moving in this demo.
//

 var gradients = [
    focusColors,
    todayColors,
    laterColors,
    neverColors
  ];


  var focusColors = [
    0.2,  0.8,  0.7,  1.0,  // green
    0.2,  0.8,  0.7,  1.0,  
    1.0,  1.0,  1.0,  1.0,   // white
    1.0,  1.0,  1.0,  1.0 

  ];

  var todayColors = [
    0.5,  0.8,  1.0,  1.0,   // light blue
    0.5,  0.8,  1.0,  1.0,   
    1.0,  1.0,  1.0,  1.0,   // white
    1.0,  1.0,  1.0,  1.0 
  ];

  var laterColors = [
    0.5,  0.5,  0.8,  1.0,  // purple
    0.5,  0.5,  0.8,  1.0,  
    0.2,  0.6,  1.0,  1.0,  // blue
    0.2,  0.6,  1.0,  1.0  
  ];

  var neverColors = [
    0.2,  0.8,  0.7,  1.0,  // green
    0.2,  0.8,  0.7,  1.0,  
    1.0,  1.0,  1.0,  1.0,   // white
    1.0,  1.0,  1.0,  1.0
  ];

function start() {
  canvas = document.getElementById("glcanvas");

  initWebGL(canvas);      // Initialize the GL context
  
  // Only continue if WebGL is available and working
  
  if (gl) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
 
    initShaders();
    window.startColor = focusColors;
    window.currColor = window.startColor;
    window.endColor = laterColors;
    _setDirection();
     
    setInterval(initBuffers, 50);
    setInterval(drawScene, 15);
  }
};


function _setDirection() {
  window.directions = [];
  window.directions[0] = window.startColor[0] > window.endColor[0] ? -0.01 : 0.01;
  window.directions[1] = window.startColor[1] > window.endColor[1] ? -0.01 : 0.01;
  window.directions[2] = window.startColor[2] > window.endColor[2] ? -0.01 : 0.01;
  window.directions[3] = window.startColor[3] > window.endColor[3] ? -0.01 : 0.01;
  window.directions[4] = window.startColor[4] > window.endColor[4] ? -0.01 : 0.01;
  window.directions[5] = window.startColor[5] > window.endColor[5] ? -0.01 : 0.01;
  window.directions[6] = window.startColor[6] > window.endColor[6] ? -0.01 : 0.01;
  window.directions[7] = window.startColor[7] > window.endColor[7] ? -0.01 : 0.01;
  window.directions[8] = window.startColor[8] > window.endColor[8] ? -0.01 : 0.01;
  window.directions[9] = window.startColor[9] > window.endColor[9] ? -0.01 : 0.01;
  window.directions[10] = window.startColor[10] > window.endColor[10] ? -0.01 : 0.01;
  window.directions[11] = window.startColor[11] > window.endColor[11] ? -0.01 : 0.01;
  window.directions[12] = window.startColor[12] > window.endColor[12] ? -0.01 : 0.01;
  window.directions[13] = window.startColor[13] > window.endColor[13] ? -0.01 : 0.01;
  window.directions[14] = window.startColor[14] > window.endColor[14] ? -0.01 : 0.01;
  window.directions[15] = window.startColor[15] > window.endColor[15] ? -0.01 : 0.01;
};

function initWebGL() {
  gl = null;
  try {
    gl = canvas.getContext("experimental-webgl");
  }
  catch(e) {}
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
};

function initBuffers() {
  squareVerticesBuffer = gl.createBuffer();  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


  for(var i = 0; i < window.currColor.length; i++) {
    if (window.directions[i] > 0 && window.currColor[i] <= window.endColor[i]) {
      window.currColor[i] += window.directions[i];         
    } else if (window.directions[i] < 0 && window.currColor[i] >= window.endColor[i]) {
      window.currColor[i] += window.directions[i];
    }
  }


  squareVerticesColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(window.currColor), gl.STATIC_DRAW)
};

function drawScene() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
  perspectiveMatrix = makePerspective(18, 1000.0/480.0, 0.1, 100.0);
  
  loadIdentity();
  
  // Now move the drawing position a bit to where we want to start
  // drawing the square.
  
  mvTranslate([-0.0, 0.0, -6.0]);
  
  // Draw the square by binding the array buffer to the square's vertices
  // array, setting attributes, and pushing it to GL.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  // Set the colors attribute for the vertices.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
  
  // Draw the square.
  
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  
  // Create the shader program
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  gl.useProgram(shaderProgram);
  
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  
  vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(vertexColorAttribute);
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  
  // Didn't find an element with the specified ID; abort.
  
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the
  // shader source string.
  
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have,
  // based on its MIME type.
  
  var shader;
  
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }
  
  // Send the source to the shader object
  
  gl.shaderSource(shader, theSource);
  
  // Compile the shader program
  
  gl.compileShader(shader);
  
  // See if it compiled successfully
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}

//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}