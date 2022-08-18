/* eslint-disable no-use-before-define */
type Await<T> = T extends PromiseLike<infer U> ? U : T;
type ExtendFunction = (...args: any) => any;

// 方法返回值的简写方法
export type ReturnTypeAlias<Function extends (...args: any) => any> = Await<ReturnType<Function>>;

// valueFactory的action
export type Action = {
  value: () => void | Promise<void>;
  list?: Array<Action>;
};

// 传参的config方法类型，不是运行中的config方法类型
export type CustomStartConfig<Value> = Record<string, (value: Value) => any>;

export type CustomFunction<Value, Config extends CustomStartConfig<Value>, ParamValue = any> = (
  paramValue: ParamValue,
  piecePipe: PiecePipeCore<Value, Config>,
  update: (val: Partial<Value>) => Promise<void> | void
) => any;

export type PipeEnd<Value> = {
  pipeEnd: () => Promise<Value>;
};

// pipe config
export type PipeConfigFunction<Value, Config extends CustomStartConfig<Value>, ParamValue> = {
  pipe: PipeFunction<Value, Config, ParamValue>;
};

// 运行中的pipe方法
export type PipeFunction<Value, Config extends CustomStartConfig<Value>, ParamValue> = <C extends CustomFunction<Value, Config, ParamValue>>(
  custom: C,
) => PipeConfigFunction<Value, Config, ReturnTypeAlias<C>> & PipeEnd<Value> & CustomStartConfigFunctions<Value, Config>;

// 运行中的Config方法的类型
export type CustomStartConfigFunctions<Value, Config extends CustomStartConfig<Value>> = {
  [key in keyof Config]: <C extends CustomFunction<Value, Config, ReturnTypeAlias<Config[key]>>>(
    custom: C,
  ) => PipeConfigFunction<Value, Config, ReturnTypeAlias<C>> & CustomStartConfigFunctions<Value, Config> & PipeEnd<Value>;
};

// 主流程的PipeCore调用方法
export type PipeCoreConfig<Value, Config extends CustomStartConfig<Value>> =
  CustomStartConfigFunctions<Value, Config> & PipeEnd<Value>;

// pipe config
export type OtherPipeConfigFunction<Value, Config extends CustomStartConfig<Value>, ParamValue> = {
  pipe: OtherPipeFunction<Value, Config, ParamValue>;
};

// 子流程的运行中的pipe方法
export type OtherPipeFunction<Value, Config extends CustomStartConfig<Value>, ParamValue> = <C extends CustomFunction<Value, Config, ParamValue>>(
  custom: C,
) => OtherPipeConfigFunction<Value, Config, ReturnTypeAlias<C>> & OtherCustomStartConfigFunctions<Value, Config>;

// 子流程的运行中的Config方法的类型
export type OtherCustomStartConfigFunctions<Value, Config extends CustomStartConfig<Value>> = {
  [key in keyof Config]: <C extends CustomFunction<Value, Config, ReturnTypeAlias<Config[key]>>>(
    custom: C,
  ) => OtherPipeConfigFunction<Value, Config, ReturnTypeAlias<C>> & OtherCustomStartConfigFunctions<Value, Config>;
};

// 子流程的PipeCore调用方法
export type OtherPipeCoreConfig<Value, Config extends CustomStartConfig<Value>> =
  OtherCustomStartConfigFunctions<Value, Config>;

export type PiecePipeCore<Value, Config extends CustomStartConfig<Value>> = OtherPipeCoreConfig<Value, Config>;

export type PipeCore<Value, Config extends CustomStartConfig<Value>> = PipeCoreConfig<Value, Config>;
