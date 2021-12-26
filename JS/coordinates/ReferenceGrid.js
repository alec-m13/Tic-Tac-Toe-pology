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
        unitSphere, // SortedSet <coordinateType> (elements are called directions)
        translate, // function (<coordinateType>, <coordinateType>) => <coordinateType>
        orientations, // Set of functions <coordinateType> => <coordinateType> which take <direction> => <direction>
    ) {
        // direct setters
        this.origin = origin;
        this.coordinateComparator = coordinateComparator;
        this.unitSphere = unitSphere;
        this.translate = translate;
        this.orientations = orientations;

        // computable data
        this.negativeDirections = this.computeNegativeDirections();

        // consistency check
        //fleshOrientations.call(this);
    }

    computeNegativeDirections() {
        let map = new SortedMap(this.coordinateComparator), translate = this.translate, sphere = this.unitSphere, origin = this.origin;
        let neg;
        for (let direction of sphere) {
            neg = translate(direction, origin);
            if (!sphere.has(neg)) throw Error("every direction must have a negative");
            map.set(direction, neg);
        }
        return map;
    }

    isOrigin(coords) {
        return this.coordinateComparator(this.origin, coords) === 0;
    }
}
