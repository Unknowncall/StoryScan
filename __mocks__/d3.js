// Mock D3 module for Jest tests
const d3 = {
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({ remove: jest.fn() })),
    append: jest.fn(() => ({
      attr: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      selectAll: jest.fn(() => ({
        data: jest.fn(() => ({
          join: jest.fn(() => ({
            attr: jest.fn().mockReturnThis(),
            append: jest.fn(() => ({
              attr: jest.fn().mockReturnThis(),
              style: jest.fn().mockReturnThis(),
              on: jest.fn().mockReturnThis(),
              transition: jest.fn(() => ({
                duration: jest.fn().mockReturnThis(),
                attrTween: jest.fn().mockReturnThis(),
                delay: jest.fn().mockReturnThis(),
                style: jest.fn().mockReturnThis(),
              })),
              text: jest.fn().mockReturnThis(),
              each: jest.fn().mockReturnThis(),
            })),
          })),
        })),
      })),
    })),
  })),
  hierarchy: jest.fn((data) => ({
    sum: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  })),
  treemap: jest.fn(() => {
    const fn = jest.fn((data) => ({
      descendants: () => [],
      value: 100,
    }));
    fn.size = jest.fn().mockReturnThis();
    fn.paddingOuter = jest.fn().mockReturnThis();
    fn.paddingTop = jest.fn().mockReturnThis();
    fn.paddingInner = jest.fn().mockReturnThis();
    fn.round = jest.fn().mockReturnThis();
    return fn;
  }),
  pie: jest.fn(() => {
    const fn = jest.fn((data) =>
      data.map((d, i) => ({
        data: d,
        startAngle: 0,
        endAngle: (Math.PI * 2) / data.length,
        index: i,
      }))
    );
    fn.value = jest.fn().mockReturnThis();
    fn.sort = jest.fn().mockReturnThis();
    return fn;
  }),
  arc: jest.fn(() => {
    const fn = jest.fn(() => 'M0,0');
    fn.innerRadius = jest.fn().mockReturnThis();
    fn.outerRadius = jest.fn().mockReturnThis();
    fn.centroid = jest.fn(() => [0, 0]);
    return fn;
  }),
  interpolate: jest.fn((a, b) => (t) => b),
};

module.exports = d3;
