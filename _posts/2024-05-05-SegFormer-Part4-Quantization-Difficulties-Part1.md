---
layout: post
title:  SegFormer Part 4, Quantization Difficulties and Errors Part 1
excerpt: 
categories: [writeup, transformer, segformer, quantization, difficulties, errors]
---

# Difficulties while Quantizing

## Load versions for QAT and compare SPACE/TIME

`ValueError: SegformerForImageClassification does not support device_map='auto'. To implement support, the modelclass needs to implement the _no_split_modules attribute.`
and
`ValueError: SegformerForImageClassification does not support device_map='sequential'. To implement support, the modelclass needs to implement the _no_split_modules attribute.`

* [`from_pretrained()`](https://huggingface.co/docs/transformers/main_classes/model#transformers.PreTrainedModel.from_pretrained.device_map) supports `device_map='auto'`, but not [SegformerForImageClassification](https://huggingface.co/docs/transformers/v4.31.0/en/model_doc/segformer#transformers.SegformerForImageClassification)
* Solution: `device_map=0` (cuda:0) as default param into `SegformerForImageClassification.from_pretrained()`

## Test model with example input

`RuntimeError: Input type (float) and bias type (c10::Half) should be the same`

* If input is not halfed
* Solution: `copy()` input dict and `half()` the `pixel_values`

`RuntimeError: "slow_conv2d_cpu" not implemented for 'Half'`

* If input is halfed
* From /usr/local/lib/python3.10/dist-packages/torch/nn/modules/conv.py
* Solution: inputs["pixel_values"] to device cuda

`UserWarning: Input type into Linear4bit is torch.float16, but bnb_4bit_compute_type=torch.float32 (default). This will lead to slow inference or training speed.`

* Solution (TODO): Use bnb config `BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=<dtpype>)`

## Training

`RuntimeError: Input type (float) and bias type (c10::Half) should be the same`

* Error when training int8 and int4 w/o adopting input
* [PyTorch cpp c10::Half](https://pytorch.org/cppdocs/api/namespace_c10.html#namespace-c10), [Introducing the Half type!](https://devblogs.microsoft.com/dotnet/introducing-the-half-type/), [Numpy Data types](https://numpy.org/doc/stable/user/basics.types.html)
* Solution: `collate_fn` with `tensor.half()`

`ValueError: The model you want to train is loaded in 8-bit precision.  if you want to fine-tune an 8-bit model, please make sure that you have installed bitsandbytes>=0.37.2.`

* Error while calling `Trainer()` despite having `bitsandbytes>=0.37.0` installed and imported, e.g. `%pip list | grep bitsandbytes` yields `bitsandbytes 0.41.1`
* Solution: TODO


`UserWarning: You are calling save_pretrained to a 8-bit converted model you may likely encounter unexepected behaviors. If you want to save 8-bit models, make sure to have bitsandbytes>0.37.2 installed.`

* Warning and Error saving 8bit quantized model

`NotImplementedError: You are calling save_pretrained on a 4-bit converted model. This is currently not supported`

* Error saving 4bit qantized model

`RuntimeError: Loading a quantized checkpoint into non-quantized Linear8bitLt is not supported. Please call module.cuda() before module.load_state_dict()`

* TODO

Designing a device map

* [Designing a device map with HF Accelerate](https://huggingface.co/docs/accelerate/main/en/usage_guides/big_modeling#designing-a-device-map), supported defaults: `"auto", "balanced", "balanced_low_0", "sequential"`
* [`accelerate.infer_auto_device_map`](https://huggingface.co/docs/accelerate/main/en/package_reference/big_modeling#accelerate.infer_auto_device_map)
* Solution: for now use `device_map=0` or `device_map={'':torch.cuda.current_device()}`



