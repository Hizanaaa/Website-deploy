'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props { scrollPhase: number }

export default function GalaxyCanvas({ scrollPhase }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef(scrollPhase)
  const frameRef = useRef<number>(0)

  useEffect(() => { phaseRef.current = scrollPhase }, [scrollPhase])

  useEffect(() => {
    if (!mountRef.current) return

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x04030a, 1)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    renderer.domElement.id = 'galaxy-canvas'
    mountRef.current.appendChild(renderer.domElement)

    // ── Scene / Camera ──
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000)
    camera.position.set(0, 80, 220)
    camera.lookAt(0, 0, 0)

    // ── Galaxy params ──
    const COUNT = 120000
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    const phases = new Float32Array(COUNT)  // random phase offset per particle

    // Home positions for each scroll phase
    const home: Float32Array[] = Array.from({ length: 5 }, () => new Float32Array(COUNT * 3))

    const orange = new THREE.Color('#ff6b2b')
    const deepOrange = new THREE.Color('#e8430a')
    const blue = new THREE.Color('#3b9eff')
    const deepBlue = new THREE.Color('#0a5dcc')
    const white = new THREE.Color('#ffe8d6')
    const coldWhite = new THREE.Color('#c8d8ff')

    function lerp3(out: Float32Array, a: Float32Array, b: Float32Array, t: number, i3: number) {
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      out[i3]   = a[i3]   + (b[i3]   - a[i3])   * e
      out[i3+1] = a[i3+1] + (b[i3+1] - a[i3+1]) * e
      out[i3+2] = a[i3+2] + (b[i3+2] - a[i3+2]) * e
    }

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      const rand = Math.random
      phases[i] = rand() * Math.PI * 2
      sizes[i] = Math.random() * 2.5 + 0.5

      // ── Color assignment ──
      const t = i / COUNT
      let col: THREE.Color
      if (t < 0.38) {
        col = orange.clone().lerp(deepOrange, rand())
      } else if (t < 0.72) {
        col = blue.clone().lerp(deepBlue, rand())
      } else if (t < 0.88) {
        col = white.clone().lerp(orange, rand() * 0.4)
      } else {
        col = coldWhite.clone().lerp(blue, rand() * 0.5)
      }
      colors[i3] = col.r; colors[i3+1] = col.g; colors[i3+2] = col.b

      // ── Phase 0: Singularity — tight dense core ──
      const jitter0 = () => (rand() - 0.5) * 3
      home[0][i3]   = jitter0()
      home[0][i3+1] = jitter0()
      home[0][i3+2] = jitter0()

      // ── Phase 1: Big Bang — radial explosion ──
      const theta1 = rand() * Math.PI * 2
      const phi1   = Math.acos(2 * rand() - 1)
      const r1     = 40 + rand() * 280
      home[1][i3]   = r1 * Math.sin(phi1) * Math.cos(theta1)
      home[1][i3+1] = r1 * Math.cos(phi1) * 0.6
      home[1][i3+2] = r1 * Math.sin(phi1) * Math.sin(theta1)

      // ── Phase 2: Nebula drift — swirling clouds ──
      const theta2 = rand() * Math.PI * 2
      const r2 = 20 + rand() * 180
      const height2 = (rand() - 0.5) * 90
      const swirl2 = theta2 + r2 * 0.004
      home[2][i3]   = r2 * Math.cos(swirl2)
      home[2][i3+1] = height2
      home[2][i3+2] = r2 * Math.sin(swirl2)

      // ── Phase 3: Spiral arms forming ──
      const armCount = 4
      const arm3 = i % armCount
      const armAngle3 = (arm3 / armCount) * Math.PI * 2
      const t3 = (i / COUNT) * Math.PI * 3.5
      const r3 = 8 + t3 * 22
      const spread3 = (rand() - 0.5) * 24
      home[3][i3]   = Math.cos(t3 + armAngle3) * r3 + spread3
      home[3][i3+1] = (rand() - 0.5) * 14
      home[3][i3+2] = Math.sin(t3 + armAngle3) * r3 + spread3

      // ── Phase 4: Full galaxy — tight spiral + bulge + halo ──
      const armCount4 = 5
      const arm4 = i % armCount4
      const armAngle4 = (arm4 / armCount4) * Math.PI * 2
      const t4 = (i / COUNT) * Math.PI * 5.5
      const r4 = 4 + t4 * 16
      const spread4 = (rand() - 0.5) * 10 * Math.exp(-r4 / 80)
      const heightFalloff = Math.exp(-r4 / 60) * 12
      home[4][i3]   = Math.cos(t4 + armAngle4) * r4 + spread4
      home[4][i3+1] = (rand() - 0.5) * heightFalloff
      home[4][i3+2] = Math.sin(t4 + armAngle4) * r4 + spread4
    }

    // Init at phase 0
    for (let i = 0; i < COUNT * 3; i++) positions[i] = home[0][i]

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // ── Shader material ──
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vDist;
        uniform float uTime;
        uniform float uPhase;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vDist = length(mvPos.xyz);
          float flicker = 0.85 + 0.15 * sin(uTime * 2.5 + position.x * 3.7 + position.z * 2.1);
          float s = size * flicker;
          // boost core particles when in singularity
          if (uPhase < 0.5) s *= (1.0 + (0.5 - uPhase) * 3.0);
          gl_PointSize = s * uPixelRatio * (280.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vDist;
        uniform float uPhase;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;

          // soft glow disc
          float alpha = 1.0 - smoothstep(0.0, 0.5, d);
          alpha = pow(alpha, 1.4);

          // halo ring
          float halo = smoothstep(0.5, 0.3, d) * smoothstep(0.1, 0.25, d) * 0.35;
          alpha = max(alpha, halo);

          vec3 col = vColor;
          // brighten toward center
          col = mix(col * 1.8, col, smoothstep(0.0, 0.3, d));

          gl_FragColor = vec4(col, alpha * 0.88);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // ── Nebula fog volumes (instanced spheres with additive mat) ──
    const nebulaGeo = new THREE.SphereGeometry(1, 8, 8)
    const nebulaMat = new THREE.MeshBasicMaterial({
      color: 0x3b4fff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const nebulas: THREE.Mesh[] = []
    const nebulaData = [
      { pos: [60, 10, -30], col: 0x3b9eff, scale: 55 },
      { pos: [-70, -8, 20], col: 0xff6b2b, scale: 45 },
      { pos: [20, 15, 70], col: 0x9955ff, scale: 50 },
      { pos: [-30, -5, -80], col: 0xff4488, scale: 40 },
      { pos: [100, 5, 40], col: 0x00ccff, scale: 38 },
    ]
    nebulaData.forEach(n => {
      const mat = new THREE.MeshBasicMaterial({
        color: n.col, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const mesh = new THREE.Mesh(nebulaGeo, mat)
      mesh.position.set(n.pos[0], n.pos[1], n.pos[2])
      mesh.scale.setScalar(n.scale)
      scene.add(mesh)
      nebulas.push(mesh)
    })

    // ── Core glow sprite ──
    const coreGeo = new THREE.SphereGeometry(1, 16, 16)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffaa55,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    scene.add(core)

    // ── Stars background ──
    const starCount = 8000
    const starPos = new Float32Array(starCount * 3)
    const starSizes = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 400 + Math.random() * 600
      starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      starPos[i*3+1] = r * Math.cos(phi)
      starPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta)
      starSizes[i] = Math.random() * 1.2 + 0.3
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))
    const starMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          float twinkle = 0.6 + 0.4 * sin(uTime * 1.5 + position.x * 0.1 + position.y * 0.13);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * twinkle * uPixelRatio * (200.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), a * 0.7);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // ── Dust particles ──
    const dustCount = 30000
    const dustPos = new Float32Array(dustCount * 3)
    const dustColors = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * 200
      dustPos[i*3]   = Math.cos(theta) * r
      dustPos[i*3+1] = (Math.random() - 0.5) * 40
      dustPos[i*3+2] = Math.sin(theta) * r
      const c = Math.random() > 0.5
        ? new THREE.Color('#ff6b2b').lerp(new THREE.Color('#3b9eff'), Math.random())
        : new THREE.Color('#200a30')
      dustColors[i*3] = c.r; dustColors[i*3+1] = c.g; dustColors[i*3+2] = c.b
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3))
    const dustMat = new THREE.PointsMaterial({
      size: 0.6, vertexColors: true, transparent: true,
      opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const dust = new THREE.Points(dustGeo, dustMat)
    scene.add(dust)

    // ── Animation ──
    let time = 0
    const currentPos = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT * 3; i++) currentPos[i] = home[0][i]

    function animate() {
      frameRef.current = requestAnimationFrame(animate)
      time += 0.008
      const p = phaseRef.current

      // Update shader uniforms
      material.uniforms.uTime.value = time
      material.uniforms.uPhase.value = p
      starMat.uniforms.uTime.value = time

      // Interpolate particle positions
      const fl = Math.min(Math.floor(p), 3)
      const fr = Math.max(0, Math.min(p - fl, 1))
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3
        lerp3(currentPos, home[fl], home[Math.min(fl + 1, 4)], fr, i3)
      }
      geometry.attributes.position.array.set(currentPos)
      geometry.attributes.position.needsUpdate = true

      // Camera cinematic movement
      const camPhase = p / 4
      camera.position.x = Math.sin(time * 0.12) * 18
      camera.position.y = 80 - camPhase * 65 + Math.sin(time * 0.09) * 8
      camera.position.z = 220 - camPhase * 100
      camera.lookAt(0, 0, 0)

      // Galaxy rotation
      points.rotation.y = time * 0.018
      dust.rotation.y = time * 0.022

      // Core glow
      const coreScale = p < 0.5
        ? 18 + (0.5 - p) * 30 + Math.sin(time * 4) * 3
        : Math.max(0, 6 - p * 1.2)
      core.scale.setScalar(coreScale)
      coreMat.opacity = p < 1 ? 0.7 - p * 0.6 + Math.sin(time * 3) * 0.1 : 0

      // Nebula opacity — visible in drift and spiral phases
      const nebulaVis = p > 1.5 && p < 3.8
        ? Math.min((p - 1.5) / 0.8, 1) * Math.max(0, 1 - (p - 3) / 0.8) * 0.035
        : 0
      nebulas.forEach(n => { (n.material as THREE.MeshBasicMaterial).opacity = nebulaVis })

      // Dust visible in galaxy phase
      dustMat.opacity = p > 3 ? Math.min((p - 3) / 1, 1) * 0.55 : 0

      // Fog
      if (p > 2) {
        scene.fog = new THREE.FogExp2(0x04030a, 0.0015 + (p - 2) * 0.0005)
      } else {
        scene.fog = null
      }

      renderer.render(scene, camera)
    }
    animate()

    // Resize
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
}
