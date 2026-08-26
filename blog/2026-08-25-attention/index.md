---
slug: advisor-attention
title: "LLM Engine (Side Quest): Heads down on attention"
authors: [glecaros]
tags: [inference]
---

In a previous post, when explaining attention I did mention the expression "attention heads", and then quickly moved on without explaining what that meant or how it did affect the computation. In this post, I'll try to atone for that by explaining to the best of my current understanding (clearly here current means my understanding after being done with writing this and all the necessary reading).

{/* truncate */}

We'll start just after the application of $RoPE$. We have embedded position into our query ($Q$) and keys ($K$), the important clarification to do here is that we treated these tensors as vectors, but in reality they are a collection of vectors that are packed as a single vector, so for $Q$:

```math
Q =
\begin{vmatrix}
q_{1,1} \\
.. \\
q_{1,d} \\
.. \\
q_{h,1} \\
.. \\
q_{h,d}
\end{vmatrix} =
\begin{vmatrix}
q_{1,1} & .. & q_{1,d} \\
.. & .. & .. \\
q_{h,1} & .. & q_{h,d}
\end{vmatrix}
```

Where $h$ is the number of heads and $d$ is the head dimension.

$K$ and $V$ (the value vector) have a different layout from $Q$ (both are identical), but here each row will have the same dimension $d$ and there will be a different number of rows, the called "key-value heads" or $KVH$ for friends. The relationship between number of heads and the key-value heads is a model design decision and can define the following taxonomy:

- *Multi-head Attention (MHA)*, same number of heads and key-value heads; the original transformer, good quality but more computationally expensive (this will be apparent in the next few paragraphs)
- *Multi-query Attention (MQA)*, single key-value head is shared across all heads; this is cheaper to compute, but apparently has instability and quality issues.
- *Grouped-query Attention (GQA)*, multiple key-value heads but they are each shared by a subset of the attention heads (e.g Llama 3 8B has 32 heads and 8 key-value heads)

Now that we have that out of the way, we'll enter into what is done for each attention head. First though, we need to determine which key-value head interacts with the current head. Let's say we are processing attention head $i$ ($0 \leq i < h$), we then will determine the key-value head $j$:

```math
j = \text{floor}(\frac{i \cdot \text{kvh}}{h})
```

We reached the part where in the previous post we said something to the effect of "we then apply our query to the keys of all previous tokens" and we also magically introduced a $i$ (master foreshadowing). Untangling all of the magic, we'll now say, we get all previously computed $K$ vectors corresponding to head $i$ from the cache (ok, not all of the magic, some mirrors left) and for computation convenience we'll pack them side by side to build a matrix (let's say current token is number $c$):

```math
K_j =
\begin{vmatrix}
k_{1,1} & .. & k_{1,d} \\
.. &.. & .. \\
k_{c,1} & .. & k_{c,d}
\end{vmatrix}
```

We then proceed to compute the scores that correspond to this head:

```math
\text{scores}_i = K_j \cdot Q_i
```

Then these scores need to be scaled. The explanation for the scaling and its value is that this product adds the components of all head dimensions. Here the assumption made is that each of these components is an independent variable, and if its mean is $0$ and variance is $1$ it follows that the variance of the sum is $d$ ($d$ dimensions, $d$ components in the sum), so scaling by the standard deviation would normalize (standard deviation is $\sqrt{d}$), so:

```math
\text{scores}_i = \frac{1}{\sqrt{d}} \cdot \text{scores}_i
```

Now that scores are standardized, we use $\text{softmax}$ to turn them into probabilities:

```math
\text{scores}_i = \text{softmax}(\text{scores}_i)
```

And we use these to compute the attention for this head by applying it to the values of all tokens so far (we obtain $V_j$ in a way identical to $K_j$)

```math
\text{attention}_i = V_j^T \cdot \text{scores}_i
```

Once this is done, we just have to project this into something we can add to the residual stream, and for this we use the $W_O$ weights. This is somewhat interesting too, as these weights are packed as a single matrix but in reality are $h$ matrices.

```math
W_O =
\begin{vmatrix}
o_{1,1} & .. & o_{1, d} & .. & o_{1, d \cdot h} \\
.. & .. & .. & .. & .. \\
.. & .. & .. & .. & .. \\
\end{vmatrix}
```

This is why we concatenate all of the heads attention results into a single vector of size $d \cdot h$, so we can do:

```math
\text{attention\_projection} = W_O \cdot \text{concatenated\_attention}
```

At this point, we can zoom out and continue moving forward in the block as described in the other post (add the projection to the residual stream, and move to the FFN part).

#### References

 - [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints, Ainslie et al.](https://arxiv.org/abs/2305.13245)
 - [Attention Is All You Need, Vaswani et al.](https://arxiv.org/abs/1706.03762)