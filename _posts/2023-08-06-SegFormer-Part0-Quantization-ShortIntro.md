---
layout: post
title:  SegFormer Quantization Part 1 Short Intro
excerpt: 
categories: [ml, theory, transformer, attention, embedding, encoding, tensor, quantization]
---

# SegFormer Quantization, Part 1 Introduction

## Purpose

- Quantization to reduce SPACE and it's effect on TIME and model quality
- Research different quantization schemes on pre-trained models
- Using HuggingFace built-in or custom functions
- If HuggingFace is insufficient use [PyTorch](https://pytorch.org/hub) or [TensorFlow](https://tfhub.dev) Hubs
- If all fall back to using low level PyTorch

## What

- Overcoming and recording difficulties along the way
- From PoC to MVP
- As generic as possible using [jupytext](https://github.com/mwouts/jupytext/) and [papermill](https://github.com/nteract/papermill)

## How

- Using [SegFormer](https://github.com/NVlabs/SegFormer) ([HF](https://huggingface.co/docs/transformers/model_doc/segformer)) for [Image Classification](https://huggingface.co/docs/transformers/v4.30.0/en/model_doc/segformer#transformers.SegformerForImageClassification) and [Semantic Segmentation](https://huggingface.co/docs/transformers/v4.30.0/en/model_doc/segformer#transformers.SegformerForSemanticSegmentation)
- PyTorch `.half()`
- [HuggingFace](https://huggingface.co/docs/transformers/main/main_classes/quantization) and [bitsandbytes](https://github.com/TimDettmers/bitsandbytes) `load_in_8bit` and `load_in_4bit`
- Custom functions like `binarization`

## To come

- Using PyTorch [quantization](https://pytorch.org/docs/stable/quantization) capabilities like `quant/dequant`-Layers, `dtype.qint32`, `quantize_fx`, `QConfigMapping`
- Task specific distribution of w/b, act and grad
- Use learned task specific distribution as initialisation
