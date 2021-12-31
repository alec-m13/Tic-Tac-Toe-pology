/*
    This coridnate system is called "axial" on https://www.redblobgames.com/grids/hexagons/
*/

const origin = [0, 0];

const comparator = (a, b) => {return a[0]===b[0]? a[1] - b[1]: a[0] - b[0]};

const unitSphere = SortedSet.fromElements(comparator, [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]]);

const translate = (newOrigin, moving) => [moving[0] - newOrigin[0], moving[1] - newOrigin[1]];

const basis = SortedSet.fromElements(comparator, [[0,1],[1,0]]);

const rawOrientations = [
    a => a, // identity
    a => [-a[0], a[0]+a[1]], // rotate right once
    a => [-a[0]-a[1], a[0]], // rotate right twice
    a => [-a[0], -a[1]], // rotate thrice
    a => [a[0], -a[0]-a[1]], // rotate left twice
    a => [a[0]+a[1], -a[0]], // rotate left once
    a => [a[1], a[0]], // flip
    a => [-a[1], a[1]+a[0]], // flip rotate right once
    a => [-a[1]-a[0], a[1]], // flip rotate right twice
    a => [-a[1], -a[0]], // flip rotate thrice
    a => [a[1], -a[1]-a[0]], // flip rotate left twice
    a => [a[1]+a[0], -a[1]], // flip rotate left once
];

const sortedFunctionGenerator = SortedFunction.generator(basis, comparator);

/*export*/ const Hexagons = new ReferenceGrid(
    origin,
    comparator,
    unitSphere,
    translate,
    rawOrientations.map(sortedFunctionGenerator)
)