"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The Next Ship — warm liquid shader (fbm domain-warp). Absolute-fills its
 * parent by default. Respects prefers-reduced-motion. Self-contained WebGL.
 */
export function LiquidShader({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const gl = (c.getContext("webgl") ||
      c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    const reduce = window.matchMedia?.("(prefers-reduced-motion:reduce)").matches;
    if (!gl) {
      c.style.background =
        "radial-gradient(60% 80% at 35% 25%,#2c2419,transparent),radial-gradient(50% 60% at 80% 40%,#241f16,transparent),#1A1A17";
      return;
    }

    const vsrc = "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}";
    const fsrc = [
      "precision highp float;uniform vec2 u_r;uniform float u_t;",
      "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float gnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);",
      " float a=hash(i),b=hash(i+vec2(1.,0.)),cc=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));",
      " return mix(mix(a,b,u.x),mix(cc,d,u.x),u.y);}",
      "float fbm(vec2 p){float v=0.,a=0.5;for(int k=0;k<5;k++){v+=a*gnoise(p);p*=2.;a*=0.5;}return v;}",
      "void main(){vec2 uv=gl_FragCoord.xy/u_r;vec2 p=uv*vec2(u_r.x/u_r.y,1.)*2.3;float t=u_t*0.05;",
      " vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,-t)));",
      " vec2 r=vec2(fbm(p+2.*q+vec2(1.7,9.2)+.12*t),fbm(p+2.*q+vec2(8.3,2.8)-.10*t));",
      " float f=fbm(p+2.4*r);",
      " vec3 ink=vec3(0.102,0.102,0.090),brown=vec3(0.180,0.156,0.113),amber=vec3(0.776,0.631,0.356);",
      " vec3 col=mix(ink,brown,smoothstep(.15,.95,f));",
      " col=mix(col,amber,pow(smoothstep(.55,1.,length(r)),2.)*0.22);",
      " float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);col+=(g-0.5)*0.025;",
      " col*=mix(0.66,1.05,smoothstep(1.25,0.25,length(uv-0.5)));gl_FragColor=vec4(col,1.0);}",
    ].join("\n");

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vsrc));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "u_r");
    const uT = gl.getUniformLocation(prog, "u_t");

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth || 1;
      const h = c.clientHeight || 440;
      c.width = w * dpr;
      c.height = h * dpr;
      gl.viewport(0, 0, c.width, c.height);
      gl.uniform2f(uR, c.width, c.height);
    };
    window.addEventListener("resize", size);
    size();

    let raf = 0;
    const frame = (ms: number) => {
      gl.uniform1f(uT, ms * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    if (reduce) {
      gl.uniform1f(uT, 8.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <canvas ref={ref} className={cn("absolute inset-0 block h-full w-full", className)} />
  );
}
