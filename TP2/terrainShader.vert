
#ifdef GL_ES
precision highp float;
#endif

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
 

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;

uniform float normScale;


void main()
{
  vec4 rgba = texture2D(uSampler2, aTextureCoord);  
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + vec3(0,0,(rgba[0]+rgba[1]+rgba[2])*normScale), 1.0);
  vTextureCoord = aTextureCoord;
}