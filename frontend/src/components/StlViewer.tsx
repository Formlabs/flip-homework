"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Props = {
  url: string;
  color?: string;
  className?: string;
  height?: number;
};

export default function StlViewer({
  url,
  className,
  color = "gray",
  height = 360,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const width = container.clientWidth || 600;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2, 2, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    let mesh: THREE.Mesh | null = null;
    let plane: THREE.GridHelper | undefined;
    const loader = new STLLoader();
    loader.load(
      url,
      (geometry: THREE.BufferGeometry) => {
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
        const material = new THREE.MeshPhongMaterial({ color });
        mesh = new THREE.Mesh(geometry, material);

        // Center & scale to fit view
        const boundingBoxSize = getBoundingBoxSize(geometry);
        const scale = getScale(boundingBoxSize);
        mesh.scale.setScalar(scale);

        const center = new THREE.Vector3();
        geometry.boundingBox!.getCenter(center).multiplyScalar(scale);
        mesh.position.sub(center);

        scene.add(mesh);
        plane = getPlane(boundingBoxSize, scale);
        scene.add(plane);
        controls.update();
        animate();
      },
      undefined,
      (err: unknown) => {
        console.error("Failed to load STL", err);
      }
    );

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    const onResize = () => {
      const w = container.clientWidth || width;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      if (mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        plane!.dispose();
      }
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [url, height, color]);

  return <div ref={containerRef} className={className} style={{ height }} />;
}

function getBoundingBoxSize(geometry: THREE.BufferGeometry): THREE.Vector3 {
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  return size;
}

function getScale(size: THREE.Vector3): number {
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  return 1 / maxDim;
}

function getPlane(size: THREE.Vector3, scale: number): THREE.GridHelper {
  const gridHelper = new THREE.GridHelper();
  gridHelper.position.y = -(size.y * 0.5 * scale);
  return gridHelper;
}
