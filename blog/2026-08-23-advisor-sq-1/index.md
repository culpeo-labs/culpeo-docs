---
slug: advisor-sq-1
title: "LLM Engine (Side Quest): The block"
authors: [glecaros]
tags: [inference]
---

At the highest of the high levels, the transformer applies a number of transformations to a token in order to obtain the next token. We'll, for now, hand-wave the fact that these consider results from application of the same operations to all tokens in the input up to the one we are currently processing.

To understand how these operations are made and how information is accumulated across a pass to all the model layers, we need to understand what the literature calls the "residual stream". The residual stream starts as the original embedding (the vector representation of the token), and as we move forward in the block we add all of the results (this can be imagined as the block imbuing the original vector with meaning derived from context and the model's training), and so, it is "residual" because each layer adds its contribution to the running result (always of the form $ x_{i+1} = x_i + f(x_i) $).

{/* truncate */}

Now, in terms of what actually happens, the first (arguably trivial) operation is to transform the received token (a number) into its equivalent embedding. This is done by doing a simple table lookup on the vocabulary table that ships with the model; the token is just the index of the row that contains the vector.

```math
X = embed(token)
```

With the embedding in hand, we first normalize it (as it was mentioned in the previous post this is to mitigate the drift that the compound operations can cause in our residual stream). Note that we normalize into a different vector, so we keep our residual vector residual (in notation we'll include the weights for normalization but will elide the $eps$ parameter).

```math
H = rmsnorm(X, W_\text{input-layer-norm})
```

Once normalized, we use it to generate the values we require for the attention. Attention is the mechanism by which the model imbues context into the embedding of a specific token. For this, we need to determine how tokens affect each other, and also in which way. The model provides three sets of weights (per layer, everything here is per layer) to obtain exactly this information:

```math
Q = W_Q \cdot H
```
```math
K = W_K \cdot H
```
```math
V = W_V \cdot H
```

The query ($Q$) and key ($K$) vectors are used to determine how a token _attends_ another, and the value ($V$) is the content that gets modulated by that attention. Something that is interesting about these values, is that they are split across several parallel heads (this is something that we'll punt to another post to keep this one reasonable)

Next part is imbuing position information into $Q$ and $K$. We do that with RoPE:

```math
Q = \text{RoPE}(Q)
```
```math
K = \text{RoPE}(K)
```

Once this is done, we need to apply our query $Q$ to the key $K$ of all previous tokens to compute how they influence each other, with this yielding the scores.

```math
\text{scores}_i = K_i \cdot Q
```
These scores get then scaled by the inverse of the square root of the dimension of each attention head, and `softmax` gets applied to it to get probabilities from the logits.

```math
\text{scores} = \text{softmax}\!\left(\text{scores} \cdot \frac{1}{\sqrt{\text{head\_dim}}}\right)
```

Now that we have built the scores as probabilities, we use them to calculate the contribution from $V$ that should actually be included in the attention, so for each attention head we have:

```math
\text{attention}_i = \sum_n{\text{scores}_{i,n} \cdot V_{i,n}}
```

And with all heads having produced their attention vectors, we can concatenate them into a full width vector that we can then project using the $W_O$ weights.

```math
\text{attention\_projection} = W_O \cdot \text{attention}
```

And the final step of the attention block is to add the projection to the residual stream ($x_{i+1} = x_i + f(x_i)$, ta da!):

```math
X = X + \text{attention\_projection}
```

The next part we then run within the layer is what literature generally calls FFN (Feed-forward Network) or sometimes MLP (Multi-layer Perceptron). This part involves a linear part, a non-linear part that is generally called activation, and a final linear part that produces the results that are then added to the residual stream. This is the second and last part of the processing of each layer and differs from attention in that semantic enrichment comes not from the neighboring tokens, but rather the model enriches each token independently (this is of course a useful mental model, but it's hard to track what's going on exactly here).

As in the attention layer, the first thing we do is to normalize the input.

```math
H = \text{rmsnorm}(X, W_\text{post-attention-norm})
```

Once normalized, we need to generate a couple of projections in what is the first linear phase mentioned above:

```math
G = W_{\text{gate}} \cdot H
```
```math
U = W_{\text{up}} \cdot H
```

Where $U$ (up) is the vector that contains the meaning that is "trying" to make it to the residual stream, and $G$ (gate) is the vector that determines how the activation of that happens (note that both $G$ and $U$ have more dimensions than $H$ so $W_{\text{up}}$ "lifts" $H$). First, we build the SiLU gate:

```math
\text{SiLU}_i = \frac{\text{G}_i}{1 + e^{-\text{G}_i}}
```

And then it just gets applied:

```math
\text{SiLU}_\text{out} = \text{SiLU} \cdot U
```

And finally, we apply the $W_{\text{down}}$ weights to project the output (bring down into the dimensions of $H$):

```math
\text{FFN}_\text{out} = W_{\text{down}} \cdot \text{SiLU}_\text{out}
```

And to close (double ta da!), the result gets added to the residual stream:

```math
X = X + \text{FFN}_\text{out}
```

This concludes the layer part of the block, the above transformations get applied for each layer of the model (each layer has its own set of weights) with the results always accumulated in the residual stream.

Once the layer processing is complete, we are ready to compute the next token from the residual stream. To do this, we first normalize:

```math
H = \text{rmsnorm}(X, W_{\text{norm}})
```

Then we apply the unembedding (`lm_head`) to produce the logits.

```math
\text{logits} = W_U \cdot H
```

And finally, in our greedy implementation we get the token by using `argmax`:

```math
\text{token} = \text{argmax}(\text{logits})
```

If we are processing input, we discard this token and process the next input token. This does not mean the pass was a waste as it updates the KV-cache (topic that we punt to a future post). If we are in the generation phase (past the input), this would be our next output token. GG


#### References:
- [A Mathematical Framework for Transformer Circuits](https://transformer-circuits.pub/2021/framework/index.html)
- [3Blue1Brown: Transformers, the tech behind LLMs](https://www.3blue1brown.com/lessons/gpt)
- [3Blue1Brown: Attention in transformers, step-by-step](https://www.3blue1brown.com/lessons/attention)
- [3Blue1Brown: How might LLMs store facts](https://www.3blue1brown.com/lessons/mlp)