import { useCursor, useTexture } from "@react-three/drei"; // Utility hooks for cursor and texture handling
import { useFrame } from "@react-three/fiber"; // Hook for per-frame updates in Three.js
import { useAtom } from "jotai"; // State management using Jotai atoms
import { easing } from "maath"; // Easing functions for smooth transitions
import { useEffect, useMemo, useRef, useState } from "react"; // React hooks for component lifecycle and state
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three"; // Three.js classes for 3D objects and materials
import { degToRad } from "three/src/math/MathUtils.js"; // Utility for converting degrees to radians
import { pageAtom, pages } from "./UI"; // Import shared state and page data from UI component

// Constants for geometry and animation parameters
const easingFactor = 0.5; // Controls general easing for animations
const easingFactorFold = 0.3; // Controls easing for page folding
const insideCurveStrength = 0.18; // Strength of inside curve while turning a page
const outsideCurveStrength = 0.05; // Strength of outside curve
const turningCurveStrength = 0.09; // Strength of the curve during page turn

const PAGE_WIDTH = 1.28; // Width of a single page
const PAGE_HEIGHT = 1.71; // Height of a single page (4:3 aspect ratio)
const PAGE_DEPTH = 0.003; // Depth of a single page
const PAGE_SEGMENTS = 30; // Number of segments for page geometry
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS; // Width of each segment

// Create a box geometry for the pages
const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0); // Adjust position so that pages rotate correctly

// Skinning attributes for smooth page animations
const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  // Process each vertex to assign skinning weights
  vertex.fromBufferAttribute(position, i); // Get vertex position
  const x = vertex.x;

  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH)); // Determine bone index
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH; // Calculate weight for smooth transitions

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0); // Assign bone indexes
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0); // Assign weights
}

// Apply skin attributes to the geometry
pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

// Material colors for pages
const whiteColor = new Color("white");
const emissiveColor = new Color("purple");

// Page materials
const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor, // Default white material
  }),
  new MeshStandardMaterial({
    color: "#111", // Dark material for page sides
  }),
  new MeshStandardMaterial({
    color: whiteColor, // Back page material
  }),
  new MeshStandardMaterial({
    color: whiteColor, // Front page material
  }),
];

// Preload textures for pages
pages.forEach((page) => {
  useTexture.preload(`/textures/${page.front}.jpg`);
  useTexture.preload(`/textures/${page.back}.jpg`);
  useTexture.preload(`/textures/book-cover-roughness2.png`);
});

// Page component representing an individual page in the book
const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  // Load textures for front and back of the page
  const [picture, picture2, pictureRoughness] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    ...(number === 0 || number === pages.length - 1
      ? [`/textures/book-cover-roughness2.png`]
      : []),
  ]);

  picture.colorSpace = picture2.colorSpace = SRGBColorSpace; // Use correct color space for rendering

  const group = useRef(); // Group reference for the page
  const turnedAt = useRef(0); // Time when the page was last turned
  const lastOpened = useRef(opened); // Track the open/close state of the page

  const skinnedMeshRef = useRef(); // Reference for the skinned mesh

  // Create a custom skinned mesh with skeleton
  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0; // Root bone at origin
      } else {
        bone.position.x = SEGMENT_WIDTH; // Subsequent bones positioned based on segment width
      }
      if (i > 0) {
        bones[i - 1].add(bone); // Link bones in a hierarchy
      }
    }
    const skeleton = new Skeleton(bones); // Create skeleton from bones

    // Define materials for the page
    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture, // Front page texture
        ...(number === 0
          ? {
              roughnessMap: pictureRoughness, // Roughness texture for cover page
            }
          : {
              roughness: 0.1,
            }),
        emissive: emissiveColor,
        emissiveIntensity: 0, // Emissive lighting
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2, // Back page texture
        ...(number === pages.length - 1
          ? {
              roughnessMap: pictureRoughness, // Roughness texture for back cover
            }
          : {
              roughness: 0.1,
            }),
        emissive: emissiveColor,
        emissiveIntensity: 0, // Emissive lighting
      }),
    ];

    // Create skinned mesh
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true; // Enable shadow casting
    mesh.receiveShadow = true; // Enable shadow receiving
    mesh.frustumCulled = false; // Avoid culling for better visibility
    mesh.add(skeleton.bones[0]); // Attach skeleton to mesh
    mesh.bind(skeleton); // Bind skeleton to mesh
    return mesh;
  }, []);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    const emissiveIntensity = highlighted ? 0.22 : 0;
    skinnedMeshRef.current.material[4].emissiveIntensity =
      skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
        skinnedMeshRef.current.material[4].emissiveIntensity,
        emissiveIntensity,
        0.1
      );

    // Handle page turning logic and animations
  });

  const [_, setPage] = useAtom(pageAtom); // Atom for managing page state
  const [highlighted, setHighlighted] = useState(false); // Highlight state for interaction
  useCursor(highlighted); // Change cursor when interacting with the page

  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true); // Highlight page on hover
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false); // Remove highlight on hover leave
      }}
      onClick={(e) => {
        e.stopPropagation();
        setPage(opened ? number : number + 1); // Navigate to the next or previous page
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

// Book component representing the entire book
export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom); // Current page state
  const [delayedPage, setDelayedPage] = useState(page); // Delayed page state for smooth transitions

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) return delayedPage;
        timeout = setTimeout(goToPage, Math.abs(page - delayedPage) > 2 ? 50 : 150);
        return page > delayedPage ? delayedPage + 1 : delayedPage - 1;
      });
    };
    goToPage();
    return () => clearTimeout(timeout); // Cleanup timeout
  }, [page]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {[...pages].map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          {...pageData}
        />
      ))}
    </group>
  );
};
