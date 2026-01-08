/**
 * Simulation Controller Module
 * Canvas tabanlı simülasyonları yönetir
 * Frame rate kontrolü, Chart.js entegrasyonu ve modüler simülasyon çağrıları
 *
 * @module modules/simulation/simController
 */

const SimController = {
    // Simulation state
    state: {
        val1: 0,
        val2: 0,
        active: false,
        timer: 0,
        angle: 0,
        dir: 2,
        lastTick: Date.now(),
        themeColor: '#00979C',
    },

    // Animation loop reference
    loop: null,

    // Chart.js instance
    chartInstance: null,

    // Frame rate control
    lastFrameTime: 0,
    targetFPS: 30,

    // Current project reference (for hasGraph check)
    currentProject: null,

    /**
     * Stop the simulation loop and destroy chart
     */
    stop: () => {
        if (SimController.loop) {
            cancelAnimationFrame(SimController.loop);
            SimController.loop = null;
        }
        if (SimController.chartInstance) {
            SimController.chartInstance.destroy();
            SimController.chartInstance = null;
        }
    },

    /**
     * Set the current project for simulation
     * @param {Object} project - Project object with hasGraph property
     */
    setProject: (project) => {
        SimController.currentProject = project;
    },

    /**
     * Get the simulation state
     * @returns {Object} Current simulation state
     */
    getState: () => SimController.state,

    /**
     * Update simulation state
     * @param {Object} updates - State properties to update
     */
    setState: (updates) => {
        Object.assign(SimController.state, updates);
    },

    /**
     * Setup simulation canvas and chart
     * @param {string} type - Simulation type (e.g., 'led_blink', 'servo')
     * @param {Object} options - Optional configuration
     */
    setup: (type, options = {}) => {
        const cvs = document.getElementById('simCanvas');
        if (!cvs) {
            console.error('[SimController] Canvas element not found');
            return;
        }

        const ctx = cvs.getContext('2d');
        cvs.width = options.width || 500;
        cvs.height = options.height || 350;

        // Get Current Theme Color from CSS
        const themeColor =
            getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#00979C';
        SimController.state.themeColor = themeColor;

        // Setup chart if project has graph
        const chartCanvas = document.getElementById('dataChart');
        if (chartCanvas && SimController.currentProject?.hasGraph) {
            const chartCtx = chartCanvas.getContext('2d');

            // Destroy existing chart
            if (SimController.chartInstance) {
                SimController.chartInstance.destroy();
            }

            // Create new chart
            SimController.chartInstance = new Chart(chartCtx, {
                type: 'line',
                data: {
                    labels: Array(20).fill(''),
                    datasets: [
                        {
                            data: Array(20).fill(0),
                            borderColor: themeColor,
                            tension: 0.3,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { display: true } },
                },
            });
        }

        // Call modular simulation setup
        if (window.Simulations?.[type]?.setup) {
            // Create app-like interface for backward compatibility
            const appInterface = SimController._createAppInterface();
            window.Simulations[type].setup(appInterface);
        } else {
            SimController.setControls(`<div class="text-red-500 text-xs">Simülasyon Bulunamadı: ${type}</div>`);
        }

        // Start the animation loop
        SimController.loop = requestAnimationFrame(() => SimController._runLoop(ctx, type));
    },

    /**
     * Set controls HTML in the simulation panel
     * @param {string} html - HTML string for controls
     */
    setControls: (html) => {
        const controlsEl = document.getElementById('simControls');
        if (controlsEl) {
            controlsEl.innerHTML = html;
        }
    },

    /**
     * Internal: Run the simulation loop with FPS throttling
     * @private
     */
    _runLoop: (ctx, type) => {
        const now = Date.now();
        const frameInterval = 1000 / SimController.targetFPS;

        // Throttle to target FPS
        if (now - SimController.lastFrameTime < frameInterval) {
            SimController.loop = requestAnimationFrame(() => SimController._runLoop(ctx, type));
            return;
        }
        SimController.lastFrameTime = now;

        // Clear canvas
        ctx.clearRect(0, 0, 500, 350);

        let val = 0;

        // Call modular draw function
        if (window.Simulations?.[type]?.draw) {
            const appInterface = SimController._createAppInterface();
            val = window.Simulations[type].draw(ctx, appInterface, now);
        }

        // Update chart if available
        if (SimController.currentProject?.hasGraph && SimController.chartInstance && val !== undefined) {
            const d = SimController.chartInstance.data.datasets[0].data;
            d.shift();
            d.push(val);
            SimController.chartInstance.update('none');
        }

        SimController.loop = requestAnimationFrame(() => SimController._runLoop(ctx, type));
    },

    /**
     * Create an app-like interface for backward compatibility with Simulations module
     * @private
     * @returns {Object} App-compatible interface
     */
    _createAppInterface: () => {
        return {
            simState: SimController.state,
            chartInstance: SimController.chartInstance,
            currentProject: SimController.currentProject,
            setControls: SimController.setControls,
            // Backward compatibility: some simulations access these directly
            get simLoop() {
                return SimController.loop;
            },
            set simLoop(value) {
                SimController.loop = value;
            },
        };
    },
};

// Global scope'a ekle (mevcut yapıya uyum için)
window.SimController = SimController;
