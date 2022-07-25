---
layout: post
title:  Python decorator function
excerpt: 
categories: [python, decorator, function]
---

# Python decorator function

## Basics

Functions are treated as objects and can be used as arguments for other functions.  
Function `f2` gets `f1` as an argument and calls it.

```python
def f1() -> None:
    print('inside f1: foobar runs')

def f2(f: object) -> None:
    print('inside f2: f1 gets called')
    print(f'which is object {str(f)} of type {type(f)}')
    f()

f2(f1)
```

Output

```
inside f2: f1 gets called
which is object <function f1 at 0x000001AA553B7C10> of type <class 'function'>
inside f1: foobar runs
```

## Wrapper function

Function `outer` gets called with function `f` as an argument.  
If bool argument `deco` is provided, then `f` will be evaluated and not returned.
Function `f_arg`  called inside `inner` either way. 

```python
from typing import Union
def outer(f_arg: object, deco: bool = None) -> Union[object,None]:

    def inner():
        print(f'inner: start')
        f_arg() # gets called either way
        print(f'inner: end')

    return inner if deco else inner()

def f():
    print('This is f')

outer(f, False)
outer(f, True)() # decoration
```

Output with `deco` not true calls inner ad hoc.

```
inner: start
This is f
inner: end
```

Output with `deco` equal `True` returns `inner` as an object witch gets called by trailing `()`.

```
inner: start
This is f
inner: end
```

## Decorater Annotation

The decorator annotation `@outer` replaces the notation `outer(f, True)()`. 

```python
def outer_deco(f_arg: object) -> object:

    def inner(*args):
        f_arg(*args)

    return inner

@outer_deco
def f(*args):
    out = str(args[0]) if args else 'no *args given'
    print(f'This is f called by decorator annotation and saying "{out}"')

f()
f('Hello World!')
```

Output.

```
>>> f()
This is f called by decorator annotation and saying "no *args given"
>>> f('Hello World!')
This is f called by decorator annotation and saying "Hello World!"
```



