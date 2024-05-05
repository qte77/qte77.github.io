---
layout: post
title:  SegFormer Part 1, Description
excerpt: 
categories: [writeup, transformer, segformer, description]
---

# Description

## Model

Using [Nvidia SegFormer (b0-sized) encoder pre-trained-only](https://huggingface.co/nvidia/mit-b0)

  * "hierarchical Transformer encoder", "lightweight all-MLP decode head" (for segmentation)
  * "pre-trained on ImageNet-1k, after which a decode head is added and fine-tuned altogether on a downstream dataset"
  * "SegformerForSemanticSegmentation adds the all-MLP decoder head on top"
  * Paper [SegFormer: Simple and Efficient Design for Semantic Segmentation with Transformers](https://arxiv.org/abs/2105.15203)
  * [Paper Github](https://github.com/NVlabs/SegFormer)
  * SegFormer Model Architecture

![SegFormer Model Architecture](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/segformer_architecture.png)

## Task 

Using `scene-parsing` with Dataset [scene_parse_150](https://huggingface.co/datasets/scene_parse_150), a subset of [semantic segmentation dataset](https://paperswithcode.com/task/semantic-segmentation) [MIT ADE20k](https://paperswithcode.com/sota/semantic-segmentation-on-ade20k)

  * "segment the whole image densely into semantic classes (image regions), where each pixel is assigned a class label"
  * "mean of the pixel-wise accuracy and class-wise IoU as the final score"
  * structure

```json
{
  'image': <PIL.JpegImagePlugin.JpegImageFile image mode=RGB size=683x512 at 0x1FF32A3EDA0>,
  'annotation': <PIL.PngImagePlugin.PngImageFile image mode=L size=683x512 at 0x1FF32E5B978>,
  'scene_category': 0
}
```

## Execution order for model `Trainer()`

  1. Transform on-the-fly
    * Data gets batch-wise prepared and augmented (`<dataset>.set_transform(<transform_fn>)`)
  2. Tokenize tansformed data (`image_processor`)
    * Inputs `image`, `annotation` (segmentation mask) and `scene_category` (label)
    * Outputs `pixel_values` and `labels` tensors
  3. Collate tokenized batch data (`data_collator=collate_fn`)
    * Returns stacked tensor of tokenized data batches
  4. Fine-tune model with prepared data
    * Also inputs `id2label` and `label2id`
    * Returns tensor of pixel-wise logits
  5. Evaluate model output (`compute_metrics`)
    * Compare output logits to input segmentation mask
    
## Pseudo downstream forward run

```python
from torch import no_grad
from transformers import (
  AutoModelForImageClassification,
  AutoImageProcessor
)
image_processor = AutoImageProcessor.from_pretrained(checkpoint)
model = AutoModelForImageClassification.from_pretrained(checkpoint)
# preprocess and tokenize, return PyTorch tensors
inputs = image_processor(image.convert("RGB"), return_tensors="pt")
# forward only
with no_grad():
    outputs = model(**inputs)
    logits = outputs.logits
pred_cls_idx = logits.argmax(-1).item()
print(f"{pred_cls_idx=}, {model.config.id2label[pred_cls_idx]=}")
```
