document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const canvas = document.getElementById('attractorCanvas');
    const ctx = canvas.getContext('2d');
    const nameDisplay = document.getElementById('nameDisplay');
    const colorToggle = document.getElementById('colorToggle');
    
    // State variables
    let width, height;
    let animationPhase = 0;
    let lastFrameTime = 0;
    let nameTimer = 0;
    let currentPresetIndex = 0;
    let colorMode = true;
    const fadeOpacity = 0.02; // Reduced fade opacity for cleaner trails
    
    // Current attractor parameters
    let params = { a: 1.7, b: 1.7, c: 0.6, d: 1.2 };
    let baseParams = { a: 1.7, b: 1.7, c: 0.6, d: 1.2 };
    
    // Initialize the application
    function init() {
        // Set up the canvas
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Set up event listeners
        colorToggle.addEventListener('click', handleColorToggle);
        document.addEventListener('click', changePreset);
        
        // Display initial preset name
        displayPresetName();
        
        // Start animation loop
        requestAnimationFrame(animate);
    }
    
    /**
     * Canvas size management
     */
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    /**
     * Event handlers
     */
    function handleColorToggle(e) {
        // Prevent click event from triggering pattern change
        e.stopPropagation();
        
        // Toggle color mode
        colorMode = !colorMode;
    }
    
    function changePreset() {
        currentPresetIndex = (currentPresetIndex + 1) % presets.length;
        
        // Update parameters from the new preset
        updateParametersFromPreset();
        
        // Display the preset name
        displayPresetName();
    }
    
    function displayPresetName() {
        nameDisplay.textContent = presets[currentPresetIndex].name;
        nameDisplay.classList.add('visible');
        nameTimer = 3; // Display for 3 seconds
    }
    
    /**
     * Parameter management
     */
    function updateParametersFromPreset() {
        // Set base parameters from current preset
        baseParams.a = presets[currentPresetIndex].a;
        baseParams.b = presets[currentPresetIndex].b;
        baseParams.c = presets[currentPresetIndex].c;
        baseParams.d = presets[currentPresetIndex].d;
        
        // Set current parameters to match base
        params.a = baseParams.a;
        params.b = baseParams.b;
        params.c = baseParams.c;
        params.d = baseParams.d;
    }
    
    /**
     * Animation loop
     */
    function animate(currentTime) {
        // Calculate delta time
        const deltaTime = currentTime - lastFrameTime;
        lastFrameTime = currentTime;
        
        // Update state
        updateAnimation(deltaTime);
        
        // Draw frame
        drawAttractorPoints(2000); // Increased number of points for better coverage
        
        // Request next frame
        requestAnimationFrame(animate);
    }
    
    function updateAnimation(deltaTime) {
        // Convert to seconds
        const dt = deltaTime / 1000;
        
        // Update animation phase
        animationPhase += dt * 0.7;
        
        // Update name display timer
        updateNameTimer(dt);
        
        // Update attractor parameters for dynamic motion
        updateAttractorParameters();
    }
    
    function updateNameTimer(dt) {
        if (nameTimer > 0) {
            nameTimer -= dt;
            if (nameTimer <= 0) {
                nameDisplay.classList.remove('visible');
            }
        }
    }
    
    function updateAttractorParameters() {
        // Calculate parameter variations for fluid motion
        // Base layer - slow, large movements
        const slow = Math.sin(animationPhase * 0.15) * 0.08; 
        
        // Medium layer - moderate movements
        const med1 = Math.sin(animationPhase * 0.3) * 0.06;
        const med2 = Math.cos(animationPhase * 0.25) * 0.05;
        
        // Fast layer - small, quick movements
        const fast1 = Math.sin(animationPhase * 0.6) * 0.03;
        const fast2 = Math.cos(animationPhase * 0.7) * 0.03;
        
        // Combine frequencies for complex movement
        params.a = baseParams.a + slow + med1 + fast1;
        params.b = baseParams.b + slow + med2 + fast2;
        params.c = baseParams.c + med1 + fast2;
        params.d = baseParams.d + med2 + fast1;
    }
    
    /**
     * Drawing functions
     */
    function drawAttractorPoints(numPoints) {
        // Clear canvas with semi-transparent black for trails
        clearCanvasWithFade();
        
        // Center coordinates and scale
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) / 5;
        
        // Initialize attractor with warm-up iterations
        let point = initializeAttractor();
        
        // Get current pattern info
        const patternInfo = presets[currentPresetIndex];
        
        // Draw points
        for (let i = 0; i < numPoints; i++) {
            // Calculate next point in the attractor
            point = iterateAttractor(point.x, point.y);
            
            // Apply pattern-specific transformations
            const transformed = transformPoint(point.x, point.y, patternInfo.pattern);
            
            // Convert to canvas coordinates
            const canvasX = centerX + transformed.x * scale;
            const canvasY = centerY + transformed.y * scale;
            
            // Skip if outside canvas bounds
            if (isOutsideCanvas(canvasX, canvasY)) continue;
            
            // Calculate appearance (color, size, opacity)
            const appearance = calculatePointAppearance(transformed, patternInfo);
            
            // Draw the point
            drawPoint(canvasX, canvasY, appearance);
        }
        
        // Reset global alpha
        ctx.globalAlpha = 1;
    }
    
    function clearCanvasWithFade() {
        // Create a semi-transparent black for trails
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        ctx.fillRect(0, 0, width, height);
        
        // Add a subtle radial gradient to soften the edges
        const gradient = ctx.createRadialGradient(
            width/2, height/2, 0,
            width/2, height/2, Math.min(width, height) / 2
        );
        
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)"); // Transparent in the center
        gradient.addColorStop(0.85, "rgba(0, 0, 0, 0)"); // Stay transparent until near the edge
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.03)"); // Very subtle fade at the edges
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    function initializeAttractor() {
        let x = 0;
        let y = 0;
        
        // Skip first iterations to reach the attractor
        for (let i = 0; i < 1000; i++) {
            const nextPoint = iterateAttractor(x, y);
            x = nextPoint.x;
            y = nextPoint.y;
        }
        
        return { x, y };
    }
    
    function iterateAttractor(x, y) {
        const newX = Math.sin(params.a * y) + params.c * Math.cos(params.a * x);
        const newY = Math.sin(params.b * x) + params.d * Math.cos(params.b * y);
        return { x: newX, y: newY };
    }
    
    function transformPoint(x, y, patternType) {
        let transformedX = x;
        let transformedY = y;
        
        switch (patternType) {
            case "star":
                return transformStarPattern(x, y);
            case "aurora":
                return transformAuroraPattern(x, y);
            case "fractal":
                return transformFractalPattern(x, y);
            case "quantum":
                return transformQuantumPattern(x, y);
            case "lorenz":
                return transformLorenzPattern(x, y);
            case "rossler":
                return transformRosslerPattern(x, y);
            case "henon":
                return transformHenonPattern(x, y);
            case "ikeda":
                return transformIkedaPattern(x, y);
            default:
                return { x, y };
        }
    }
    
    function transformStarPattern(x, y) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // Add spikes to the shape
        const spikeFactor = 0.2 * Math.sin(angle * 5 + animationPhase * 0.3);
        const newDistance = distance * (1 + spikeFactor);
        
        const transformedX = newDistance * Math.cos(angle);
        const transformedY = newDistance * Math.sin(angle);
        
        return { x: transformedX, y: transformedY };
    }
    
    function transformAuroraPattern(x, y) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // Create wave-like patterns that flow upward
        const waveEffect = 0.2 * Math.sin(y * 3 + animationPhase * 0.5);
        const verticalStretch = 1.1 + Math.sin(x * 2 + animationPhase * 0.3) * 0.1;
        
        const transformedX = x + waveEffect;
        const transformedY = y * verticalStretch;
        
        return { x: transformedX, y: transformedY };
    }
    
    function transformFractalPattern(x, y) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // Scale to Mandelbrot set coordinates
        const zoom = 0.9 + Math.sin(animationPhase * 0.08) * 0.1;
        const offsetX = Math.sin(animationPhase * 0.04) * 0.3;
        const offsetY = Math.cos(animationPhase * 0.05) * 0.2;
        
        const mbX = x * zoom + offsetX;
        const mbY = y * zoom + offsetY;
        
        // Calculate Mandelbrot set iteration for this point
        const mbResult = mandelbrotIteration(mbX, mbY, 15);
        
        let transformedX, transformedY;
        
        if (mbResult.escaped) {
            const fractalFactor = mbResult.value;
            const fractalInfluence = 0.15 * Math.sin(animationPhase * 0.15 + fractalFactor * Math.PI * 6);
            transformedX = x + fractalInfluence * Math.cos(angle * 2);
            transformedY = y + fractalInfluence * Math.sin(angle * 2);
        } else {
            transformedX = x * 0.99;
            transformedY = y * 0.99;
        }
        
        return { x: transformedX, y: transformedY };
    }
    
    function transformQuantumPattern(x, y) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // Create multiple interference waves
        const wave1 = Math.sin(distance * 4 - animationPhase * 0.3) * 0.05;
        const wave2 = Math.cos(angle * 3 + animationPhase * 0.2) * 0.05;
        const wave3 = Math.sin(x * 2 - y * 2 + animationPhase * 0.25) * 0.07;
        
        // Combine waves with phase differences
        const interference = wave1 + wave2 + wave3;
        
        // Apply wave interference effect
        let transformedX = x + interference * Math.cos(angle);
        let transformedY = y + interference * Math.sin(angle);
        
        // Add occasional quantum tunneling effect
        if (Math.random() < 0.002) {
            const jumpDistance = 0.1 + Math.random() * 0.2;
            const jumpAngle = Math.random() * Math.PI * 2;
            
            transformedX += Math.cos(jumpAngle) * jumpDistance;
            transformedY += Math.sin(jumpAngle) * jumpDistance;
        }
        
        return { x: transformedX, y: transformedY };
    }
    
    function transformLorenzPattern(x, y) {
        // Lorenz attractor parameters
        const sigma = 10;
        const rho = 28;
        const beta = 8/3;
        
        // Use the Clifford attractor coordinates as a starting point
        // Scale them to work better with the Lorenz system
        let lorenzX = x * 0.1;
        let lorenzY = y * 0.1;
        let lorenzZ = 0.1;
        
        // Simulate several steps of the Lorenz system to get the characteristic butterfly shape
        const dt = 0.005;
        const steps = 10; // Increased steps for more pronounced effect
        
        for (let i = 0; i < steps; i++) {
            // The Lorenz equations
            const dx = sigma * (lorenzY - lorenzX) * dt;
            const dy = (lorenzX * (rho - lorenzZ) - lorenzY) * dt;
            const dz = (lorenzX * lorenzY - beta * lorenzZ) * dt;
            
            lorenzX += dx;
            lorenzY += dy;
            lorenzZ += dz;
        }
        
        // Project the 3D Lorenz system to 2D, with some time-based rotation
        const angle = animationPhase * 0.1;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        
        // Rotate around the Y axis for a dynamic view of the attractor
        const projX = lorenzX * cosA + lorenzZ * sinA;
        const projY = lorenzY;
        
        // More pronounced effect - use more of the Lorenz transformation
        // This makes the butterfly shape more visible
        const transformedX = projX * 0.4 + x * 0.6;
        const transformedY = projY * 0.4 + y * 0.6;
        
        return { x: transformedX, y: transformedY };
    }
    

    function transformRosslerPattern(x, y) {
        // Rössler attractor parameters
        const a = 0.2;
        const b = 0.2; 
        const c = 5.7;
        
        // Use the Clifford attractor coordinates as a starting point
        let rosslerX = x * 0.1;
        let rosslerY = y * 0.1;
        let rosslerZ = 0.1;
        
        // Simulate a few steps of the Rössler system
        const dt = 0.01;
        const steps = 5;
        
        for (let i = 0; i < steps; i++) {
            // The Rössler equations
            const dx = (-rosslerY - rosslerZ) * dt;
            const dy = (rosslerX + a * rosslerY) * dt;
            const dz = (b + rosslerZ * (rosslerX - c)) * dt;
            
            rosslerX += dx;
            rosslerY += dy;
            rosslerZ += dz;
        }
        
        // Project the 3D Rössler system to 2D, with time-based rotation
        const angle = animationPhase * 0.15;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        
        // Dynamic projection that emphasizes the spiral structure
        const projX = rosslerX * cosA - rosslerY * sinA;
        const projY = rosslerY * cosA + rosslerX * sinA;
        
        // Blend with original coordinates for a cohesive look
        const transformedX = projX * 0.3 + x * 0.7;
        const transformedY = projY * 0.3 + y * 0.7;
        
        // Add subtle spiral distortion
        const dist = Math.sqrt(transformedX * transformedX + transformedY * transformedY);
        const ang = Math.atan2(transformedY, transformedX);
        const spiralFactor = 0.1 * Math.sin(dist * 3 - animationPhase * 0.2);
        
        const finalX = transformedX + spiralFactor * Math.cos(ang);
        const finalY = transformedY + spiralFactor * Math.sin(ang);
        
        return { x: finalX, y: finalY };
    }
    
    function transformHenonPattern(x, y) {
        // Hénon map parameters
        const a = 1.4;
        const b = 0.3;
        
        // Apply Hénon map transformation directly to the coordinates
        // The Hénon map is 2D, so we can apply it more directly
        
        // Scale the input coordinates to the right range
        let henonX = x * 0.15;
        let henonY = y * 0.15;
        
        // Apply several iterations of the Hénon map
        const steps = 3;
        
        for (let i = 0; i < steps; i++) {
            // The Hénon map equations
            const nextX = 1 - a * henonX * henonX + henonY;
            const nextY = b * henonX;
            
            henonX = nextX;
            henonY = nextY;
        }
        
        // Add a time-dependent rotation to make it more dynamic
        const angle = animationPhase * 0.2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        
        const rotX = henonX * cosA - henonY * sinA;
        const rotY = henonX * sinA + henonY * cosA;
        
        // Blend with original coordinates
        const transformedX = rotX * 0.25 + x * 0.75;
        const transformedY = rotY * 0.25 + y * 0.75;
        
        return { x: transformedX, y: transformedY };
    }
    
    function transformIkedaPattern(x, y) {
        // Ikeda map parameters
        const u = 0.918;
        const t = 0.4;
        
        // Scale the input coordinates
        let ikedaX = x * 0.2;
        let ikedaY = y * 0.2;
        
        // Apply several iterations of the Ikeda map
        const steps = 3;
        
        for (let i = 0; i < steps; i++) {
            // Calculate the Ikeda tau parameter
            const xSquared = ikedaX * ikedaX;
            const ySquared = ikedaY * ikedaY;
            const r = Math.sqrt(1 + xSquared + ySquared);
            const theta = t - 6 / (1 + r);
            
            // The Ikeda map equations
            const nextX = 1 + u * (ikedaX * Math.cos(theta) - ikedaY * Math.sin(theta));
            const nextY = u * (ikedaX * Math.sin(theta) + ikedaY * Math.cos(theta));
            
            ikedaX = nextX;
            ikedaY = nextY;
        }
        
        // Scale down the result (Ikeda can get large)
        ikedaX *= 0.1;
        ikedaY *= 0.1;
        
        // Add a time-varying swirl effect
        const distance = Math.sqrt(ikedaX * ikedaX + ikedaY * ikedaY);
        const angle = Math.atan2(ikedaY, ikedaX);
        
        const swirlFactor = 0.1 * Math.sin(distance * 4 - animationPhase * 0.3);
        const swirlAngle = angle + swirlFactor;
        
        const swirlX = distance * Math.cos(swirlAngle);
        const swirlY = distance * Math.sin(swirlAngle);
        
        // Blend with original coordinates
        const transformedX = swirlX * 0.25 + x * 0.75;
        const transformedY = swirlY * 0.25 + y * 0.75;
        
        return { x: transformedX, y: transformedY };
    }
    function isOutsideCanvas(x, y) {
        const padding = 10;
        return x < -padding || x > width + padding || y < -padding || y > height + padding;
    }
    
    function calculatePointAppearance(point, patternInfo) {
        const { x, y } = point;
        const patternType = patternInfo.pattern;
        const hue = patternInfo.hue;
        
        // Default values
        let h = hue;
        let s = 0.7;
        let l = 0.5;
        let alpha = 0.7;
        let pointSize = 1.5;
        
        switch (patternType) {
            case "aurora":
                return calculateAuroraAppearance(x, y, hue);
            case "fractal":
                return calculateFractalAppearance(x, y, hue);
            case "quantum":
                return calculateQuantumAppearance(x, y, hue);
            case "lorenz":
                return calculateLorenzAppearance(x, y, hue);
            case "rossler":
                return calculateRosslerAppearance(x, y, hue);
            case "henon":
                return calculateHenonAppearance(x, y, hue);
            case "ikeda":
                return calculateIkedaAppearance(x, y, hue);
            default:
                return calculateStandardAppearance(x, y, hue);
        }
    }
    
    function calculateAuroraAppearance(x, y, hue) {
        const yPos = y / 2;
        const colorPhase = yPos + animationPhase * 0.2;
        
        const h = (hue + Math.sin(colorPhase) * 0.2) % 1;
        const s = 0.7 + Math.sin(x * 2 + animationPhase * 0.3) * 0.3;
        const l = 0.5 + Math.sin(x * 3 + animationPhase * 0.4) * 0.3;
        
        const alpha = 0.5 + Math.abs(Math.sin(x * 3 + animationPhase * 0.4)) * 0.5;
        const pointSize = 1.5 + Math.abs(Math.sin(x * 3 + animationPhase * 0.4)) * 1.5;
        
        return { h, s, l, alpha, pointSize };
    }
    
    function calculateFractalAppearance(x, y, hue) {
        const mbX = x * 0.9 + Math.sin(animationPhase * 0.04) * 0.3;
        const mbY = y * 0.9 + Math.cos(animationPhase * 0.05) * 0.2;
        const mbResult = mandelbrotIteration(mbX, mbY, 15);
        
        let h, s, l, alpha, pointSize;
        
        if (mbResult.escaped) {
            h = (hue + mbResult.value * 1.5) % 1;
            s = 0.6 + Math.sin(mbResult.value * Math.PI * 3) * 0.2;
            l = 0.5 + Math.cos(mbResult.value * Math.PI * 4) * 0.15;
            
            alpha = 0.6 + mbResult.value * 0.3;
            pointSize = 1.3 + mbResult.value * 1.2;
        } else {
            h = hue;
            s = 0.6;
            l = 0.4;
            alpha = 0.7;
            pointSize = 1.2;
        }
        
        return { h, s, l, alpha, pointSize };
    }
    
    function calculateQuantumAppearance(x, y, hue) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // Create interference pattern
        const interference = 
            Math.sin(distance * 5 - animationPhase * 0.3) * 
            Math.cos(angle * 3 + animationPhase * 0.2);
        
        // Calculate probability-like value
        const probability = Math.abs(interference);
        
        // Calculate color based on quantum properties
        const h = (hue + probability * 0.2 + distance * 0.05) % 1;
        const s = 0.7 + probability * 0.3;
        const l = 0.5 + Math.sin(angle * 4 - animationPhase * 0.25) * 0.2;
        
        // Vary opacity with probability
        const alpha = 0.6 + probability * 0.4;
        
        // Size based on interference
        const pointSize = 1.2 + probability * 1.8;
        
        // Add occasional bright flashes
        if (Math.random() < 0.003) {
            return { 
                h, 
                s, 
                l: 0.9, 
                alpha: 0.9, 
                pointSize: pointSize * 1.5 
            };
        }
        
        return { h, s, l, alpha, pointSize };
    }
    
    function calculateLorenzAppearance(x, y, hue) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // Create a more distinct effect for the Lorenz "butterfly wings"
        const wingEffect = Math.sin(angle * 2 + distance * 3) * Math.cos(distance * 2 - angle);
        
        // Use the wing effect to create "altitude" bands of color
        // This mimics the layered structure of the Lorenz attractor
        const layerValue = (wingEffect + 1) * 0.5;  // Normalize to 0-1
        
        // Create a color gradient that shifts across the "wings"
        // Green to blue-green for the classic Lorenz butterfly look
        const h = (hue + layerValue * 0.2) % 1;
        
        // More saturated at the edges of the wings
        const s = 0.7 + layerValue * 0.3;
        
        // Brighter in the center parts
        const l = 0.4 + Math.pow(Math.sin(layerValue * Math.PI), 2) * 0.4;
        
        // More opaque overall with some variation
        const alpha = 0.7 + layerValue * 0.3;
        
        // Larger points in the dense regions of the attractor
        const pointSize = 1.5 + layerValue * 2.5;
        
        return { h, s, l, alpha, pointSize };
    }
    

    function calculateLorenzAppearance(x, y, hue) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // Create a height-map-like effect to simulate the Lorenz "butterfly wings"
        const wingEffect = Math.sin(angle * 2 + distance * 3) * Math.cos(distance * 2 - angle);
        
        // Use the wing effect to create "altitude" bands of color
        // This mimics the layered structure of the Lorenz attractor
        const layerValue = (wingEffect + 1) * 0.5;  // Normalize to 0-1
        
        // Create a color gradient that shifts across the "wings"
        // Green to blue-green for the classic Lorenz butterfly look
        const h = (hue + layerValue * 0.15) % 1;
        
        // More saturated at the edges of the wings
        const s = 0.7 + layerValue * 0.3;
        
        // Brighter in the center parts
        const l = 0.4 + Math.pow(Math.sin(layerValue * Math.PI), 2) * 0.3;
        
        // More transparent at the edges for a smoother transition
        const alpha = 0.5 + layerValue * 0.5;
        
        // Larger points in the dense regions of the attractor
        const pointSize = 1.0 + layerValue * 2.0;
        
        return { h, s, l, alpha, pointSize };
    }
    
    function calculateRosslerAppearance(x, y, hue) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // Create a spiral-based coloring effect
        // The Rössler attractor's most distinctive feature is its spiral structure
        const spiralPhase = angle + distance * 2;
        
        // Normalize spiral phase to 0-1 range
        const spiralValue = (Math.sin(spiralPhase) + 1) * 0.5;
        
        // Create pink-purple-blue color gradient that follows the spiral structure
        const h = (hue + spiralValue * 0.2) % 1;
        
        // More saturated colors along the spiral
        const s = 0.6 + spiralValue * 0.4;
        
        // Brighter along the spiral path
        const l = 0.4 + spiralValue * 0.3;
        
        // Vary opacity to emphasize spiral structure
        const alpha = 0.6 + spiralValue * 0.4;
        
        // Vary point size to highlight the spiral
        const pointSize = 1.2 + spiralValue * 1.8;
        
        return { h, s, l, alpha, pointSize };
    }
    
    function calculateHenonAppearance(x, y, hue) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // The Hénon map creates a distinctive horseshoe-shaped attractor
        // Use angle-based coloring to highlight this structure
        const anglePhase = (Math.cos(angle * 3) + 1) * 0.5;
        
        // Create a color gradient that emphasizes the horseshoe shape
        // Yellow-greens for the Hénon map's characteristic shape
        const h = (hue + anglePhase * 0.15) % 1;
        
        // More saturated at the edges of the horseshoe
        const s = 0.7 + Math.sin(distance * 4) * 0.3;
        
        // Brighter at the dense regions
        const l = 0.4 + anglePhase * 0.3;
        
        // More opaque at the dense regions
        const alpha = 0.6 + anglePhase * 0.4;
        
        // Vary size based on position in the horseshoe
        const pointSize = 1.3 + Math.sin(angle * 2) * 0.8;
        
        return { h, s, l, alpha, pointSize };
    }
    
    function calculateIkedaAppearance(x, y, hue) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x);
        
        // The Ikeda attractor creates elegant swirls and loops
        // Create a distance and angle-based coloring effect
        const swirl = Math.sin(distance * 3 + angle * 4 + animationPhase * 0.2);
        const swirlValue = (swirl + 1) * 0.5;
        
        // Warm orange-amber colors for the Ikeda attractor
        const h = (hue + swirlValue * 0.1) % 1;
        
        // More saturated along the swirl patterns
        const s = 0.6 + swirlValue * 0.4;
        
        // Brighter in the dense regions
        const l = 0.4 + Math.pow(swirlValue, 2) * 0.4;
        
        // Vary opacity to emphasize structure
        const alpha = 0.5 + swirlValue * 0.5;
        
        // Larger points at the attractor's focal points
        const pointSize = 1.0 + swirlValue * 2.0;
        
        return { h, s, l, alpha, pointSize };
    }
    function calculateStandardAppearance(x, y, hue) {
        const distance = Math.sqrt(x*x + y*y);
        const angle = Math.atan2(y, x) / Math.PI;
        
        const h = (hue + 0.1 * Math.sin(angle * 2 + animationPhase * 0.1)) % 1;
        const s = 0.7 + 0.3 * Math.sin(distance * 2 - animationPhase * 0.05);
        const l = 0.5 + 0.2 * Math.sin(x * y + animationPhase * 0.07);
        
        const alpha = 0.7;
        const pointSize = 1.5 + Math.abs(Math.sin(x * y) * 1);
        
        return { h, s, l, alpha, pointSize };
    }
    
    function drawPoint(x, y, appearance) {
        const { h, s, l, alpha, pointSize } = appearance;
        
        // Apply color mode (color or monochrome)
        const rgb = colorMode 
            ? hslToRgb(h, s, l) 
            : hslToRgb(0, 0, l); // Grayscale when colorMode is false
        
        // Draw a subtle glow first (larger, more transparent)
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        ctx.beginPath();
        ctx.arc(x, y, pointSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the main point
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Initialize the application
    init();
});
