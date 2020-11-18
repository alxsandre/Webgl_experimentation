
// Après avoir écrit les shaders

// On créer une fonction :
// qui créé un shader, charge la source GLSL, compile le shader
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

//On créer une fonction pour maintenant créer le programme
//et le rattacher aux shaders
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






// On appelle les fonctions de création de shaders élaborées au début
var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

//On lit les sharders au programme
var program = createProgram(gl, vertexShader, fragmentShader);

//On créer un buffer et on le lie à gl.ARRAY_BUFFER
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






// gl.drawArrays execute les shaders sur le GPU
var primitiveType = gl.TRIANGLES;
var offset = 0;
var count = 6;
gl.drawArrays(primitiveType, offset, count);
