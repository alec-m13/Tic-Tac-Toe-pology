/*
    ComparatorGenerator generates comparators for use on maps. They take (id, comparator) pairs where id is a string defining a type and
    comparator compares data of that type. They produce higher order comparators for arbitrary shapes.

    Shapes are objects which define the input and output types of functions. At the base are elements. Each base element type has a string
    id and a base comparator. The assumption is that any object of corresponding type can be consistently compared using the comparator.
    For example, the base type "int" could be given the comparator (a, b) => a-b; The element type "string" could be given the comparator
    (a, b) => a.localeCompare(b); The element type "array" could be given a lexographic comparator.

    Functions take objects of some type and produce objects of some other type. Functions have a shape which defines these types.
    Functions are described by the shape {in: type1, out: type2, function: true}.

    The third kind of shape is the tuple. These are arrays of shapes. They allow for functions to take in multiple elements at once.

    Take the function below:

        function addToEach(x, array) {
            return array.map(a => a+x).join(" ");
        }

    Thiis function takes in an integer and an array and returns a string. It is defined by the shape

        {
            function: true,
            in: ["int", "array"],
            out: "string"
        }

    Functions and maps are related but different. Functions are JS functions: they take arbitrary input values , run some procedure unknown
    at the level of shape, and then return a value. One function can take arbitrary values (assuming the types are correct).

    Maps are like snapshots of functions. They are defined by a function but they try to call it as little as possible. They instead store
    the output from each input called of them. Storage is done in a SortedMap object.

    Shapes are lexographically comparable to each other and maps of the same shape are lexographically comparable as well. Therefore all
    types of maps defined over comparable base element types are comparable to each other. ComparatorGenerator generates the various levels
    of comparators required for these comparisons. All copmarisons are done lexographically and an effort is made to use fast-computable values
    earlier in the comparison to keep total sort time efficiency at a maximum.
*/

/*export*/ class ComparatorGenerator {
    constructor(comparators) {
        // copy comparators to make them less mutable
        let c = this.baseComparators = {};
        Object.assign(c, comparators);
        
        let myComparators = this.comparators = new SortedMap(ComparatorGenerator.shapeComparator);
        for (let id in c) myComparators.set(id, c[id]);
    }

    get(shape) {

    }

    // multilayered lexographic sorter
    static shapeComparator(s1, s2) {
        // F represents function shape ? -> ?, A represents array, and e represents elemental tensor. S means F or A
        // e < F < A
        if (typeof s1 === "string") { // e vs ?
            if (typeof s2 === "string") return s1 < s2? -1: s1 > s2? 1: 0; // e vs e
            return -1; // e vs S
        }
        if (typeof s2 === "string") return 1; // S vs e
        // from here on it's all S vs S
        if (s1.function) { // F vs S
            if (s2.function) { // F vs F
                let i1 = s1.in, i2 = s2.in, o1 = s1.out, o2 = s2.out;
                if (typeof i1 === "string") { // e -> ? vs ? -> ?
                    if (typeof i2 === "string") {   /// e -> ? vs e -> ?
                        if (i1 !== i2) return i1 < i2? -1: 1; // string compare
                        if (typeof o1 === "string") { // e -> e vs e -> ?
                            if (typeof o2 === "string") { // e -> e vs e -> e
                                return o1 < o2? -1: o1 > o2? 1: 0; // string compare
                            }
                            return -1; // e -> e vs e -> S
                        }
                        if (typeof o2 === "string") return 1; // e -> S vs e -> e
                        if (o1.function) { // e -> F vs e -> S
                            if (o2.function) return ComparatorGenerator.shapeComparator(o1, o2); // e -> F vs e -> F
                            return -1; // e -> F vs e -> A
                        }
                    }
                    return -1; // e -> ? vs S -> ?
                }
                if (typeof i2 === "string") return 1; // S -> ? vs e -> ?
                if (i1.function) { // F -> ? vs ? -> ?
                    if (i2.function) { // F -> ? vs F -> ?
                        let res = ComparatorGenerator.shapeComparator(i1, i2);
                        if (res !== 0) return res;
                        if (typeof o1 === "string") { // F -> e vs F -> ?
                            if (typeof o2 === "string") return o1 < o2? -1: o1 > o2? 1: 0; // F -> e vs F -> e
                            return -1; // F -> e vs F -> S
                        }
                        if (o1.function) { // F -> F vs F -> ?
                            if (typeof o2 === "string") return 1; // F -> F vs F -> e
                            if (o2.function) return ComparatorGenerator.shapeComparator(o1, o2); // F -> F vs F -> F
                            return -1; // F -> F vs F -> A
                        }
                        if (typeof o2 === "string") return 1; // F -> A vs F -> e
                        if (o2.function) return 1; // F -> A vs F -> F
                        // F -> A vs F -> A
                        if (o1.length !== o2.length) return o1.length - o2.length;
                        let l = o1.length;
                        for (let i = 0; i < this.length; ++i) {
                            res = ComparatorGenerator.shapeComparator(o1[i], o2[i]);
                            if (res !== 0) return res;
                        }
                        return 0;
                    }
                    return -1; // F -> ? vs A -> ?
                }
                if (typeof i2 === "string") return 1; // A -> ? vs e -> ?
                if (i2.function) return 1; // A -> ? vs F -> ?
                // A -> ? vs A -> ?
                if (i1.length !== i2.length) return i1.length - i2.length;
                let l = i1.length, res;
                for (let i = 0; i < l; ++i) {
                    res = ComparatorGenerator.shapeComparator(i1[i], i2[i]);
                    if (res !== 0) return res;
                }
                if (typeof o1 === "string") { // A -> e vs A -> ?
                    if (typeof o2 === "string") return o1 < o2? -1: o1 > o2? 1: 0; // A -> e vs a -> e
                    return -1; // A -> e vs A -> S
                }
                if (o1.function) { // A -> F vs A -> ?
                    if (typeof o2 === "string") return 1; // A -> F vs A -> e
                    if (o2.function) return ComparatorGenerator.shapeComparator(o1, o2); // A -> F vs A -> F
                    return -1; // A -> F vs A -> A
                }
                if (typeof o2 === "string") return 1; // A -> A vs A -> e
                if (o2.function) return 1; // A -> A vs A -> F
                // A -> A vs A -> A
                if (o1.length !== o2.length) return o1.length - o2.length;
                l = o1.length;
                for (let i = 0; i < l; ++i) {
                    res = ComparatorGenerator.shapeComparator(o1[i], o2[i]);
                    if (res !== 0) return res;
                }
                return 0;
            }
            return -1; // F vs A
        }
        if (s2.function) return 1; // A vs F
        // A vs A
        if (s1.length !== s2.length) return s1.length - s2.length;
        let l = s1.length, res;
        for (let i = 0; i < l; ++i) {
            res = ComparatorGenerator.shapeComparator(s1[i], s2[i]);
            if (res !== 0) return res;
        }
        return 0;
    }

    static shapeToString(shape) {
        if (typeof shape === "string") return shape;
        return "("+ComparatorGenerator.shapeToString(shape.in)+" -> "+ComparatorGenerator.shapeToString(shape.out)+")";
    }
}
