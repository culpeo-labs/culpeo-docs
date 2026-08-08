---
slug: advisor
title: "LLM Engine: The method"
authors: [glecaros]
tags: [inference]
---

Usually, when I am using AI at work, I rely on it to write code: fix a bug, scaffold a project, sometimes even to write a project end to end. This flow leads to a couple of things: my understanding of the projects can become stale if I'm not careful, and, honestly, I'm not having as much fun as I used to.

{/* truncate */}

To put a spin on this, I'm starting to experiment with using AI as a non-coding advisor, with the flow being: I select a topic, use AI to scope and frame what needs to be done, and start developing. Note that by non-coding, I mean not coding towards the problem, but still using it to help with mechanical parts like scaffolding. And the advisor part comes from reviewing, and pointing out conceptual gaps I need to close to understand the problem.

As a first attempt, I decided to implement an engine that can run LLMs in C++ from scratch. This seemed like a good project because a) it has been a few years since I started using these tools, and I do feel I don't understand how they work underneath, and b) C++ is the language I feel most comfortable with, and it's also a language I don't get to use in my day-to-day work (so this is my fun plug).

Without going into prompts and details, the first thing I did was to iterate over what I wanted to do and, importantly, how. The "how" here carries the explicit ask for "don't give me code", "review, but don't update", and so on. It also carries the progression I want from the project: small-ish tasks with observable (testable even) results, that build into an end-to-end that works. Once we reach "works", the real fun begins as we begin working towards "works well" and "works fast".