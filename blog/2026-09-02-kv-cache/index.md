---
slug: kv-cache
title: "LLM Engine: KV Cache"
authors: [glecaros]
tags: [inference]
---

From the previous posts, it should be clear(-ish) that to compute attention for a given token, we need to have performed calculations on all previous tokens. Concretely we need to compute their keys ($K$) and values ($V$). Computing these values depends only on the token and the model weights, therefore they can be computed once and just referred to in the future. This is what a KV-cache is/does: As we process a token, we generate its $K$ and $V$ and store them in the cache that we can just read when we need them again.

{/* truncate */}

In terms of implementation, this is a somewhat simple thing to do, the requirements are (a) values need to be stored by head, and position; (b) when read we need to retrieve all the positions stored (this is the "we need $K$ and $V$ for all previous tokens"); and (c) we need values to be stored in a way that is read-efficient as we write once but read many times.

Let's start by describing the shape, the relevant tensors are: $Q$, $K$, and $V$. First, we define a few values for the dimensions:

- $h$: Heads
- $h_{kv}$: Key-Value heads.
- $d$: Head dimensions.
- $hidden$: Hidden dimension, essentially the embedding dimensions.

Then how we compute each of them (and their dimensions):

```math
\underbrace{Q}_{h \cdot d \times 1} = \underbrace{W_{q}}_{h \cdot d \times hidden} \cdot \underbrace{H}_{hidden \times 1}
```
```math
\underbrace{K}_{h_{kv} \cdot d \times 1} = \underbrace{W_{k}}_{h_{kv} \cdot d \times hidden} \cdot \underbrace{H}_{hidden \times 1}
```
```math
\underbrace{V}_{h_{kv} \cdot d \times 1} = \underbrace{W_{v}}_{h_{kv} \cdot d \times hidden} \cdot \underbrace{H}_{hidden \times 1}
```

Now, these vectors are the tensors for all heads/kv-heads, so each of them is of this form:

```math
\underbrace{T}_{h \times dim} =
\begin{vmatrix}
\underbrace{t_{1}}_{dim \times 1} && .. && \underbrace{t_{h}}_{dim \times 1}
\end{vmatrix}
```

Given this, going forward we'll use $q_i$, $k_i$, and $v_i$ to denote the specific tensor for a head/kv-head.

Next, for how they are used, for each token at position $pos$ we do (note that for simplicity we will use $h$ to denote the appropriate kv-head too, see the previous post to see how we get that ;)):

```math
scores_{h,t} = \underbrace{k_{h,t}}_{dim} \cdot \underbrace{q_{h}}_{dim}, \forall t \in [1, pos]
```

Which is equivalent to:

```math
\underbrace{scores_{h}}_{pos} = \underbrace{k_h}_{pos \times dim} \cdot \underbrace{q_h}_{dim}
```

From this it is clear that, for each token we compute its $k_h$ and we also need the values from every token up to there, so we just store it:

```math
\text{store\_k}(h, pos, k_h)
```

And the retrieve method should give us a shape that we can use in the vectorized version of the $scores_h$ computation, so:

```math
\underbrace{K_h}_{pos \times dim} = \text{retrieve\_k}(h)
```

Cool, now to the $V$ part: the usage of $v_h$.

```math
attention_{h,i} = \sum_{j \in [1, pos]} scores_{h,j} \cdot v_{h,j,i}, \forall i \in [1,dim]
```

Which is a bit of a mouthful, but can be rewritten as:

```math
\underbrace{attention_h}_{dim} = \underbrace{v^T_h}_{dim \times pos} \cdot \underbrace{scores_h}_{pos}
```

So, this is a little bit funnier. We have the option of writing the double loop or transpose and use our `matvec` kernel. Initially I did implement the double loop, but later updated to the other alternative (which is what we'll use here). It's clear that we need all of the old $v_h$, so we do the same as we did for $k_h$ but we store transposed:

```math
\text{store\_v}(h, pos, v_h)
```

Interface has the same shape, although less efficient to write for a row-aligned matrix (which is what we use), not terribly worrying as we write very few times compared to how many times we read.

```math
\underbrace{V^T_h}_{dim \times pos} = \text{retrieve\_v}(h)
```

And that is actually all there is to it, exactly what you would expect of something that has cache in the name, with the added interesting bit that shape matters.

Next up, we'll talk about floating-point numbers.

:::note

The PRs are that are relevant for the implementation of the KV cache are:

- [Refactor cache_block to use mdarray. #11](https://github.com/culpeo-labs/inference/pull/11)
- [Extending cache block to allow transposed storage.](https://github.com/culpeo-labs/inference/pull/12)
- [Storing values transposed to use matvec directly + Add heuristic to fall back into sequential execution. #13](https://github.com/culpeo-labs/inference/pull/13)
:::