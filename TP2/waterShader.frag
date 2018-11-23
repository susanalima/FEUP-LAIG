
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
uniform float textscale;


void main()
{
  vec2 meu = vTextureCoord;
  meu.x += time/6.0;
  meu.x = mod(meu.x,1.0);
  meu.x *= textscale;
  meu.y += time/6.0;
  meu.y = mod(meu.y,1.0);
  meu.y *= textscale;
  vec4 rgba = texture2D(uSampler1, meu);  
  gl_FragColor = rgba;
}