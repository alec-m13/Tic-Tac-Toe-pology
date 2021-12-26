/*

SortedMap is a SortedSet but where the elements are pairs [in, out]. They are fed two sorter functions, one for each type of in/out.
For notational clarity a -> b means [a, b].

Maps utilize wildcards (*). Wildcards match any object in the (mapified) comparator function. They are intended for internal use only.

For example, suppose we have a SortedMap of numbers (inSorter = outsorter = (a, b) => a-b) and we set 0 -> 1. The object [0, 1] is
added to the map's internal sorted set.

Now suppose we want to add the element 0 -> *. This will match 0 -> 1 re the comparator so there's nothing to add. The map's internal elements
are unchanged: the only one is 0 -> 1.

This works both ways. If we set 1 -> * then the elements are 0 -> 1, 1 -> *. If we then add 1 -> 0, the comparator will say that 1 -> 0 and
1 -> * are the same element. Then nothing changes, the elements remain 0 -> 1 and 1 -> *.

It's best not to add elements directly to a map: use set instead. Set will find an occurrence with the same in value (if one exists) and replace
it (if necessary) to the new set out value. Get is similar: it will find an entry with the same in value and return the corresponding out.
Set replacement is done in place on the object [in, out]. The out value is directly reassigned in place.
*/

/*export*/ class SortedMap {
    constructor(inSorter, outSorter = inSorter, mapifiedSorter = SortedMap.mapifyComparators(inSorter, outSorter)) {
        this.sortedSet = new SortedSet(mapifiedSorter);
        this.inSorter = inSorter;
        this.outSorter = outSorter;
        this.size = 0;
    }


    ifHas(obj, thenThis, elseThis) {
        if (this.has(obj)) {
            if (thenThis) return thenThis(this.processFound);
        } else {
            if (elseThis) return elseThis();
        }
    }

    boundIfHas(obj, thenThis, elseThis, thisObject = this, ...args) {
        if (this.has(obj)) {
            if (thenThis) return thenThis.call(thisObject, this.processFound, ...args);
        } else {
            if (elseThis) return elseThis.call(thisObject, obj, ...args);
        }
    }

    // JS Map functions
    clear() {
        this.set.clear();
        this.size = 0;
    }

    delete(obj) {
        return this.boundIfHas(obj, this.postProcessDelete, SortedSet.returnFalse);
    }
    postProcessDelete(obj) {
        --this.size;
        return this.sortedSet.postProcessDelete(); // this.sortedSet already processed in this.delete call
    }

    get(obj) {
        return this.ifHas(obj, SortedSet.identityFunction, SortedSet.emptyFunction);
    }
    
    has(obj) {
        return this.sortedSet.has([obj, SortedMap.wildcard]);
    }

    set(inElement, outElement) {
        if (!this.delete(inElement)) ++this.size;
        this.sortedSet.add([inElement, outElement]);
    }

    // iteration methods for compatibility with JS Map
    [Symbol.iterator]() {
        return this.sortedSet[Symbol.iterator]();
    }

    keys() {
        return this.sortedSet.elements.map(x => x[0])[Symbol.iterator]();
    }

    values() {
        return this.sortedSet.elements.map(x => x[1])[Symbol.iterator]();
    }

    entries() {
        return this.sortedSet[Symbol.iterator]();
    }

    forEach(callback, thisArg) {
        return this.sortedSet.forEach(callback, thisArg);
    }

    // lexographic sorting with wildcard support
    static mapifyComparators(inSorter, outSorter, wildcard = SortedMap.wildcard) {
        return function(a, b) {
            let ain = a[0], aout = a[1], bin = b[0], bout = b[1];
            if (ain === wildcard || bin === wildcard) {
                if (aout === wildcard || bout === wildcard) return 0;
                return outSorter(aout, bout);
            }
            let res = inSorter(ain, bin);
            if (res === 0) {
                if (aout === wildcard || bout === wildcard) return 0;
                return outSorter(aout, bout);
            }
            return res;
        }
    }

    // if both maps have comparable domains and codomains then they can be sorted relative to each other
    static mapComparator(map1, map2) {
        if (map1.size !== map2.size) return map1.size - map2.size;
        let l = map1.size, a1 = map1.sortedSet.elements, e2 = map2.sortedSet.elements, inS = map1.inSorter, outS = map1.outSorter, res;
        for (let i = 0; i < l; ++i) {
            res = inS(a1[i][0], a2[i][0]);
            if (res !== 0) return res;
            res = outS(a1[i][1], a2[i][1]);
            if (res !== 0) return res;
        }
        return 0;
    }
    
    static wildcard = Symbol("sorted map wildcard"); // For use in input-only operations. Don't use this as an element.
}