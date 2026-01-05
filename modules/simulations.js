// --- HELPER FUNCTIONS ---
const SimHelpers = {
    // Helper to convert Hex to RGBA
    hexToRgba: (hex, alpha = 1) => {
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
        }
        return hex; // Fail gracefully
    },

    // Standard Arduino Board Drawing
    drawBoard: (ctx, themeColor = '#00979C') => {
        ctx.fillStyle = themeColor;
        ctx.fillRect(50, 200, 150, 100);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('UNO', 60, 220);
    },

    // Standard LED Drawing
    drawLED: (ctx, x, y, color, on) => {
        ctx.fillStyle = on ? color : '#333';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 6.28);
        ctx.fill();
        if (on) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    },

    // Factory for creating standard simulations
    createStandardSimulation: ({ type, label, min = 0, max = 1023, buttonText, onDraw }) => {
        return {
            setup: (app) => {
                // Initialize default state
                app.simState.val1 = type === 'slider' ? min + (max - min) / 2 : 0;
                app.simState.active = false;

                if (type === 'slider') {
                    app.setControls(`
                        <span class="mr-2 text-xs font-bold">${label || 'Değer'}:</span>
                        <input type="range" min="${min}" max="${max}" value="${app.simState.val1}" class="w-full" 
                               oninput="app.simState.val1=parseInt(this.value)">
                    `);
                } else if (type === 'button') {
                    app.setControls(`
                        <button onmousedown="app.simState.active=true" onmouseup="app.simState.active=false" 
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition shadow">
                            ${buttonText || 'BAS'}
                        </button>
                    `);
                } else if (type === 'info') {
                    app.setControls(`<div class="text-center text-xs text-gray-500 font-bold">${label}</div>`);
                }
            },
            draw: (ctx, app, t) => {
                const themeColor = app.simState.themeColor || '#00979C';
                SimHelpers.drawBoard(ctx, themeColor);
                if (onDraw) onDraw(ctx, app, t, app.simState.val1, app.simState.active);
            },
        };
    },

    // Helper to draw a vertical bar (good for moisture, temp, etc.)
    drawBarSensor: (ctx, x, y, value, maxVal, color, label) => {
        const h = (value / maxVal) * 200;
        ctx.fillStyle = '#eee';
        ctx.fillRect(x, y - 200, 50, 200); // Bg
        ctx.fillStyle = color;
        ctx.fillRect(x, y - h, 50, h); // Fill
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${label}: ${value}`, x, y + 20);
    },

    // Helper to draw a generic LED/Lamp
    drawLamp: (ctx, x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 6.28);
        ctx.fill();
        ctx.fillStyle = '#555';
        ctx.fillRect(x - 5, y + 20, 10, 100);
    },
};

const Simulations = {
    // 1. BLINK
    blink: SimHelpers.createStandardSimulation({
        type: 'info',
        label: 'Otomatik Yanıp Sönme',
        onDraw: (ctx, app, t) => {
            SimHelpers.drawLED(ctx, 120, 250, 'orange', t % 1000 < 500);
            ctx.fillStyle = '#333';
            ctx.fillText('13', 100, 260);
        },
    }),

    // 2. TRAFIK LAMBASI
    traffic: SimHelpers.createStandardSimulation({
        type: 'info',
        label: 'Otomatik Döngü: K > S > Y',
        onDraw: (ctx, app, t) => {
            ctx.fillStyle = '#333';
            ctx.fillRect(200, 50, 80, 200);
            const p = t % 8000;
            SimHelpers.drawLED(ctx, 240, 90, 'red', p < 3000);
            SimHelpers.drawLED(ctx, 240, 150, 'yellow', p >= 3000 && p < 4000);
            SimHelpers.drawLED(ctx, 240, 210, 'green', p >= 4000 && p < 7000);
        },
    }),

    // 4. BUTTON
    button: SimHelpers.createStandardSimulation({
        type: 'button',
        buttonText: 'BAS',
        onDraw: (ctx, app, t, val, active) => {
            SimHelpers.drawLED(ctx, 300, 200, 'red', active);
        },
    }),

    // 5. POT
    pot: SimHelpers.createStandardSimulation({
        type: 'slider',
        label: 'Direnç',
        min: 0,
        max: 1023,
        onDraw: (ctx, app, t, val) => {
            const b = val / 1023;
            SimHelpers.drawLED(ctx, 300, 200, `rgba(255,255,0,${b})`, true);
        },
    }),

    // 6. RGB
    rgb: SimHelpers.createStandardSimulation({
        type: 'info',
        label: 'Otomatik Renk Döngüsü',
        onDraw: (ctx, app, t) => {
            const r = Math.sin(t * 0.002) * 127 + 128;
            const g = Math.sin(t * 0.003) * 127 + 128;
            const b = Math.sin(t * 0.004) * 127 + 128;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            ctx.arc(250, 175, 50, 0, 6.28);
            ctx.fill();
        },
    }),

    // 7. DHT
    dht: SimHelpers.createStandardSimulation({
        type: 'slider',
        label: 'Sıcaklık',
        min: 0,
        max: 50,
        onDraw: (ctx, app, t, val) => {
            // Thermometer visual
            ctx.fillStyle = '#eee';
            ctx.fillRect(220, 50, 60, 200);
            const h = (val / 50) * 180;
            ctx.fillStyle = 'red';
            ctx.fillRect(230, 240 - h, 40, h);
            ctx.fillStyle = '#333';
            ctx.font = '20px Arial';
            ctx.fillText(val + '°C', 300, 150);
        },
    }),

    // 8. ULTRASONIC
    ultrasonic: SimHelpers.createStandardSimulation({
        type: 'slider',
        label: 'Mesafe (cm)',
        min: 0,
        max: 200,
        onDraw: (ctx, app, t, val) => {
            ctx.fillStyle = '#ccc';
            ctx.fillRect(150, 100, 100, 50); // Sensor body
            const x = 150 + val * 2;
            if (x < 480) {
                ctx.fillStyle = 'red';
                ctx.fillRect(x, 80, 10, 90);
            } // Obstacle
            ctx.fillStyle = '#000';
            ctx.fillText(val + 'cm', 200, 200);
        },
    }),

    // 9. SERVO
    servo: SimHelpers.createStandardSimulation({
        type: 'slider',
        label: 'Açı',
        min: 0,
        max: 180,
        onDraw: (ctx, app, t, val) => {
            ctx.fillStyle = '#333';
            ctx.fillRect(200, 150, 60, 40); // Body
            ctx.save();
            ctx.translate(230, 150);
            ctx.rotate((val - 90) * 0.0174);
            ctx.fillStyle = '#ddd';
            ctx.fillRect(-5, -60, 10, 60); // Arm
            ctx.restore();
        },
    }),

    // 10. MELODY
    melody: SimHelpers.createStandardSimulation({
        type: 'button',
        buttonText: '🎵 ÇAL',
        onDraw: (ctx, app, t, val, active) => {
            ctx.fillStyle = '#333';
            ctx.fillRect(100, 150, 300, 50); // Buzzer Board
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(250, 100, 30, 0, 6.28);
            ctx.fill(); // Buzzer Circle
            if (active && t % 500 < 250) {
                ctx.strokeStyle = 'white';
                ctx.beginPath();
                ctx.arc(250, 100, 40, 0, 6.28);
                ctx.stroke();
            }
        },
    }),

    // 11. MOISTURE
    moisture: SimHelpers.createStandardSimulation({
        type: 'slider',
        label: 'Nem Seviyesi',
        min: 0,
        max: 1023,
        onDraw: (ctx, app, t, val) => {
            SimHelpers.drawBarSensor(ctx, 200, 250, val, 1023, 'blue', 'Değer');
        },
    }),

    // 12. MOTION
    motion: SimHelpers.createStandardSimulation({
        type: 'button',
        buttonText: '🏃 HAREKET OLUŞTUR',
        onDraw: (ctx, app, t, val, active) => {
            ctx.fillStyle = active ? 'red' : '#333';
            ctx.beginPath();
            ctx.arc(250, 120, 40, 0, 6.28);
            ctx.fill(); // Sensor
            ctx.fillStyle = 'white';
            ctx.fillText('PIR', 235, 125);
            if (active) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(250, 120, 60, 0, 6.28);
                ctx.stroke();
            }
        },
    }),

    // 13. STREETLIGHT
    streetLight: SimHelpers.createStandardSimulation({
        type: 'slider',
        label: 'Ortam Işığı',
        min: 0,
        max: 1023,
        onDraw: (ctx, app, t, val) => {
            const b = val / 1023; // 1 = bright, 0 = dark
            SimHelpers.drawLamp(ctx, 250, 100, `rgba(255, 255, 100, ${1 - b})`);
        },
    }),

    // 14. COUNTDOWN
    countdown: {
        setup: (app) => {
            app.setControls(
                '<button onclick="if(!app.simState.active){app.simState.active=true; app.simState.val1=9;}" class="w-full bg-red-600 text-white py-2 rounded">BAŞLAT</button>'
            );
        },
        draw: (ctx, app, t) => {
            SimHelpers.drawBoard(ctx, app.simState.themeColor || '#00979C');
            if (app.simState.active && t - (app.simState.lastTick || 0) > 1000) {
                app.simState.val1--;
                app.simState.lastTick = t;
                if (app.simState.val1 < 0) app.simState.active = false;
            }
            const val = app.simState.val1;
            ctx.fillStyle = 'red';
            ctx.font = '80px monospace';
            ctx.fillText(val < 0 ? 'BOOM' : val, 200, 200);
        },
    },

    // 15. FLOOD
    flood: SimHelpers.createStandardSimulation({
        type: 'slider',
        label: 'Su Seviyesi',
        min: 0,
        max: 1023,
        onDraw: (ctx, app, t, val) => {
            SimHelpers.drawBarSensor(ctx, 200, 250, val, 1023, 'blue', 'Su');
        },
    }),

    // 16. CLAP
    clap: SimHelpers.createStandardSimulation({
        type: 'button',
        buttonText: '👏 ALKIŞLA',
        onDraw: (ctx, app, t, val, active) => {
            ctx.fillStyle = '#e91e63';
            ctx.beginPath();
            ctx.arc(250, 175, 30, 0, 6.28);
            ctx.fill(); // Mic
            if (active) {
                ctx.strokeStyle = 'rgba(233,30,99,0.5)';
                ctx.lineWidth = 10;
                ctx.stroke();
                SimHelpers.drawLED(ctx, 350, 175, 'green', true);
            } else {
                SimHelpers.drawLED(ctx, 350, 175, 'green', false);
            }
        },
    }),

    // 17. FIRE
    fire: SimHelpers.createStandardSimulation({
        type: 'slider',
        label: 'Sıcaklık',
        min: 0,
        max: 1023,
        onDraw: (ctx, app, t, val) => {
            SimHelpers.drawBarSensor(ctx, 200, 250, val, 1023, 'orange', 'Temp');
            if (val > 600) {
                ctx.fillStyle = 'red';
                ctx.font = '30px Arial';
                ctx.fillText('YANGIN!', 300, 100);
            }
        },
    }),

    // 18. THEREMIN
    theremin: SimHelpers.createStandardSimulation({
        type: 'slider',
        label: 'El Mesafesi',
        min: 0,
        max: 1023,
        onDraw: (ctx, app, t, val) => {
            SimHelpers.drawBarSensor(ctx, 200, 250, val, 1023, 'purple', 'Freq');
        },
    }),

    // 19. HOURGLASS
    hourglass: SimHelpers.createStandardSimulation({
        type: 'info',
        label: '<label><input type="checkbox" onchange="app.simState.active=this.checked"> Ters Çevir</label>',
        onDraw: (ctx, app, t, val, active) => {
            const rot = active ? 1 : 0;
            ctx.save();
            ctx.translate(250, 175);
            ctx.rotate(rot * 3.14);
            ctx.fillStyle = app.simState.themeColor || '#00979C';
            ctx.fillRect(-100, -50, 200, 100);
            ctx.fillStyle = 'white';
            ctx.fillText('UNO', -20, 0);
            ctx.restore();
        },
    }),

    // 20. RADAR
    radar: {
        setup: (app) => {
            app.simState = { angle: 0, dir: 2, val1: 0 };
            app.setControls('<div class="text-center text-xs">Radar Taraması</div>');
        },
        draw: (ctx, app, t) => {
            // Logic
            app.simState.angle += app.simState.dir;
            if (app.simState.angle > 180 || app.simState.angle < 0) app.simState.dir *= -1;

            // Draw
            SimHelpers.drawBoard(ctx, app.simState.themeColor || '#00979C');
            ctx.fillStyle = 'black';
            ctx.fillRect(100, 50, 300, 250);
            ctx.strokeStyle = 'lime';
            ctx.beginPath();
            ctx.moveTo(250, 280);
            const rad = (app.simState.angle + 180) * 0.0174;
            ctx.lineTo(250 + Math.cos(rad) * 200, 280 + Math.sin(rad) * 200);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0,255,0,0.2)';
            ctx.beginPath();
            ctx.arc(250, 280, 200, 3.14, 0);
            ctx.fill();
        },
    },

    // EXPLORER (Existing)
    explorer_board: {
        setup: (app) => {
            const controlsHTML = `
                <div class="flex justify-between items-center w-full px-2">
                    <span class="text-xs font-bold text-gray-600">🖱️ Yaklaş: Tekerlek | Gez: Sürükle</span>
                    <button id="fsBtn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded text-xs transition">
                        ⛶ Büyüt
                    </button>
                </div>
            `;
            app.setControls(controlsHTML);

            // Handle Fullscreen Toggle
            const fsBtn = document.getElementById('fsBtn');
            const simContainer = document.getElementById('sim-container');
            const cvs = document.getElementById('simCanvas');

            // Resize Observer to adjust canvas resolution
            if (app.simState.resizeObserver) app.simState.resizeObserver.disconnect();

            const resizeCanvas = () => {
                const rect = simContainer.querySelector('#sim-content-area').getBoundingClientRect();
                cvs.width = rect.width;
                cvs.height = rect.height;
            };

            app.simState.resizeObserver = new ResizeObserver(() => {
                resizeCanvas();
            });
            app.simState.resizeObserver.observe(simContainer);

            // Initial size
            resizeCanvas();

            fsBtn.onclick = () => {
                if (!document.fullscreenElement) {
                    simContainer.requestFullscreen().catch((err) => {
                        console.warn(`Fullscreen error: ${err.message}`);
                    });
                } else {
                    document.exitFullscreen();
                }
            };

            document.onfullscreenchange = () => {
                if (document.fullscreenElement) {
                    fsBtn.innerText = 'Küçült';
                } else {
                    fsBtn.innerText = 'Büyüt';
                }
            };

            app.simState.mouseX = 0;
            app.simState.mouseY = 0;

            // Zoom & Pan State
            app.simState.zoom = 1;
            app.simState.panX = 0;
            app.simState.panY = 0;
            app.simState.isDragging = false;
            app.simState.lastDragX = 0;
            app.simState.lastDragY = 0;

            app.simState.activeHotspots = app.currentProject.hotspots || [];

            if (!app.arduinoImg) {
                app.arduinoImg = new Image();
            }

            // Always update source based on current project
            if (app.currentProject.circuitImage) {
                if (app.currentProject.circuitImage.includes('/')) app.arduinoImg.src = app.currentProject.circuitImage;
                else app.arduinoImg.src = 'img/' + app.currentProject.circuitImage;
            } else {
                app.arduinoImg.src = 'img/arduino_tanitim.jpg';
            }

            // Event Listeners for Interaction
            cvs.onmousemove = (e) => {
                const rect = cvs.getBoundingClientRect();
                const scaleX = cvs.width / rect.width;
                const scaleY = cvs.height / rect.height;
                const newX = (e.clientX - rect.left) * scaleX;
                const newY = (e.clientY - rect.top) * scaleY;

                if (app.simState.isDragging) {
                    app.simState.panX += newX - app.simState.lastDragX;
                    app.simState.panY += newY - app.simState.lastDragY;
                }

                app.simState.mouseX = newX;
                app.simState.mouseY = newY;
                app.simState.lastDragX = newX;
                app.simState.lastDragY = newY;
            };

            cvs.onmousedown = (e) => {
                app.simState.isDragging = true;
                // Capture start pos is handled by mousemove immediately
            };

            cvs.onmouseup = (e) => {
                app.simState.isDragging = false;
            };

            cvs.onmouseleave = (e) => {
                app.simState.isDragging = false;
            };

            cvs.onwheel = (e) => {
                e.preventDefault();
                const zoomIntensity = 0.1;
                const wheel = e.deltaY < 0 ? 1 : -1;
                const zoomFactor = Math.exp(wheel * zoomIntensity);

                // Get mouse pos in world coords before zoom
                const worldX = (app.simState.mouseX - app.simState.panX) / app.simState.zoom;
                const worldY = (app.simState.mouseY - app.simState.panY) / app.simState.zoom;

                // Update Zoom
                const newZoom = Math.min(Math.max(app.simState.zoom * zoomFactor, 1), 10); // Limit 10x

                // Adjust Pan to keep mouse fixed
                app.simState.panX = app.simState.mouseX - worldX * newZoom;
                app.simState.panY = app.simState.mouseY - worldY * newZoom;

                app.simState.zoom = newZoom;
            };
        },
        draw: (ctx, app, t) => {
            const cw = ctx.canvas.width;
            const ch = ctx.canvas.height;
            const themeColor = app.simState.themeColor || '#00979C';

            // Background
            ctx.fillStyle = '#eee';
            ctx.fillRect(0, 0, cw, ch);

            if (app.arduinoImg && app.arduinoImg.complete && app.arduinoImg.naturalWidth > 0) {
                // Fit image to current canvas size but keeping relative coords of 500x350
                const refW = 500;
                const refH = 350;

                const virtualScale = Math.min(cw / refW, ch / refH);
                const virtualOx = (cw - refW * virtualScale) / 2;
                const virtualOy = (ch - refH * virtualScale) / 2;

                ctx.save();

                // User Zoom/Pan
                ctx.translate(app.simState.panX, app.simState.panY);
                ctx.scale(app.simState.zoom, app.simState.zoom);

                // "Virtual Screen" Transform
                ctx.translate(virtualOx, virtualOy);
                ctx.scale(virtualScale, virtualScale);

                const ratio = Math.min(500 / app.arduinoImg.width, 350 / app.arduinoImg.height);
                const w = app.arduinoImg.width * ratio;
                const h = app.arduinoImg.height * ratio;
                const ox = (500 - w) / 2;
                const oy = (350 - h) / 2;

                // Draw Image centered
                ctx.drawImage(app.arduinoImg, ox, oy, w, h);

                // Check Hotspots (Mouse in World Space)
                const mx = (app.simState.mouseX - app.simState.panX) / app.simState.zoom;
                const my = (app.simState.mouseY - app.simState.panY) / app.simState.zoom;

                // Convert to Ref Space
                const refX = (mx - virtualOx) / virtualScale;
                const refY = (my - virtualOy) / virtualScale;

                let hovered = null;

                app.simState.activeHotspots.forEach((hp) => {
                    const hx = hp.x + ox;
                    const hy = hp.y + oy;

                    ctx.strokeStyle = SimHelpers.hexToRgba(themeColor, 0.4);
                    ctx.lineWidth = 2 / app.simState.zoom / virtualScale;
                    ctx.beginPath();

                    let inside = false;
                    if (hp.r) {
                        const dist = Math.sqrt((refX - hx) ** 2 + (refY - hy) ** 2);
                        ctx.arc(hx, hy, hp.r, 0, 6.28);
                        inside = dist < hp.r;
                    } else if (hp.w && hp.h) {
                        ctx.rect(hx, hy, hp.w, hp.h);
                        inside = refX >= hx && refX <= hx + hp.w && refY >= hy && refY <= hy + hp.h;
                    }
                    ctx.stroke();

                    if (inside) hovered = hp;
                });

                if (hovered) {
                    const hx = hovered.x + ox;
                    const hy = hovered.y + oy;

                    ctx.fillStyle = SimHelpers.hexToRgba(themeColor, 0.5);
                    ctx.beginPath();
                    if (hovered.r) {
                        ctx.arc(hx, hy, hovered.r, 0, 6.28);
                    } else if (hovered.w && hovered.h) {
                        ctx.rect(hx, hy, hovered.w, hovered.h);
                    }
                    ctx.fill();
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 3 / app.simState.zoom / virtualScale;
                    ctx.stroke();
                }

                ctx.restore(); // Back to Screen Space for Tooltip

                // Tooltip
                if (hovered) {
                    const boxW = 200;
                    const boxH = 80;
                    // Tooltip follows actual mouse pointer
                    let bx = app.simState.mouseX + 20;
                    let by = app.simState.mouseY + 20;

                    if (bx + boxW > cw) bx = app.simState.mouseX - boxW - 20;
                    if (by + boxH > ch) by = app.simState.mouseY - boxH - 20;

                    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(bx, by, boxW, boxH);
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = themeColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(bx, by, boxW, boxH);

                    ctx.fillStyle = themeColor;
                    ctx.font = 'bold 14px Arial';
                    ctx.fillText(hovered.name, bx + 10, by + 25);
                    ctx.fillStyle = '#333';
                    ctx.font = '12px Arial';
                    ctx.fillText(hovered.desc, bx + 10, by + 50, boxW - 20);
                }
            } else {
                ctx.fillStyle = '#333';
                ctx.fillText('Resim Yükleniyor...', 200, 175);
            }
        },
    },
};

// Aliases
Simulations.explorer_ide = Simulations.explorer_board;
Simulations.traffic_light = Simulations.traffic; // Map old name to new name just in case
Simulations.pot_led = Simulations.pot;
Simulations.button_led = Simulations.button;
Simulations.generic_sensor = Simulations.streetLight; // Approximation

window.Simulations = Simulations;
