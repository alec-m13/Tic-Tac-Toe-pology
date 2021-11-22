# Tic-Tac-Toe-pology

The purpose of this is to play board games on topologically active surfaces. Not only can the board be a surface like the [Mobius strip](https://en.wikipedia.org/wiki/M%C3%B6bius_strip) or the [torus](https://en.wikipedia.org/wiki/Torus), but the board can change during gameplay as well. The idea is to construct the board as a discretized version of a [manifold](https://en.wikipedia.org/wiki/Manifold) where charts are required to be large enough that token movement makes sense.

# Squares

Our board consists of tiles. For now let's say our tiles are all squares, although there are certainly ways to do this with other polygons too. Squares are particularly nice because they are easy to draw. We can even draw them with ASCII art, which we will do throughout this document. Here is a square:

<details open><summary>Square</summary><pre>
        o-------o
        |       |
        |   X   |
        |       |
        o-------o
</pre></details>

The X here is a marker meaning the area inside the square is filled.

There are symmetries associated to this square, but in order to see them we need to draw an orientation on it. We do that by drawing more markings on the square. Here is the standard orientation:

<details open><summary>Oriented square</summary><pre>
        o-------o
        |   ^ > |
        |   X   |
        |       |
        o-------o
</pre></details>

Picture this as an arrow pointing up from the center of the square and rotating clockwise. Another way of describing it is with two directions: the primary direction (up here) and the secondary direction (to the right). We call this orientation `0`, or the standard orientation. There are 8 possible orientations:


<details open><summary>Square orientations</summary><pre>
o-------o o-------o o-------o o-------o o-------o o-------o o-------o o-------o
|   ^ > | |       | |       | | ^     | | < ^   | |     ^ | |       | |       |
|   X   | |   X > | |   X   | | < X   | |   X   | |   X > | |   X   | | < X   |
|       | |     v | | < v   | |       | |       | |       | |   v > | | v     |
o-------o o-------o o-------o o-------o o-------o o-------o o-------o o-------o
    0         1         2         3         4         5         6         7
</pre></details>

These orientations arise as the result of doing a transformation to the square. For example, transformation 1 is "rotate clockwise a quarter turn" and transformation 6 is "flip across the horizontal axis."

Transformations combine to form other transformations. For example, doing transformation 1 (rotating clockwise once) and then doing transformation 1 again is the same thing as rotating twice, which is transformation 2. We express this with the notation `1 -> 1 = 2`. Likewise doing transformation 3 (rotate counter-clockwise) and then transformation 4 (flip across vertical) is the same as doing transformation 5 (flip across upward diagonal). We write this as `3 -> 4 = 5`.

Here is a table with the possible combinations of tranformations. The entry in the table is the result of doing the transformation from the row first, then doing the transformation from the column.

<details open><summary>Symmetries of the square</summary><pre>
 -> |_0_1_2_3_4_5_6_7
  0 | 0 1 2 3 4 5 6 7
  1 | 1 2 3 0 7 4 5 6
  2 | 2 3 0 1 6 7 4 5
  3 | 3 0 1 2 5 6 7 4
  4 | 4 5 6 7 0 1 2 3
  5 | 5 6 7 4 3 0 1 2
  6 | 6 7 4 5 2 3 0 1
  7 | 7 4 5 6 1 2 3 0
</pre></details>

Mathematically we call this a multiplication table and it represents the [symmetry group of the square](https://proofwiki.org/wiki/Definition:Symmetry_Group_of_Square).

# Tiles

A tile is a square along with some associated information. Each tile has an id, a number used to distinguish them. On a standard tic-tac-toe board we can assign the ids like this:

<details open><summary>Tic-tac-toe board</summary><pre>
        o-------o o-------o o-------o
        |       | |       | |       |
        |   1   | |   2   | |   3   |
        |       | |       | |       |
        o-------o o-------o o-------o
        o-------o o-------o o-------o
        |       | |       | |       |
        |   4   | |   5   | |   6   |
        |       | |       | |       |
        o-------o o-------o o-------o
        o-------o o-------o o-------o
        |       | |       | |       |
        |   7   | |   8   | |   9   |
        |       | |       | |       |
        o-------o o-------o o-------o
</pre></details>

During gameplay a tile may change state. In tic-tac-toe the tiles start empty, then they are claimed by players through the use of tokens (X or O). In checkers the tokens start on the board and they move during a turn. From the point of view of a tile, it has a state which we encode as a number. The meaning to the number is used when declaring the rules of the game. We will get into rules later, focusing now on just tile states. Here are some states which would be useful for tic-tac-toe:

 - State 0 is an empty tile
 - State 1 is an X
 - State 2 is an O

Here are some states which would apply for checkers:

0) Empty tile
1) Red checker
2) Black checker
3) Red king checker
4) Black king checker

# Charts

So far our tiles are independent. We have not seen how to place them next to each other. Notice in the tic-tac-toe board above that the tiles are not touching. We could have just as well drawn it like this:

<details open><summary>Unpositioned tic-tac-toe board</summary><pre>
o-------o o-------o o-------o o-------o o-------o o-------o o-------o o-------o o-------o
|       | |       | |       | |       | |       | |       | |       | |       | |       |
|   1   | |   2   | |   3   | |   4   | |   5   | |   6   | |   7   | |   8   | |   9   |
|       | |       | |       | |       | |       | |       | |       | |       | |       |
o-------o o-------o o-------o o-------o o-------o o-------o o-------o o-------o o-------o
</pre></details>

That's not really a tic-tac-toe board. A tic-tac-toe board looks like this, with the tiles touching each other:

<details open><summary>Positioned tic-tac-toe board</summary><pre>
        o-------o-------o-------o
        |       |       |       |
        |   1   |   2   |   3   |
        |       |       |       |
        o-------o-------o-------o
        |       |       |       |
        |   4   |   5   |   6   |
        |       |       |       |
        o-------o-------o-------o
        |       |       |       |
        |   7   |   8   |   9   |
        |       |       |       |
        o-------o-------o-------o
</pre></details>

We need a way to tape the tiles together. That's what charts are for: a chart centered on a tile is the directions for how to tape that tile into the board.

Specifically a chart is a chunk of grid centered on a tile. The center of the grid is always drawn in the standard orientation, but other tiles in the grid may have other orientations. Every tile in the board has a chart centered on it. All these charts together is called an atlas, and an atlas defines the board's shape.

It's easiest with an example. Look at this tic-tac-toe board. Notice some tiles have been placed in non-standard orientation.

<details><summary>Tic-tac-toe board</summary>
<pre>
        o-------o-------o-------o
        |   ^ > |   ^ > |   ^ > |
        |   1   |   2   |   3   |
        |       |       |       |
        o-------o-------o-------o
        |   ^ > | < ^   |   ^ > |
        |   4   |   5   |   6   |
        |       |       |       |
        o-------o-------o-------o
        |       |       | ^     |
        |   7 > |   8   | < 9   |
        |     v |   v > |       |
        o-------o-------o-------o
</pre>
</details>

The orientation on these tiles doesn't affect the gameplay in any way. It's just that we rotated and/or flipped over some of the tiles before taping them together. The resulting board is still the same 3x3 tic-tac-toe board.

Here is the atlas associated with this board. There are nine chunks of grid, each centered on one of the nine tiles. The center tile is marked with `*`s and is always drawn in the standard orientation of up-clockwise.

<details><summary>Tic-tac-toe charts</summary>
<pre>
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   *   |   ^ > |      |   ^ > |   *   |   ^ > |      |   ^ > |   *   |       |
        |       | * 1 * |   2   |      |   1   | * 2 * |   3   |      |   2   | * 3 * |       |
        |       |   *   |       |      |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > | < ^   |      |   ^ > | < ^   |   ^ > |      | < ^   |   ^ > |       |
        |       |   4   |   5   |      |   4   |   5   |   6   |      |   5   |   6   |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
</pre>
<pre>
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |   ^ > |      | < ^   | < ^   | < ^   |      |   ^ > |   ^ > |       |
        |       |   1   |   2   |      |   3   |   2   |   1   |      |   2   |   3   |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   *   | < ^   |      | < ^   |   *   | < ^   |      | < ^   |   *   |       |
        |       | * 4 * |   5   |      |   6   | * 5 * |   4   |      |   5   | * 6 * |       |
        |       |   *   |       |      |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |     ^ |       |       |      |       | ^     |       |
        |       |   7 > |   8   |      |   9 > |   8   | < 7   |      |   8   | < 9   |       |
        |       |     v |   v > |      |       | < v   | v     |      |   v > |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
</pre>
<pre>
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |     ^ |       |      |       |       |       |      |       |       |     ^ |
        | < 5   |   8 > |       |      |       |       |       |      |       | < 8   |   5 > |
        | v     |       |       |      |       |       |       |      |       | v     |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        | ^     |   *   |       |      |     ^ |   *   |       |      |       |   *   |       |
        | < 4   | * 7 * |       |      |   7 > | * 8 * | < 9   |      |       | * 9 * |   6 > |
        |       |   *   |       |      |       |   *   | v     |      |       |   *   |     v |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |      |       |       |       |
        |       |       |       |      |   4   |   5   |   6   |      |       |       |       |
        |       |       |       |      |   v > | < v   |   v > |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
</pre>
</details>
  
These charts define the relative context for each tile. Notice that empty spaces are allowed in the charts. That's how we detect the edges of the board.

# Transition maps

Charts are not isolated. They have to agree with each other in order to make sense. Notice that, in the atlas above, any chart which contains both tiles 4 and 5 has them oriented in such a way that both their primary directions are the same their secondary directions are opposite. That is because this atlas is consistent.

Testing if an atlas is consistent is done via transition maps. To define this properly we need to refine our definition of chart. Specifically, start with the infinite grid:

<details><summary>Reference grid</summary><pre>
   |       |       |       |       |       |       |       |
   |   2   |   2   |   2   |   2   |  2    |   2   |   2   |
---o-------o-------o-------o-------o-------o-------o-------o---
   |  -3   |  -2   |  -1   |   0   |   1   |   2   |   3   |
   |       |       |       |       |       |       |       |
   |   1   |   1   |   1   |   1   |   1   |   1   |   1   |
---o-------o-------o-------o-------o-------o-------o-------o---
   |  -3   |  -2   |  -1   |   0   |   1   |   2   |   3   |
   |       |       |       |       |       |       |       |
   |   0   |   0   |   0   |   0   |   0   |   0   |   0   |
---o-------o-------o-------o-------o-------o-------o-------o---
   |  -3   |  -2   |  -1   |   0   |   1   |   2   |   3   |
   |       |       |       |       |       |       |       |
   |  -1   |  -1   |  -1   |  -1   |  -1   |  -1   |  -1   |
---o-------o-------o-------o-------o-------o-------o-------o---
   |  -3   |  -2   |  -1   |   0   |   1   |   2   |   3   |
   |       |       |       |       |       |       |       |
</pre>
</details>

Call the upper index the x coordinate and the lower index the y coordinate. The most upper-left complete square has coordinates `(x, y) = (-3, 1)`. The point `(0, 0)` is called the origin.

A chart is defined as a subset of this reference grid where the origin `(0, 0)` has the center tile in it with orientation 0. Picture drawing the tile right-side-up in the position `(0, 0)`. Any other grid position is either empty or has a tile in it with some particular orientation.

It's important that charts are supposed to be just pieces of the reference grid, not the whole infinite thing. To be useful, charts should have only finitely much data. All of the charts we have seen so far have had 9 entries from the 3x3 grid around `(0, 0)`, i.e.  `-1 <= x <= 1` and `-1 <= y <= 1`.

There are some transformations of the reference grid which we will use. First off, the grid can be translated. If we want to send the point at `(a, b)` to the origin, we do this with the translation `T(x, y) = (x-a, y-b)`.

Plugging in the point `(a, b)`, i.e. computing `T(a, b)`, gives the origin `(0, 0)` as requested. Plugging in any other point moves it down by `a` (up if `a` is negative) and left by `b` (right if `b` is negative), the same motion that it took to move `(a, b)` to the origin. Translations are a key feature of the reference grid which we will use.

The other feature is that the symmetry group of the square acts on the reference grid in much the same way as it does on the square. Recall that we have 8 transformations of the square: 4 rotations and 4 flips. We can rotate and flip the grid just as well, and here are the formulas for those:

```
   Transformation | Formula
                0 | (x, y)
                1 | (y, -x)
                2 | (-x, -y)
                3 | (-y, x)
                4 | (-x, y)
                5 | (y, x)
                6 | (x, -y)
                7 | (-y, -x)
```

For example, look at the point `(1, 2)`. If we want to apply transformation 3 to it (rotate counter-clockwise about the origin), that would move it to `(-2, 1)`. But that's exactly what plugging `(1, 2)` into formula 3 does: if `x = 1` and `y = 2` then `(-y, x) = (-2, 1)`. These transformations are the other key feature of the grid which we need.

Now we are ready to talk about transition maps. Start by picking a tile from the board. Let's pick tile 3 from our tic-tac-toe board. Here is its chart from before:

<details><summary>Chart for tile 3</summary><pre>
         o-------o-------o-------o
         |       |       |       |
         |       |       |       |
         |       |       |       |
         o-------o-------o-------o
         |   ^ > |   *   |       |
         |   2   | * 3 * |       |
         |       |   *   |       |
         o-------o-------o-------o
         | < ^   |   ^ > |       |
         |   5   |   6   |       |
         |       |       |       |
         o-------o-------o-------o
</pre></details>

There are 9 positions here given by coordinates `(x, y)` where `x` and `y` are either 0, 1, or -1.  Pick any of those coordinates which has a tile present. Let's pick `(-1, -1)`, which has tile 5 in it. Translate the grid so that `(-1, -1)` moves to the origin. That is done by the transformation `T(x, y) = (x+1, y+1)`. That gives us this grid:

<details><summary>Translated to tile 5</summary><pre>
         o-------o-------o-------o
         |       |   ^ > |   ^ > |
         |       |   2   |   3   |
         |       |       |       |
         o-------o-------o-------o
         |       | < ^   |   ^ > |
         |       | * 5 * |   6   |
         |       |   *   |       |
         o-------o-------o-------o
         |       |       |       |
         |       |       |       |
         |       |       |       |
         o-------o-------o-------o
</pre></details>

Now the coordinates with tiles are `(0, 0)` (tile 5), `(0, 1)` (tile 2), `(1, 0)` (tile 6), and `(1, 1)` (tile 3).

Tile 5 is not in standard orientation, it has orientation 4. Look through the multiplication table and find the inverse of 4. To do this, look for which column contains the 0 in row 4. That is column 4.

Apply transformation 4 to this grid to standardize the orientation on the center (tile 5). To do this formulaically, plug in each position's coordinates to formula 4 `(-x, y)` to see where it should be drawn. This gives us the grid


<details><summary>Centered on tile 5</summary><pre>
         o-------o-------o-------o
         |       |       |       |
         |   3   |   2   |       |
         |       |       |       |
         o-------o-------o-------o
         |       |   ^ > |       |
         |   6   | * 5 * |       |
         |       |   *   |       |
         o-------o-------o-------o
         |       |       |       |
         |       |       |       |
         |       |       |       |
         o-------o-------o-------o
</pre></details>

The formula tells us the position of the tiles, but how do we get their orientations? The multiplication table! The new orientation is the entry in the table where the column is 4 (from the transformation) and the row is whatever the orientation was beforehand. For example, tile 2 had orientation 0 before the transformation. The table has a 4 in row 0 column 4, so tile 2 has orientation 4 after the transformation. This process fills out this grid:

<details><summary>Centered on tile 5</summary><pre>
         o-------o-------o-------o
         | < ^   | < ^   |       |
         |   3   |   2   |       |
         |       |       |       |
         o-------o-------o-------o
         | < ^   |   ^ > |       |
         |   6   | * 5 * |       |
         |       |   *   |       |
         o-------o-------o-------o
         |       |       |       |
         |       |       |       |
         |       |       |       |
         o-------o-------o-------o
</pre></details>

That process is the transition map. Start with a chart and pick any nonempty coordinate in that chart. The transition map is the process of transforming the grid so that it is centered on the chosen tile with standard orientation.

Now to check for consistency. Compare this resulting grid to tile 5's chart:
<details><summary>Check for consistency</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o
        | < ^   | < ^   |       |      | < ^   | < ^   | < ^   |
        |   3   |   2   |       |      |   3   |   2   |   1   |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
        | < ^   |   ^ > |       |      | < ^   |   *   | < ^   |
        |   6   | * 5 * |       |      |   6   | * 5 * |   4   |
        |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |     ^ |       |       |
        |       |       |       |      |   9 > |   8   | < 7   |
        |       |       |       |      |       | < v   | v     |
        o-------o-------o-------o      o-------o-------o-------o
             Transition Map                      Chart
</pre></details>

There are two grids here -- the transition map and the chart -- both centered at 5 with standard orientation. For any coordinates present in the chart (whether there is a tile there or not), check those coordinates in the transition map. If the chart says it should be empty there then the map must be empty there too. If the chart says there should be a tile there then the map should either have that same tile there in the same orientation or should be empty there. If that is the case for the entire chart then the transition map is consistent with the chart.

In this example above, the test passes. There are 3 tiles and 5 empty spaces, and the 3 tiles match. The empty spaces in the transition map are not a problem.

Essentially what this test is looking for is that any information which is visible to two tiles is interpreted the same way by both tiles. For example, according to tile 3's chart, tile 5 is pointing its primary direction at tile 2. If we instead look directly at tile 5's chart, we see that tile 5 is in fact pointing its primary direction at tile 2. Thus both tiles 3 and 5 agree that tile 5 is pointing its primary direction into tile 2, so we can use that information while playing the game on this board.

The missing pieces in the transition map are not a problem because they just represent the limits of tile 3's knowledge of the board. Tile 3's chart only contains information about the board near tile 3, so when we recenter it to tile 5 there will be information about tile 5 which is missing. That's represented by the empty spaces. For example, tile 3 does not know that tile 5 is connected to tile 4 because tile 4 is too far away.

This process started with two choices: tile 3 and the coordinates `(-1, -1)` in tile 3's chart. Because the test passed, we say that tile 3's `(-1, -1)` transition map is consistent with the atlas. In other words, it makes sense to move down-left out of tile 3 in this board. If you go back to tile 3's chart there are 5 empty spaces, coordinates `(-1, 1) , `(0, 1)`, `(1, 1)`, `(1, 0)`, and `(1, -1)`. Because they are empty in the chart, there is no test to fail. So tile 3 is trivially consistent with the atlas in those 5 directions as well. We would have to test the directions `(-1, 0)` and `(0, -1)` the same way we did `(-1, -1)`. This would involve comparing to the charts of tiles 2 and 6, respectively. I won't write out the steps but those tests do also pass.

Because tile 3's chart passed the consistency test in all its coordinates, we say that tile 3's chart is consistent with the atlas. If every tile's chart is consistent with the atlas then the atlas is consistent and defines a board. We don't want inconsistencies in our atlases, so some moves in some games may not be allowed because they would introduce inconsistencies in the atlas. That would render the board unusable which is why they aren't allowed.

# Building a board

In the check for consistency, we said it was ok for the transition map to have a hole where there was a tile in the chart. What about the other way, what if the chart has a hole but not the transition map?

This situation arises while we are taping tiles together to build the board. Suppose we have two tiles like so:

<details><summary>Starting board</summary><pre>
          o-------o-------o
          |   ^ > |   ^ > |
          |   1   |   2   |
          |       |       |
          o-------o-------o
</pre></details>

Their charts look like this:

<details><summary>Initial charts</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
        |       |   *   |   ^ > |      |   ^ > |   *   |       |
        |       | * 1 * |   2   |      |   1   | * 2 * |       |
        |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
</pre></details>

This atlas is consistent, the only nontrivial tests are two translations and they both work.

Take a new tile, tile 3. It starts with an empty chart because it is not attached to anything:

<details><summary>Isolated tile 3</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   *   |   ^ > |      |   ^ > |   *   |       |      |       |   *   |       |
        |       | * 1 * |   2   |      |   1   | * 2 * |       |      |       | * 3 * |       |
        |       |   *   |       |      |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
</pre></details>

Suppose we want to put tile 3 into the board by taping it to the bottom of tile 1. First we have to check that there is room. The `(0, 1)` position in chart 3 is empty (that's where tile 1 will go) and the `(0, -1)` position in chart 1 is empty so there is room for this attaching. Put the tiles in those positions, so we have

<details><summary>Initial taping</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |      |       |   ^ > |       |
        |       |       |       |      |       |       |       |      |       |   1   |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   *   |   ^ > |      |   ^ > |   *   |       |      |       |   *   |       |
        |       | * 1 * |   2   |      |   1   | * 2 * |       |      |       | * 3 * |       |
        |       |   *   |       |      |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |       |      |       |       |       |      |       |       |       |
        |       |   3   |       |      |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
</pre></details>

At this point the transition map out of tile 3 in the direction `(0, 1)` is consistent with chart 1, but the reverse is not. Here is the transformation test for `(0, -1)` out of chart 1:

<details><summary>Consistency check</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |   ^ > |      |       |   ^ > |       |
        |       |   1   |   2   |      |       |   1   |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |       |      |       |   *   |       |
        |       | * 3 * |       |      |       | * 3 * |       |
        |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
         (0, -1) out of chart 1                 chart 3
</pre></details>

According to chart 3 there should be a hole in position `(1, 1)`, but the transition map has a tile there (tile 2). This is an inconsistency. If we ask tile 1 what is top-right of tile 3, the response is "tile 2." If we ask tile 3 the same question, its response is "nothing." That's different than "I don't know," tile 3 should know this since it is contained in its chart. So what's the remedy?

This inconsistency is about missing information. Our solution is to fill out the missing information and then try the atlas consistency test again. First we address the specific missing information by putting tile 2 into chart 3, giving us these three charts:

<details><summary>Atlas 2</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |      |       |   ^ > |   ^ > |
        |       |       |       |      |       |       |       |      |       |   1   |   2   |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   *   |   ^ > |      |   ^ > |   *   |       |      |       |   *   |       |
        |       | * 1 * |   2   |      |   1   | * 2 * |       |      |       | * 3 * |       |
        |       |   *   |       |      |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |       |      |       |       |       |      |       |       |       |
        |       |   3   |       |      |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
</pre></details>

Now that that piece of missing information has been resolved, we check atlas consistency again. Charts 1 and 3 are consistent, but not chart 2. Moving `(1, 0)` out of chart 1 gives the test below:

<details><summary>Consistency check 2</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
        |   ^ > |   ^ > |       |      |   ^ > |   *   |       |
        |   1   | * 2 * |       |      |   1   | * 2 * |       |
        |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o
        |   ^ > |       |       |      |       |       |       |
        |   3   |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
         (1, 0) out of chart 1                 chart 2
</pre></details>

This inconsistency is again from missing information so we do the same thing. Put tile 3 into chart 2 and try again. The atlas becomes:

<details><summary>Atlas 3</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |      |       |   ^ > |   ^ > |
        |       |       |       |      |       |       |       |      |       |   1   |   2   |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   *   |   ^ > |      |   ^ > |   *   |       |      |       |   *   |       |
        |       | * 1 * |   2   |      |   1   | * 2 * |       |      |       | * 3 * |       |
        |       |   *   |       |      |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |       |      |   ^ > |       |       |      |       |       |       |
        |       |   3   |       |      |   3   |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
</pre></details>

This time all consistency checks pass, so our atlas is consistent and we have a valid board.

With this process we can build the board one piece at a time. It's not so important for the inital setup, but when taping is an allowed move in-game this is the process by which that is done.

# Tape strips

You may be wondering why we did the iterative process described instead of just adding tile 3 under tile 1 in every chart where tile 1 is present. The reason has to do with taping together whole chunks of the board. Suppose we have this board:

<details><summary>Strip</summary><pre>
   o-------o-------o-------o-------o-------o-------o-------o
   |   ^ > |   ^ > |   ^ > |   ^ > |   ^ > |   ^ > |   ^ > |
   |   1   |   2   |   3   |   4   |   5   |   6   |   7   |
   |       |       |       |       |       |       |       |
   o-------o-------o-------o-------o-------o-------o-------o
</pre></details>

I won't draw the charts out, but they are all horizontal strips in a 3x3 grid. Grid 1 is missing a left piece and grid 7 is missing a right piece since they are at the edges of the board.

Now let's say we want to attach the top of tile 3 to the bottom of tile 4. Physically this is no problem; just picture lifting the top and bottom of the strip towards you while leaving the middle on the table, forming a tube, and then skewing it a little so that the top of tile 3 aligns with the bottom of tile 4.

We make the corresponding changes to the atlas. Here are charts 3 and 4 after the initial taping:

<details><summary>Initial taping</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |       |      |       |       |       |
        |       |   4   |       |      |       |       |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
        |   ^ > |   *   |   ^ > |      |   ^ > |   *   |   ^ > |
        |   2   | * 3 * |   4   |      |   3   | * 4 * |   5   |
        |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |   ^ > |       |
        |       |       |       |      |       |   3   |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
                 chart 3                        chart 4
</pre></details>

The resulting atlas is inconsistent, however. Even the two charts above are inconsistent. Going up out of 3 gives tile 4 according to both, but what about up-right out of tile 3? Chart 4 says up-right out of tile 3 is tile 5, but chart 3 is missing that information. Here are charts 3 and 4 after filling in the missing information from each other:

<details><summary>Initial information filling</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o
        |   ^ > |   ^ > |   ^ > |      |   ^ > |   ^ > |       |
        |   3   |   4   |   5   |      |   4   |   5   |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
        |   ^ > |   *   |   ^ > |      |   ^ > |   *   |   ^ > |
        |   2   | * 3 * |   4   |      |   3   | * 4 * |   5   |
        |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |   ^ > |      |   ^ > |   ^ > |   ^ > |
        |       |   2   |   3   |      |   2   |   3   |   4   |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
                 chart 3                        chart 4
</pre></details>

This doesn't finish the board, though, because there are still inconsistencies. According to chart 5, tile 4 has nothing above or below it. That is inconsistent with chart 4, so we fill in the missing information and turn chart 5 into

<details><summary>Propogating information</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o
        |   ^  >|   ^ > |       |      |   ^ > |   ^ > |       |
        |   4   |   5   |       |      |   5   |   6   |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
        |   ^ > |   *   |   ^ > |      |   ^ > |   *   |   ^ > |
        |   3   | * 4 * |   5   |      |   4   | * 5 * |   6   |
        |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o
        |   ^ > |   ^ > |   ^ > |      |   ^ > |   ^ > |   ^ > |
        |   2   |   3   |   4   |      |   3   |   4   |   5   |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
                 chart 4                        chart 5
</pre></details>

This introduced another inconsistency. According to chart 4, tile 5 has nothing above it. But according to chart 6, tile 5 has tile 6 above it. We add this information to chart 4 and obtain

<details><summary>Propogating information 2</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o
        |   ^  >|   ^ > |   ^ > |      |   ^ > |   ^ > |       |
        |   4   |   5   |   6   |      |   5   |   6   |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
        |   ^ > |   *   |   ^ > |      |   ^ > |   *   |   ^ > |
        |   3   | * 4 * |   5   |      |   4   | * 5 * |   6   |
        |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o
        |   ^ > |   ^ > |   ^ > |      |   ^ > |   ^ > |   ^ > |
        |   2   |   3   |   4   |      |   3   |   4   |   5   |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
                 chart 4                        chart 5
</pre></details>

Now charts 4 and 5 are consistent, but chart 6 has the same problem that chart 5 had before. This process continues through lots of steps, and we end up with the correct atlas when it resolves. Most of the charts look like this most recent version of chart 4, but the charts at the end still have some holes in them because they are still board edge pieces.

The point of this example was to show that tapings, though started in only two charts, propagate across the whole board. This example resulted in a consistent atlas and hence a valid board, but this is not always the case.

# Unallowed taping

Start with the board below:
<details><summary>Initial board</summary><pre>
        o-------o-------o
        |   ^  >|   ^ > |
        |   1   |   2   |
        |       |       |
        o-------o-------o
        |   ^ > |
        |   3   |
        |       |
        o-------o
</pre></details>

<details><summary>Initial atlas</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |      |       |   ^ > |   ^ > |
        |       |       |       |      |       |       |       |      |       |   1   |   2   |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   *   |   ^ > |      |   ^ > |   *   |       |      |       |   *   |       |
        |       | * 1 * |   2   |      |   1   | * 2 * |       |      |       | * 3 * |       |
        |       |   *   |       |      |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |       |      |   ^ > |       |       |      |       |       |       |
        |       |   3   |       |      |   3   |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
                 chart 1                        chart 2                        chart 3
</pre></details>

The top of tile 1 is empty and the right of tile 3 is empty, so we can fit those two together, right? Here is the atlas after the initial taping:

<details><summary>First taping</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |      |       |   ^ > |   ^ > |
        |       |   3 > |       |      |       |       |       |      |       |   1   |   2   |
        |       |     v |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   *   |   ^ > |      |   ^ > |   *   |       |      |       |   *   | ^     |
        |       | * 1 * |   2   |      |   1   | * 2 * |       |      |       | * 3 * | < 1   |
        |       |   *   |       |      |       |   *   |       |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |       |      |   ^ > |       |       |      |       |       |       |
        |       |   3   |       |      |   3   |       |       |      |       |       |       |
        |       |       |       |      |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o      o-------o-------o-------o
                 chart 1                        chart 2                        chart 3
</pre></details>

The new pieces are `(0, 1)` in chart 1 and `(1, 0)` in chart 3. That is the top of tile 1 taped to the right of tile 3. There is a problem, though, and it has to do with tile 2. We can detect the problem already in our charts by taking the `(1, 0)` transformation map out of chart 3.

<details><summary>Consistency check</summary><pre>
        o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |       |       |
        |       |   3 > |   1 > |      |       |   3 > |       |
        |       |     v |     v |      |       |     v |       |
        o-------o-------o-------o      o-------o-------o-------o
        |       |   ^ > |       |      |       |   *   |   ^ > |
        |       | * 1 * |   2 > |      |       | * 1 * |   2   |
        |       |   *   |     v |      |       |   *   |       |
        o-------o-------o-------o      o-------o-------o-------o
        |       |       |       |      |       |   ^ > |       |
        |       |       |       |      |       |   3   |       |
        |       |       |       |      |       |       |       |
        o-------o-------o-------o      o-------o-------o-------o
         (1, 0) out of chart 3                  chart 1
</pre></details>

The `(1, 0)` position in chart 1 is tile 2 with orientation 0. However, the `(1, 0)` position in the transition map is tile 2 with orientation 1. Those are different.

This is a hard inconsistency. Filling in missing information is one thing, but having directly conflicting information makes this atas unsalvageable.This particular 1-3 taping is not allowed.

That makes physical sense, too. Where does tile 2 go when tiles 1 and 3 are taped together this way? Tile 2 goes on top of itself, but rotated from where it used to be. That doesn't work.

# Moves

We have defined the topological board as a consistent atlas and have shown how to build it one piece at a time, but what's a board game without moves? Board games consist of turns in which the players make a move, so let's see what moves are.

We need to be sufficiently general in our abilities to allow for a variety of games. Specifically we won't be happy unless our topological game system can handle tic-tac-toe, checkers, and chess.

Let's define one of the simplest moves available: the checkers piece. Not the jump over the opponent, just the single move. They can move diagonally either forwards-right or forwards-left. Focus on the forwards-right move. It requires a particular region of the board to even be possible:

<details><summary>Forward-right checkers move domain</summary><pre>
                o-------o
                |       |
                |   X   |
                |       |
        o-------o-------o
        |   *   |
        | * X * |
        |   *   |
        o-------o
</pre></details>

The fact that this move requires this domain means this move is unavailable to the uppermost row on a chessboard, since there's no way to go up from there. Likewise the right-most column is unavailable. So that's a good start. We can work out the details of fitting this shape into the board later.

For now we want to encode what the actual move is. The initial and final states encapsulate the entirety of the move, so let's just encode the move like that. Suppose our rulebook says that tile state 0 is an empty tile and that state 1 means occupied by player 1's checker. Then the data representing player 1's forwards-right checkers move is this, with board states in parentheses:

<details><summary>Forward-right checkers move, player 1</summary><pre>
                o-------o        ==>                o-------o
                |       |        ==>                |       |
                |  (0)  |        ==>                |  (1)  |
                |       |        ==>                |       |
        o-------o-------o        ==>        o-------o-------o
        |   *   |                ==>        |   *   |
        | *(1)* |                ==>        | *(0)* |
        |   *   |                ==>        |   *   |
        o-------o                ==>        o-------o
</pre></details>

The domain defines the context available in this move (the current tile and its top-right neighbor), and the tile states define the move's action. This one says if the current tile is in state 1 and its top-right neighbor is in state 0, then after this move the current tile will be in state 0 and the neighbor will be in state 1. That seems to capture the essence of this move.

Encoding capturing a piece is no different. Here's the move for player 2 taking one of player 1's tokens with an up-left jump:

<details><summary>Checkers jump move</summary><pre>
        o-------o                        ==>        o-------o
        |       |                        ==>        |       |
        |  (0)  |                        ==>        |  (2)  |
        |       |                        ==>        |       |
        o-------o-------o                ==>        o-------o-------o
                |       |                ==>                |       |
                |  (1)  |                ==>                |  (0)  |
                |       |                ==>                |       |
                o-------o-------o        ==>                o-------o-------o
                        |   *   |        ==>                        |   *   |
                        | *(2)* |        ==>                        | *(0)* |
                        |   *   |        ==>                        |   *   |
                        o-------o        ==>                        o-------o
</pre></details>

The game can progress as a squence of turns where the computer offers all available moves and the player picks one for their turn. Some moves like the bishop's are allowed to repeat arbitrarily, so moves should have a repeatable modifier. Actually, since checkers jumps can be sequenced, there should be a way of telling which next moves are available from this one in a given turn. But that's not too complicated, we can figure it out. But first let's finish up the shape fitting.

When we are designing a set of rules for a game, we encode the possible moves as a collection of move transformations like the ones above. A move transformation domain is a subset of the reference grid which contains the origin. Once all the moves have been defined, we take all the move transformation domains and place them on top of each other in the reference grid to get the minimal chart shape. This is what we use as the domain of charts for the game, and those charts in turn define the boards on which we can play. That way there is never any ambiguity about whether a move is allowed or not, and the check is always feasible by looking at just one chart. This saves time since we don't have to compute any global topological arrangements. The only thing we need to check is that any tiles which have different states in the product are in fact different tiles, a nontrivial ondition for some topologies.

Back to the move definition language. We can assume that tile states have been decided before the moves are constructed, so we know what the states mean at this point. How to encode moves? Our lives would be easier if we had shorthand for declaring moves, like dynamically assigned variables, but all of that is just syntactical sugar. Let's try and keep it simple to program by not having those.

A move is a piece of reference grid along with an assignment of tile states defining before and after the move. Moves may or may not link together, so each move has a list of which moves it can link to. These are often tied to position, so the available moves out are given by their oriented location in the reference grid. To declare linkable jumps in checkers, we attach some data to the topmost tile in the above figure. This data is on that tile pointing in the up direction and stating that either of the two jump moves can be executed from that position in that direction if they fit in the board.

For tic-tac-toe, the standard move is turning an empty tile into a claimed tile. This is a fairly trivial move, encoded like so:

<details><summary>Claiming a tile</summary><pre>
         o-------o     ==>     o-------o
         |   *   |     ==>     |   *   |
         | *(0)* |     ==>     | *(1)* |
         |   *   |     ==>     |   *   |
         o-------o     ==>     o-------o
</pre></details>

The difficult part involves counting the tiles in a row. We can do this by using this kind of move:

<details><summary>Counting tiles</summary><pre>
         o-------o-------o     ==>     o-------o-------o
         |   *   |       |     ==>     |   *   |       |
         | *(1)* |  (1)  |     ==>     | *(3)* |  (1)  |
         |   *   |       |     ==>     |   *   |       |
         o-------o-------o     ==>     o-------o-------o
</pre></details>

Here state 1 is claimed by player 1 and state 3 is an intermediate state meaning claimed by player 1 but used in this sequence of moves already. We then repeat this move as many times as possible and that will count how many times we can move right with only stepping on player 1's tiles. Then this move terminates all the state 3 tiles are reverted to state 1s, and this information has to be presented in the move. So there has to be another move which just turns state 3 into state 1 and can start from anywhere.

So it looks like the linked moves can be declared as starting at a particular position or not, and if not then the game will try it out on all tiles in all positions. Not bad. Let's see if we can code it up.
