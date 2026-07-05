import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import { createMoonPhaseTexture, getMoonPhase } from "@/lib/garden3d/moon-phase";
import {
  MOON_POSITION,
  NIGHT_SKY_FRAGMENT,
  NIGHT_SKY_VERTEX,
} from "@/lib/garden3d/night-sky-shaders";

function NightSkyDome({ lite = false }: { lite?: boolean }) {
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: NIGHT_SKY_VERTEX,
      fragmentShader: NIGHT_SKY_FRAGMENT,
    });
    return mat;
  }, []);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[180, lite ? 32 : 64, lite ? 24 : 48]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function StarLayers({ lite = false, reduced = false }: { lite?: boolean; reduced?: boolean }) {
  if (lite || reduced) {
    return (
      <Stars radius={120} depth={70} count={1800} factor={4} saturation={0.3} fade speed={0.25} />
    );
  }
  return (
    <>
      <Stars radius={160} depth={90} count={5500} factor={3.2} saturation={0.2} fade speed={0.35} />
      <Stars radius={90} depth={50} count={900} factor={5.5} saturation={0.45} fade speed={0.18} />
      <Stars radius={45} depth={25} count={320} factor={9} saturation={0.75} fade speed={0.08} />
    </>
  );
}

function SkySparkles() {
  return (
    <>
      <Sparkles
        count={140}
        scale={[70, 35, 55]}
        position={[0, 18, -22]}
        size={2.2}
        speed={0.18}
        opacity={0.55}
        color="#c8dcff"
        noise={1.5}
      />
      <Sparkles
        count={80}
        scale={[50, 22, 40]}
        position={[-8, 12, -18]}
        size={3}
        speed={0.12}
        opacity={0.35}
        color="#88ffcc"
        noise={2}
      />
      <Sparkles
        count={60}
        scale={[45, 20, 38]}
        position={[12, 14, -16]}
        size={2.5}
        speed={0.15}
        opacity={0.3}
        color="#c8a8ff"
        noise={1.8}
      />
    </>
  );
}

type Star = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
};

function ShootingStars({ pool = 8 }: { pool?: number }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const stars = useMemo(() => {
    const arr: Star[] = [];
    for (let i = 0; i < pool; i++) {
      arr.push({ pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: 0, maxLife: 0, active: false });
    }
    return arr;
  }, [pool]);

  const spawn = (s: Star) => {
    s.pos.set((Math.random() - 0.5) * 55, 16 + Math.random() * 20, -18 - Math.random() * 28);
    const speed = 20 + Math.random() * 26;
    s.vel.set(-0.65 - Math.random() * 0.45, -0.2 - Math.random() * 0.3, 0.12 + Math.random() * 0.18)
      .normalize()
      .multiplyScalar(speed);
    s.maxLife = 0.5 + Math.random() * 0.5;
    s.life = s.maxLife;
    s.active = true;
  };

  useFrame((_, delta) => {
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const g = refs.current[i];
      if (!s.active) {
        if (g) g.visible = false;
        if (Math.random() < 0.018) spawn(s);
        continue;
      }
      s.life -= delta;
      s.pos.addScaledVector(s.vel, delta);
      if (s.life <= 0) {
        s.active = false;
        if (g) g.visible = false;
        continue;
      }
      if (!g) continue;
      g.visible = true;
      const fade = s.life / s.maxLife;
      const dir = s.vel.clone().normalize();
      g.position.copy(s.pos);
      const head = g.children[0] as THREE.Mesh;
      const trail = g.children[1] as THREE.Mesh;
      trail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      trail.position.set(-dir.x * 1.1, -dir.y * 1.1, -dir.z * 1.1);
      trail.scale.set(0.04, 2.2 * fade, 0.04);
      (head.material as THREE.MeshBasicMaterial).opacity = fade;
      (trail.material as THREE.MeshBasicMaterial).opacity = fade * 0.85;
    }
  });

  return (
    <>
      {stars.map((_, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
          <mesh>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[1, 0.12, 1, 6, 1, true]} />
            <meshBasicMaterial
              color="#d0ecff"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Billboard moon with real lunar phase — always faces the camera. */
export function PhasedMoon({ lite = false }: { lite?: boolean }) {
  const glow = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => getMoonPhase(), []);
  const texture = useMemo(() => {
    const canvas = createMoonPhaseTexture(phase);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [phase]);

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 0.35) * 0.05;
    if (glow.current) glow.current.scale.setScalar(4.2 * pulse);
    if (!lite && halo.current) {
      (halo.current.material as THREE.MeshBasicMaterial).opacity =
        0.14 + Math.sin(clock.elapsedTime * 0.5) * 0.04;
    }
  });

  return (
    <>
      {!lite && (
        <pointLight position={MOON_POSITION} intensity={0.45} color="#d0e4ff" distance={60} decay={2} />
      )}
      <Billboard position={MOON_POSITION} follow lockX={false} lockY={false} lockZ={false} renderOrder={1000}>
        {!lite && (
          <mesh ref={halo} scale={6.5}>
            <circleGeometry args={[1, 48]} />
            <meshBasicMaterial
              color="#8090ff"
              transparent
              opacity={0.16}
              depthWrite={false}
              fog={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
        <mesh ref={glow} scale={4.2}>
          <circleGeometry args={[1, 48]} />
          <meshBasicMaterial
            color="#b8d0ff"
            transparent
            opacity={0.32}
            depthWrite={false}
            fog={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh scale={3.4} renderOrder={1001}>
          <circleGeometry args={[1, 64]} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} fog={false} />
        </mesh>
      </Billboard>
    </>
  );
}

export function NightSkyEffects({ lite = false, reduced = false }: { lite?: boolean; reduced?: boolean }) {
  return (
    <>
      <NightSkyDome lite={lite || reduced} />
      <StarLayers lite={lite} reduced={reduced} />
      {!lite && !reduced && <SkySparkles />}
      <PhasedMoon lite={lite || reduced} />
      {!lite && !reduced && <ShootingStars pool={6} />}
    </>
  );
}

/** Visible sun disc in daytime sky. */
export function DaySun({ position }: { position: [number, number, number] }) {
  const pulse = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (pulse.current) pulse.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.8) * 0.04);
  });

  return (
    <Billboard position={position} renderOrder={1000}>
      <mesh ref={pulse} scale={5.5}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial
          color="#ffe066"
          transparent
          opacity={0.4}
          depthWrite={false}
          fog={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={3.8} renderOrder={1001}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color="#fff8e1" toneMapped={false} depthWrite={false} fog={false} />
      </mesh>
      <mesh scale={2.8} renderOrder={1002}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color="#ffd54f" toneMapped={false} depthWrite={false} fog={false} />
      </mesh>
    </Billboard>
  );
}
