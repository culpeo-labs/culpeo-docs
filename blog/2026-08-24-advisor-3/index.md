---
slug: advisor-safetensors
title: "LLM Engine: Safetensors"
authors: [glecaros]
tags: [inference]
---

To prevent this turning into me playing [insert Bethesda game name here], I'll try to have at least one main story post in between side quests. In this one we'll cover the next item I implemented in my project: parsing and loading of models in safetensors format.

{/* truncate */}

### The format

First let's talk about the format, `safetensors` is a file format designed for storing tensors that claims safety and speed are its big advantage over its competitors. Apparently, some of the existing formats and their associated machinery execute code on load (pickle), and/or create copies of the tensors in sort of a two step load; compared to that, `safetensors` indeed can claim an advantage and the format is just that, a format: passive data waiting to be read, and data that is packed in a way that we can directly use once loaded into memory (the community seems to use zero-copy when referring to this property).

Now, concretely for the format, the layout is like this:

| Offsets [B]                  | Description          |
| ---------------------------- | -------------------- |
| 0 - 7                        | Header size (uint64) |
| 8 - (8 + \<header-size> - 1) | Header               |
| (8 + \<header-size>) - EOF   | Tensor data          |

The header size at the beginning is just a LE uint64, and as the name says, it gives us the size of the next block, that is a json format header. The schema of this header is (using TypeSpec for simplicity):

```typescript
union DataType {
  "BF16",
  "F64",
  "F32",
  "F16",
  "I64",
  "I32",
  "I16",
  "I8",
  "U8",
  "BOOL",
}

model TensorDescription {
  /**
   * Data type of the tensor
   */
  dtype: DataType;

  /**
   * Shape conveys the extents of the tensor.
   * A vector would have a single dimension  [D]
   * A matrix would have two dimensions [R, C]
   * An n-dimensional matrix would be [D_1, ..., D_N]
   */
  shape: uint64[];

  /**
   * The offsets where the tensor can be found,
   * of the form [start, end).
   * (relative to the end of the header).
   */
  @maxItems(2)
  @minItems(2)
  data_offsets: uint64[];
}

/**
 * Structure that contains the declaration of all tensors. Every
 * key is a tensor name, with its value being the description of
 * that tensor. The only exception is the `__metadata__` field that
 * is a string to string map with extra information.
 */
model SafetensorsHeader {
  __metadata__?: Record<string>;
  ...Record<TensorDescription>;
}
```

An interesting note about the header block is that it can be padded with trailing spaces which is relevant for alignment. Similarly, tensors are not necessarily densely packaged to account for alignment.

### The parser

To read the file in an easy way, we use `mmap` to efficiently map the file to memory. To initialize the mapping, we need the size of the file (that we can easily get with `std::filesystem::file_size`), and a file descriptor for the file (easy again with `fopen` and `fileno`, it should be noted that we can close the file stream with `fclose` as soon as we initialize the map as it does not require it to be open). Additionally, we pass the `PROT_READ` for the memory protection parameter (you may have guessed that means "pages can be read"), and the `MAP_PRIVATE` flag, essentially saying that the map is process local with copy-on-write (not relevant for us because read-only) It should be noted that since RAII is our friend, we use it for the closable stuff to be safe, homebrew `scope_guard` for the file stream, and `std::shared_ptr` with a custom deleter for the `mmap` (`munmap` called by the destructor lambda).

Now that we have the entire file as a big chunk of (virtual) memory, we can just start reading it. First 8-byte word is the size of the header. With it we can initialize a `std::string_view` that encompasses the whole header, and we use that to initialize our header struct.

For json deserialization, we use [glaze](https://github.com/stephenberry/glaze). glaze is a really cool library that is amazingly fast at deserializing and allows us to have a type safe representation of the struct (no `json["__metadata__"]` like other libraries). It also allows to easily customize the parser and do stuff like "we only know this property, put the rest in this map" (which is really useful when that's exactly the structure of the header)

With the header at hand, we know all the tensors by name, and what their shape is, so we can now just get them. For this we build a thin wrapper class that has a view of the memory scoped to the tensor position and size within the memory map. This class also has an alias `std::shared_ptr` to guarantee lifetime of the memory map is tied to its lifetime, and, of course, information about its shape.

To ensure everything works as intended, I asked the AI to help me generate a python script that would generate a sample safetensors file and a header file with the expected values. To accompany these, I also asked for a test file to exercise my code (with this being the part I wasn't as interested in writing, having it help with this ended up being really useful)

The code for this part of the project (with some extra stuff where I was reorganizing some of the code) can be found [here](https://github.com/culpeo-labs/inference/pull/2).