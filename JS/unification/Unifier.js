/*
    Unifier is a SortedSet with tensors. Objects are added as (obj, tensor) pairs where obj is the object and tensor describes the object's shape.

    Tensors are maps of maps. They are stored as (object, shape) pairs where object is ether an element or a Map and shape defines the map.
    Each shape has an in and out which are shapes. Null represents the base type of element (which the base comparator uses).
    Example shapes:
    elements (e):
        null
    map of elements (e -> e):
        {in: null, out: null}
    map to maps (e -> (e -> e)):
        {in: null, out: {in: null, out: null}}
    map of maps to maps ((e -> e) -> (e -> e)):
        {in: {in: null, out: null}, out: {in: null, out: null}}
*/

//import { SortedSet } from "./SortedSet";

/*export*/ class Unifier extends SortedSet {
    constructor(comparator) {
        super(Unifier.makeUnifiedComparator(comparator));
    }

    makeTensor(map, shape = null) {
        if (!shape) return {object: map, shape: shape};
    }

    static shapeToString(shape) {
        if (!shape) return "e";
        return "("+this.shapeToString(shape.in)+" -> "+this.shapeToString(shape.out)+")";
    }

    // lexographic sorter where null is minimal
    static shapeSorter(t1, t2, recurse = Unifier.shapeSorter) {
        // T represents a proper tensor (? ?), e represents null (which means element type)
        if (!t1) { // e vs ?
            if (!t2) return 0; // e vs e
            return -1; // e vs T
        }
        if (!t2) return 1; // T vs e
        // from here on it's all T vs T
        let i1 = t1.in, o1 = t1.out, i2 = t2.in, o2 = t2.out;
        if (!i1) { // (e, ?) vs (?, ?)
            if (!i2) { // (e, ?) vs (e, ?)
                if (!o1) { // (e, e) vs (e, ?)
                    if (!o2) return 0; // (e, e) vs (e, e)
                    return -1; // (e, e) vs (e, T)
                }
                if (!o2) return 1; // ( e, T) vs (e, e)
                return recurse(o1, o2, recurse); // (e, T) vs (e, T)
            }
            return -1; // (e, ?) vs (T, ?)
        }
        if (!i2) return 1; // (T, ?) vs (e, ?)
        let inResult = recurse(i1, i2, recurse);
        if (inResult !== 0) return inResult; // (T, ?) vs (T', ?) with T != T'
        // the ins are equivalent so we just have to check the outs
        if (!o1) { // e vs ?
            if (!o2) return 0; // e vs e
            return -1; // e vs T
        }
        if (!o2) return 1; // T vs e
        return recurse(o1, o2, recurse); // T vs T
    }

    static followTensorSorter(a, b, baseCompare, tensor) {
        if (!tensor) return baseCompare(a, b);
        // build this out
    }

    static makeUnifiedComparator(comparator, tensorSorter = Unifier.tensorSorter) {
        return function(a, b) {
            let tres = tensorSorter(a.tensor, b.tensor);
            if (tres !== 0) return tres;
            
        }
    }
}