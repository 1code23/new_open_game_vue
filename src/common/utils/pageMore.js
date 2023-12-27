function throttle(fn, delay) {
    let valid = true
    return function () {
        if (!valid) {
            return false
        }
        valid = false
        setTimeout(() => {
            fn()
            valid = true;
        }, delay)
    }
}
class PageMore {
    constructor(options) {
        this.options = Object.assign({
            distance: 0,
            disabled: false
        }, options)
        this._init();
    }
    _init() {
        this.flag = false;
        this.callBack = this.options.callBack || null;
        this.dom = typeof this.options.dom == 'string' ? document.querySelector(this.options.dom) : this.options.dom;
        if (!this.callBack) return console.error("回调函数未传入");
        this._bindEvent();
    }
    _bindEvent() {
        this.dom.addEventListener('scroll', throttle(this.scrollFn.bind(this), 200), false);
    }
    scrollFn() {
        let _this = this.dom;
        if (_this.scrollTop + _this.clientHeight + this.options.distance + 5 >= _this.scrollHeight && !this.flag) {
            this.callBack();
        }
    }
    setOpenDisabled() {
        this.flag = false;
    }
    setCloseDisabled() {
        this.flag = true;
    }
}

export default PageMore;