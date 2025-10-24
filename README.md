# Attractor Gallery

An interactive visualization of strange attractors and chaotic systems.

## Live Demo

https://semajyllek.github.io/attractor_gallery/

## Mathematical Formulations

### Clifford Attractors
```
x_n+1 = sin(a * y_n) + c * cos(a * x_n)
y_n+1 = sin(b * x_n) + d * cos(b * y_n)
```

### Lorenz Attractor
```
dx/dt = σ(y - x)
dy/dt = x(ρ - z) - y
dz/dt = xy - βz
```
Where σ = 10, ρ = 28, and β = 8/3

### Rössler Attractor
```
dx/dt = -y - z
dy/dt = x + ay
dz/dt = b + z(x - c)
```
Where a = 0.2, b = 0.2, and c = 5.7

### Hénon Map
```
x_n+1 = 1 - a * x_n^2 + y_n
y_n+1 = b * x_n
```
Where a = 1.4 and b = 0.3

### Ikeda Attractor
```
x_n+1 = 1 + u(x_n * cos(t) - y_n * sin(t))
y_n+1 = u(x_n * sin(t) + y_n * cos(t))
```
Where t = 0.4 - 6/(1 + x_n^2 + y_n^2) and u = 0.918

## Usage

Click anywhere to cycle through patterns.

Top-left corner has an invisible toggle for color/monochrome mode.

## License

MIT License
