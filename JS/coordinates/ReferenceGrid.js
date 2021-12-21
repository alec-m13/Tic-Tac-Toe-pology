/*
    Reference grid is the start of all this. Manifolds are spaces which are locally trivial and the reference grid defines the trivial space.
    Reference grids manage coordinates. We can automate most of the reference grid machinery by defining a few pieces of group-theoretic data.

     -- We will use tesselation of the plane by squares as an example.

    The machinery is powered by JS' Set and Map features so coordinates can be assigned via any data type compatible with those (i.e. any
    data type).

    We start by declaring the origin. This is some object which represents the origin. It's instantiation-specific.

     -- The origin is the array [0, 0]. It represents the point x = 0, y = 0 in the plane.

    Next we give a coordinate comparator function. The comparator does not need to respect any grid structure; it just needs to
    be consistent to allow for binary searching of coordinates.

     -- coordinateComparator(a, b) {
     --     // a and b are length 2 arrays
     --     return a[0]===b[0]? a[1] - b[1]: a[0] - b[0];
     -- }
    
    After that we declare unit directions. These correspond to adjacent positions. Each face of a tile borders a different neighbor and this
    is where we set those neighbor positions. The set of directions is called the unit sphere.

     -- For planar squares there are four neighbors: up, right, down, left. We will use the characters {u, r, d, l} to represent these.

     Directions can be composed to form paths. The reference grid must be given a function which follows a direction to give its resulting position.
    
     -- move(position, direction) {
     --     // position and direction are both length 2 arrays
     --     return [position[0] + direction[0], position[1] + direction[1]];
     -- }
    
    We now have enough structure for positions and translations. Translations are built up as sequences (arrays) of directions. Up next
    is orientations.

    Orientations are mappings on coordinates which preserve the unit sphere and respect paths. In algebraic terms they are group automorphisms.
    They are given as functions from coordinates to coordinates. When fed coordinates from the unit sphere they must return coordinates
    from the unit sphere. They also have to preserve paths. That is, if [d0, d1, ..., dn] is a path (each di is in the unit sphere) and if O
    is an orientation then for any position x, applying the path [d0, d1, ..., dn] to x and then taking O must result in coordinates equivalent
    to following [O(d0), O(d1), ..., O(dn)] from O(x). This condition is not checked; it's assumed.

     -- One orientation transformation is rotation clockwise by a quarter circle. This can be represented as the map
     -- (0, 1) -> (1, 0); (1, 0) -> (0,-1); (0,-1) -> (-1,0); (-1,0) -> (0, 1);
     -- Another orientation is vertical reflection represented by (0, 1) -> (0,-1); (1, 0) -> (1, 0); (0,-1) -> (0, 1); (-1,0) -> (-1,0);

    Orientations transformations form a group. The ReferenceGrid constructor can extrapolate the whole group from a generating set.
    This means not all orientations have to be declared: it will calculate all possible combinations of the declared orientations.
*/

/*export*/ class ReferenceGrid {
    
    constructor(
        origin, // object <coordinateType>
        coordinateComparator, // function (<coordinateType>, <coordinateType>) => int
        directions, // Set <coordinateType> (elements are called directions)
        move, // function (<coordinateType>, <direction>) => <coordinateType>
        orientations, // Set of Maps <direction> => <direction>
    ) {
        // direct setters
        this.origin = origin;
        this.coordinateComparator = coordinateComparator;
        this.directions = directions;
        this.move = move;
        this.orientations = orientations;

        // other setters
        this.encounteredCoordinates = [this.origin];

        // computable data
        unifyDeclaredData.call(this);
        findReverseDirections.call(this);
        //fleshOrientations.call(this);
    }

    isOrigin(coords) {
        return this.coordinateComparator(this.origin, coords) === 0;
    }

    unifyCoordinates(coords) {
        let encountereds = this.encounteredCoordinates, comp = this.coordinateComparator;
        let low = 0, high = encountereds.length-1, mid = high, res;
        if (comp(coords, encountereds[low]) < 0) {
            encountereds.unshift(coords);
            return coords;
        }
        if (comp(coords, encountereds[high]) >= 0) {
            if (comp(coords, encountereds[high]) === 0) return encountereds[high];
            encountereds.push(coords);
            return coords;
        }
        while (low+1 < high) {
            mid = (low + high) >>> 1;
            res = comp(encountereds[mid], coords);
            if (res > 0) {
                high = mid;
                continue;
            }
            if (res < 0) {
                low = mid;
                continue;
            }
            return encountereds[mid];
        }
        if (comp(coords, encountereds[low]) === 0) return encountereds[low];
        if (comp(coords, encountereds[high]) === 0) return encountereds[high];
        encountereds.splice(high, 0, coords);
        return coords;
    }

    postUnify(f) {
        return function(...args) {
            return this.unifyCoordinates(f(...args));
        }
    }
}

function unifyDeclaredData() {
    this.unifyCoordinates(this.origin);
    for (let direction of this.directions) this.unifyCoordinates(direction);
    this.move = this.postUnify(this.move);
    let oldOrientations = this.orientations;
    let ors = this.orientations = new Set();
    let unifiedMap;
    for (let ot of oldOrientations.values()) {
        unifiedMap = new Map();
        for (let e of ot.entries()) unifiedMap.set(this.unifyCoordinates(e[0]), this.unifyCoordinates(e[1]));
        ors.add(unifiedMap);
    }
    console.log(this);
}

function findReverseDirections() {
    let map = this.reverseDirections = new Map();
    for (let direction of this.directions) map.set(direction, findReverseDirection.call(this, direction));
}

function findReverseDirection(direction) {
    for (let otherDirection of this.directions) if (this.isOrigin(this.move(direction, otherDirection))) return otherDirection;
    throw Error("uninvertible direction: " + direction);
}

function fleshOrientations() {
    // orientation transformations
    let encounteredMaps = new Set();
    for (let orientation of this.orientations) encounteredMaps.add(orientation);
    function unifyMap(map) {
        for (let x of encounteredMaps) if (sameMap(x, map)) return x;
        encounteredMaps.add(map);
        return map;
    }
    // pairs of orientation transformations
    let encounteredPairs = new Set();
    function unifyPair(a, b) {
        for (let pair of encounteredPairs) if (pair[0] === a && pair[1] === b) return {new: false, pair: pair};
        let pair = [a, b];
        encounteredPairs.add(pair);
        return {new: true, pair: pair};
    }
    console.log("flesh killed");
    console.log("encounteredMaps",encounteredMaps);
    console.log("encounteredPairs",encounteredPairs);
    // from pair of orientation transformations to orientation transformation
    /*let group = new Map(), size = -1, pair;
    while (size !== group.size) {
        for (let a of encounteredMaps) for (let b of encounteredMaps) {
            pair = unifyPair(a, b);
            if (!pair.new) continue;
            pair = pair.pair;
            group.set(pair, unifyMap(composeMaps(...pair)));
        }
    }
    for (let o of encounteredMaps) this.orientations.add(o);
    this.orientationGroup = group;*/
}

function composeMaps(first, second) {
    let comp = new Map();
    for (let e of first.entries()) comp.set(e[0], second.get(e[1]));
    return comp;
}

function sameMap(a, b) {
    if (a.size !== b.size) return false;
    for (let e of a.entries()) if (e[1] !== b.get(e[0])) return false;
    return true;
}