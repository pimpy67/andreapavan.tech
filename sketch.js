// Stile ispirato a Keita Yamada (p5aholic.me)
// Forme organiche fluide con movimento ipnotico

let shapes = [];
let numShapes = 12;
let time = 0;
let dark = true;
let mouseInfluence = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };
function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent("sketch");
  pixelDensity(Math.min(2, window.devicePixelRatio));

  colorMode(HSB, 360, 100, 100, 100);

  for (let i = 0; i < numShapes; i++) {
    shapes.push({
      x: random(width),
      y: random(height),
      baseSize: random(150, 400),
      noiseOffset: random(1000),
      speedMult: random(0.3, 1),
      hue: random(200, 280), // blu-viola
      rotationOffset: random(TWO_PI)
    });
  }

  targetMouse.x = width / 2;
  targetMouse.y = height / 2;
  mouseInfluence.x = width / 2;
  mouseInfluence.y = height / 2;
}

function draw() {
  // sfondo con leggera trasparenza per trail sottile
  background(dark ? 0 : 0, dark ? 0 : 0, dark ? 5 : 97, 15);

  // smooth mouse follow
  mouseInfluence.x = lerp(mouseInfluence.x, targetMouse.x, 0.05);
  mouseInfluence.y = lerp(mouseInfluence.y, targetMouse.y, 0.05);

  noFill();

  for (let s of shapes) {
    push();

    // movimento organico basato su noise
    let noiseX = noise(s.noiseOffset + time * 0.2 * s.speedMult) * width;
    let noiseY = noise(s.noiseOffset + 500 + time * 0.15 * s.speedMult) * height;

    // influenza del mouse
    let mx = map(mouseInfluence.x, 0, width, -100, 100);
    let my = map(mouseInfluence.y, 0, height, -100, 100);

    let posX = noiseX + mx * 0.3;
    let posY = noiseY + my * 0.3;

    translate(posX, posY);
    rotate(time * 0.1 * s.speedMult + s.rotationOffset);

    // forma blob organica
    let points = 80;
    let baseRadius = s.baseSize * (0.8 + 0.2 * sin(time * s.speedMult));

    // più livelli per profondità
    for (let layer = 3; layer >= 0; layer--) {
      let layerSize = baseRadius * (1 + layer * 0.15);
      let alpha = map(layer, 0, 3, 40, 8);
      let strokeW = map(layer, 0, 3, 1.5, 0.5);

      stroke(s.hue, dark ? 60 : 30, dark ? 80 : 40, alpha);
      strokeWeight(strokeW);

      beginShape();
      for (let i = 0; i <= points; i++) {
        let angle = map(i, 0, points, 0, TWO_PI);

        // deformazione organica multi-frequenza
        let n1 = noise(
          cos(angle) * 2 + s.noiseOffset,
          sin(angle) * 2 + s.noiseOffset,
          time * 0.3 * s.speedMult
        );
        let n2 = noise(
          cos(angle * 3) + s.noiseOffset + 100,
          sin(angle * 3) + s.noiseOffset + 100,
          time * 0.5 * s.speedMult
        );

        let r = layerSize * (0.5 + n1 * 0.4 + n2 * 0.2);

        let x = cos(angle) * r;
        let y = sin(angle) * r;

        curveVertex(x, y);
      }
      endShape(CLOSE);
    }

    pop();
  }

  // linee di connessione sottili tra forme vicine
  stroke(dark ? 255 : 0, 5);
  strokeWeight(0.5);
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      let s1 = shapes[i];
      let s2 = shapes[j];

      let x1 = noise(s1.noiseOffset + time * 0.2 * s1.speedMult) * width;
      let y1 = noise(s1.noiseOffset + 500 + time * 0.15 * s1.speedMult) * height;
      let x2 = noise(s2.noiseOffset + time * 0.2 * s2.speedMult) * width;
      let y2 = noise(s2.noiseOffset + 500 + time * 0.15 * s2.speedMult) * height;

      let d = dist(x1, y1, x2, y2);
      if (d < 400) {
        let alpha = map(d, 0, 400, 15, 0);
        stroke(dark ? 255 : 0, alpha);
        line(x1, y1, x2, y2);
      }
    }
  }

  time += 0.008;
}

function mouseMoved() {
  targetMouse.x = mouseX;
  targetMouse.y = mouseY;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Theme toggle buttons (compatibile con sketch.html)
window.addEventListener('DOMContentLoaded', () => {
  const btnLight = document.getElementById('btn-light');
  const btnDark = document.getElementById('btn-dark');

  // Se esistono i bottoni di sketch.html
  if (btnLight && btnDark) {
    btnLight.addEventListener('click', () => {
      dark = false;
      document.body.classList.add('light-mode');
      btnLight.classList.add('active');
      btnDark.classList.remove('active');
    });

    btnDark.addEventListener('click', () => {
      dark = true;
      document.body.classList.remove('light-mode');
      btnDark.classList.add('active');
      btnLight.classList.remove('active');
    });
  }

  // Integrazione con portfolio.html (usa data-theme)
  const savedTheme = localStorage.getItem('theme') || 'light';
  dark = savedTheme === 'dark';

  // Osserva cambiamenti del tema
  const observer = new MutationObserver(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    dark = currentTheme === 'dark';
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
});
