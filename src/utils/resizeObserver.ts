const debounce = (fn:ResizeObserverCallback, delay: number) => {
    let timer: NodeJS.Timeout|undefined = undefined;
    return function (entries: ResizeObserverEntry[], observer: ResizeObserver) {
        let context = self;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, [entries, observer]);
        }, delay);
    };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
        callback = debounce(callback, 16);
        super(callback);
    }
};
