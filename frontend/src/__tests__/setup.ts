import '@testing-library/jest-dom';

// Mock ResizeObserver for Recharts ResponsiveContainer
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
