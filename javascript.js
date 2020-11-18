// WebGL2 - Fundamentals
// from https://webgl2fundamentals.org/webgl/webgl-fundamentals.html


"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

uniform mat3 u_matrix;

// all shaders have a main function
void main() {


    v_texCoord = a_texCoord;
    gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform sampler2D u_image;
in vec2 v_texCoord;
uniform vec2 u_decallage;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec2 onePixel = vec2(u_decallage) / vec2(textureSize(u_image, 0));

    // average the left, middle, and right pixels.
    outColor = (
        texture(u_image, v_texCoord) +
        texture(u_image, v_texCoord + vec2( onePixel.x, onePixel.y)) +
        texture(u_image, v_texCoord + vec2(-onePixel.x, -onePixel.y))) / 3.0;

}
`;

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
  gl.deleteShader(shader);
  return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));  // eslint-disable-line
  gl.deleteProgram(program);
  return undefined;
}

var image = new Image();
  image.src = "./paysage.jpg";
  image.onload = function() {
  render(image);
};

// First let's make some variables
// to hold the translation,
var translation = [150, 100];
var rotationInRadians = 0;
var scale = [1, 1];



function render(image) {
  // Get A WebGL context
  var canvas = document.querySelector("#c");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
  //pour adapter la taille du canvas à Webgl
  function resize(canvas) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
    // Check if the canvas is not the same size.
    if (canvas.width  !== displayWidth ||
        canvas.height !== displayHeight) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
  }
  resize(gl.canvas);


  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
  var imageLocation = gl.getUniformLocation(program, "u_image");
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");
  var decallagePixelGauche = gl.getUniformLocation(program, "u_decallage");

  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();
   // Bind the position buffer so gl.bufferData that will be called
   // in setRectangle puts data in the position buffer
   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

   // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, 250, 300);
  function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ]), gl.STATIC_DRAW);
  }


  //Collection d'état d'attributs
  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();
  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);


// provide texture coordinates for the rectangle.
  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordAttributeLocation);
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texCoordAttributeLocation, size, type, normalize, stride, offset)

  // Create a texture.
  var texture = gl.createTexture();

  // make unit 0 the active texture uint
  // (ie, the unit all other texture commands will affect
  gl.activeTexture(gl.TEXTURE0 + 0);

  // Bind it to texture unit 0' 2D bind point
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we don't need mips and so we're not filtering
  // and we don't repeat
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  var mipLevel = 0;               // the largest mip
  var internalFormat = gl.RGBA;   // format we want in the texture
  var srcFormat = gl.RGBA;        // format of data we are supplying
  var srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
  gl.texImage2D(gl.TEXTURE_2D,
                mipLevel,
                internalFormat,
                srcFormat,
                srcType,
                image);

  var souriX = 700
  var souriY = 543

  drawScene(souriX, souriY)

  document.addEventListener('mousemove', function (e) {

   souriX = e.clientX
        if(e.clientX > 400 ) {
          souriX = (e.clientX - 400) * 2
        }
        if(e.clientX < 150  ) {
          souriX = (e.clientX - 150) *2
        }
          if(e.clientX > 150 && e.clientX < 400 )
        {
            souriX = 0;
          }

   souriY = e.clientY
        if(e.clientY > 345 ) {
          souriY = (e.clientY - 345) * 2
        }
        if(e.clientY < 100  ) {
          souriY = (e.clientY - 100) *2
        }
          if(e.clientY > 100 && e.clientY < 345 )
        {
            souriY = 0;
          }


  console.log(e.clientY)

  drawScene(souriX, souriY)
})



                function drawScene(souriX, souriY) {

                  // Tell WebGL how to convert from clip space to pixels
                  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

                  // Clear the canvas
                  gl.clearColor(0, 0, 0, 0);
                  gl.clear(gl.COLOR_BUFFER_BIT);


                  // Tell it to use our program (pair of shaders)
                  gl.useProgram(program);





                  // Tell the shader to get the texture from texture unit 0
                   gl.uniform1i(imageLocation, 0);
                   gl.uniform2fv(decallagePixelGauche, [souriX, souriY])



                  var m3 = {
                    projection: function (width, height) {
                    // Note: This matrix flips the Y axis so that 0 is at the top.
                    return [
                      2 / width, 0, 0,
                      0, -2 / height, 0,
                      -1, 1, 1,
                    ];
                  },
                  translation: function(tx, ty) {
                    return [
                      1, 0, 0,
                      0, 1, 0,
                      tx, ty, 1,
                    ];
                  },

                  rotation: function(angleInRadians) {
                    var c = Math.cos(angleInRadians);
                    var s = Math.sin(angleInRadians);
                    return [
                      c,-s, 0,
                      s, c, 0,
                      0, 0, 1,
                    ];
                  },

                  scaling: function(sx, sy) {
                    return [
                      sx, 0, 0,
                      0, sy, 0,
                      0, 0, 1,
                    ];
                  },

                  multiply: function(a, b) {
                    var a00 = a[0 * 3 + 0];
                    var a01 = a[0 * 3 + 1];
                    var a02 = a[0 * 3 + 2];
                    var a10 = a[1 * 3 + 0];
                    var a11 = a[1 * 3 + 1];
                    var a12 = a[1 * 3 + 2];
                    var a20 = a[2 * 3 + 0];
                    var a21 = a[2 * 3 + 1];
                    var a22 = a[2 * 3 + 2];
                    var b00 = b[0 * 3 + 0];
                    var b01 = b[0 * 3 + 1];
                    var b02 = b[0 * 3 + 2];
                    var b10 = b[1 * 3 + 0];
                    var b11 = b[1 * 3 + 1];
                    var b12 = b[1 * 3 + 2];
                    var b20 = b[2 * 3 + 0];
                    var b21 = b[2 * 3 + 1];
                    var b22 = b[2 * 3 + 2];

                    return [
                      b00 * a00 + b01 * a10 + b02 * a20,
                      b00 * a01 + b01 * a11 + b02 * a21,
                      b00 * a02 + b01 * a12 + b02 * a22,
                      b10 * a00 + b11 * a10 + b12 * a20,
                      b10 * a01 + b11 * a11 + b12 * a21,
                      b10 * a02 + b11 * a12 + b12 * a22,
                      b20 * a00 + b21 * a10 + b22 * a20,
                      b20 * a01 + b21 * a11 + b22 * a21,
                      b20 * a02 + b21 * a12 + b22 * a22,
                    ];
                  },
                  translate: function(m, tx, ty) {
                    return m3.multiply(m, m3.translation(tx, ty));
                  },

                  rotate: function(m, angleInRadians) {
                    return m3.multiply(m, m3.rotation(angleInRadians));
                  },

                  scale: function(m, sx, sy) {
                    return m3.multiply(m, m3.scaling(sx, sy));
                  }
                };

                    // Compute the matrices
                    var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
                    matrix = m3.translate(matrix, translation[0], translation[1]);
                    matrix = m3.rotate(matrix, rotationInRadians);
                    matrix = m3.scale(matrix, scale[0], scale[1]);


                    // Set the matrix.
                    gl.uniformMatrix3fv(matrixLocation, false, matrix);

                  // draw
                  var primitiveType = gl.TRIANGLES;
                  var offset = 0;
                  var count = 6;
                  gl.drawArrays(primitiveType, offset, count);



                }

}



render();
