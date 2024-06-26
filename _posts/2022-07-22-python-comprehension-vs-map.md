---
layout: post
title:  Python Comprehension vs map()
excerpt: The comprehension techiques for the data types `list`, `dict` and `set` append values to new data objects. They can be used to replace loops with `for` and functions like `map` and `filter`.  
categories: [python, comprehension, map function]
---

# Python Comprehension vs map()

The comprehension techiques for the data types `list`, `dict` and `set` append values to new data objects. They can be used to replace loops with `for` and functions like `map` and `filter`.  
The following examples showcase the usage of comprehension versus `map()` with the tokenization of a dataset for a Hugging Face pre-trained model.

## Basics with lists

```python
# loop
l = []
for n in data:
    l.append(n**2)
print(l)

# comprehension
[n**2 for n in data]
```

```
>>> # loop
>>> print(l)
[1, 4, 9, 16, 25]
>>> # comprehension
>>> [n**2 for n in data]
[1, 4, 9, 16, 25]
```

The built-in function `map(function, iterable, ...)` applies the function to every item of iterable. The returned iterator yields the results. See [map()](https://docs.python.org/3/library/functions.html#map).

```python
# map
# passed to higher-function with IIFE
# i.e. immediately invoked function execution
# e.g. (lambda n: n**2)(3) # 9
list(map(lambda n: n**2, data))
```

```
>>> list(map(lambda n: n**2, data))
[1, 4, 9, 16, 25]
```

# Generated bytecode

The following snippets use the [module `dis`](https://docs.python.org/3/library/dis.html) to disassemble the CPython bytecode used by interpreter and compiler.  
The input object can be 'a module, a class, a method, a function, a generator, an asynchronous generator, a coroutine, a code object, a string of source code or a byte sequence of raw bytecode'. See [dis.dis()](https://docs.python.org/3/library/dis.html#dis.dis).

```python
from dis import dis, show_code
```

```python
# comprehension
dis(n**2 for n in data)
show_code(n**2 for n in data)
```

<div>&nbsp;</div>
<details>
<summary>Expand for Output</summary>
<p><pre>
&gt;&gt;&gt; dis(n**2 for n in data)
  1           0 LOAD_FAST                0 (.0)
        &gt;&gt;    2 FOR_ITER                14 (to 18)
              4 STORE_FAST               1 (n)
              6 LOAD_FAST                1 (n)
              8 LOAD_CONST               0 (2)
             10 BINARY_POWER
             12 YIELD_VALUE
             14 POP_TOP
             16 JUMP_ABSOLUTE            2
        &gt;&gt;   18 LOAD_CONST               1 (None)
             20 RETURN_VALUE
&gt;&gt;&gt; show_code(n**2 for n in data)
Name:              <genexpr>
Filename:          <stdin>
Argument count:    1
Positional-only arguments: 0
Kw-only arguments: 0
Number of locals:  2
Stack size:        3
Flags:             OPTIMIZED, NEWLOCALS, GENERATOR, NOFREE
Constants:
   0: 2
   1: None
Variable names:
   0: .0
   1: n
</pre></p>
</details>
<div>&nbsp;</div>

```python
# lambda
lfun = lambda n: n**2
dis(lfun)
show_code(lfun)
```

<div>&nbsp;</div>
<details>
<summary>Expand for Output</summary>
<p><pre>
&gt;&gt;&gt; lfun = lambda n: n**2
&gt;&gt;&gt; dis(lfun)
  1           0 LOAD_FAST                0 (n)
              2 LOAD_CONST               1 (2)
              4 BINARY_POWER
              6 RETURN_VALUE
&gt;&gt;&gt; show_code(lfun)
Name:              <lambda>
Filename:          <stdin>
Argument count:    1
Positional-only arguments: 0
Kw-only arguments: 0
Number of locals:  1
Stack size:        2
Flags:             OPTIMIZED, NEWLOCALS, NOFREE
Constants:
   0: None
   1: 2
Variable names:
   0: n
</pre></p>
</details>
<div>&nbsp;</div>

## Multiple inputs

```python
#TODO
```

```python
#TODO
```