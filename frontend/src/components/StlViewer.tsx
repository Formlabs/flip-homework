"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getColorHex } from "@/lib/colors";

export type ModelDimensions = {
  width: number;
  height: number;
  depth: number;
};

type Props = {
  url: string;
  className?: string;
  height?: number;
  color?: string;
  onDimensionsCalculated?: (dimensions: ModelDimensions) => void;
};

export default function StlViewer({
  url,
  className,
  height = 360,
  color,
  onDimensionsCalculated,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [dimensions, setDimensions] = useState<ModelDimensions | null>(null);

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

    const gridHelper = new THREE.GridHelper(2, 20, 0x888888, 0xcccccc);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xf0f0f0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    scene.add(plane);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    let mesh: THREE.Mesh | null = null;
    const loader = new STLLoader();
    loader.load(
      url,
      (geometry: THREE.BufferGeometry) => {
        geometry.rotateX(-Math.PI / 2);
        
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshPhongMaterial({
          color: getColorHex(color),
          shininess: 30,
          specular: 0x222222,
        });
        mesh = new THREE.Mesh(geometry, material);

        const box = geometry.boundingBox!;
        const size = new THREE.Vector3();
        box.getSize(size);
        
        const dims: ModelDimensions = {
          width: Math.round(size.x * 10) / 10,
          height: Math.round(size.y * 10) / 10,
          depth: Math.round(size.z * 10) / 10,
        };
        
        setDimensions(dims);
        onDimensionsCalculated?.(dims);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 1 / maxDim;
        mesh.scale.setScalar(scale);

        const center = new THREE.Vector3();
        box.getCenter(center).multiplyScalar(scale);
        mesh.position.sub(center);

        scene.add(mesh);
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
      }
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [url, height, color, onDimensionsCalculated]);

  return (
    <div className="relative">
      <div ref={containerRef} className={className} style={{ height }} />
      {dimensions && (
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded text-xs font-mono space-y-0.5">
          <div className="flex gap-2">
            <span className="text-zinc-400">W:</span>
            <span className="font-semibold">{dimensions.width} mm</span>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-400">H:</span>
            <span className="font-semibold">{dimensions.height} mm</span>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-400">D:</span>
            <span className="font-semibold">{dimensions.depth} mm</span>
          </div>
        </div>
      )}
    </div>
  );
}
