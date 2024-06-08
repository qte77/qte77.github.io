# Resultes fine-tuning pre-trained SegFormer

- [SegFormer-fine-tune-half-baseline.py](https://github.com/qte77/SegFormerQuantization/edit/main/PoC/SegFormer-fine-tune-half-baseline.py)
- Model specs
  - [original pre-trained mit-b0]( https://huggingface.co/nvidia/mit-b0)
  - fined (fine-tuned)
  - fined_half (fine-tuned and weights halfed)

## GPU T4

```sh
2024-05-18, GPU T4 x2, train_n_epochs=1000, time train 24 minutes

orig
         size=1832.62
         mean_iou=6.661906575535688e-06
         mean_accuracy=4.905447543698625e-05
         overall_accuracy=1.2687577909658102e-05
fined (fine-tuned)
         size=1832.62
         mean_iou=0.8767435186414186
         mean_accuracy=0.9333408857632106
         overall_accuracy=0.9786753534283421
fined_half (fine-tuned and weights halfed)
         size=916.31
         mean_iou=0.8763746372690113
         mean_accuracy=0.9341201476478558
         overall_accuracy=0.978795885418484
---------------------
orig
                   IoU       Acc
wall         0.000000  0.000000P
floor        0.000047  0.000049
tree         0.000000  0.000000
ceiling      0.000000  0.000000
person       0.000000  0.000000
plant        0.000000  0.000000
seat         0.000000  0.000000
fence        0.000000  0.000000
column       0.000000  0.000000
signboard    0.000366  0.000736
streetlight  0.000000  0.000000
escalator    0.000000  0.000000
fountain     0.000000  0.000000
pot          0.000000  0.000000
ashcan       0.000000  0.000000
flag         0.000000  0.000000
---------------------
fined
                  IoU       Acc
wall         0.964517  0.987972
floor        0.922030  0.941426
tree         0.876874  0.917932
ceiling      0.990845  0.995715
person       0.642100  0.898230
plant        0.944452  0.977216
seat         0.893468  0.959987
fence        0.582727  0.643574
column       0.892548  0.929626
signboard    0.898165  0.918322
streetlight  0.988662  0.995434
escalator    0.945328  0.955779
fountain     0.964822  0.984560
pot          0.814856  0.929204
ashcan       0.783099  0.948805
flag         0.923404  0.949672
---------------------
fined_half
                  IoU       Acc
wall         0.962633  0.990550
floor        0.923439  0.942186
tree         0.873446  0.903782
ceiling      0.991342  0.995631
person       0.647707  0.871681
plant        0.942934  0.973982
seat         0.898811  0.967202
fence        0.588037  0.700803
column       0.895929  0.929840
signboard    0.885653  0.906181
streetlight  0.997722  1.000000
escalator    0.943396  0.954774
fountain     0.960984  0.985589
pot          0.799145  0.945638
ashcan       0.793785  0.959044
flag         0.917031  0.919037
```

## P100

```sh
2024-05-20, P100, 1.40s/it, train_n_epochs=1000, time train 24 minutes

orig
	size=1832.62
	mean_iou=0.00012747152834123089
	mean_accuracy=0.015043250957378799
	overall_accuracy=0.0017223387012360873
fined
	size=1832.62
	mean_iou=0.8633531645402123
	mean_accuracy=0.9080789058286678
	overall_accuracy=0.975750866720166
fined_half
	size=916.31
	mean_iou=0.7668116746879406
	mean_accuracy=0.8328274292451897
	overall_accuracy=0.962108548572806
---------------------
orig
                  IoU       Acc
wall         0.001655  0.001681
floor        0.005059  0.005075
tree         0.000000  0.000000
ceiling      0.000000  0.000000
person       0.000000  0.000000
plant        0.000000  0.000000
seat         0.000000  0.000000
fence        0.001444  0.233936
column       0.000000  0.000000
signboard    0.000000  0.000000
streetlight  0.000000  0.000000
escalator    0.000000  0.000000
fountain     0.000000  0.000000
pot          0.000000  0.000000
ashcan       0.000000  0.000000
flag         0.000000  0.000000
---------------------
fined
                  IoU       Acc
wall         0.957004  0.982243
floor        0.920770  0.972491
tree         0.849617  0.883715
ceiling      0.987733  0.989995
person       0.613441  0.741150
plant        0.932384  0.952668
seat         0.869103  0.912430
fence        0.594569  0.637550
column       0.867747  0.957961
signboard    0.893319  0.915011
streetlight  0.970320  0.970320
escalator    0.963257  0.974874
fountain     0.955383  0.980829
pot          0.789116  0.879899
ashcan       0.834835  0.948805
flag         0.815054  0.829322
---------------------
fined_half
                  IoU       Acc
wall         0.927242  0.969644
floor        0.884865  0.929167
tree         0.800613  0.872910
ceiling      0.982292  0.984718
person       0.535153  0.836947
plant        0.896391  0.934735
seat         0.814371  0.892096
fence        0.379102  0.440763
column       0.813051  0.950291
signboard    0.766822  0.846946
streetlight  0.855530  0.865297
escalator    0.882820  0.893467
fountain     0.932883  0.960371
pot          0.649888  0.734513
ashcan       0.543210  0.600683
flag         0.604752  0.612691
```

## Encountered problems

### Imports while on GPU

```sh
E external/local_xla/xla/stream_executor/cuda/cuda_dnn.cc:9261] Unable to register cuDNN factory: Attempting to register factory for plugin cuDNN when one has already been registered
E external/local_xla/xla/stream_executor/cuda/cuda_fft.cc:607] Unable to register cuFFT factory: Attempting to register factory for plugin cuFFT when one has already been registered
E external/local_xla/xla/stream_executor/cuda/cuda_blas.cc:1515] Unable to register cuBLAS factory: Attempting to register factory for plugin cuBLAS when one has already been registered
```

### Warning `SegformerImageProcessor(do_reduce_labels)`

`/opt/conda/lib/python3.10/site-packages/transformers/models/segformer/image_processing_segformer.py:103: FutureWarning: The `reduce_labels` parameter is deprecated and will be removed in a future version. Please use `do_reduce_labels` instead.`

### Warning `TSegformerForSemanticSegmentation.from_pretrained()`

```sh
Some weights of SegformerForSemanticSegmentation were not initialized from the model checkpoint at nvidia/mit-b0 and are newly initialized: ['decode_head.batch_norm.bias', 'decode_head.batch_norm.num_batches_tracked', 'decode_head.batch_norm.running_mean', 'decode_head.batch_norm.running_var', 'decode_head.batch_norm.weight', 'decode_head.classifier.bias', 'decode_head.classifier.weight', 'decode_head.linear_c.0.proj.bias', 'decode_head.linear_c.0.proj.weight', 'decode_head.linear_c.1.proj.bias', 'decode_head.linear_c.1.proj.weight', 'decode_head.linear_c.2.proj.bias', 'decode_head.linear_c.2.proj.weight', 'decode_head.linear_c.3.proj.bias', 'decode_head.linear_c.3.proj.weight', 'decode_head.linear_fuse.weight']
You should probably TRAIN this model on a down-stream task to be able to use it for predictions and inference.
```

### Warning `model_fined_half(pixel_values=pixel_values)`

`RuntimeError: Input type (float) and bias type (c10::Half) should be the same`

Solution: `model_fined_half(pixel_values=pixel_values.half())`

### Warning `metric`

```sh
/opt/conda/lib/python3.10/site-packages/datasets/features/image.py:341: UserWarning: Downcasting array dtype int64 to int32 to be compatible with 'Pillow'
  warnings.warn(f"Downcasting array dtype {dtype} to {dest_dtype} to be compatible with 'Pillow'")
/root/.cache/huggingface/modules/evaluate_modaules/metrics/evaluate-metric--mean_iou/9e450724f21f05592bfb0255fe2fa576df8171fa060d11121d8aecfff0db80d0/mean_iou.py:259: RuntimeWarning: invalid value encountered in divide
  iou = total_area_intersect / total_area_union
/root/.cache/huggingface/modules/evaluate_modules/metrics/evaluate-metric--mean_iou/9e450724f21f05592bfb0255fe2fa576df8171fa060d11121d8aecfff0db80d0/mean_iou.py:260: RuntimeWarning: invalid value encountered in divide
  acc = total_area_intersect / total_area_label
```
