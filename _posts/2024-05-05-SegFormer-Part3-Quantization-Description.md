---
layout: post
title:  SegFormer Part 3, Quantization Description
excerpt: 
categories: [writeup, transformer, segformer, quantization, description]
---

# Description of Quantization of pre-trained Image Transformers

## Load versions for QAT and compare SPACE/TIME

8-bit quantization with bitsandbytes

From [LLM.int8() Paper](https://arxiv.org/abs/2110.02861), [Source GH](https://github.com/TimDettmers/bitsandbytes).
[8-bit HF inference example](https://github.com/TimDettmers/bitsandbytes/blob/main/examples/int8_inference_huggingface.py)

* optimizer
  * `bnb.optim.Adam8bit(....)`
  * `bnb.nn.Embedding(..)`
* inference
  * `linear = bnb.nn.Linear8bitLt(...)`
  * Modes: mixed-precision, int8
  * or full `LLM.int8()` method


`BitsAndBytesConfig` also offers configuration support.

```python
from transformers import BitsAndBytesConfig

# quantization_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=bf16)
nf4_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
)
```

## Links

* HF [SegFormer](https://huggingface.co/docs/transformers/model_doc/segformer), [SegFormer Semantic Segmentation](https://huggingface.co/docs/transformers/v4.30.0/en/model_doc/segformer#transformers.SegformerForSemanticSegmentation)
* HF [Quantize Transformer Models](https://huggingface.co/docs/transformers/main/main_classes/quantization)
* HF [PEFT Parameter-Efficient Fine-Tuning](https://github.com/huggingface/peft)
 * HF PEFT LoRA int8 [Finetune-opt-bnb-peft.ipynb](https://colab.research.google.com/drive/1jCkpikz0J2o20FBQmYmAGdiKmJGOMo-o?usp=sharing)
* HF [Accelerate MP multi-GPUs/TPU/fp16](https://github.com/huggingface/accelerate)
  * wraps `torch.distributed.run`
* Nvidia [amp: Automatic Mixed Precision](https://github.com/NVIDIA/apex/tree/master/apex/amp)
* Microsoft [DeepSpeed CPU offloading](https://www.deepspeed.ai/tutorials/zero-offload/)
  * [HF DeepSpeed integration]( https://huggingface.co/transformers/v4.10.1/main_classes/deepspeed.html)
* HF [Utilities for Image Processors](https://huggingface.co/docs/transformers/internal/image_processing_utils)
* [PyTorch performance tuning](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html)
