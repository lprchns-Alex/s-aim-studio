/* S—AIM / liquid studies. Decorative, dependency-free, and motion-aware. */
(() => {
  'use strict';

  const VERTEX = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * .5 + .5;
      gl_Position = vec4(aPosition, 0., 1.);
    }
  `;

  const FRAGMENT = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uTime;

    mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c,-s,s,c); }
    float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7))) * 43758.5453); }

    // A thin swept ribbon: an elliptical orbit whose cross-section slowly twists.
    float ribbon(vec3 p, float radius, float width, float phase) {
      float angle = atan(p.y, p.x);
      float orbit = radius + .12*sin(angle*3.+phase) + .055*cos(angle*5.-phase);
      vec2 q = vec2(length(p.xy)-orbit, p.z);
      q = rot(angle*.5 + .42*sin(angle+phase) + phase*.3) * q;
      q.y += .052*sin(q.x*8.)*cos(angle*2.+phase);
      vec2 b = abs(q) - vec2(width,.022);
      return length(max(b,0.)) + min(max(b.x,b.y),0.) - .018;
    }

    vec3 objectSpace(vec3 p) {
      p -= vec3(.96,.40,0.);
      p.xz = rot(-.41 + .075*sin(uTime*.12) + uPointer.x*.08) * p.xz;
      p.yz = rot(.60 + .065*cos(uTime*.15) + uPointer.y*.06) * p.yz;
      p.xy = rot(-.31 + .045*sin(uTime*.10)) * p.xy;
      return p;
    }

    float scene(vec3 p) {
      p = objectSpace(p);
      float phase = .68 + .13*sin(uTime*.16);
      float a = ribbon(p,1.71,.52,phase);
      vec3 q = p;
      q.z += .23;
      q.xy = rot(.11) * q.xy;
      float b = ribbon(q,1.24,.20,phase+1.15);
      q = p;
      q.z -= .11;
      q.yz = rot(.08) * q.yz;
      float c = ribbon(q,2.14,.18,phase-.72);
      return min(a,min(b,c));
    }

    vec3 normalAt(vec3 p) {
      const vec2 e = vec2(.0017,0.);
      return normalize(vec3(
        scene(p+e.xyy)-scene(p-e.xyy),
        scene(p+e.yxy)-scene(p-e.yxy),
        scene(p+e.yyx)-scene(p-e.yyx)
      ));
    }

    // Long studio lights produce the characteristic folded, liquid-metal reflections.
    vec3 studio(vec3 r) {
      vec3 c = mix(vec3(.025,.035,.039),vec3(.21,.29,.35),smoothstep(-.65,.95,r.y));
      float broad = pow(max(0.,dot(r,normalize(vec3(-.5,.9,1.1)))),9.);
      float strip = exp(-pow((r.x+.20+r.y*.32)*12.,2.)) * smoothstep(-.25,.5,r.y);
      float white = exp(-pow((r.y-.43+r.x*.28)*19.,2.)) * smoothstep(-.9,.45,r.z);
      float blue = pow(max(0.,dot(r,normalize(vec3(1.2,.25,.35)))),12.);
      c += vec3(.66,.77,.81)*broad;
      c += vec3(1.14,1.18,1.14)*strip;
      c += vec3(.74,.85,.91)*white;
      c += vec3(.06,.17,.26)*blue;
      return c;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - uResolution*.5) / uResolution.y;
      vec3 bg = vec3(.080,.094,.085);
      float halo = exp(-length((uv-vec2(.45,.19))*vec2(.9,1.25))*1.5);
      bg += vec3(.025,.031,.028)*halo;
      bg *= 1.-.19*smoothstep(.3,1.15,length(uv));

      vec3 ro = vec3(0.,0.,6.8);
      vec3 rd = normalize(vec3(uv*2.9,-4.7));
      ro.xy += uPointer*vec2(.065,.045);
      vec3 boundsOrigin = ro - vec3(.96,.40,0.);
      float projected = dot(boundsOrigin,rd);
      float discriminant = projected*projected-dot(boundsOrigin,boundsOrigin)+7.29;
      float travel = max(2.4,-projected-sqrt(max(0.,discriminant)));
      float d = 1.;
      bool hit = false;
      for (int i = 0; i < 78; i++) {
        if (discriminant < 0.) break;
        vec3 p = ro + rd*travel;
        d = scene(p);
        if (d < .0024) { hit = true; break; }
        travel += max(d*.69,.003);
        if (travel > 10.) break;
      }

      vec3 color = bg;
      if (hit) {
        vec3 p = ro + rd*travel;
        vec3 n = normalAt(p);
        vec3 local = objectSpace(p);
        float angle = atan(local.y,local.x);
        float brushing = sin(length(local.xy)*410.+angle*7.) * .012;
        n = normalize(n + brushing*vec3(.3,.5,.17));
        vec3 reflection = reflect(rd,n);
        float fresnel = pow(1.-max(0.,dot(-rd,n)),3.);
        float key = max(0.,dot(n,normalize(vec3(-.7,1.,1.4))));
        float occlusion = clamp(scene(p+n*.18)/.18,.18,1.);
        color = studio(reflection) * mix(.72,1.04,fresnel);
        color += vec3(.075,.095,.102)*key;
        color *= mix(.48,1.,occlusion);
        color += vec3(.18,.23,.24)*pow(1.-abs(dot(n,-rd)),5.);
        color = color / (color*.48 + vec3(.82));
        color = mix(bg,color,1.-smoothstep(5.7,10.,travel));
      }

      // The sculpture recedes behind the oversized title without a hard gradient edge.
      float textShade = (1.-smoothstep(.05,.68,vUv.x)) * (1.-smoothstep(.12,.65,vUv.y));
      color = mix(color,bg*.82,textShade*.77);
      color += (hash(gl_FragCoord.xy + floor(uTime*8.))-.5)*.014;
      gl_FragColor = vec4(max(color,0.),1.);
    }
  `;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function makeWebGL(canvas) {
    const gl = canvas.getContext('webgl', {
      alpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: 'low-power', preserveDrawingBuffer: false,
    });
    if (!gl) return null;
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vertex || !fragment) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, 'uResolution');
    const pointer = gl.getUniformLocation(program, 'uPointer');
    const time = gl.getUniformLocation(program, 'uTime');
    return (seconds, x, y) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointer, x, y);
      gl.uniform1f(time, seconds);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
  }

  function makeFallback(canvas) {
    // A separate canvas is required after a browser has allocated a WebGL context.
    let context = null;
    try { context = canvas.getContext('2d', { alpha: false }); } catch (_) { /* use a fresh surface */ }
    if (!context) {
      const replacement = canvas.cloneNode(false);
      canvas.replaceWith(replacement);
      canvas = replacement;
      context = canvas.getContext('2d', { alpha: false });
    }
    if (!context) return { canvas, draw: () => {} };
    const draw = (seconds, pointerX, pointerY) => {
      const w = canvas.width, h = canvas.height;
      context.fillStyle = '#1b1e1b';
      context.fillRect(0, 0, w, h);
      context.save();
      context.translate(w*.69 + pointerX*h*.018, h*.40 + pointerY*h*.016);
      context.rotate(-.22 + Math.sin(seconds*.12)*.025);
      const size = h*.33;
      // Closely spaced contours preserve the brushed-metal character on older GPUs.
      for (let line = 0; line < 72; line++) {
        const radius = size*(.73 + line*.008);
        const gradient = context.createLinearGradient(-size,-size,size,size);
        gradient.addColorStop(0, '#243b45');
        gradient.addColorStop(.22, '#829da6');
        gradient.addColorStop(.35, '#ccd4d0');
        gradient.addColorStop(.41, '#4d626d');
        gradient.addColorStop(.66, '#182a32');
        gradient.addColorStop(.83, '#a3b5b8');
        gradient.addColorStop(1, '#263b43');
        context.strokeStyle = gradient;
        context.lineWidth = Math.max(1, h*.0019);
        context.beginPath();
        for (let step = 0; step <= 160; step++) {
          const angle = step / 160 * Math.PI*2;
          const bend = Math.sin(angle*3 + seconds*.08) * size*.11;
          const x = Math.cos(angle)*(radius+bend)*1.38;
          const y = Math.sin(angle)*(radius+bend)*.91 + Math.sin(angle*2)*line*h*.0007;
          if (step) context.lineTo(x, y); else context.moveTo(x, y);
        }
        context.closePath();
        context.stroke();
      }
      context.restore();
      const shade = context.createLinearGradient(0,h,w*.7,h*.1);
      shade.addColorStop(0, '#1b1e1b');
      shade.addColorStop(.65, '#1b1e1b88');
      shade.addColorStop(1, '#1b1e1b00');
      context.fillStyle = shade;
      context.fillRect(0,0,w,h);
    };
    return { canvas, draw };
  }

  function init(originalCanvas) {
    if (originalCanvas.dataset.motionReady) return;
    let canvas = originalCanvas;
    let draw = null;
    try { draw = makeWebGL(canvas); } catch (_) { /* use the 2D rendering path */ }
    if (!draw) ({ canvas, draw } = makeFallback(canvas));
    canvas.dataset.motionReady = 'true';
    canvas.setAttribute('aria-hidden', 'true');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    let visible = true, paused = false, contextAvailable = true, raf = 0, last = 0, elapsed = 0;
    let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
    const frameInterval = 1000 / (mobile ? 24 : 30);

    const canAnimate = () => contextAvailable && visible && !document.hidden && !paused && !reducedMotion.matches;
    const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; };
    const render = () => draw(elapsed, pointerX, pointerY);
    const tick = (now) => {
      raf = 0;
      if (!canAnimate()) { last = 0; return; }
      if (!last) last = now - frameInterval;
      const delta = now - last;
      if (delta >= frameInterval - 1) {
        elapsed += Math.min(delta, 80) / 1000;
        last = now - (delta % frameInterval);
        pointerX += (targetX-pointerX)*.035;
        pointerY += (targetY-pointerY)*.035;
        render();
      }
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (!canAnimate()) { stop(); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const budget = mobile ? 900000 : 2000000;
      const scale = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5,
        Math.sqrt(budget / (bounds.width*bounds.height)));
      const width = Math.max(1, Math.round(bounds.width*scale));
      const height = Math.max(1, Math.round(bounds.height*scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        render();
      }
    };

    const region = canvas.parentElement;
    region?.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = region.getBoundingClientRect();
      targetX = ((event.clientX-bounds.left)/bounds.width-.5)*2;
      targetY = -((event.clientY-bounds.top)/bounds.height-.5)*2;
    }, { passive: true });
    region?.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; }, { passive: true });
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('studio:motion', (event) => {
      if (typeof event.detail?.paused === 'boolean') paused = event.detail.paused;
      sync();
    });
    const preferenceChanged = () => {
      if (reducedMotion.matches) { pointerX = 0; pointerY = 0; render(); }
      sync();
    };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', preferenceChanged);
    else reducedMotion.addListener(preferenceChanged);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      }, { rootMargin: '80px' });
      observer.observe(canvas);
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      contextAvailable = false;
      stop();
    });
    canvas.addEventListener('webglcontextrestored', () => {
      const restored = makeWebGL(canvas);
      if (restored) { draw = restored; contextAvailable = true; render(); sync(); }
    });
    resize();
    render();
    sync();
  }

  const boot = () => document.querySelectorAll('canvas[data-hero-canvas]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
