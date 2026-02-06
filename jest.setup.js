import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)', // Return true for dark mode preference
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
    promise: jest.fn(),
    custom: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock D3 for SVG rendering
const createD3SelectionMock = () => {
  const mockSelection = {
    attr: jest.fn(function () {
      return this;
    }),
    append: jest.fn(function () {
      return this;
    }),
    filter: jest.fn(function () {
      return this;
    }),
    each: jest.fn(function () {
      return this;
    }),
    text: jest.fn(function () {
      return this;
    }),
    style: jest.fn(function () {
      return this;
    }),
    on: jest.fn(function () {
      return this;
    }),
    selectAll: jest.fn(function () {
      return this;
    }),
    select: jest.fn(function () {
      return this;
    }),
    data: jest.fn(function () {
      return this;
    }),
    datum: jest.fn(function () {
      return this;
    }),
    join: jest.fn(function () {
      return this;
    }),
    enter: jest.fn(function () {
      return this;
    }),
    remove: jest.fn(function () {
      return this;
    }),
    transition: jest.fn(function () {
      return this;
    }),
    duration: jest.fn(function () {
      return this;
    }),
    attrTween: jest.fn(function () {
      return this;
    }),
    delay: jest.fn(function () {
      return this;
    }),
    call: jest.fn(function () {
      return this;
    }),
    node: jest.fn(() => ({
      getTotalLength: jest.fn(() => 100),
      getBBox: jest.fn(() => ({ width: 100, height: 40, x: 0, y: 0 })),
    })),
  };
  return mockSelection;
};

const mockHierarchy = {
  sum: jest.fn(function () {
    return this;
  }),
  sort: jest.fn(function () {
    return this;
  }),
  descendants: jest.fn(() => []),
  value: 1000,
  depth: 0,
  children: [],
};

jest.mock('d3', () => ({
  select: jest.fn(() => createD3SelectionMock()),
  hierarchy: jest.fn(() => mockHierarchy),
  treemap: jest.fn(() => {
    const treemapLayout = jest.fn(() => mockHierarchy);
    treemapLayout.size = jest.fn(function () {
      return this;
    });
    treemapLayout.paddingOuter = jest.fn(function () {
      return this;
    });
    treemapLayout.paddingTop = jest.fn(function () {
      return this;
    });
    treemapLayout.paddingInner = jest.fn(function () {
      return this;
    });
    treemapLayout.round = jest.fn(function () {
      return this;
    });
    return treemapLayout;
  }),
  // Mock D3 pie and arc for FileTypeBreakdown
  pie: jest.fn(() => {
    const pieGenerator = jest.fn((data) => data);
    pieGenerator.value = jest.fn(function () {
      return this;
    });
    pieGenerator.sort = jest.fn(function () {
      return this;
    });
    return pieGenerator;
  }),
  arc: jest.fn(() => {
    const arcGenerator = jest.fn(() => 'M0,0');
    arcGenerator.innerRadius = jest.fn(function () {
      return this;
    });
    arcGenerator.outerRadius = jest.fn(function () {
      return this;
    });
    arcGenerator.cornerRadius = jest.fn(function () {
      return this;
    });
    return arcGenerator;
  }),
  scaleOrdinal: jest.fn(() => jest.fn((d) => '#000000')),
  schemeTableau10: [],
  // D3 functions used by HistoryGraph (line chart)
  extent: jest.fn(() => [new Date('2025-01-01'), new Date('2025-12-31')]),
  max: jest.fn(() => 1000000),
  scaleTime: jest.fn(() => {
    const scale = jest.fn((d) => 0);
    scale.domain = jest.fn(function () {
      return this;
    });
    scale.range = jest.fn(function () {
      return this;
    });
    scale.invert = jest.fn(() => new Date());
    return scale;
  }),
  scaleLinear: jest.fn(() => {
    const scale = jest.fn((d) => 0);
    scale.domain = jest.fn(function () {
      return this;
    });
    scale.range = jest.fn(function () {
      return this;
    });
    return scale;
  }),
  line: jest.fn(() => {
    const lineGen = jest.fn(() => 'M0,0L10,10');
    lineGen.x = jest.fn(function () {
      return this;
    });
    lineGen.y = jest.fn(function () {
      return this;
    });
    lineGen.curve = jest.fn(function () {
      return this;
    });
    return lineGen;
  }),
  axisBottom: jest.fn(() => {
    const axis = jest.fn();
    axis.ticks = jest.fn(function () {
      return this;
    });
    axis.tickFormat = jest.fn(function () {
      return this;
    });
    axis.tickSize = jest.fn(function () {
      return this;
    });
    return axis;
  }),
  axisLeft: jest.fn(() => {
    const axis = jest.fn();
    axis.ticks = jest.fn(function () {
      return this;
    });
    axis.tickFormat = jest.fn(function () {
      return this;
    });
    axis.tickSize = jest.fn(function () {
      return this;
    });
    return axis;
  }),
  bisector: jest.fn(() => ({
    left: jest.fn(() => 0),
    right: jest.fn(() => 0),
  })),
  timeFormat: jest.fn(() => jest.fn(() => 'Jan 01, 2025 00:00')),
  pointer: jest.fn(() => [0, 0]),
  curveMonotoneX: 'curveMonotoneX',
}));
