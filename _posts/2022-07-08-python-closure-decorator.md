---
layout: post
title:  Python Closures and Decorators
excerpt: Functions are treated as objects and can be used as arguments or return values for other higher functions. This paradigm is called first-class functions. A built-in example in python would be map() which takes a function as an argument.
categories: [python, decorators, closures, functions]
---

# Python Closures and Decorators

## Basics

Functions are treated as objects and can be used as arguments or return values for other higher functions. This paradigm is called first-class functions. A built-in example in python would be map() which takes a function as an argument.  
In the following example the higher function `f2` gets `f1` as an argument and executes it.

```python
def f1() -> None:
    print('inside f1: foobar runs')

def f2(f: object) -> None:
    print('inside f2: f1 gets executed')
    print(f'which is object {str(f)} of type {type(f)}')
    f()

f2(f1)
```

```
inside f2: f1 gets executed
which is object <function f1 at 0x000001AA553B7C10> of type <class 'function'>
inside f1: foobar runs
```

## Closures

Closures store the function and its environment for later usage.  
Meaning free variables, i.e. non-local variables, are referenced even if the function is called outside of the closures scopes.

```python
def outer(f_arg: object) -> object:

    # free variable
    msg_outer = 'This is \'msg_outer\', a free variable used by inner'

    def inner(msg_inner: str = None) -> None:
        print(f'inner: start')
        print(msg_outer)
        f_arg(msg_inner) # gets called either way
        print(f'inner: end')

    return inner

def f(msg: str = None) -> None:
    print(f'This is \'f\' passed as an argument with args[0] equal \'{msg}\'')

closure = outer(f)
closure
closure()
closure("hello world")
```

<details>
<summary>Expand for Output</summary>
<p><pre>
&gt;&gt;&gt; closure
&lt;function outer.&lt;locals&gt;.inner at 0x000002344DAF6B80&gt;
&gt;&gt;&gt; closure()
This is 'msg_outer', a free variable used by inner
This is f passed as an argument with args[0] equal 'None'
inner: end
&gt;&gt;&gt; closure("hello world")
inner: start
This is 'msg_outer', a free variable used by inner
This is 'f' passed as an argument with args[0] equal 'hello world'
inner: end
</pre></p>
</details>
<div>&nbsp;</div>

## Wrapper function

The decorating function `outer` gets called with the decorated function `f` as an argument. The decorating `outer` adds functionality to `f`.  
In the following case printing some messages like the (from the point of view of `f`) free variable `msg_outer`. If bool argument `deco` is provided, then `f` will be evaluated and not returned. Function `f_arg` gets called inside `inner` either way.

```python
from typing import Union
def outer(f_arg: object, deco: bool = None) -> Union[object,None]:

    # free variable
    msg_outer = 'This is \'msg_outer\', a free variable used by inner'

    def inner():
        print(f'inner: start')
        print(msg_outer)
        f_arg() # gets called either way
        print(f'inner: end')

    return inner if deco else inner()

def f():
    print('This is f passed as an argument')

closure_1 = outer(f, False)
closure_2 = outer(f, True)() # () as a decoration
closure_1
closure_2
```

Output with `deco` not true calls inner ad hoc.

```
inner: start
This 'msg_outer', a free variable used by inner
This is f passed as an argument
inner: end
```

Output with `deco` equal `True` returns `inner` as an object witch gets called by trailing `()`.

```
inner: start
This is f
inner: end
```

## Decorater Annotation

The decorator annotation `@outer` replaces the notation `outer(f, True)`.  
`*args` and `**kwargs` can be provided.

```python
from typing import Any
def outer_deco(f_arg: object) -> object:

    def inner(*args: Any) -> None:
        f_arg(*args)
    
    return inner

@outer_deco
def f(*args):
    out = str(args[0]) if args else 'no *args given'
    print(f'This is decorated f called by decorator annotation saying \'{out}\'')

f()
f('Hello World!')
```

```
>>> f()
This is decorated f called by decorator annotation saying 'no *args given'
>>> f('Hello World!')
This is decorated f called by decorator annotation saying 'Hello World!'
```

## Decorator with return values

```python
def outer_deco(f_arg: object) -> object:

    def inner() -> str:
        ret = f_arg()
        print(f'inner WILL return: {ret}')
        return ret
    
    return inner # does not get executed

@outer_deco
def f():
    return 'This is decorated \'f\''

ret = f() # gets executed
print(f'inner DID return: {ret}')
```

```
>>> ret = f()
inner WILL return: This is decorated 'f'
>>> print(f'inner DID return: {ret}')
inner DID return: This is decorated 'f'
```