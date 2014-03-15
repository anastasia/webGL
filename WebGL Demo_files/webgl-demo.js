var canvas;
var gl;
var squareVerticesBuffer;
var squareVerticesColorBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var vertexColorAttribute;
var perspectiveMatrix;

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
  
  if (gl) {
    gl.clearColor(1.0, 1.0, 1.0,0.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
 
    initShaders();
    window.startColor = laterColors;
    window.currColor = window.startColor;
    window.endColor = todayColors;
    _setDirection();
     
    setInterval(initBuffers, 30);
    setInterval(drawScene, 15);
  }
};


function _setDirection() {
  window.directions = [];
  for(var i = 0; i < window.startColor.length; i++){
    window.directions[i] =  window.startColor[i] > window.endColor[i] ? -0.01 : 0.01;
  };
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

/*
  window.currColor.length / 2
  for(var i = currColor.length/2; i < window.currColor.length; i++) {

*/
  for(var j = window.currColor.length/2; j < window.currColor.length; j++) {
    if (window.directions[j] > 0 && window.currColor[j] <= window.endColor[j]) {
      window.currColor[j] += window.directions[j];         
    } else if (window.directions[j] < 0 && window.currColor[j] >= window.endColor[j]) {
      window.currColor[j] += window.directions[j];
    }
  }
  for(var i = 0; i < window.currColor.length/2; i++) {
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