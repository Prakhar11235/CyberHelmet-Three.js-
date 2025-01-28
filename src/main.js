import './style.css';
import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';

const scroll = new LocomotiveScroll();

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight,0.1,100);
camera.position.z=5;


new RGBELoader()
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) { 
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    
  });


let model;
const loader = new GLTFLoader();
loader.load(
  './public/DamagedHelmet.gltf', 
  function (gltf) {
    model=gltf.scene;
    scene.add(model);
    
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error('An error occurred loading the model:', error);
  }
);

const renderer=new THREE.WebGLRenderer({
  canvas:document.querySelector('#draw'),
  antialias:true,
  alpha:true, // Makes the renderer background transparent, allowing HTML elements behind the canvas to be visible
});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Post processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0030;
composer.addPass(rgbShiftPass);



window.addEventListener('resize',()=>{
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

window.addEventListener('mousemove',(e)=>{
  const rotationX=(e.clientX/window.innerWidth-0.5)*(Math.PI*0.12);
  const rotationY=(e.clientY/window.innerHeight-0.5)*(Math.PI*0.12);
  gsap.to(model.rotation, {
    x: rotationY,
    y: rotationX,
    duration: 0.9,
    ease: "power2.out"
  });
});

function animate() {
  requestAnimationFrame(animate);
  
  composer.render();
}
animate();