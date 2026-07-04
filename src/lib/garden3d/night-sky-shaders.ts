/** Shared moon position + procedural night-sky GLSL (inside-out dome). */

export const MOON_POSITION: [number, number, number] = [18, 20, -6];

export const NIGHT_SKY_VERTEX = /* glsl */ `
varying vec3 vDir;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vDir = normalize(world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const NIGHT_SKY_FRAGMENT = /* glsl */ `
uniform float uTime;
varying vec3 vDir;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.0;
    a *= 0.5;
  }
  return v;
}

float stars(vec3 dir, float density, float size) {
  vec2 uv = dir.xz / (abs(dir.y) + 0.08);
  vec2 id = floor(uv * density);
  float h = hash(id);
  if (h < 0.985) return 0.0;
  vec2 gv = fract(uv * density) - 0.5;
  float d = length(gv);
  float tw = 0.55 + 0.45 * sin(uTime * (1.5 + h * 4.0) + h * 40.0);
  return smoothstep(size, 0.0, d) * tw;
}

void main() {
  vec3 dir = normalize(vDir);
  float el = dir.y;

  vec3 zenith = vec3(0.015, 0.025, 0.09);
  vec3 mid = vec3(0.04, 0.06, 0.16);
  vec3 horizon = vec3(0.07, 0.1, 0.2);
  vec3 sky = mix(horizon, mid, smoothstep(-0.05, 0.35, el));
  sky = mix(sky, zenith, smoothstep(0.2, 0.92, el));

  float bandAngle = atan(dir.z, dir.x) + 0.45;
  float bandLat = el;
  float band = exp(-pow(bandLat - 0.38, 2.0) * 14.0);
  band *= exp(-pow(sin(bandAngle * 1.6) * 0.55, 2.0) * 2.5);
  vec2 mwUv = vec2(bandAngle * 2.2, bandLat * 5.0);
  float mw = fbm(mwUv * 3.5 + vec2(uTime * 0.008, 0.0));
  vec3 milky = vec3(0.62, 0.55, 0.95) * band * (0.28 + mw * 0.72);
  sky += milky * 0.85;

  float auroraH = smoothstep(-0.05, 0.22, el) * (1.0 - smoothstep(0.22, 0.48, el));
  float wave1 = sin(dir.x * 9.0 + uTime * 0.35) * 0.5 + 0.5;
  float wave2 = sin(dir.z * 7.0 - uTime * 0.28 + dir.x * 3.0) * 0.5 + 0.5;
  vec3 aurora = mix(vec3(0.15, 0.95, 0.55), vec3(0.55, 0.25, 0.95), wave1);
  aurora = mix(aurora, vec3(0.2, 0.7, 1.0), wave2 * 0.5);
  sky += aurora * auroraH * 0.32;

  float s1 = stars(dir, 95.0, 0.18);
  float s2 = stars(dir, 160.0, 0.12);
  float s3 = stars(dir, 240.0, 0.08);
  sky += vec3(0.92, 0.94, 1.0) * s1;
  sky += vec3(0.85, 0.88, 1.0) * s2 * 0.7;
  sky += vec3(0.75, 0.82, 1.0) * s3 * 0.45;

  gl_FragColor = vec4(sky, 1.0);
}
`;
