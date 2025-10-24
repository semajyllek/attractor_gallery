/**
 * Function to compute Mandelbrot set escape iteration for a point
 */
function mandelbrotIteration(cx, cy, maxIter) {
    let x = 0;
    let y = 0;
    let iteration = 0;
    let x2 = 0;
    let y2 = 0;
    
    // Iterate until escape or max iterations
    while (x2 + y2 <= 4 && iteration < maxIter) {
        y = 2 * x * y + cy;
        x = x2 - y2 + cx;
        x2 = x * x;
        y2 = y * y;
        iteration++;
    }
    
    // Return iteration count and normalized escape value
    if (iteration === maxIter) {
        return { escaped: false, value: 0 };
    } else {
        // Smooth coloring formula
        const smooth = iteration + 1 - Math.log(Math.log(Math.sqrt(x2 + y2))) / Math.log(2);
        return { escaped: true, value: smooth / maxIter };
    }
}

/**
 * Function to convert HSL to RGB
 */
function hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
