declare type Await<T> = T extends PromiseLike<infer U> ? U : T;
declare type ReturnTypeAlias<Function extends (...args: any) => any> = Await<ReturnType<Function>>;
declare type Action = {
    value: () => void | Promise<void>;
    list?: Array<Action>;
};
declare type CustomStartConfig<Value> = Record<string, (value: Value) => any>;
declare type CustomFunction<Value, Config extends CustomStartConfig<Value>, ParamValue = any> = (paramValue: ParamValue, piecePipe: PiecePipeCore<Value, Config>, update: (val: Partial<Value>) => Promise<void> | void) => any;
declare type PipeEnd<Value> = {
    pipeEnd: () => Promise<Value>;
};
declare type PipeConfigFunction<Value, Config extends CustomStartConfig<Value>, ParamValue> = {
    pipe: PipeFunction<Value, Config, ParamValue>;
};
declare type PipeFunction<Value, Config extends CustomStartConfig<Value>, ParamValue> = <C extends CustomFunction<Value, Config, ParamValue>>(custom: C) => PipeConfigFunction<Value, Config, ReturnTypeAlias<C>> & PipeEnd<Value> & CustomStartConfigFunctions<Value, Config>;
declare type CustomStartConfigFunctions<Value, Config extends CustomStartConfig<Value>> = {
    [key in keyof Config]: <C extends CustomFunction<Value, Config, ReturnTypeAlias<Config[key]>>>(custom: C) => PipeConfigFunction<Value, Config, ReturnTypeAlias<C>> & CustomStartConfigFunctions<Value, Config> & PipeEnd<Value>;
};
declare type PipeCoreConfig<Value, Config extends CustomStartConfig<Value>> = CustomStartConfigFunctions<Value, Config> & PipeEnd<Value>;
declare type OtherPipeConfigFunction<Value, Config extends CustomStartConfig<Value>, ParamValue> = {
    pipe: OtherPipeFunction<Value, Config, ParamValue>;
};
declare type OtherPipeFunction<Value, Config extends CustomStartConfig<Value>, ParamValue> = <C extends CustomFunction<Value, Config, ParamValue>>(custom: C) => OtherPipeConfigFunction<Value, Config, ReturnTypeAlias<C>> & OtherCustomStartConfigFunctions<Value, Config>;
declare type OtherCustomStartConfigFunctions<Value, Config extends CustomStartConfig<Value>> = {
    [key in keyof Config]: <C extends CustomFunction<Value, Config, ReturnTypeAlias<Config[key]>>>(custom: C) => OtherPipeConfigFunction<Value, Config, ReturnTypeAlias<C>> & OtherCustomStartConfigFunctions<Value, Config>;
};
declare type OtherPipeCoreConfig<Value, Config extends CustomStartConfig<Value>> = OtherCustomStartConfigFunctions<Value, Config>;
declare type PiecePipeCore<Value, Config extends CustomStartConfig<Value>> = OtherPipeCoreConfig<Value, Config>;
declare type PipeCore<Value, Config extends CustomStartConfig<Value>> = PipeCoreConfig<Value, Config>;

declare function createPipeCore<Value extends object, CustomStart extends CustomStartConfig<Value>>(value: Value, config?: CustomStart): PipeCore<Value, CustomStart>;

export { Action, CustomFunction, CustomStartConfig, CustomStartConfigFunctions, OtherCustomStartConfigFunctions, OtherPipeConfigFunction, OtherPipeCoreConfig, OtherPipeFunction, PiecePipeCore, PipeConfigFunction, PipeCore, PipeCoreConfig, PipeEnd, PipeFunction, ReturnTypeAlias, createPipeCore };
