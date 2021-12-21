let elementals = ["string", "int", "array"];
function functionShape(inS, outS) {
    return {
        function: true,
        in: inS,
        out: outS
    }
}

let all = [];

for (let i  = 0; i < elementals.length; ++i) {
    all.push(elementals[i]);
    all.push(elementals.slice(i));
    all.push(elementals.map(x => [x, x]));
}

let fs = [];

for (let i = 0; i < all.length; ++i) for (let j = 0; j < all.length; ++j) if (i % 3 === j % 3) {
    fs.push(functionShape(all[i], all[j]));
}

all.push(...fs);
for (let c of fs) all.push(functionShape("string", c));

all.sort(ComparatorGenerator.shapeComparator);
all = all.filter(function (x, i) {
    if (i === all.length - 1) return false;
    return ComparatorGenerator.shapeComparator(x, all[i+1]) !== 0;
})
console.log(all);