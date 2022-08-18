# @pipex/core

[![tag](https://img.shields.io/github/tag/lengfangbing/pipex-core.svg)](https://github.com/lengfangbing/pipex-core)
[![license](https://img.shields.io/github/license/lengfangbing/pipex-core.svg)](https://github.com/lengfangbing/pipex-core)
[![npm version](https://img.shields.io/npm/v/@pipex/core.svg?style=flat)](https://www.npmjs.com/package/@pipex/core)
[![Build Status](https://app.travis-ci.com/lengfangbing/pipex-core.svg?branch=main)](https://app.travis-ci.com/lengfangbing/pipex-core)
[![Coverage Status](https://coveralls.io/repos/github/lengfangbing/pipex-core/badge.svg?branch=main)](https://coveralls.io/github/lengfangbing/pipex-core?branch=main)

## What is @pipex/core?

> process data like a pipeline

## Design

![](https://s3.bmp.ovh/imgs/2022/07/22/db46802a6b79d896.png)

## Usage

```typescript
const value = {
    name: '@pipex/core',
    loading: false
};
const customStart = {
    getName(value) {
	return `custom returned ${value.name}`;
    },
    getLoading(value) {
	return value.loading;
    },
    getValue(value) {
	return value;
    }
}
```

> simple example

```typescript
const pipeCore = createPipeCore(value, customStart);
await pipeCore
    .getName(name => {
         // name === 'custom returned @pipex/core'
         return '123';
     })
     .pipe<string>(name => {
         // name === '123'
     })
     .getName(name => {
	 // name === 'custom returned @pipex/core'
      })
     .pipeEnd();
```

> use piecePipe

```typescript
const pipeCore = createPipeCore(value, customStart);
await pipeCore
    .getName((name, piecePipe) => {
        // name === 'custom returned @pipex/core'
        piecePipe
	   .getLoading((loading, _, set) => {
		// loading === false
		// update loading value to true
	        set({ loading: true });
	    })
       return '123';
    })
    .pipe<string>((name, piecePipe) => {
        // name === '123'
        piecePipe
	    .getLoading((loading, _, set) => {
		// loading === true
	    })
     })
     .pipeEnd();
```

> use instance()

```typescript
const pipeCore = createPipeCore(value, customStart);
const testInstance = async () => {
    await pipeCore
        .instance()
	.getValue(async (_, __, set) => {
	    // update loading to true
	    set({ loading: true });
	    await testNewInstance();
	})
	.pipeEnd();
}
const testNewInstance = async () => {
    await pipeCore
      .instance(true)
      .getValue((_, __, set) => {
        // update name
        set({ name: 'instance @pipex/core' });
      })
      .pipeEnd();
};
await pipeCore
    .getName((name, piecePipe) => {
        // name === 'custom returned @pipex/core'
	piecePipe
	    .getLoading(async (loading, _piecePipe, set) => {
		// loading === false
		// update loading value to true
		await testInstance();
		_piecePipe
		    .getName(_name => {
                       // name === 'custom returned @pipex/core'，instance(true) not reference value to source PipeCore
                    })
		    .getLoading(loading => {
		        // loading === true
			// instance always called before _piecePipe, so loading is true
		    })
	    })
     })
     .pipeEnd();
```


## API

createPipeCore(value: Record<string, string>, config: Record<string, (value: Value) => any>): PipeCore

> `createPipeCore` will create one PipeCore. `value` means the origin Record value source. `config` means the pipeline start function.

instance(createOneFreshValue?: boolean): PipeCore

> `instance` will create one new pipeline to call. `createOneFreshValue` means need create one independent PipeCore.

piecePipe: PiecePipeCore

> `piecePipe` means if you do sth in line A, you could use `piecePipe` to do sth in other line includes line A

pipeEnd(): void;

> `pipeEnd` means call all functions, only called in PipeCore, not in PiecePipeCore

## Annotation

* Both `instance()` and `piecePipe` could do sth in other line, the `instance()` would call before `piecePipe` in every `PipeCore` function.

## TODO

* `support for React state`

