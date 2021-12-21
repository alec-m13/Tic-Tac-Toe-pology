/*
    Tensors are maps of maps (all sorted maps). They can be sorted, making calculations involving them much more efficient, if they are
    constructed in a comparably coherent manner.

    Tensors contain an element and a shape. The element is either a base element or a sorted map. The shape defines the type of the element.

    If the shape is string then the element is a base element, i.e. not a map (at least tensor won't recognize that it's a map). The string
    is an identifier for the type of element.

    If the shape is not a string then it is of the form {in: a, out: b}, notationally represented by a -> b, where a and b are other shapes.
    The element must be a map whose domain consists of tensors of shape a and whose codomain consists of tensors of shape b.

    We can define comparability now. Two elemental tensors t1, t2, with elements e1, e2 and comparators c1, c2, are said to be comparable if
    both c1(x, y) and c2(x, y) exist and are on the same side of 0 for any combination of x, y chosen from e1, e2.
    
    Comparing higher tensors is based on shape first. Shapes are lexographically sorted with elementals less than proper tensors. If two
    proper tensors have the same shape then comparison is done with the map comparison.
*/

//import { SortedSet } from "./SortedSet";

/*export*/ class Tensor {
    constructor(
        element,
        shape,
        elementalComparator
    ) {
        this.element = element;
        this.shape = shape;
        if (shape === null) this.elementalComparator = elementalComparator;
    }

    
}