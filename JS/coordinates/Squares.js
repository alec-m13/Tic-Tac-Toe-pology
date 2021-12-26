const origin = [0, 0];

const comparator = (a, b) => {return a[0]===b[0]? a[1] - b[1]: a[0] - b[0]};

const unitSphere = SortedSet.fromElements(comparator, [[0,1],[1,0],[0,-1],[-1,0]]);

const translate = (newOrigin, moving) => [moving[0] - newOrigin[0], moving[1] - newOrigin[1]];

const basis = SortedSet.fromElements(comparator, [[0,1],[1,0]]);

const rawOrientations = [
    a => a, // identity
    a => [a[1], -a[0]], // rotate right
    a => [-a[0], -a[1]], // rotate twice
    a => [-a[1], a[0]], // rotate left
    a => [-a[0], a[1]], // flip
    a => [a[1], a[0]], // rotate right flip
    a => [a[0], -a[1]], // rotate twice flip
    a => [-a[1], -a[0]], // rotate left flip
]

/*export*/ const Squares = new ReferenceGrid(
    origin,
    comparator,
    unitSphere,
    translate,
    rawOrientations.map(f => new SortedFunction(basis, f, comparator))
)