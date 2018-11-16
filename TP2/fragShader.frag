#ifdef GL_ES
precision highp float;
#endif

 uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
 


varying vec2 vTextureCoord;
uniform sampler2D uSampler2;

uniform float normScale;

void main()
{
  gl_FragColor = texture2D(uSampler2, vTextureCoord);  

}


