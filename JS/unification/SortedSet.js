/*

SortedSet is a reconstruction of JS native Set but based on comparator order instead of insertion order. Sorted sets are constructed
using a comparator function. Any elements added must be compatible with this comparator function.

Comparator functions are less restrictive than equality. The general practice is that elements already in the set get priority.
Suppose our set is of length one arrays of numbers with comparator (a, b) => a[0] - b[0]. Suppose we have two separate instances
a = [1] and b = [1]. If we add a first using set.add(a), then ask if the set contains b, it will respond in the affirmative beacuse
a and b are comparatively equivalent. Some operations even replace b with a so that they both point to the same object in memory.

The fundamental step is the `process` function. It is a binary search which stashes the results of the binary search. It's not
intended to be used externally; instead it's called by the other functions. Note that boolean false (and any other falsy value) may
be added to the set if the comparator utilizes it. Since the binary search process stashes the discovered value if found, there is
a distinct internal Symbol to represent binary search negative result. Don't use this symbol as an object in the sorted set.
*/

/*export*/ class SortedSet {
    constructor(comparator = SortedSet.compareToComparator, indexName = "index") {
        this.comparator = comparator;
        this.elements = [];
        this.size = 0;
        this.indexName = indexName;
    }

    // search for obj
    // if found, stash equivalent contained object as this.processFound and its index as this.processIndex
    // if not found, stash index of where obj should be spliced in and stash negative as this.processFound
    process(obj) {
        let a = this.elements;
        if (this.size === 0) { // special base case
            this.processIndex = 0;
            return this.processFound = SortedSet.negativeResult;
        }
        let comp = this.comparator;
        let low = 0, high = a.length-1, mid = high, lastmid = mid+1, res;
        // if obj belongs below the lowest
        if (comp(obj, a[low]) < 0) mid = lastmid = -1; // skip loop with index where obj should be inserted (0) less 1
        res = comp(obj, a[high]);
        // if obj is too high for binary search
        if (res >= 0) {
            if (res === 0) {
                this.processIndex = high;
                return this.processFound = a[high]; // obj is the highest
            }
            // obj belongs above the highest
            lastmid = mid; // skip loop with index where obj should be inserted (a.length) less 1
        }

        // binary search
        while (mid !== lastmid) {
            lastmid = mid;
            mid = (high + low) >>> 1;
            res = comp(obj, a[mid]);
            if (res < 0) {
                high = mid;
                continue;
            }
            if (res > 0) {
                low = mid;
                continue;
            }
            // found at mid
            this.processIndex = mid;
            return this.processFound = a[mid];
        }
        // obj not found and mid is the floor index of obj
        this.processIndex = mid+1; // obj will be inserted here, one above its floor, if it's to be added
        return this.processFound = SortedSet.negativeResult;
    }

    // if obj is contained then return the contained value, otherwise add obj and return it
    unify(obj) {
        return this.boundIfHas(obj, SortedSet.identityFunction, this.postProcessUnify);
    }

    // helper function for unify; usually don't call postProcessUnify directly
    postProcessUnify(obj) {
        this.postProcessAdd(obj);
        return obj;
    }

    /*
    // if obj is about to be modified, call this method to get a callback which needs to be called
    // after the modification to fix the order of this SortedSet
    notifyModification(obj) {
        if (this.has(obj)) {
            if (obj !== this.processFound) throw Error("can only notify with unified objects");
            let me = this, index = this.processIndex;
            return function modificationComplete () {
                // can't call delete since obj is no longer in its correct place
                me.elements.splice(index, 1);
                --me.size;
                me.add(obj);
            }
        } else throw Error("can only notify with elements contained in this sorted set");
    }
    */

    ifHas(obj, thenThis, elseThis, ...args) {
        if (this.has(obj)) {
            if (thenThis) return thenThis(this.processFound, ...args);
        } else {
            if (elseThis) return elseThis(obj, ...args);
        }
    }

    boundIfHas(obj, thenThis, elseThis, thisObject = this, ...args) {
        if (this.has(obj)) {
            if (thenThis) return thenThis.call(thisObject, this.processFound, ...args);
        } else {
            if (elseThis) return elseThis.call(thisObject, obj, ...args);
        }
    }

    // add obj if necessary and return the contained element which is equivalent to obj
    add(obj) {
        return this.boundIfHas(obj, this.returnMe, this.postProcessAdd);
    }

    // helper function for add; usually don't call postProcessAdd directly
    postProcessAdd(obj) {
        let elements = this.elements, len = elements.length, index = this.indexName, processIndex = this.processIndex;
        for (let i = len; i > processIndex; --i) {
            elements[i-1][index] = i;
            elements[i] = elements[i-1];
        }
        elements[this.processIndex] = obj;
        obj[index] = this.processIndex;
        ++this.size;
        this.processFound = obj;
        return this;
    }

    clear() {
        this.elements.splice(0, this.size);
        this.processIndex = 0;
        this.proces
        sFound = SortedSet.negativeResult;
    }

    delete(obj, check = true) {
        return this.boundIfHas(obj, this.postProcessDelete, SortedSet.returnFalse);
    }

    // helper function for delete; usually don't call postProcessDelete directly
    postProcessDelete() {
        let elements = this.elements, length = elements.length, index = this.indexName;
        for (let i = this.processIndex; i < length; ++i) {
            elements[i] = elements[i+1];
            elements[i][index] = i;
        }
        elements.pop();
        --this.size;
        this.processFound = SortedSet.negativeResult;
        return true;

    }

    has(obj) {
        return this.process(obj) !== SortedSet.negativeResult;
    }

    // It's fine to use set.elements for read access and iteration over elements but not for writing/modification.
    // These methods below emulate JS native Set iteration methods for compatibility.

    [Symbol.iterator]() {
        return this.elements[Symbol.iterator]();
    }

    values() {
        return this.elements[Symbol.iterator]();
    }

    keys() {
        return this.elements[Symbol.iterator]();
    }

    entries() {
        return this.elements.map(x => [x, x])[Symbol.iterator]();
    }

    forEach(callback, thisArg) {
        return this.elements.forEach(callback, thisArg);
    }

    static fromElements(comparator, elements) {
        let returner = new SortedSet(comparator);
        for (let e of elements) returner.add(e);
        return returner;
    }

    static compareToComparator(a, b) {
        return a.compareTo(b);
    }

    // used for representing that no element was found which matches the requested value
    static negativeResult = Symbol("binary search element not found"); // don't use this object in a sorted set.

    static emptyFunction() {}
    static returnMe() {return this}
    static returnFalse() {return false}
    static identityFunction(x) {return x}
    
}