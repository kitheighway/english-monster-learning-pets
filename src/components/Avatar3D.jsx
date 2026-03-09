// src/components/Avatar3D.jsx
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

const MODEL_URL = "/models/cactoro_blob_only_normalized.glb";

/**
 * Animation: one long clip split into three states (update later).
 */
const FPS = 30;
const RANGES = {
  idle: { start: 0, end: 60 }, // loop
  correct: { start: 60, end: 105 }, // one-shot
  feed: { start: 105, end: 165 }, // one-shot
};

/**
 * Camera framing knobs
 */
const CAMERA_FOV = 35;
const CAMERA_Z = 3.4; // ✅ slightly further so buddy isn't huge
const TARGET_Y_BIAS = 0.0;

/**
 * Model tuning
 */
const MODEL_SCALE = 1.35; // ✅ smaller so it fits frame
const MODEL_POS = [0, 0.0, 0];
const MODEL_ROT = [-Math.PI / 2, 0, 0]; // ✅ correct upright fix

/**
 * Wobble (yaw only)
 */
const YAW_WOBBLE = { amount: 0.08, speed: 0.8 };

export default function Avatar3D({ action = "idle" }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          position: [0, 0.55, CAMERA_Z],
          fov: CAMERA_FOV,
          near: 0.01,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.physicallyCorrectLights = true;
        }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[2, 4, 3]} intensity={1.25} />
        <directionalLight position={[-3, 2, 4]} intensity={0.9} />

        <Suspense fallback={<Loader />}>
          <Buddy action={action} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Loader() {
  return (
    <Html center>
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "3px solid #000",
          background: "#fff",
          fontWeight: 900,
        }}
      >
        Loading…
      </div>
    </Html>
  );
}

function Buddy({ action }) {
  const gltf = useGLTF(MODEL_URL);
  const scene = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);

  const { camera } = useThree();
  const controlsRef = useRef(null);
  const groupRef = useRef(null);

  const { mixer, clips } = useAnimations(gltf.animations, scene);

  const [target, setTarget] = useState(() => new THREE.Vector3(0, 0.55, 0));

  // Apply model transforms
  useEffect(() => {
    if (!scene) return;

    scene.scale.setScalar(MODEL_SCALE);
    scene.position.set(MODEL_POS[0], MODEL_POS[1], MODEL_POS[2]);
    scene.rotation.set(MODEL_ROT[0], MODEL_ROT[1], MODEL_ROT[2]);
    scene.updateMatrixWorld(true);

    // Compute bounds-based target
    const box = new THREE.Box3().setFromObject(scene);
    const c = box.getCenter(new THREE.Vector3());
    const s = box.getSize(new THREE.Vector3());

    const t = new THREE.Vector3(c.x, c.y + s.y * TARGET_Y_BIAS, c.z);
    setTarget(t);

    // Move camera to a level view at the same Y as target
    camera.position.set(0, t.y, CAMERA_Z);
    camera.up.set(0, 1, 0);
    camera.lookAt(t);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.copy(t);
      controlsRef.current.update();
    }
  }, [scene, camera]);

  // Keep camera + controls locked if target updates
  useEffect(() => {
    if (!target) return;

    camera.position.set(0, target.y, CAMERA_Z);
    camera.lookAt(target);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }
  }, [target, camera]);

  // Subclips from first clip
  const subclips = useMemo(() => {
    const base = clips?.[0];
    if (!base) return null;

    const make = (name) => {
      const r = RANGES[name];
      if (!r) return null;
      return THREE.AnimationUtils.subclip(
        base,
        name,
        Math.floor(r.start),
        Math.floor(r.end),
        FPS
      );
    };

    return {
      idle: make("idle"),
      correct: make("correct"),
      feed: make("feed"),
    };
  }, [clips]);

  // Play action
  useEffect(() => {
    if (!mixer || !subclips) return;

    mixer.stopAllAction();

    const clip = subclips[action] || subclips.idle;
    if (!clip) return;

    const a = mixer.clipAction(clip);

    if (action === "idle") {
      a.setLoop(THREE.LoopRepeat, Infinity);
      a.clampWhenFinished = false;
    } else {
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;

      const onFinished = (e) => {
        if (e.action !== a) return;

        const idleClip = subclips.idle;
        if (!idleClip) return;

        const idleA = mixer.clipAction(idleClip);
        idleA.reset();
        idleA.setLoop(THREE.LoopRepeat, Infinity);
        idleA.fadeIn(0.12).play();

        mixer.removeEventListener("finished", onFinished);
      };

      mixer.addEventListener("finished", onFinished);
    }

    a.reset();
    a.fadeIn(0.12).play();
  }, [action, mixer, subclips]);

  // Update mixer + yaw-only wobble
  useFrame((state, dt) => {
    if (mixer) mixer.update(Math.min(0.05, dt));

    const g = groupRef.current;
    if (!g) return;

    const t = state.clock.getElapsedTime();
    g.rotation.y = Math.sin(t * YAW_WOBBLE.speed) * YAW_WOBBLE.amount;

    // keep axes clean
    g.rotation.x = 0;
    g.rotation.z = 0;
  });

  return (
    <>
      {/* ✅ fully locked: no zoom / no rotate / no pan */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        minDistance={CAMERA_Z}
        maxDistance={CAMERA_Z}
      />

      <group ref={groupRef}>
        <primitive object={scene} />
      </group>
    </>
  );
}

useGLTF.preload(MODEL_URL);
