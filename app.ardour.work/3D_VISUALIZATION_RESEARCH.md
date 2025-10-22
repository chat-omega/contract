# 3D Visualization Libraries Research
## For Circular Market Map - Interactive 3D Donut/Bagel Chart

**Goal:** Replace current 2D Recharts circular treemap with an interactive 3D sliced donut/bagel visualization that can be spun/rotated.

---

## Recommended Libraries

### 1. **Apache ECharts** ⭐ RECOMMENDED
**Best for**: Production-ready 3D pie/donut charts with minimal setup

**Pros:**
- ✅ Built-in 3D pie chart support (`pie3D` type)
- ✅ Excellent performance and optimization
- ✅ Smooth animations and transitions
- ✅ Interactive rotation and zoom
- ✅ Good documentation and examples
- ✅ Smaller bundle size than Plotly
- ✅ Easy integration with React (`echarts-for-react`)
- ✅ Supports drill-down hierarchies

**Cons:**
- ⚠️ Some documentation in Chinese (but examples are clear)
- ⚠️ Less customization than D3/Three.js

**Implementation Complexity:** ⭐⭐ (Medium-Low)

**Example Code:**
```tsx
import ReactECharts from 'echarts-for-react';

const option = {
  series: [{
    type: 'pie3D',
    data: [
      { value: 850, name: 'Fitness & Activity' },
      { value: 650, name: 'Digital Health Coaching' }
    ],
    radius: ['40%', '75%'], // Donut shape
    center: ['50%', '50%'],
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
};

<ReactECharts option={option} style={{ height: '100%' }} />
```

**Installation:**
```bash
npm install echarts echarts-for-react echarts-gl
```

**Demo:** https://echarts.apache.org/examples/en/editor.html?c=pie3d

---

### 2. **Plotly.js**
**Best for**: Scientific/data visualization with interactive 3D

**Pros:**
- ✅ Native 3D support
- ✅ Interactive rotation built-in
- ✅ Good React wrapper (`react-plotly.js`)
- ✅ Excellent 3D donut support
- ✅ Professional appearance
- ✅ Good documentation

**Cons:**
- ⚠️ Larger bundle size (~3MB)
- ⚠️ Can be slow with large datasets
- ⚠️ Less control over styling

**Implementation Complexity:** ⭐⭐ (Medium)

**Example Code:**
```tsx
import Plot from 'react-plotly.js';

<Plot
  data={[{
    type: 'pie',
    hole: 0.4, // Donut shape
    values: [850, 650, 550],
    labels: ['Fitness', 'Health Coaching', 'Remote Monitoring'],
    marker: {
      colors: ['#4ade80', '#60a5fa', '#f59e0b']
    }
  }]}
  layout={{
    scene: {
      camera: {
        eye: {x: 1.5, y: 1.5, z: 1.5}
      }
    },
    height: 500
  }}
/>
```

**Installation:**
```bash
npm install react-plotly.js plotly.js
```

---

### 3. **React Three Fiber + Drei**
**Best for**: Maximum customization and stunning 3D visuals

**Pros:**
- ✅ Complete 3D control (Three.js wrapper for React)
- ✅ Most impressive visuals possible
- ✅ Excellent performance
- ✅ Active community
- ✅ Fully customizable interactions
- ✅ Can create truly unique experiences

**Cons:**
- ⚠️ Requires building chart from scratch
- ⚠️ Steep learning curve
- ⚠️ More development time
- ⚠️ Requires WebGL knowledge

**Implementation Complexity:** ⭐⭐⭐⭐⭐ (Very High)

**Example Concept:**
```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function DonutChart() {
  return (
    <Canvas>
      <OrbitControls enableRotate={true} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {/* Custom 3D donut segments */}
      <TorusSegment args={[2, 0.5, 16, 100]} rotation={[0, 0, angle]} />
    </Canvas>
  );
}
```

**Installation:**
```bash
npm install three @react-three/fiber @react-three/drei
```

---

### 4. **Chart.js + chart.js-3d-pie**
**Best for**: Simple integration if already using Chart.js

**Pros:**
- ✅ Easy to use if familiar with Chart.js
- ✅ Lightweight
- ✅ Good documentation

**Cons:**
- ⚠️ Limited true 3D capabilities (mostly 2.5D)
- ⚠️ Less impressive than ECharts or Plotly
- ⚠️ Fewer interaction options

**Implementation Complexity:** ⭐ (Low)

---

### 5. **D3.js + Custom 3D**
**Best for**: Complete control with custom implementation

**Pros:**
- ✅ Maximum flexibility
- ✅ Can create exactly what you want
- ✅ Powerful data manipulation

**Cons:**
- ⚠️ Very time-consuming to build
- ⚠️ Requires advanced D3 and SVG/Canvas knowledge
- ⚠️ Complex 3D transformations

**Implementation Complexity:** ⭐⭐⭐⭐⭐ (Very High)

---

## Comparison Table

| Library | Bundle Size | 3D Quality | Ease of Use | Performance | Interactivity |
|---------|------------|------------|-------------|-------------|---------------|
| **ECharts** | ~300KB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Plotly** | ~3MB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Three Fiber** | ~150KB | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Chart.js 3D** | ~200KB | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **D3 Custom** | ~70KB | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Final Recommendation

### **For Immediate Implementation: Apache ECharts**

**Why:**
1. Best balance of quality, performance, and ease of implementation
2. Built-in 3D pie/donut support with minimal code
3. Professional appearance matches enterprise expectations
4. Good performance even with hierarchical data
5. Easy to maintain and update
6. Reasonable bundle size

### **For Future Enhancement: React Three Fiber**

**Why:**
1. Most impressive visual results
2. Complete creative control
3. Best performance for complex interactions
4. Future-proof and highly customizable

---

## Implementation Roadmap

### Phase 1 (Recommended): ECharts Migration
**Timeline:** 1-2 days
- Install `echarts`, `echarts-for-react`, `echarts-gl`
- Convert current data structure to ECharts format
- Implement 3D pie chart with drill-down
- Add rotation controls
- Test performance

### Phase 2 (Optional): Three.js Enhancement
**Timeline:** 1-2 weeks
- Prototype with React Three Fiber
- Build custom 3D donut segments
- Implement smooth animations
- Add advanced interactions (spin, slice expansion, etc.)
- Polish and optimize

---

## Code Examples & Resources

### ECharts 3D Pie Examples:
- Official Examples: https://echarts.apache.org/examples/en/index.html#chart-type-pie
- 3D Extensions: https://github.com/ecomfe/echarts-gl
- React Integration: https://github.com/hustcc/echarts-for-react

### Three.js Resources:
- React Three Fiber Docs: https://docs.pmnd.rs/react-three-fiber
- Drei Helpers: https://github.com/pmndrs/drei
- Three.js Journey: https://threejs-journey.com/

---

**Last Updated:** 2025-10-19
**Created for:** GOQii M&A Targets Circular Market Map Visualization
