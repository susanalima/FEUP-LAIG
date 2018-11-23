
#ifdef GL_ES
precision highp float;
#endif

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
 
varying vec2 vTextureCoord;
uniform sampler2D uSampler2;
uniform sampler2D uSampler1;

uniform float normScale;
uniform float time;


void main()
{
  vec2 meu = vTextureCoord;
  meu.x += time;
  meu.x = mod(meu.x,1.0);
  meu.y += time;
  meu.y = mod(meu.y,1.0);
  vec4 rgba = texture2D(uSampler1, meu);  
  gl_FragColor = rgba;
}