import { useEffect, useRef } from 'react'
import './BackgroundCanvas.css'

/**
 * Animated starfield + floating orb background using Canvas.
 * Fully CSS-positioned behind all content.
 */
export default function BackgroundCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let width, height

    // Particles
    const PARTICLE_COUNT = 80
    const particles = []

    function resize() {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    function initParticles() {
      particles.length = 0
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.2 + 0.2,
          opacity: Math.random() * 0.35 + 0.06,
          speed: Math.random() * 0.15 + 0.04,
          dx: (Math.random() - 0.5) * 0.2,
          dy: -(Math.random() * 0.2 + 0.04),
          hue: 215,  // consistent soft blue
        })
      }
    }

    // Floating orbs
    const orbs = [
      { x: 0.15, y: 0.35, r: 260, color: 'rgba(59,100,200,0.055)' },
      { x: 0.82, y: 0.15, r: 200, color: 'rgba(59,100,200,0.04)' },
      { x: 0.65, y: 0.72, r: 300, color: 'rgba(40,80,180,0.045)' },
    ]

    let tick = 0

    function draw() {
      ctx.clearRect(0, 0, width, height)

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#020818')
      grad.addColorStop(0.5, '#040f2a')
      grad.addColorStop(1, '#020d20')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Floating orbs
      orbs.forEach((orb) => {
        const ox = orb.x * width + Math.sin(tick * 0.0008 + orb.x * 10) * 30
        const oy = orb.y * height + Math.cos(tick * 0.0006 + orb.y * 10) * 20
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r)
        g.addColorStop(0, orb.color)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(ox, oy, orb.r, 0, Math.PI * 2)
        ctx.fill()
      })


      // Particles
      particles.forEach((p) => {
        p.x += p.dx
        p.y += p.dy
        if (p.y < -5) { p.y = height + 5; p.x = Math.random() * width }
        if (p.x < -5) p.x = width + 5
        if (p.x > width + 5) p.x = -5

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`
        ctx.fill()
      })

      tick++
      animId = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    draw()

    window.addEventListener('resize', () => { resize(); initParticles() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />
}
