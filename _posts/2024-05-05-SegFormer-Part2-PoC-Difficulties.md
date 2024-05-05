---
layout: post
title:  SegFormer Part 2, PoC Difficulties and Errors
excerpt: 
categories: [writeup, transformer, segformer, difficulties, errors]
---

# Difficulties while working on a PoC

This is a writup to difficulties and errors encountered while working on a [SegFormer PoC workbook](https://github.com/qte77/SegFormerQuantization/blob/main/PoC/hf_segformer_PoC.ipynb).

# Model

`ValueError: You passed along num_labels=1055 with an incompatible id to label map:{}`

* Passing `train_ds.features["scene_category"].num_classes`to `num_labels` when `len(id2label)` expected
* Solution: Use `len(id2label)`

`RuntimeError: Error(s) in loading state_dict for SegformerForSemanticSegmentation: size mismatch for decode_head.classifier.weight: copying a param with shape torch.Size([150, 256, 1, 1]) from checkpoint, the shape in current model is torch.Size([151, 256, 1, 1]). size mismatch for decode_head.classifier.bias: copying a param with shape torch.Size([150]) from checkpoint, the shape in current model is torch.Size([151]). You may consider adding ignore_mismatched_sizes=True in the model `from_pretrained` method.`

* Solution: Use `ignore_mismatched_sizes=True`
* New alert: `- decode_head.classifier.weight: found shape torch.Size([150, 256, 1, 1]) in the checkpoint and torch.Size([151, 256, 1, 1]) in the model instantiated - decode_head.classifier.bias: found shape torch.Size([150]) in the checkpoint and torch.Size([151]) in the model instantiated`

`NotImplementedError: Cannot copy out of meta tensor; no data!`

* When using `device_map=dev` in `from_pretrained()`.
* Solution: Add `accelerate.infer_auto_device_map(model)` to `model.hf_device_map` after model is loaded

## Train

HuggingFace Dataloader `RuntimeError: cannot pin 'torch.cuda.FloatTensor' only dense CPU tensors can be pinned`

* Dataloader loads data on device of model and tries loading data already loaded to 'cuda' into 'cuda'
* Solution: Not using `.to(cuda)` inside `collator_fn`

`OutOfMemoryError: CUDA out of memory. Tried to allocate 4.69 GiB (GPU 0; 14.75 GiB total capacity; 11.08 GiB already allocated; 2.48 GiB free; 11.23 GiB reserved in total by PyTorch) If reserved memory is >> allocated memory try setting max_split_size_mb to avoid fragmentation.  See documentation for Memory Management and PYTORCH_CUDA_ALLOC_CONF`

* [PyTorch CUDA Memory management](https://pytorch.org/docs/stable/notes/cuda.html#memory-management)
* Solution in environment: `environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:256"`
* Solution for training: `per_device_train_batch_size=batch_size` with `batch_size` from `32` to `8`
* Solution for evaluation: `per_device_eval_batch_size=batch_size` with `batch_size` from `32` to `1`

`RuntimeError: CUDA error: CUBLAS_STATUS_ALLOC_FAILED when calling cublasCreate(handle)`

* Solution: Set `environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:2048"` to max `1024`

`RuntimeError: CUDA error: device-side assert triggered
CUDA kernel errors might be asynchronously reported at some other API call, so the stacktrace below might be incorrect.
For debugging consider passing CUDA_LAUNCH_BLOCKING=1.
Compile with TORCH_USE_CUDA_DSA to enable device-side assertions.`

* Error occurs in cross entropy, maybe wrong number of labels or label indexing, `id2label` or `label2id`, See [CUDA runtime error (59) : device-side assert triggered](https://stackoverflow.com/questions/51691563/cuda-runtime-error-59-device-side-assert-triggered)
* Switch to CPU to get more meaningful error messages
* Solution: Switching to CPU leads to `IndexError: Target 150 is out of bounds.`

`IndexError: Target 150 is out of bounds.`

* Occurs in `torch._C._nn.cross_entropy_loss`, See [CUDA runtime error (59) : device-side assert triggered](https://stackoverflow.com/questions/51691563/cuda-runtime-error-59-device-side-assert-triggered).
* Maybe because `len(categories)` (150) smaller than `train_ds.features['scene_category'].num_classes` (1055) -> No.
* Testing with `max([(i["labels"].min().item(), i["labels"].max().item()) for i in test_ds.shard(10, 0)])` yields `(0, 150)`
* Solution: Prepend dummy class `id2label = {**{0:'NONE'}, **{k:v for k,v in enumerate(categories, 1)}}`. Has to be used with `ignore_mismatched_sizes=True` in `from_pretrained()`.

`RuntimeError: Input type (torch.cuda.FloatTensor) and weight type (torch.FloatTensor) should be the same`

* When trying to debug and trace `CUDA error: device-side assert triggered` with CPU instead of CUDA
* Solution: Do not use `device_map` for cpu

`ValueError: Unsupported number of image dimensions: 2`

* Occuring at random batches with
  * `PIL.mode='RGB'` (`['RGB', 'RGB', 'RGB', 'RGB', 'RGB', 'RGB', 'RGB', 'RGB']`)
  * `'pixel_values'`:`torch.Size([<batch_size=8>, <chn_dim=3>, 512, 512])`
  * `'labels'`:`torch.Size([<batch_size=8>, 512, 512])`
* Maybe false `PIL.mode` like `RGBA` with 4 channels instead of `RGB`, See ["Unsupported number of image dimensions" while using image_utils from Transformers](https://stackoverflow.com/questions/75168665/unsupported-number-of-image-dimensions-while-using-image-utils-from-transforme)
* Solution (bad one): Using `image.convert("RGB")` on every image within the on-the-fly transform function `train_transforms(example_batch)`
