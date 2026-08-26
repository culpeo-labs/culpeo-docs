---
slug: advisor-kernels
title: "LLM Engine: The plan and the kernels"
authors: [glecaros]
tags: [inference]
---

In the previous post, I talked about the methodology of my learning project. In this one, I'll describe the general plan I built iterating with the AI tool based on what I wanted to achieve. To recap, I want to write the code myself, with AI just providing guidance, reviews, and information.

This being a learning adventure, the progression I arrived at was: first, I'll write a naive implementation that lets me learn the process, and we'll refine from there.

{/* truncate */}

The components to get the naive implementation to work are:
- The operations required (kernels) to run generation.
- The KV cache (critical part that keeps past calculations so each token considers them without recomputing)
- The structure that loads and holds the model weights and config.
- The actual code that runs generation.

Tokenization in both directions is for now out of scope and I'll use a wrapping layer that handles token encoding/decoding.
On top of that, we have a somewhat orthogonal staging for implementation that relates to runtime optimization, and note that we will start with the slowest most naive implementation with the explicit intention of experiencing the impact of each layer. These, at broad strokes are: scalar implementation, SIMD, concurrency, and GPU.

Finally, the last axis in this implementation is related to how it works (and how useful it is). Broadly speaking we have the greedy implementation (`argmax`) vs the non-deterministic (with top-p and temperature). This is one of the most interesting parts from a learning perspective as it is the one that I understand the least, so for now we just parrot the names.

With that, let's move to the first stage, the kernels. From the writeup AI generated for me, it seems that we will need to implement a few operations (these are presented as refdoc-like signatures sometimes with pseudocode). These are:

- `embed(table: [r, c], token: int)- > [c]`

    Essentially, a table lookup where a token_id (index) is received and a vector is returned

- `rmsnorm(x: [r], w: [r], eps: float) -> [r]`

    [Root mean square normalization](https://arxiv.org/abs/1910.07467). Apparently, since each layer computes a number of multiplications, the impact of these start compounding and the values can drift. To mitigate this LayerNormalization is introduced, and RMS Normalization is a variant on the traditional version of it that is cheaper computationally.

- `matvec(w: [r, c], x: [c]) -> [r]`

    Plain matrix vector multiplication, easy enough.

- `rope(t: [r, c], pos: int, theta_base: float) -> [r, c]`

    Huh? This one needed learning, so watched a couple of videos on it. At its most basic, [RoPE](https://arxiv.org/abs/2104.09864) encodes position information in a token by rotating it. So here we rotate the vectors in `t` to encode the position `pos`.

    The reading yielded that this uses the fact that rotating vectors by an angle proportional to the position makes the dot product between two vectors depend only on their relative distance within the attention.

- `softmax(x: [r]) -> [r]`

    Again, something that needed a bit of [reading](https://www.deeplearningbook.org/contents/mlp.html). Apparently this function is used to turn a vector of `n` scores into a probability distribution. It's used to transform the attention scores into weights to model the relationship between tokens, and also to compute which token is the most likely next token (this happens at the end of the forward pass for each token)

- `add(a: [r], b: [r]) -> [r]`

    Just vector addition.

-  `silu_mul(gate: [r], up: [r]) -> [r]`

    The activation function, this uses [Swish](https://arxiv.org/abs/1710.05941) on the `gate` and then it multiplies by `up` ultimately having the `gate` modulate how much of `up` goes past it ([the SwiGLU gate](https://arxiv.org/abs/2002.05202))

- `argmax(x: [r]) -> int`

    Returns the index of the biggest element, this we use in our greedy implementation to find the next token.

This is what my research yielded for each of the functions I needed to implement and, while this has been really illustrative, I feel that I lack the conceptual understanding on how these play together. I'll shelve this concern for now and probably take a little side quest to find out more for the next writeup.

In terms of implementation, first thing to note is that none of these allocate, the memory for the output will always be provided by the caller. Second, some of the signatures don't show it, but operations are made in place where it makes sense.

Now, more deeply into the details, I decided to use [`std::mdspan`](https://en.cppreference.com/cpp/container/mdspan) for matrices and [`std::span`](https://en.cppreference.com/cpp/container/span) for vectors (this is one of those decisions that a voice in my head tells me I'm going to regret it, but I ignored it to get something working first)

Last bit of the implementation here, AI provided a test file, and a python script to generate the golden values we would be testing against.

This first implementation can be found [here](https://github.com/culpeo-labs/inference/tree/77b746ff3161487226f97ef5ee79a213883cc28e) (a number of updates were done after that, including acting on the advice to rethink the `std::span` decision)