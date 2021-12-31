/*export*/ class SortedFunction {
    constructor(
        basis, // SortedSet of elements for testing
        func, // function
        comparator, // comparator for codomain
    ) {
        this.basis = basis;
        this.func = func;
        this.comparator = comparator;
    }

    // assuming basis and comparator are the same, check funcs on basis
    compareTo(otherSortedFunction) {
        let me = this.func, other = otherSortedFunction.func, comp = this.comparator, res;
        for (let x of this.basis) {
            res = comp(me(x), other(x));
            if (res !== 0) return res;
        }
        return 0;
    }

    static generator(basis, comparator) {
        return function(func) {
            return new SortedFunction(basis, func, comparator)
        }
    }
}