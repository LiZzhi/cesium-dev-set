export type voidFuncType = (...payload: any[]) => void;

export type returnFunc<T> = (...payload: any[]) => T;

export type selectOptionType = {
    label: string;
    [propName: string]: any;
}
