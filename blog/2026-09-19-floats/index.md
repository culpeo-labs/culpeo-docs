---
slug: floats
title: "LLM Engine (Side Quest): We all float"
authors: [glecaros]
tags: [inference]
---

So, there's a lot of buzz about memory in the AI space; this buzz seems to, by the time of me writing this, have overtaken completely the discussion about compute. This is because here lies perhaps the catch of the "Deep Neural Network scale really well when parameters grow" phrase: those parameters need to a) be loaded somewhere, and b) need to be given to a processor to munch on.

{/* truncate */}

To put this in scale, the latest (again, at the time of this writing) models seem to be in the order of 500 billion parameters, with each of these parameters obviously being a number. This means that to run it we need to load 500 billion numbers, and not just that, we need to also perform computations on them (as was previously described in the post about the forward block)... that is a lot of numbers, and a lot of moving of numbers even without considering KV-caches and the like. This would mean that if we have a parameter count of $N$, and a parameter representation $b$ in (bytes per parameter), we could define $W$ as the total bytes used by the parameters.

```math
W = N \cdot b
```

So, to put numbers to it, if we stored each number as a single precision floating point number, we would be spending 4 bytes of memory per parameter, which would put us at around 2 [TB] of memory just to load the model into memory. Let's say we have that, for an (extremely coarse) approximation consider that we need to move all of those parameters for each token of input and generated, and assuming a bandwidth $B$ (in [B/s]), we could define our throughput as:

```math
T(W, B) = \frac{B}{W}
```

This is for $W$ total bytes of weights, so our throughput is our memory bandwidth $B$ divided by $W$. A high-end consumer PC has something like 90 [GB/s] for bandwidth, and some of the high-end dedicated AI GPU systems can go way higher with 8 [TB/s] per GPU. For those values we have (again, we are being super naive and coarse, but this is just to grasp the scale of the problem)

```math
T_\text{consumer}(W) = \frac{90 \frac{GB}{s}}{2\frac{TB}{token}} = 0.045 \frac{\text{token}}{s}
```

```math
T_\text{AI}(W) = \frac{8 \frac{TB}{s}}{2\frac{TB}{token}} =  4\frac{\text{token}}{s}
```

Neat, the gains from consumer to industrial grade hardware are definitely something, but 4 tokens per second is hardly an impressive number. It is a given that memory bandwidth will continue to increase, but that is generally a slow process (or at least slower than the rate at which models are being developed). So, if we want to get improvements soon, what's left is to fiddle with the other component, the number of bytes of weights per token.

Aside from the "DNN scale well with parameter count" claim, there's another that is quite relevant here: "DNN are quite tolerant to numeric differences in the parameters" ([Dettmers et al.](https://arxiv.org/abs/2208.07339)). This one is quite important because it allows us to run the model with way smaller precisions without losing quality in a noticeable way. We have two avenues for this: training the model in lower precision representations, and _quantizing_ the model so inference can be performed with much decreased precision.

The first approach is self-explanatory, if a lower precision number is used to train, the model will have its weights encoded in that precision. This is a direct gain and we have this as a very common pattern that has been used for a while. For example, the Llama model we are playing with in this project, uses `BF16` encoding, which is not-quite-half-precision (half precision has 1 sign, 5 exponent and 10 mantissa bits, where `BF16` has 1 sign, 8 exponent and 7 mantissa).

Model quantization is also quite simple in its goal while its execution is a bit more esoteric (for an uninitiated like me :D). Essentially, the model checkpoint that was trained with some precision can be modified to operate at a lower precision. For example, a `BF16` model can be modified to operate with 8-bit float or integer, or even 4-bit integer, which against the full-precision baseline in our example above would be an 8x improvement (and 4x against `BF16`). It should be noted that all our assumptions are gross oversimplifications akin to saying $\pi=10$, useful to convey an idea and its scale but far from accurate.


#### References

[LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale, Dettmers et al.](https://arxiv.org/abs/2208.07339)