"use client";

import * as React from "react";

/*
 * Shader del hero, portado de docs/design-foundation.html.
 *
 * Es fbm con domain warping: el ruido se muestrea con coordenadas que a su vez
 * salen de otro ruido, dos veces. Eso es lo que produce las vetas líquidas en
 * vez de nubes. Encima van vetas ámbar, grano y viñeta.
 *
 * Lo añadido acá sobre el original: el puntero desplaza el segundo warp, así que
 * el líquido se arrastra detrás del cursor. El seguimiento es amortiguado (lerp)
 * porque enganchar la posición cruda se siente mecánico, no líquido.
 */

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}";

const FRAG = `
precision highp float;
uniform vec2 u_r;
uniform float u_t;
uniform vec2 u_m;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float gnoise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  for(int k=0;k<5;k++){v+=a*gnoise(p);p*=2.0;a*=0.5;}
  return v;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_r;
  vec2 p=uv*vec2(u_r.x/u_r.y,1.0)*2.3;
  float t=u_t*0.05;

  vec2 q=vec2(fbm(p+vec2(0.0,t)),fbm(p+vec2(5.2,-t)));

  /* El cursor arrastra el segundo warp: cerca del puntero el líquido se estira
     hacia él, y el efecto decae con la distancia. */
  vec2 m=(u_m-0.5)*vec2(u_r.x/u_r.y,1.0)*2.3;
  float pull=exp(-dot(p-m,p-m)*0.35);
  vec2 drag=(m-p)*pull*0.55;

  vec2 r=vec2(
    fbm(p+2.0*q+drag+vec2(1.7,9.2)+0.12*t),
    fbm(p+2.0*q+drag+vec2(8.3,2.8)-0.10*t)
  );
  float f=fbm(p+2.4*r);

  /* Fósforo verde: el ground casi negro, la veta en verde de CRT. */
  vec3 ink=vec3(0.043,0.055,0.043);
  vec3 deep=vec3(0.055,0.115,0.075);
  vec3 phos=vec3(0.290,0.940,0.494);

  vec3 col=mix(ink,deep,smoothstep(0.15,0.95,f));
  float sheen=pow(smoothstep(0.55,1.0,length(r)),2.0);
  col=mix(col,phos,sheen*(0.20+0.16*pull));

  float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
  col+=(g-0.5)*0.025;
  col*=mix(0.66,1.05,smoothstep(1.25,0.25,length(uv-0.5)));

  gl_FragColor=vec4(col,1.0);
}
`;

/** Degradado estático para navegadores sin WebGL. Mismos tonos que el shader. */
const FALLBACK =
  "radial-gradient(60% 80% at 35% 25%, #14301f, transparent), radial-gradient(50% 60% at 80% 40%, #0f2417, transparent), #0B0E0B";

export function LiquidShader({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) {
      canvas.style.background = FALLBACK;
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("[shader] compile:", gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[shader] link:", gl.getProgramInfoLog(program));
      canvas.style.background = FALLBACK;
      return;
    }
    gl.useProgram(program);
    // Un buffer sin dibujar debe verse como el ground, no como blanco.
    gl.clearColor(0.043, 0.055, 0.043, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Un solo triángulo que cubre el clip space: más barato que dos.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const attr = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_r");
    const uTime = gl.getUniformLocation(program, "u_t");
    const uMouse = gl.getUniformLocation(program, "u_m");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = (canvas.clientHeight || 460) * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Objetivo vs. actual: el segundo persigue al primero cada frame.
    const target = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };

    const onPointer = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      target.x = (e.clientX - box.left) / box.width;
      // El eje Y de WebGL va al revés que el del DOM.
      target.y = 1 - (e.clientY - box.top) / box.height;
    };

    let frame = 0;
    const render = (ms: number) => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      gl.uniform2f(uMouse, current.x, current.y);
      gl.uniform1f(uTime, ms * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(render);
    };

    if (reduce) {
      // Un frame fijo: la textura queda, el movimiento no.
      gl.uniform2f(uMouse, 0.5, 0.5);
      gl.uniform1f(uTime, 8);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      frame = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      // Ojo: NO se llama a loseContext(). En StrictMode React monta, desmonta y
      // vuelve a montar; `getContext` devolvería el mismo contexto ya perdido y
      // todo fallaría en silencio (compile/link sin info log, canvas en blanco).
      // El contexto muere solo cuando el canvas se recoge.
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
