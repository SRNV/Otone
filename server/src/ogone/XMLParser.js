const __default = ()=>({
        blocks: {
        },
        parentheses: {
        },
        setters: {
        },
        imports: {
        },
        exports: {
        },
        require: [],
        use: {
        },
        properties: [],
        data: {
        },
        switch: {
            before: {
                each: null,
                cases: {
                }
            },
            cases: [],
            default: false
        },
        reflections: [],
        protocol: ""
    })
;
let i = 0;
const __default1 = function* gen() {
    while(true){
        let base = 0;
        crypto.getRandomValues(new Uint8Array(10)).forEach((__int)=>{
            base += +__int;
        });
        const res = Math.floor(Math.random() * 200000 + base);
        yield i += +res;
    }
}();
const tokens = [
    {
        name: "block",
        open: "[",
        reg: /\[([^\[\]])+\]/,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `${__default1.next().value}_array`;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: "]"
    },
    {
        name: "parentheses",
        open: "(",
        reg: /\(([^\(\)])*\)/,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `${__default1.next().value}_parenthese`;
            if (expressions) expressions[id] = value;
            if (typedExpressions && typedExpressions.parentheses) typedExpressions.parentheses[id] = value;
            return id;
        },
        close: ")"
    },
    {
        name: "block",
        open: "{",
        reg: /\{([^\{\}])*\}/,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `${__default1.next().value}_block`;
            if (expressions) expressions[id] = value;
            if (typedExpressions && typedExpressions.blocks) typedExpressions.blocks[id] = value;
            return id;
        },
        close: "}"
    }, 
];
const nullish = [
    {
        open: false,
        reg: /(?<!\\)\$\{(.*?)(?<!\\)\}/i,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `§§template${__default1.next().value}§§`;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: false
    },
    {
        open: false,
        reg: /(?<!\\)(["'`])(.*?)(?<!\\)\1/i,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `${__default1.next().value}_string`;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: false
    },
    {
        name: 'comment',
        split: [
            "/*",
            "*/"
        ],
        splittedId: (value, expressions)=>{
            const id = `§§comment0§§`;
            if (expressions) expressions[id] = value;
            return "";
        }
    },
    {
        name: 'comment',
        open: "//",
        reg: /(?<!\:)\/\/([^\n])+\n/,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `§§commentLine${__default1.next().value}§§`;
            if (expressions) expressions[id] = value;
            return "";
        },
        close: "/"
    },
    {
        open: false,
        reg: /(:?\s)(\/)(.+?)(?<!\\)(\/)(\w+){0,1}/i,
        id: (value, matches, typedExpressions, expressions)=>{
            const id = `§§regexp${__default1.next().value}§§`;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: false
    }, 
];
function getDeepTranslation1(str = "", template, callback) {
    let result = str;
    if (!template) return result;
    while(Object.keys(template).find((key)=>result.indexOf(key) > -1
    )){
        const key = Object.keys(template).find((key1)=>result.indexOf(key1) > -1
        );
        if (key) {
            const index = result.indexOf(key);
            const firstPart = result.substring(0, index);
            const secondPart = result.substring(index + key.length, result.length);
            result = `${firstPart}${callback ? callback(key) : template[key]}${secondPart}`;
        }
    }
    return result;
}
function existsSync(filePath) {
    try {
        Deno.lstatSync(filePath);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
function concat(origin, b) {
    const output = new Uint8Array(origin.length + b.length);
    output.set(origin, 0);
    output.set(b, origin.length);
    return output;
}
function copyBytes(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
class DenoStdInternalError extends Error {
    constructor(message2){
        super(message2);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const DEFAULT_BUF_SIZE = 4096;
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    name = "BufferFullError";
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
    }
}
class PartialReadError extends Deno.errors.UnexpectedEof {
    name = "PartialReadError";
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    r = 0;
    w = 0;
    eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd1, size1 = 4096){
        if (size1 < 16) {
            size1 = MIN_BUF_SIZE;
        }
        this._reset(new Uint8Array(size1), rd1);
    }
    size() {
        return this.buf.byteLength;
    }
    buffered() {
        return this.w - this.r;
    }
    async _fill() {
        if (this.r > 0) {
            this.buf.copyWithin(0, this.r, this.w);
            this.w -= this.r;
            this.r = 0;
        }
        if (this.w >= this.buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i1 = 100; i1 > 0; i1--){
            const rr = await this.rd.read(this.buf.subarray(this.w));
            if (rr === null) {
                this.eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    }
    reset(r) {
        this._reset(this.buf, r);
    }
    _reset(buf, rd) {
        this.buf = buf;
        this.rd = rd;
        this.eof = false;
    }
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.r === this.w) {
            if (p.byteLength >= this.buf.byteLength) {
                const rr1 = await this.rd.read(p);
                const nread = rr1 ?? 0;
                assert(nread >= 0, "negative read");
                return rr1;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copyBytes(this.buf.subarray(this.r, this.w), p, 0);
        this.r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.r === this.w){
            if (this.eof) return null;
            await this._fill();
        }
        const c = this.buf[this.r];
        this.r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            let { partial: partial1  } = err;
            assert(partial1 instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            if (!this.eof && partial1.byteLength > 0 && partial1[partial1.byteLength - 1] === CR) {
                assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial1 = partial1.subarray(0, partial1.byteLength - 1);
            }
            return {
                line: partial1,
                more: !this.eof
            };
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i1 = this.buf.subarray(this.r + s, this.w).indexOf(delim);
            if (i1 >= 0) {
                i1 += s;
                slice = this.buf.subarray(this.r, this.r + i1 + 1);
                this.r += i1 + 1;
                break;
            }
            if (this.eof) {
                if (this.r === this.w) {
                    return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
            }
            if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.w - this.r;
            try {
                await this._fill();
            } catch (err) {
                err.partial = slice;
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.w - this.r;
        while(avail < n && avail < this.buf.byteLength && !this.eof){
            try {
                await this._fill();
            } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
            }
            avail = this.w - this.r;
        }
        if (avail === 0 && this.eof) {
            return null;
        } else if (avail < n && this.eof) {
            return this.buf.subarray(this.r, this.r + avail);
        } else if (avail < n) {
            throw new BufferFullError(this.buf.subarray(this.r, this.w));
        }
        return this.buf.subarray(this.r, this.r + n);
    }
}
class AbstractBufBase {
    usedBufferBytes = 0;
    err = null;
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer1, size2 = 4096){
        super();
        this.writer = writer1;
        if (size2 <= 0) {
            size2 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size2);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await Deno.writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.writer.write(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copyBytes(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copyBytes(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer2, size3 = 4096){
        super();
        this.writer = writer2;
        if (size3 <= 0) {
            size3 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size3);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            Deno.writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copyBytes(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copyBytes(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const encoder = new TextEncoder();
function encode(input) {
    return encoder.encode(input);
}
const decoder = new TextDecoder();
function decode(input) {
    return decoder.decode(input);
}
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
function str3(buf) {
    if (buf == null) {
        return "";
    } else {
        return decode(buf);
    }
}
function charCode(s) {
    return s.charCodeAt(0);
}
class TextProtoReader {
    constructor(r1){
        this.r = r1;
    }
    async readLine() {
        const s = await this.readLineSlice();
        if (s === null) return null;
        return str3(s);
    }
    async readMIMEHeader() {
        const m = new Headers();
        let line;
        let buf = await this.r.peek(1);
        if (buf === null) {
            return null;
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            line = await this.readLineSlice();
        }
        buf = await this.r.peek(1);
        if (buf === null) {
            throw new Deno.errors.UnexpectedEof();
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            throw new Deno.errors.InvalidData(`malformed MIME header initial line: ${str3(line)}`);
        }
        while(true){
            const kv = await this.readLineSlice();
            if (kv === null) throw new Deno.errors.UnexpectedEof();
            if (kv.byteLength === 0) return m;
            let i1 = kv.indexOf(charCode(":"));
            if (i1 < 0) {
                throw new Deno.errors.InvalidData(`malformed MIME header line: ${str3(kv)}`);
            }
            const key = str3(kv.subarray(0, i1));
            if (key == "") {
                continue;
            }
            i1++;
            while(i1 < kv.byteLength && (kv[i1] == charCode(" ") || kv[i1] == charCode("\t"))){
                i1++;
            }
            const value = str3(kv.subarray(i1)).replace(invalidHeaderCharRegex, encodeURI);
            try {
                m.append(key, value);
            } catch  {
            }
        }
    }
    async readLineSlice() {
        let line;
        while(true){
            const r1 = await this.r.readLine();
            if (r1 === null) return null;
            const { line: l , more  } = r1;
            if (!line && !more) {
                if (this.skipSpace(l) === 0) {
                    return new Uint8Array(0);
                }
                return l;
            }
            line = line ? concat(line, l) : l;
            if (!more) {
                break;
            }
        }
        return line;
    }
    skipSpace(l) {
        let n = 0;
        for(let i1 = 0; i1 < l.length; i1++){
            if (l[i1] === charCode(" ") || l[i1] === charCode("\t")) {
                continue;
            }
            n++;
        }
        return n;
    }
}
var Status;
(function(Status1) {
    Status1[Status1["Continue"] = 100] = "Continue";
    Status1[Status1["SwitchingProtocols"] = 101] = "SwitchingProtocols";
    Status1[Status1["Processing"] = 102] = "Processing";
    Status1[Status1["EarlyHints"] = 103] = "EarlyHints";
    Status1[Status1["OK"] = 200] = "OK";
    Status1[Status1["Created"] = 201] = "Created";
    Status1[Status1["Accepted"] = 202] = "Accepted";
    Status1[Status1["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
    Status1[Status1["NoContent"] = 204] = "NoContent";
    Status1[Status1["ResetContent"] = 205] = "ResetContent";
    Status1[Status1["PartialContent"] = 206] = "PartialContent";
    Status1[Status1["MultiStatus"] = 207] = "MultiStatus";
    Status1[Status1["AlreadyReported"] = 208] = "AlreadyReported";
    Status1[Status1["IMUsed"] = 226] = "IMUsed";
    Status1[Status1["MultipleChoices"] = 300] = "MultipleChoices";
    Status1[Status1["MovedPermanently"] = 301] = "MovedPermanently";
    Status1[Status1["Found"] = 302] = "Found";
    Status1[Status1["SeeOther"] = 303] = "SeeOther";
    Status1[Status1["NotModified"] = 304] = "NotModified";
    Status1[Status1["UseProxy"] = 305] = "UseProxy";
    Status1[Status1["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    Status1[Status1["PermanentRedirect"] = 308] = "PermanentRedirect";
    Status1[Status1["BadRequest"] = 400] = "BadRequest";
    Status1[Status1["Unauthorized"] = 401] = "Unauthorized";
    Status1[Status1["PaymentRequired"] = 402] = "PaymentRequired";
    Status1[Status1["Forbidden"] = 403] = "Forbidden";
    Status1[Status1["NotFound"] = 404] = "NotFound";
    Status1[Status1["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    Status1[Status1["NotAcceptable"] = 406] = "NotAcceptable";
    Status1[Status1["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
    Status1[Status1["RequestTimeout"] = 408] = "RequestTimeout";
    Status1[Status1["Conflict"] = 409] = "Conflict";
    Status1[Status1["Gone"] = 410] = "Gone";
    Status1[Status1["LengthRequired"] = 411] = "LengthRequired";
    Status1[Status1["PreconditionFailed"] = 412] = "PreconditionFailed";
    Status1[Status1["RequestEntityTooLarge"] = 413] = "RequestEntityTooLarge";
    Status1[Status1["RequestURITooLong"] = 414] = "RequestURITooLong";
    Status1[Status1["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    Status1[Status1["RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
    Status1[Status1["ExpectationFailed"] = 417] = "ExpectationFailed";
    Status1[Status1["Teapot"] = 418] = "Teapot";
    Status1[Status1["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    Status1[Status1["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    Status1[Status1["Locked"] = 423] = "Locked";
    Status1[Status1["FailedDependency"] = 424] = "FailedDependency";
    Status1[Status1["TooEarly"] = 425] = "TooEarly";
    Status1[Status1["UpgradeRequired"] = 426] = "UpgradeRequired";
    Status1[Status1["PreconditionRequired"] = 428] = "PreconditionRequired";
    Status1[Status1["TooManyRequests"] = 429] = "TooManyRequests";
    Status1[Status1["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    Status1[Status1["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    Status1[Status1["InternalServerError"] = 500] = "InternalServerError";
    Status1[Status1["NotImplemented"] = 501] = "NotImplemented";
    Status1[Status1["BadGateway"] = 502] = "BadGateway";
    Status1[Status1["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    Status1[Status1["GatewayTimeout"] = 504] = "GatewayTimeout";
    Status1[Status1["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
    Status1[Status1["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    Status1[Status1["InsufficientStorage"] = 507] = "InsufficientStorage";
    Status1[Status1["LoopDetected"] = 508] = "LoopDetected";
    Status1[Status1["NotExtended"] = 510] = "NotExtended";
    Status1[Status1["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(Status || (Status = {
}));
const STATUS_TEXT = new Map([
    [
        Status.Continue,
        "Continue"
    ],
    [
        Status.SwitchingProtocols,
        "Switching Protocols"
    ],
    [
        Status.Processing,
        "Processing"
    ],
    [
        Status.EarlyHints,
        "Early Hints"
    ],
    [
        Status.OK,
        "OK"
    ],
    [
        Status.Created,
        "Created"
    ],
    [
        Status.Accepted,
        "Accepted"
    ],
    [
        Status.NonAuthoritativeInfo,
        "Non-Authoritative Information"
    ],
    [
        Status.NoContent,
        "No Content"
    ],
    [
        Status.ResetContent,
        "Reset Content"
    ],
    [
        Status.PartialContent,
        "Partial Content"
    ],
    [
        Status.MultiStatus,
        "Multi-Status"
    ],
    [
        Status.AlreadyReported,
        "Already Reported"
    ],
    [
        Status.IMUsed,
        "IM Used"
    ],
    [
        Status.MultipleChoices,
        "Multiple Choices"
    ],
    [
        Status.MovedPermanently,
        "Moved Permanently"
    ],
    [
        Status.Found,
        "Found"
    ],
    [
        Status.SeeOther,
        "See Other"
    ],
    [
        Status.NotModified,
        "Not Modified"
    ],
    [
        Status.UseProxy,
        "Use Proxy"
    ],
    [
        Status.TemporaryRedirect,
        "Temporary Redirect"
    ],
    [
        Status.PermanentRedirect,
        "Permanent Redirect"
    ],
    [
        Status.BadRequest,
        "Bad Request"
    ],
    [
        Status.Unauthorized,
        "Unauthorized"
    ],
    [
        Status.PaymentRequired,
        "Payment Required"
    ],
    [
        Status.Forbidden,
        "Forbidden"
    ],
    [
        Status.NotFound,
        "Not Found"
    ],
    [
        Status.MethodNotAllowed,
        "Method Not Allowed"
    ],
    [
        Status.NotAcceptable,
        "Not Acceptable"
    ],
    [
        Status.ProxyAuthRequired,
        "Proxy Authentication Required"
    ],
    [
        Status.RequestTimeout,
        "Request Timeout"
    ],
    [
        Status.Conflict,
        "Conflict"
    ],
    [
        Status.Gone,
        "Gone"
    ],
    [
        Status.LengthRequired,
        "Length Required"
    ],
    [
        Status.PreconditionFailed,
        "Precondition Failed"
    ],
    [
        Status.RequestEntityTooLarge,
        "Request Entity Too Large"
    ],
    [
        Status.RequestURITooLong,
        "Request URI Too Long"
    ],
    [
        Status.UnsupportedMediaType,
        "Unsupported Media Type"
    ],
    [
        Status.RequestedRangeNotSatisfiable,
        "Requested Range Not Satisfiable"
    ],
    [
        Status.ExpectationFailed,
        "Expectation Failed"
    ],
    [
        Status.Teapot,
        "I'm a teapot"
    ],
    [
        Status.MisdirectedRequest,
        "Misdirected Request"
    ],
    [
        Status.UnprocessableEntity,
        "Unprocessable Entity"
    ],
    [
        Status.Locked,
        "Locked"
    ],
    [
        Status.FailedDependency,
        "Failed Dependency"
    ],
    [
        Status.TooEarly,
        "Too Early"
    ],
    [
        Status.UpgradeRequired,
        "Upgrade Required"
    ],
    [
        Status.PreconditionRequired,
        "Precondition Required"
    ],
    [
        Status.TooManyRequests,
        "Too Many Requests"
    ],
    [
        Status.RequestHeaderFieldsTooLarge,
        "Request Header Fields Too Large"
    ],
    [
        Status.UnavailableForLegalReasons,
        "Unavailable For Legal Reasons"
    ],
    [
        Status.InternalServerError,
        "Internal Server Error"
    ],
    [
        Status.NotImplemented,
        "Not Implemented"
    ],
    [
        Status.BadGateway,
        "Bad Gateway"
    ],
    [
        Status.ServiceUnavailable,
        "Service Unavailable"
    ],
    [
        Status.GatewayTimeout,
        "Gateway Timeout"
    ],
    [
        Status.HTTPVersionNotSupported,
        "HTTP Version Not Supported"
    ],
    [
        Status.VariantAlsoNegotiates,
        "Variant Also Negotiates"
    ],
    [
        Status.InsufficientStorage,
        "Insufficient Storage"
    ],
    [
        Status.LoopDetected,
        "Loop Detected"
    ],
    [
        Status.NotExtended,
        "Not Extended"
    ],
    [
        Status.NetworkAuthenticationRequired,
        "Network Authentication Required"
    ], 
]);
function deferred2() {
    let methods;
    const promise = new Promise((resolve, reject)=>{
        methods = {
            resolve,
            reject
        };
    });
    return Object.assign(promise, methods);
}
class MuxAsyncIterator {
    iteratorCount = 0;
    yields = [];
    throws = [];
    signal = deferred2();
    add(iterator) {
        ++this.iteratorCount;
        this.callIteratorNext(iterator);
    }
    async callIteratorNext(iterator) {
        try {
            const { value , done  } = await iterator.next();
            if (done) {
                --this.iteratorCount;
            } else {
                this.yields.push({
                    iterator,
                    value
                });
            }
        } catch (e) {
            this.throws.push(e);
        }
        this.signal.resolve();
    }
    async *iterate() {
        while(this.iteratorCount > 0){
            await this.signal;
            for(let i1 = 0; i1 < this.yields.length; i1++){
                const { iterator , value  } = this.yields[i1];
                yield value;
                this.callIteratorNext(iterator);
            }
            if (this.throws.length) {
                for (const e of this.throws){
                    throw e;
                }
                this.throws.length = 0;
            }
            this.yields.length = 0;
            this.signal = deferred2();
        }
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
function emptyReader() {
    return {
        read (_) {
            return Promise.resolve(null);
        }
    };
}
function bodyReader(contentLength, r1) {
    let totalRead = 0;
    let finished = false;
    async function read(buf) {
        if (finished) return null;
        let result;
        const remaining = contentLength - totalRead;
        if (remaining >= buf.byteLength) {
            result = await r1.read(buf);
        } else {
            const readBuf = buf.subarray(0, remaining);
            result = await r1.read(readBuf);
        }
        if (result !== null) {
            totalRead += result;
        }
        finished = totalRead === contentLength;
        return result;
    }
    return {
        read
    };
}
function chunkedBodyReader(h, r1) {
    const tp = new TextProtoReader(r1);
    let finished = false;
    const chunks = [];
    async function read(buf) {
        if (finished) return null;
        const [chunk] = chunks;
        if (chunk) {
            const chunkRemaining = chunk.data.byteLength - chunk.offset;
            const readLength = Math.min(chunkRemaining, buf.byteLength);
            for(let i1 = 0; i1 < readLength; i1++){
                buf[i1] = chunk.data[chunk.offset + i1];
            }
            chunk.offset += readLength;
            if (chunk.offset === chunk.data.byteLength) {
                chunks.shift();
                if (await tp.readLine() === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
            }
            return readLength;
        }
        const line = await tp.readLine();
        if (line === null) throw new Deno.errors.UnexpectedEof();
        const [chunkSizeString] = line.split(";");
        const chunkSize = parseInt(chunkSizeString, 16);
        if (Number.isNaN(chunkSize) || chunkSize < 0) {
            throw new Error("Invalid chunk size");
        }
        if (chunkSize > 0) {
            if (chunkSize > buf.byteLength) {
                let eof = await r1.readFull(buf);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                const restChunk = new Uint8Array(chunkSize - buf.byteLength);
                eof = await r1.readFull(restChunk);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                } else {
                    chunks.push({
                        offset: 0,
                        data: restChunk
                    });
                }
                return buf.byteLength;
            } else {
                const bufToFill = buf.subarray(0, chunkSize);
                const eof = await r1.readFull(bufToFill);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                if (await tp.readLine() === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                return chunkSize;
            }
        } else {
            assert(chunkSize === 0);
            if (await r1.readLine() === null) {
                throw new Deno.errors.UnexpectedEof();
            }
            await readTrailers1(h, r1);
            finished = true;
            return null;
        }
    }
    return {
        read
    };
}
function isProhibidedForTrailer(key) {
    const s = new Set([
        "transfer-encoding",
        "content-length",
        "trailer"
    ]);
    return s.has(key.toLowerCase());
}
async function readTrailers1(headers, r1) {
    const trailers = parseTrailer1(headers.get("trailer"));
    if (trailers == null) return;
    const trailerNames = [
        ...trailers.keys()
    ];
    const tp = new TextProtoReader(r1);
    const result = await tp.readMIMEHeader();
    if (result == null) {
        throw new Deno.errors.InvalidData("Missing trailer header.");
    }
    const undeclared = [
        ...result.keys()
    ].filter((k)=>!trailerNames.includes(k)
    );
    if (undeclared.length > 0) {
        throw new Deno.errors.InvalidData(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    for (const [k, v] of result){
        headers.append(k, v);
    }
    const missingTrailers = trailerNames.filter((k1)=>!result.has(k1)
    );
    if (missingTrailers.length > 0) {
        throw new Deno.errors.InvalidData(`Missing trailers: ${Deno.inspect(missingTrailers)}.`);
    }
    headers.delete("trailer");
}
function parseTrailer1(field) {
    if (field == null) {
        return undefined;
    }
    const trailerNames = field.split(",").map((v)=>v.trim().toLowerCase()
    );
    if (trailerNames.length === 0) {
        throw new Deno.errors.InvalidData("Empty trailer header.");
    }
    const prohibited = trailerNames.filter((k)=>isProhibidedForTrailer(k)
    );
    if (prohibited.length > 0) {
        throw new Deno.errors.InvalidData(`Prohibited trailer names: ${Deno.inspect(prohibited)}.`);
    }
    return new Headers(trailerNames.map((key)=>[
            key,
            ""
        ]
    ));
}
async function writeChunkedBody(w, r1) {
    const writer3 = BufWriter.create(w);
    for await (const chunk of Deno.iter(r1)){
        if (chunk.byteLength <= 0) continue;
        const start = encoder.encode(`${chunk.byteLength.toString(16)}\r\n`);
        const end = encoder.encode("\r\n");
        await writer3.write(start);
        await writer3.write(chunk);
        await writer3.write(end);
    }
    const endChunk = encoder.encode("0\r\n\r\n");
    await writer3.write(endChunk);
}
async function writeTrailers(w, headers, trailers) {
    const trailer = headers.get("trailer");
    if (trailer === null) {
        throw new TypeError("Missing trailer header.");
    }
    const transferEncoding = headers.get("transfer-encoding");
    if (transferEncoding === null || !transferEncoding.match(/^chunked/)) {
        throw new TypeError(`Trailers are only allowed for "transfer-encoding: chunked", got "transfer-encoding: ${transferEncoding}".`);
    }
    const writer3 = BufWriter.create(w);
    const trailerNames = trailer.split(",").map((s)=>s.trim().toLowerCase()
    );
    const prohibitedTrailers = trailerNames.filter((k)=>isProhibidedForTrailer(k)
    );
    if (prohibitedTrailers.length > 0) {
        throw new TypeError(`Prohibited trailer names: ${Deno.inspect(prohibitedTrailers)}.`);
    }
    const undeclared = [
        ...trailers.keys()
    ].filter((k)=>!trailerNames.includes(k)
    );
    if (undeclared.length > 0) {
        throw new TypeError(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    for (const [key, value] of trailers){
        await writer3.write(encoder.encode(`${key}: ${value}\r\n`));
    }
    await writer3.write(encoder.encode("\r\n"));
    await writer3.flush();
}
async function writeResponse(w, r1) {
    const protoMajor = 1;
    const protoMinor = 1;
    const statusCode = r1.status || 200;
    const statusText = STATUS_TEXT.get(statusCode);
    const writer3 = BufWriter.create(w);
    if (!statusText) {
        throw new Deno.errors.InvalidData("Bad status code");
    }
    if (!r1.body) {
        r1.body = new Uint8Array();
    }
    if (typeof r1.body === "string") {
        r1.body = encoder.encode(r1.body);
    }
    let out = `HTTP/${1}.${1} ${statusCode} ${statusText}\r\n`;
    const headers = r1.headers ?? new Headers();
    if (r1.body && !headers.get("content-length")) {
        if (r1.body instanceof Uint8Array) {
            out += `content-length: ${r1.body.byteLength}\r\n`;
        } else if (!headers.get("transfer-encoding")) {
            out += "transfer-encoding: chunked\r\n";
        }
    }
    for (const [key, value] of headers){
        out += `${key}: ${value}\r\n`;
    }
    out += `\r\n`;
    const header = encoder.encode(out);
    const n = await writer3.write(header);
    assert(n === header.byteLength);
    if (r1.body instanceof Uint8Array) {
        const n1 = await writer3.write(r1.body);
        assert(n1 === r1.body.byteLength);
    } else if (headers.has("content-length")) {
        const contentLength = headers.get("content-length");
        assert(contentLength != null);
        const bodyLength = parseInt(contentLength);
        const n1 = await Deno.copy(r1.body, writer3);
        assert(n1 === bodyLength);
    } else {
        await writeChunkedBody(writer3, r1.body);
    }
    if (r1.trailers) {
        const t = await r1.trailers();
        await writeTrailers(writer3, headers, t);
    }
    await writer3.flush();
}
class ServerRequest {
    done = deferred2();
    _contentLength = undefined;
    get contentLength() {
        if (this._contentLength === undefined) {
            const cl = this.headers.get("content-length");
            if (cl) {
                this._contentLength = parseInt(cl);
                if (Number.isNaN(this._contentLength)) {
                    this._contentLength = null;
                }
            } else {
                this._contentLength = null;
            }
        }
        return this._contentLength;
    }
    _body = null;
    get body() {
        if (!this._body) {
            if (this.contentLength != null) {
                this._body = bodyReader(this.contentLength, this.r);
            } else {
                const transferEncoding = this.headers.get("transfer-encoding");
                if (transferEncoding != null) {
                    const parts = transferEncoding.split(",").map((e)=>e.trim().toLowerCase()
                    );
                    assert(parts.includes("chunked"), 'transfer-encoding must include "chunked" if content-length is not set');
                    this._body = chunkedBodyReader(this.headers, this.r);
                } else {
                    this._body = emptyReader();
                }
            }
        }
        return this._body;
    }
    async respond(r) {
        let err;
        try {
            await writeResponse(this.w, r);
        } catch (e) {
            try {
                this.conn.close();
            } catch  {
            }
            err = e;
        }
        this.done.resolve(err);
        if (err) {
            throw err;
        }
    }
    finalized = false;
    async finalize() {
        if (this.finalized) return;
        const body = this.body;
        const buf = new Uint8Array(1024);
        while(await body.read(buf) !== null){
        }
        this.finalized = true;
    }
}
function parseHTTPVersion(vers) {
    switch(vers){
        case "HTTP/1.1":
            return [
                1,
                1
            ];
        case "HTTP/1.0":
            return [
                1,
                0
            ];
        default:
            {
                const Big = 1000000;
                if (!vers.startsWith("HTTP/")) {
                    break;
                }
                const dot = vers.indexOf(".");
                if (dot < 0) {
                    break;
                }
                const majorStr = vers.substring(vers.indexOf("/") + 1, dot);
                const major = Number(majorStr);
                if (!Number.isInteger(major) || major < 0 || major > 1000000) {
                    break;
                }
                const minorStr = vers.substring(dot + 1);
                const minor = Number(minorStr);
                if (!Number.isInteger(minor) || minor < 0 || minor > 1000000) {
                    break;
                }
                return [
                    major,
                    minor
                ];
            }
    }
    throw new Error(`malformed HTTP version ${vers}`);
}
async function readRequest(conn, bufr) {
    const tp = new TextProtoReader(bufr);
    const firstLine = await tp.readLine();
    if (firstLine === null) return null;
    const headers = await tp.readMIMEHeader();
    if (headers === null) throw new Deno.errors.UnexpectedEof();
    const req = new ServerRequest();
    req.conn = conn;
    req.r = bufr;
    [req.method, req.url, req.proto] = firstLine.split(" ", 3);
    [req.protoMinor, req.protoMajor] = parseHTTPVersion(req.proto);
    req.headers = headers;
    fixLength1(req);
    return req;
}
class Server {
    closing = false;
    connections = [];
    constructor(listener2){
        this.listener = listener2;
    }
    close() {
        this.closing = true;
        this.listener.close();
        for (const conn of this.connections){
            try {
                conn.close();
            } catch (e) {
                if (!(e instanceof Deno.errors.BadResource)) {
                    throw e;
                }
            }
        }
    }
    async *iterateHttpRequests(conn) {
        const reader = new BufReader(conn);
        const writer3 = new BufWriter(conn);
        while(!this.closing){
            let request;
            try {
                request = await readRequest(conn, reader);
            } catch (error) {
                if (error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof) {
                    await writeResponse(writer3, {
                        status: 400,
                        body: encode(`${error.message}\r\n\r\n`)
                    });
                }
                break;
            }
            if (request === null) {
                break;
            }
            request.w = writer3;
            yield request;
            const responseError = await request.done;
            if (responseError) {
                this.untrackConnection(request.conn);
                return;
            }
            await request.finalize();
        }
        this.untrackConnection(conn);
        try {
            conn.close();
        } catch (e) {
        }
    }
    trackConnection(conn) {
        this.connections.push(conn);
    }
    untrackConnection(conn) {
        const index = this.connections.indexOf(conn);
        if (index !== -1) {
            this.connections.splice(index, 1);
        }
    }
    async *acceptConnAndIterateHttpRequests(mux) {
        if (this.closing) return;
        let conn;
        try {
            conn = await this.listener.accept();
        } catch (error) {
            if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof) {
                return mux.add(this.acceptConnAndIterateHttpRequests(mux));
            }
            throw error;
        }
        this.trackConnection(conn);
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        yield* this.iterateHttpRequests(conn);
    }
    [Symbol.asyncIterator]() {
        const mux = new MuxAsyncIterator();
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        return mux.iterate();
    }
}
function fixLength1(req) {
    const contentLength = req.headers.get("Content-Length");
    if (contentLength) {
        const arrClen = contentLength.split(",");
        if (arrClen.length > 1) {
            const distinct = [
                ...new Set(arrClen.map((e)=>e.trim()
                ))
            ];
            if (distinct.length > 1) {
                throw Error("cannot contain multiple Content-Length headers");
            } else {
                req.headers.set("Content-Length", distinct[0]);
            }
        }
        const c = req.headers.get("Content-Length");
        if (req.method === "HEAD" && c && c !== "0") {
            throw Error("http: method cannot contain a Content-Length");
        }
        if (c && req.headers.has("transfer-encoding")) {
            throw new Error("http: Transfer-Encoding and Content-Length cannot be send together");
        }
    }
}
const noColor = globalThis.Deno?.noColor ?? true;
let enabled = !noColor;
function setColorEnabled(value) {
    if (noColor) {
        return;
    }
    enabled = value;
}
function getColorEnabled() {
    return enabled;
}
function code1(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str1, code1) {
    return enabled ? `${code1.open}${str1.replace(code1.regexp, code1.open)}${code1.close}` : str1;
}
function reset(str1) {
    return run(str1, code1([
        0
    ], 0));
}
function bold(str1) {
    return run(str1, code1([
        1
    ], 22));
}
function dim(str1) {
    return run(str1, code1([
        2
    ], 22));
}
function italic(str1) {
    return run(str1, code1([
        3
    ], 23));
}
function underline(str1) {
    return run(str1, code1([
        4
    ], 24));
}
function inverse(str1) {
    return run(str1, code1([
        7
    ], 27));
}
function hidden(str1) {
    return run(str1, code1([
        8
    ], 28));
}
function strikethrough(str1) {
    return run(str1, code1([
        9
    ], 29));
}
function black(str1) {
    return run(str1, code1([
        30
    ], 39));
}
function red(str1) {
    return run(str1, code1([
        31
    ], 39));
}
function green(str1) {
    return run(str1, code1([
        32
    ], 39));
}
function yellow(str1) {
    return run(str1, code1([
        33
    ], 39));
}
function blue(str1) {
    return run(str1, code1([
        34
    ], 39));
}
function magenta(str1) {
    return run(str1, code1([
        35
    ], 39));
}
function cyan(str1) {
    return run(str1, code1([
        36
    ], 39));
}
function white(str1) {
    return run(str1, code1([
        37
    ], 39));
}
function gray(str1) {
    return run(str1, code1([
        90
    ], 39));
}
function bgBlack(str1) {
    return run(str1, code1([
        40
    ], 49));
}
function bgRed(str1) {
    return run(str1, code1([
        41
    ], 49));
}
function bgGreen(str1) {
    return run(str1, code1([
        42
    ], 49));
}
function bgYellow(str1) {
    return run(str1, code1([
        43
    ], 49));
}
function bgBlue(str1) {
    return run(str1, code1([
        44
    ], 49));
}
function bgMagenta(str1) {
    return run(str1, code1([
        45
    ], 49));
}
function bgCyan(str1) {
    return run(str1, code1([
        46
    ], 49));
}
function bgWhite(str1) {
    return run(str1, code1([
        47
    ], 49));
}
function clampAndTruncate(n, max = 255, min = 0) {
    return Math.trunc(Math.max(Math.min(n, max), min));
}
function rgb8(str1, color) {
    return run(str1, code1([
        38,
        5,
        clampAndTruncate(color)
    ], 39));
}
function bgRgb8(str1, color) {
    return run(str1, code1([
        48,
        5,
        clampAndTruncate(color)
    ], 49));
}
function rgb24(str1, color) {
    if (typeof color === "number") {
        return run(str1, code1([
            38,
            2,
            color >> 16 & 255,
            color >> 8 & 255,
            color & 255
        ], 39));
    }
    return run(str1, code1([
        38,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b), 
    ], 39));
}
function bgRgb24(str1, color) {
    if (typeof color === "number") {
        return run(str1, code1([
            48,
            2,
            color >> 16 & 255,
            color >> 8 & 255,
            color & 255
        ], 49));
    }
    return run(str1, code1([
        48,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b), 
    ], 49));
}
const ANSI_PATTERN = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
function stripColor(string) {
    return string.replace(ANSI_PATTERN, "");
}
const mod = function() {
    return {
        setColorEnabled: setColorEnabled,
        getColorEnabled: getColorEnabled,
        reset: reset,
        bold: bold,
        dim: dim,
        italic: italic,
        underline: underline,
        inverse: inverse,
        hidden: hidden,
        strikethrough: strikethrough,
        black: black,
        red: red,
        green: green,
        yellow: yellow,
        blue: blue,
        magenta: magenta,
        cyan: cyan,
        white: white,
        gray: gray,
        bgBlack: bgBlack,
        bgRed: bgRed,
        bgGreen: bgGreen,
        bgYellow: bgYellow,
        bgBlue: bgBlue,
        bgMagenta: bgMagenta,
        bgCyan: bgCyan,
        bgWhite: bgWhite,
        rgb8: rgb8,
        bgRgb8: bgRgb8,
        rgb24: rgb24,
        bgRgb24: bgRgb24,
        stripColor: stripColor
    };
}();
const CHAR_FORWARD_SLASH = 47;
const navigator = globalThis.navigator;
let isWindows = false;
if (globalThis.Deno != null) {
    isWindows = Deno.build.os == "windows";
} else if (navigator?.appVersion != null) {
    isWindows = navigator.appVersion.includes("Win");
}
function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function isPosixPathSeparator(code1) {
    return code1 === 47;
}
function isPathSeparator(code1) {
    return isPosixPathSeparator(code1) || code1 === 92;
}
function isWindowsDeviceRoot(code1) {
    return code1 >= 97 && code1 <= 122 || code1 >= 65 && code1 <= 90;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code1;
    for(let i1 = 0, len = path.length; i1 <= len; ++i1){
        if (i1 < len) code1 = path.charCodeAt(i1);
        else if (isPathSeparator1(code1)) break;
        else code1 = CHAR_FORWARD_SLASH;
        if (isPathSeparator1(code1)) {
            if (lastSlash === i1 - 1 || dots === 1) {
            } else if (lastSlash !== i1 - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i1;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i1;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i1);
                else res = path.slice(lastSlash + 1, i1);
                lastSegmentLength = i1 - lastSlash - 1;
            }
            lastSlash = i1;
            dots = 0;
        } else if (code1 === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep + base;
}
const sep = "\\";
const delimiter = ";";
function resolve3(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i1 = pathSegments.length - 1; i1 >= -1; i1--){
        let path;
        if (i1 >= 0) {
            path = pathSegments[i1];
        } else if (!resolvedDevice) {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path = Deno.cwd();
        } else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path = `${resolvedDevice}\\`;
            }
        }
        assertPath(path);
        const len = path.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute = false;
        const code1 = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code1)) {
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code1)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code1)) {
            rootEnd = 1;
            isAbsolute = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute = false;
    const code1 = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code1)) {
            isAbsolute = true;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code1)) {
            if (path.charCodeAt(1) === 58) {
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        isAbsolute = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code1)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute) tail = ".";
    if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return false;
    const code1 = path.charCodeAt(0);
    if (isPathSeparator(code1)) {
        return true;
    } else if (isWindowsDeviceRoot(code1)) {
        if (len > 2 && path.charCodeAt(1) === 58) {
            if (isPathSeparator(path.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i1 = 0; i1 < pathsCount; ++i1){
        const path = paths[i1];
        assertPath(path);
        if (path.length > 0) {
            if (joined === undefined) joined = firstPart = path;
            else joined += `\\${path}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart != null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    const fromOrig = resolve3(from);
    const toOrig = resolve3(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i1 = 0;
    for(; i1 <= length; ++i1){
        if (i1 === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i1) === 92) {
                    return toOrig.slice(toStart + i1 + 1);
                } else if (i1 === 2) {
                    return toOrig.slice(toStart + i1);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i1) === 92) {
                    lastCommonSep = i1;
                } else if (i1 === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i1);
        const toCode = to.charCodeAt(toStart + i1);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i1;
    }
    if (i1 !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i1 = fromStart + lastCommonSep + 1; i1 <= fromEnd; ++i1){
        if (i1 === fromEnd || from.charCodeAt(i1) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath(path) {
    if (typeof path !== "string") return path;
    if (path.length === 0) return "";
    const resolvedPath = resolve3(path);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code1 = resolvedPath.charCodeAt(2);
                if (code1 !== 63 && code1 !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path;
}
function dirname(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code1 = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code1)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code1)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code1)) {
        return path;
    }
    for(let i1 = len - 1; i1 >= offset; --i1){
        if (isPathSeparator(path.charCodeAt(i1))) {
            if (!matchedSlash) {
                end = i1;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path.slice(0, end);
}
function basename(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i1;
    if (path.length >= 2) {
        const drive = path.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i1 = path.length - 1; i1 >= start; --i1){
            const code1 = path.charCodeAt(i1);
            if (isPathSeparator(code1)) {
                if (!matchedSlash) {
                    start = i1 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i1 + 1;
                }
                if (extIdx >= 0) {
                    if (code1 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
                            end = i1;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i1 = path.length - 1; i1 >= start; --i1){
            if (isPathSeparator(path.charCodeAt(i1))) {
                if (!matchedSlash) {
                    start = i1 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i1 + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname(path) {
    assertPath(path);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot(path.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i1 = path.length - 1; i1 >= start; --i1){
        const code1 = path.charCodeAt(i1);
        if (isPathSeparator(code1)) {
            if (!matchedSlash) {
                startPart = i1 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i1 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i1;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("\\", pathObject);
}
function parse(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code1 = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code1)) {
            rootEnd = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code1)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code1)) {
        ret.root = ret.dir = path;
        return ret;
    }
    if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i1 = path.length - 1;
    let preDotState = 0;
    for(; i1 >= rootEnd; --i1){
        code1 = path.charCodeAt(i1);
        if (isPathSeparator(code1)) {
            if (!matchedSlash) {
                startPart = i1 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i1 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i1;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path.slice(startPart, end);
        }
    } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    return new URL(String(url)).pathname.replace(/^\/*([A-Za-z]:)(\/|$)/, "$1/").replace(/\//g, "\\");
}
const mod1 = function() {
    return {
        sep: sep,
        delimiter: delimiter,
        resolve: resolve3,
        normalize: normalize,
        isAbsolute: isAbsolute,
        join: join,
        relative: relative,
        toNamespacedPath: toNamespacedPath,
        dirname: dirname,
        basename: basename,
        extname: extname,
        format: format,
        parse: parse,
        fromFileUrl: fromFileUrl
    };
}();
const sep1 = "/";
const delimiter1 = ":";
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i1 = pathSegments.length - 1; i1 >= -1 && !resolvedAbsolute; i1--){
        let path;
        if (i1 >= 0) path = pathSegments[i1];
        else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno.cwd();
        }
        assertPath(path);
        if (path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const isAbsolute1 = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = normalizeString(path, !isAbsolute1, "/", isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute1) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute1) return `/${path}`;
    return path;
}
function isAbsolute1(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i1 = 0, len = paths.length; i1 < len; ++i1){
        const path = paths[i1];
        assertPath(path);
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `/${path}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function relative1(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    from = resolve1(from);
    to = resolve1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i1 = 0;
    for(; i1 <= length; ++i1){
        if (i1 === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i1) === 47) {
                    return to.slice(toStart + i1 + 1);
                } else if (i1 === 0) {
                    return to.slice(toStart + i1);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i1) === 47) {
                    lastCommonSep = i1;
                } else if (i1 === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i1);
        const toCode = to.charCodeAt(toStart + i1);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i1;
    }
    let out = "";
    for(i1 = fromStart + lastCommonSep + 1; i1 <= fromEnd; ++i1){
        if (i1 === fromEnd || from.charCodeAt(i1) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath1(path) {
    return path;
}
function dirname1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const hasRoot = path.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i1 = path.length - 1; i1 >= 1; --i1){
        if (path.charCodeAt(i1) === 47) {
            if (!matchedSlash) {
                end = i1;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path.slice(0, end);
}
function basename1(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i1;
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i1 = path.length - 1; i1 >= 0; --i1){
            const code1 = path.charCodeAt(i1);
            if (code1 === 47) {
                if (!matchedSlash) {
                    start = i1 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i1 + 1;
                }
                if (extIdx >= 0) {
                    if (code1 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
                            end = i1;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i1 = path.length - 1; i1 >= 0; --i1){
            if (path.charCodeAt(i1) === 47) {
                if (!matchedSlash) {
                    start = i1 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i1 + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname1(path) {
    assertPath(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i1 = path.length - 1; i1 >= 0; --i1){
        const code1 = path.charCodeAt(i1);
        if (code1 === 47) {
            if (!matchedSlash) {
                startPart = i1 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i1 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i1;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("/", pathObject);
}
function parse1(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path.length === 0) return ret;
    const isAbsolute2 = path.charCodeAt(0) === 47;
    let start;
    if (isAbsolute2) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i1 = path.length - 1;
    let preDotState = 0;
    for(; i1 >= start; --i1){
        const code1 = path.charCodeAt(i1);
        if (code1 === 47) {
            if (!matchedSlash) {
                startPart = i1 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i1 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i1;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute2) {
                ret.base = ret.name = path.slice(1, end);
            } else {
                ret.base = ret.name = path.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute2) {
            ret.name = path.slice(1, startDot);
            ret.base = path.slice(1, end);
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute2) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    return new URL(String(url)).pathname;
}
const mod2 = function() {
    return {
        sep: sep1,
        delimiter: delimiter1,
        resolve: resolve1,
        normalize: normalize1,
        isAbsolute: isAbsolute1,
        join: join1,
        relative: relative1,
        toNamespacedPath: toNamespacedPath1,
        dirname: dirname1,
        basename: basename1,
        extname: extname1,
        format: format1,
        parse: parse1,
        fromFileUrl: fromFileUrl1
    };
}();
const path3 = isWindows ? mod1 : mod2;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join2 , normalize: normalize2 , parse: parse2 , relative: relative2 , resolve: resolve2 , sep: sep2 , toNamespacedPath: toNamespacedPath2 ,  } = path3;
var DiffType;
(function(DiffType1) {
    DiffType1["removed"] = "removed";
    DiffType1["common"] = "common";
    DiffType1["added"] = "added";
})(DiffType || (DiffType = {
}));
class AssertionError extends Error {
    constructor(message1){
        super(message1);
        this.name = "AssertionError";
    }
}
function absolute1(base, relative3) {
    const stack = base.split("/"), parts = relative3.split("/");
    stack.pop();
    for(let i1 = 0; i1 < parts.length; i1++){
        if (parts[i1] == ".") {
            continue;
        }
        if (parts[i1] == "..") {
            stack.pop();
        } else {
            stack.push(parts[i1]);
        }
    }
    return stack.join("/");
}
async function fetchRemoteRessource(p) {
    const a = await fetch(p);
    if (a.status < 400) {
        const b = await a.blob();
        const c = await b.text();
        return c;
    } else {
        return null;
    }
}
var Flags;
(function(Flags1) {
    Flags1["DEVTOOL"] = '--devtool';
    Flags1["TRACE"] = '--ogone-trace';
    Flags1["DESIGNER"] = '--open-designer';
    Flags1["RELEASE"] = '--release';
})(Flags || (Flags = {
}));
var Workers;
(function(Workers1) {
    Workers1["SERVICE_DEV_READY"] = "SERVICE_DEV_READY";
    Workers1["UPDATE_APPLICATION"] = "UPDATE_APPLICATION";
    Workers1["INIT_MESSAGE_SERVICE_DEV"] = "INIT_MESSAGE_SERVICE_DEV";
    Workers1["SERVICE_DEV_GET_PORT"] = "SERVICE_DEV_GET_PORT";
    Workers1["LSP_SEND_PORT"] = "LSP_SEND_PORT";
    Workers1["LSP_OPEN_WEBVIEW"] = "LSP_OPEN_WEBVIEW";
    Workers1["LSP_UPDATE_CURRENT_COMPONENT"] = "LSP_UPDATE_CURRENT_COMPONENT";
    Workers1["LSP_UPDATE_SERVER_COMPONENT"] = "LSP_UPDATE_SERVER_COMPONENT";
    Workers1["LSP_CURRENT_COMPONENT_RENDERED"] = "LSP_CURRENT_COMPONENT_RENDERED";
    Workers1["LSP_SEND_COMPONENT_INFORMATIONS"] = "LSP_SEND_COMPONENT_INFORMATIONS";
    Workers1["LSP_SEND_ROOT_COMPONENT_FILE"] = "LSP_SEND_ROOT_COMPONENT_FILE";
    Workers1["LSP_ERROR"] = "LSP_ERROR";
    Workers1["LSP_CLOSE"] = "LSP_CLOSE";
    Workers1["WS_INIT"] = "WS_INIT";
    Workers1["WS_FILE_UPDATED"] = "WS_FILE_UPDATED";
})(Workers || (Workers = {
}));
const FIFOMessages1 = [];
const importMeta = {
    url: "file:///home/rudy/.vscode/extensions/Otone/Ogone/src/classes/Configuration.ts",
    main: false
};
class Utils {
    getDeepTranslation = getDeepTranslation1;
    static client = new WebSocket('ws://localhost:3441/');
    static getDeepTranslation = getDeepTranslation1;
    absolute = absolute1;
    trace(message) {
        if (Deno.args.includes(Flags.TRACE)) {
            this.message(`${this.constructor.name} ${message}`);
        }
    }
    static trace(message) {
        if (Deno.args.includes(Flags.TRACE)) {
            this.message(`${this.constructor.name} ${message}`);
        }
    }
    warn(message, opts) {
        const { bgYellow: bgYellow1 , bold: bold1 , black: black1 , yellow: yellow1  } = mod;
        this.message(`${bgYellow1(bold1(black1("   WARN  ")))} ${yellow1(message)}`);
    }
    error(message, opts) {
        const { bgRed: bgRed1 , red: red1 , bold: bold1 , yellow: yellow1  } = mod;
        const m = this.message(`${bgRed1("  ERROR  ")} ${red1(message)}\n${yellow1(`\n\t\tfeeling like it's an issue ?\n\t\tplease report on https://github.com/SRNV/Ogone/issues/new?assignees=&modifiers=&template=bug_report.md&title=`)}`, {
            returns: true
        });
        if (Configuration.OgoneDesignerOpened) {
            this.notify({
                type: Workers.LSP_ERROR,
                message: m
            });
        }
        const e = new Error(m);
        console.error(e.stack);
        Deno.exit(1);
    }
    static error(message, opts) {
        const { bgRed: bgRed1 , red: red1 , bold: bold1 , yellow: yellow1  } = mod;
        const m = this.message(`${bgRed1("  ERROR  ")} ${red1(message)}\n${yellow1(`\n\t\tfeeling like it's an issue ?\n\t\tplease report on https://github.com/SRNV/Ogone/issues/new?assignees=&modifiers=&template=bug_report.md&title=`)}`, {
            returns: true
        });
        if (Configuration.OgoneDesignerOpened) {
            this.notify({
                type: Workers.LSP_ERROR,
                message: m
            });
        }
        Deno.exit(1);
        throw new Error(m);
    }
    success(message, opts) {
        const { bgBlack: bgBlack1 , white: white1 , bold: bold1 , green: green1  } = mod;
        this.message(`${bgBlack1(bold1(green1(" SUCCESS ")))} ${white1(message)}`);
    }
    static success(message, opts) {
        const { bgBlack: bgBlack1 , white: white1 , bold: bold1 , green: green1  } = mod;
        this.message(`${bgBlack1(bold1(green1(" SUCCESS ")))} ${white1(message)}`);
    }
    infos(message, opts) {
        const { bgBlack: bgBlack1 , bold: bold1 , blue: blue1  } = mod;
        this.message(`${bgBlack1(bold1(blue1("  INFOS  ")))} ${blue1(message)}`);
    }
    static infos(message, opts) {
        const { bgBlack: bgBlack1 , bold: bold1 , blue: blue1  } = mod;
        this.message(`${bgBlack1(bold1(blue1("  INFOS  ")))} ${blue1(message)}`);
    }
    message(message, opts) {
        const { cyan: cyan1 , bold: bold1  } = mod;
        const name = bold1(cyan1(" [Ogone] "));
        if (opts && opts.returns) {
            return `${name} ${message}`;
        } else {
            console.log(name, message);
            return;
        }
    }
    static message(message, opts) {
        const { cyan: cyan1 , bold: bold1 , white: white1  } = mod;
        const name = bold1(cyan1(" [Ogone] "));
        if (opts && opts.returns) {
            return `${name} ${message}`;
        } else {
            console.log(name, message);
            return;
        }
    }
    template(tmpl, data) {
        let result = tmpl;
        const fn = new Function("__value", ...Object.keys(data), `try { return eval('('+ __value + ')'); } catch(err) { throw err; }`);
        const values = Object.values(data);
        while(result.indexOf("{%") > -1 && result.indexOf("%}") > -1){
            if (result.indexOf("{%") > result.indexOf("%}")) {
                result = result.replace("%}", "% }");
            }
            const start = result.indexOf("{%");
            const end = result.indexOf("%}") + 2;
            const substrContent = result.substring(start + 2, end - 2).trim();
            const partStart = result.substring(0, start);
            const partEnd = result.substring(end);
            result = partStart + fn(substrContent, ...values) + partEnd;
        }
        return result;
    }
    static template(tmpl, data) {
        let result = tmpl;
        const fn = new Function("__value", ...Object.keys(data), `try { return eval('('+ __value + ')'); } catch(err) { throw err; }`);
        const values = Object.values(data);
        while(result.indexOf("{%") > -1 && result.indexOf("%}") > -1){
            if (result.indexOf("{%") > result.indexOf("%}")) {
                result = result.replace("%}", "% }");
            }
            const start = result.indexOf("{%");
            const end = result.indexOf("%}") + 2;
            const substrContent = result.substring(start + 2, end - 2).trim();
            const partStart = result.substring(0, start);
            const partEnd = result.substring(end);
            result = partStart + fn(substrContent, ...values) + partEnd;
        }
        return result;
    }
    static notify(data) {
        if (Utils.client.readyState !== 1) {
            FIFOMessages1.push(JSON.stringify(data));
        } else {
            FIFOMessages1.forEach((message3)=>{
                Utils.client.send(message3);
            });
            FIFOMessages1.splice(0);
            Utils.client.send(JSON.stringify(data));
        }
    }
    notify = Utils.notify.bind(this);
    static exposeSession(port, entrypoint) {
        const { cyan: cyan1 , blue: blue1  } = mod;
        this.success(`\n    App: ${cyan1(entrypoint || Configuration.entrypoint)}\n    Running here: ${cyan1(`http://localhost:${port || Configuration.port || 8080}/`)}\n\n    - Love Ogone's project ? Join the discord here: ${cyan1(`https://discord.gg/gCnGzh2wMc`)}\n    - Releases: ${cyan1(`https://github.com/SRNV/Ogone/releases`)}\n    - Github: ${cyan1(`https://github.com/SRNV/Ogone`)}\n    - Projects: ${cyan1(`https://github.com/SRNV/Ogone/projects`)}\n\n      deno:\t\t${Deno.version.deno}\n      typescript:\t${Deno.version.typescript}\n    `);
    }
    exposeSession = Utils.exposeSession.bind(this);
}
class Configuration {
    static entrypoint = "/index.o3";
    static port = 0;
    static ["static"] = "/public/";
    static modules = "/modules";
    static OgoneDesignerOpened = false;
    static setConfig(config) {
        try {
            if (!config) {
                throw new TypeError(`no configuration provided to class Configuration\n${importMeta.url}`);
            }
            Configuration.entrypoint = config.entrypoint;
            Configuration.port = config.port ? config.port : 0;
            Configuration.static = config.static;
            Configuration.controllers = config.controllers;
            Configuration.devtool = config.devtool;
            Configuration.minifyCSS = config.minifyCSS;
            Configuration.compileCSS = config.compileCSS;
            Configuration.build = config.build;
            Configuration.serve = config.serve;
            Configuration.types = config.types;
            Configuration.deploySPA = config.deploySPA;
        } catch (err) {
            Utils.error(`Configuration: ${err.message}\n${err.stack}`);
        }
    }
    static setHead(head) {
        try {
            Configuration.head = head;
            if (!Configuration.savedHead) {
                Configuration.savedHead = head;
                return false;
            }
            if (Configuration.savedHead !== head) {
                Configuration.savedHead = head;
                return true;
            }
            return false;
        } catch (err) {
            Utils.error(`Configuration: ${err.message}\n${err.stack}`);
        }
    }
}
class MapPosition extends Utils {
    static mapTokens = new Map();
    static mapNodes = new Map();
    static getColumn(text, position, startIndex = 0) {
        try {
            const array = text.split('\n');
            let i1 = 0;
            let currentLine = this.getLine(text, position);
            const currentColumn = array.map((line, index)=>{
                const part1 = array.slice(0, index).join('\n').length;
                const result = line.slice(0, i1 - line.length);
                i1 = part1 - line.length;
                return part1 <= position.start ? currentLine === index + 1 ? result : '' : '';
            });
            const result = currentColumn.find((line)=>line.length
            )?.length || 0;
            return result - startIndex > 0 ? result - startIndex : 0;
        } catch (err) {
            this.error(`MapPosition: ${err.message}\n${err.stack}`);
        }
    }
    static getLine(text, position, startIndex = 0) {
        try {
            const array = text.split('\n');
            const currentLine = array.find((line, index)=>{
                const part1 = array.slice(0, index).join('\n').length;
                return part1 > position.start;
            });
            const result = currentLine && array.indexOf(currentLine) || 0;
            return result;
        } catch (err) {
            this.error(`MapPosition: ${err.message}\n${err.stack}`);
        }
    }
}
function savePosition(id, start, end) {
    return MapPosition.mapTokens.set(id, {
        start,
        end
    });
}
function __default2(opts) {
    try {
        const { typedExpressions , expressions , value , name , array , before ,  } = opts;
        let result = before ? before(value) : value;
        array.forEach((item)=>{
            if (name && !item.name) return;
            if (name && item.name && name !== item.name) return;
            if (Deno.args.includes('--ogone-trace-transformations')) console.warn(item);
            if (item.open && item.close && item.id && item.pair) {
                if (Deno.args.includes('--ogone-trace-transformations')) console.warn(1);
                while(!((result.split(item.open).length - 1) % 2) && result.indexOf(item.open) > -1 && result.indexOf(item.close) > -1 && result.match(item.reg)){
                    const matches = result.match(item.reg);
                    const value1 = matches ? matches[0] : null;
                    if (matches && value1) {
                        const newId = item.id(value1, matches, typedExpressions, expressions);
                        result = result.replace(item.reg, newId);
                        const start = getDeepTranslation1(result.slice(0, result.indexOf(newId)), expressions).length;
                        const end = getDeepTranslation1(value1, expressions).length + start;
                        savePosition(newId, start, end);
                    }
                }
                return;
            }
            if (item.open && item.close && item.id && !item.pair) {
                if (Deno.args.includes('--ogone-trace-transformations')) console.warn(2);
                while(result && result.indexOf(item.open) > -1 && result.indexOf(item.close) > -1 && result.match(item.reg)){
                    const matches = result.match(item.reg);
                    const value1 = matches ? matches[0] : null;
                    if (matches && value1) {
                        const newId = item.id(value1, matches, typedExpressions, expressions);
                        result = result.replace(item.reg, newId);
                        const start = getDeepTranslation1(result.slice(0, result.indexOf(newId)), expressions).length;
                        const end = getDeepTranslation1(value1, expressions).length + start;
                        savePosition(newId, start, end);
                    }
                }
                return;
            }
            if (item.open === false && item.close === false && item.id) {
                if (Deno.args.includes('--ogone-trace-transformations')) console.warn(3);
                while(result && result.match(item.reg)){
                    if (Deno.args.includes('--ogone-trace-transformations')) console.warn(result.length, result.match(item.reg).index, item);
                    const matches = result.match(item.reg);
                    const value1 = matches ? matches[0] : null;
                    if (matches && value1) {
                        if (Deno.args.includes('--ogone-trace-transformations')) console.warn(value1);
                        const newId = item.id(value1, matches, typedExpressions, expressions);
                        result = result.replace(item.reg, newId);
                        const start = getDeepTranslation1(result.slice(0, result.indexOf(newId)), expressions).length;
                        const end = getDeepTranslation1(value1, expressions).length + start;
                        savePosition(newId, start, end);
                    }
                }
            }
            if (item.split && item.splittedId) {
                while(result && result.indexOf(item.split[0]) > -1 && result.indexOf(item.split[1]) > -1 && result.indexOf(item.split[0]) < result.indexOf(item.split[1])){
                    const part1 = result.substring(result.indexOf(item.split[0]), result.indexOf(item.split[1]) + 2);
                    result = result.replace(part1, item.splittedId(result, expressions));
                }
            }
        });
        return result;
    } catch (err) {
        throw err;
    }
}
class ProtocolModifierGetter1 extends Utils {
    expressions = {
    };
    registerModifierProviders(text, { modifiers , onError  }) {
        try {
            this.typedExpressions = __default();
            this.expressions = {
            };
            this.modifiers = modifiers;
            this.onError = onError;
            const allTokens = this.getUncatchableModifiers();
            const globalRegExp = new RegExp(`(${allTokens.join('|')})`, 'gi');
            const transformedText = __default2({
                typedExpressions: this.typedExpressions,
                expressions: this.expressions,
                value: text,
                array: nullish.concat(tokens, [
                    {
                        open: false,
                        reg: /\n\s*\n/,
                        id: (value, matches)=>'\n'
                        ,
                        close: false
                    }
                ])
            });
            const contents = transformedText.split(globalRegExp).filter((s)=>s && s.length
            );
            const result = this.getModifierContents(contents);
            this.hasBadArgument(result);
            this.hasDuplicateModifierImplementation(transformedText, result);
            this.triggerParsedModifiers(result, modifiers);
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}\n${err.stack}`);
        }
    }
    triggerExclusion(modifier, savedModifiers) {
        try {
            const keys = Object.keys(savedModifiers);
            if (modifier.exclude) {
                modifier.exclude.forEach((token2)=>{
                    const reg = new RegExp(`${token2}\\b`, 'i');
                    const modifierRegExp = new RegExp(modifier.token, 'i');
                    const excludedModifier = keys.find((token3)=>reg.test(token3)
                    );
                    const hasModifier = keys.find((token3)=>modifierRegExp.test(token3)
                    );
                    if (excludedModifier && this.onError && hasModifier) {
                        const token3 = excludedModifier.trim().split(' ')[0].replace(/\:$/, '');
                        this.onError(new Error(`can't use ${modifier.token} and ${token3} inside the same component.`));
                    }
                });
            }
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}\n${err.stack}`);
        }
    }
    triggerParsedModifiers(savedModifiers, modifiers) {
        try {
            modifiers.forEach((modifier)=>{
                if (modifier.onParse && typeof modifier.onParse === 'function') {
                    const entries = Object.entries(savedModifiers);
                    entries.reverse().forEach(([key, values])=>{
                        const token = key.trim().split(' ')[0].replace(/\:$/, '');
                        const value = values.reverse().join('');
                        if (modifier.token === token) {
                            this.triggerExclusion(modifier, savedModifiers);
                            const newValue = getDeepTranslation1(value, this.expressions);
                            modifier.onParse({
                                argument: getDeepTranslation1(key.trim().split(' ')[1], this.expressions).replace(/\:$/, ''),
                                token,
                                value: newValue,
                                endsWithBreak: !!value.trim().match(/\bbreak[\n\s]*;{0,1}$/)
                            });
                        }
                    });
                }
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}\n${err.stack}`);
        }
    }
    cleanContents(contents) {
        try {
            contents.forEach((content, i1, arr)=>{
                if (content.startsWith('\n')) return true;
                else if (arr[i1 - 1]) {
                    arr[i1 - 1] = `${arr[i1 - 1]}${content}`;
                    delete arr[i1];
                }
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}\n${err.stack}`);
        }
    }
    hasBadArgument(savedModifiers) {
        try {
            if (this.modifiers) {
                this.modifiers.map((modifierProvider)=>{
                    if (modifierProvider.argumentType && modifierProvider.argumentType === 'string') {
                        const regExp = new RegExp(`(?:(?:\\s*)${modifierProvider.token}\\s+(\\<string\\d+\\>)\\s*\\:)`, 'i');
                        const entries = Object.entries(savedModifiers);
                        entries.forEach(([key, value])=>{
                            const match = regExp.test(key.trim());
                            if (key.startsWith(`${modifierProvider.token} `) && !match && this.onError) {
                                this.onError(new Error(`modifier ${modifierProvider.token} is only waiting for a ${modifierProvider.argumentType} as argument. concatenations are not supported, please use template litteral`));
                            }
                        });
                    }
                });
            }
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}\n${err.stack}`);
        }
    }
    hasDuplicateModifierImplementation(text, savedModifiers) {
        try {
            if (!this.onError) return;
            const allTokens = this.getCatchableModifiers();
            const globalRegExp = new RegExp(`(${allTokens.join('|')})`, 'gi');
            const match = text.match(globalRegExp);
            const store = [];
            match?.forEach((m)=>{
                if (this.modifiers) {
                    const token = m.trim();
                    const name = token.split(/(?:\s|\:$)/)[0];
                    const modifierProvider = this.modifiers.find((modifier)=>modifier.token === name && modifier.unique
                    );
                    if (store.includes(m) && savedModifiers[m] && this.onError && modifierProvider) {
                        this.onError(new Error(`[Protocol] - Duplicate modifier implementation: ${modifierProvider.token}`));
                    } else {
                        store.push(m);
                    }
                }
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}\n${err.stack}`);
        }
    }
    getUncatchableModifiers() {
        try {
            if (!this.modifiers) return [];
            return this.modifiers.map((modifierProvider)=>{
                if (modifierProvider.argumentType && modifierProvider.argumentType === 'string') return `(?:(?:\\s*)${modifierProvider.token}\\s*(?:.+?)\\s*\\:)`;
                return `(?:\\s*)${modifierProvider.token}\\s*\\:`;
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}\n${err.stack}`);
        }
    }
    getCatchableModifiers() {
        try {
            if (!this.modifiers) return [];
            return this.modifiers.map((modifierProvider)=>{
                if (modifierProvider.argumentType && modifierProvider.argumentType === 'string') return `\\n((?:\\s*)${modifierProvider.token}\\s*(.+?)\\s*\\:)`;
                return `\\n(\\s*)${modifierProvider.token}\\s*\\:`;
            });
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}\n${err.stack}`);
        }
    }
    getModifierContents(contents) {
        try {
            if (!this.modifiers) return {
            };
            this.cleanContents(contents);
            const tokens1 = this.getCatchableModifiers();
            const indentRegExp = /\n\s*/;
            const result = {
            };
            const reversedContents = contents.slice().reverse();
            reversedContents.forEach((content, i1, arr)=>{
                const match = content.match(indentRegExp);
                const matchingToken = tokens1.find((token)=>new RegExp(token, 'g').exec(content)
                );
                if (match) {
                    const [indent] = match;
                    if (!indent || !content.length) return;
                    const parent = reversedContents.find((content2, id)=>{
                        const m = content2?.match(indentRegExp);
                        if (m) {
                            const matchingTokenForCandidate = tokens1.find((token)=>new RegExp(token, 'g').exec(content2)
                            );
                            const [indent2] = m;
                            return indent2 && indent2.length < indent.length && id > i1 && matchingTokenForCandidate || matchingTokenForCandidate && !matchingToken && id > i1;
                        }
                    });
                    if (parent) {
                        const name = parent;
                        result[name] = result[name] || [];
                        result[name].push(content);
                    }
                    if (!parent && matchingToken) {
                        const match1 = new RegExp(matchingToken).exec(content);
                        if (match1) {
                            const [input] = match1;
                            const value = content.replace(input, '');
                            if (value.length) {
                                const name = input;
                                result[name] = result[name] || [];
                                result[name].push(value);
                            }
                        }
                    }
                }
            });
            return result;
        } catch (err) {
            this.error(`ProtocolModifierGetter: ${err.message}\n${err.stack}`);
        }
    }
}
class YAMLError extends Error {
    constructor(message3 = "(unknown reason)", mark = ""){
        super(`${message3} ${mark}`);
        this.mark = mark;
        this.name = this.constructor.name;
    }
    toString(_compact) {
        return `${this.name}: ${this.message} ${this.mark}`;
    }
}
function compileList(schema, name, result) {
    const exclude = [];
    for (const includedSchema of schema.include){
        result = compileList(includedSchema, name, result);
    }
    for (const currentType of schema[name]){
        for(let previousIndex = 0; previousIndex < result.length; previousIndex++){
            const previousType = result[previousIndex];
            if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
                exclude.push(previousIndex);
            }
        }
        result.push(currentType);
    }
    return result.filter((type, index)=>!exclude.includes(index)
    );
}
function compileMap(...typesList) {
    const result = {
        fallback: {
        },
        mapping: {
        },
        scalar: {
        },
        sequence: {
        }
    };
    for (const types of typesList){
        for (const type of types){
            if (type.kind !== null) {
                result[type.kind][type.tag] = result["fallback"][type.tag] = type;
            }
        }
    }
    return result;
}
class Schema {
    constructor(definition){
        this.explicit = definition.explicit || [];
        this.implicit = definition.implicit || [];
        this.include = definition.include || [];
        for (const type1 of this.implicit){
            if (type1.loadKind && type1.loadKind !== "scalar") {
                throw new YAMLError("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
            }
        }
        this.compiledImplicit = compileList(this, "implicit", []);
        this.compiledExplicit = compileList(this, "explicit", []);
        this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
    }
    static create() {
    }
}
const DEFAULT_RESOLVE = ()=>true
;
const DEFAULT_CONSTRUCT = (data)=>data
;
function checkTagFormat(tag) {
    return tag;
}
class Type {
    kind = null;
    constructor(tag1, options){
        this.tag = checkTagFormat(tag1);
        if (options) {
            this.kind = options.kind;
            this.resolve = options.resolve || DEFAULT_RESOLVE;
            this.construct = options.construct || DEFAULT_CONSTRUCT;
            this.instanceOf = options.instanceOf;
            this.predicate = options.predicate;
            this.represent = options.represent;
            this.defaultStyle = options.defaultStyle;
            this.styleAliases = options.styleAliases;
        }
    }
    resolve = ()=>true
    ;
    construct = (data)=>data
    ;
}
const BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
    if (data === null) return false;
    let code1;
    let bitlen = 0;
    const max = data.length;
    const map = BASE64_MAP;
    for(let idx = 0; idx < max; idx++){
        code1 = map.indexOf(data.charAt(idx));
        if (code1 > 64) continue;
        if (code1 < 0) return false;
        bitlen += 6;
    }
    return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
    const input = data.replace(/[\r\n=]/g, "");
    const max = input.length;
    const map = BASE64_MAP;
    const result = [];
    let bits = 0;
    for(let idx = 0; idx < max; idx++){
        if (idx % 4 === 0 && idx) {
            result.push(bits >> 16 & 255);
            result.push(bits >> 8 & 255);
            result.push(bits & 255);
        }
        bits = bits << 6 | map.indexOf(input.charAt(idx));
    }
    const tailbits = max % 4 * 6;
    if (tailbits === 0) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
    } else if (tailbits === 18) {
        result.push(bits >> 10 & 255);
        result.push(bits >> 2 & 255);
    } else if (tailbits === 12) {
        result.push(bits >> 4 & 255);
    }
    return new Deno.Buffer(new Uint8Array(result));
}
function representYamlBinary(object) {
    const max = object.length;
    const map = BASE64_MAP;
    let result = "";
    let bits = 0;
    for(let idx = 0; idx < max; idx++){
        if (idx % 3 === 0 && idx) {
            result += map[bits >> 18 & 63];
            result += map[bits >> 12 & 63];
            result += map[bits >> 6 & 63];
            result += map[bits & 63];
        }
        bits = (bits << 8) + object[idx];
    }
    const tail = max % 3;
    if (tail === 0) {
        result += map[bits >> 18 & 63];
        result += map[bits >> 12 & 63];
        result += map[bits >> 6 & 63];
        result += map[bits & 63];
    } else if (tail === 2) {
        result += map[bits >> 10 & 63];
        result += map[bits >> 4 & 63];
        result += map[bits << 2 & 63];
        result += map[64];
    } else if (tail === 1) {
        result += map[bits >> 2 & 63];
        result += map[bits << 4 & 63];
        result += map[64];
        result += map[64];
    }
    return result;
}
function isBinary(obj) {
    const buf = new Deno.Buffer();
    try {
        if (0 > buf.readFromSync(obj)) return true;
        return false;
    } catch  {
        return false;
    } finally{
        buf.reset();
    }
}
const binary = new Type("tag:yaml.org,2002:binary", {
    construct: constructYamlBinary,
    kind: "scalar",
    predicate: isBinary,
    represent: representYamlBinary,
    resolve: resolveYamlBinary
});
function resolveYamlBoolean(data) {
    const max = data.length;
    return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
    return data === "true" || data === "True" || data === "TRUE";
}
const bool = new Type("tag:yaml.org,2002:bool", {
    construct: constructYamlBoolean,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isBoolean,
    represent: {
        lowercase (object) {
            return object ? "true" : "false";
        },
        uppercase (object) {
            return object ? "TRUE" : "FALSE";
        },
        camelcase (object) {
            return object ? "True" : "False";
        }
    },
    resolve: resolveYamlBoolean
});
const YAML_FLOAT_PATTERN = new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?" + "|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?" + "|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*" + "|[-+]?\\.(?:inf|Inf|INF)" + "|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
    if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === "_") {
        return false;
    }
    return true;
}
function constructYamlFloat(data) {
    let value = data.replace(/_/g, "").toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    const digits = [];
    if ("+-".indexOf(value[0]) >= 0) {
        value = value.slice(1);
    }
    if (value === ".inf") {
        return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }
    if (value === ".nan") {
        return NaN;
    }
    if (value.indexOf(":") >= 0) {
        value.split(":").forEach((v)=>{
            digits.unshift(parseFloat(v));
        });
        let valueNb = 0;
        let base = 1;
        digits.forEach((d)=>{
            valueNb += d * base;
            base *= 60;
        });
        return sign * valueNb;
    }
    return sign * parseFloat(value);
}
const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
    if (isNaN(object)) {
        switch(style){
            case "lowercase":
                return ".nan";
            case "uppercase":
                return ".NAN";
            case "camelcase":
                return ".NaN";
        }
    } else if (Number.POSITIVE_INFINITY === object) {
        switch(style){
            case "lowercase":
                return ".inf";
            case "uppercase":
                return ".INF";
            case "camelcase":
                return ".Inf";
        }
    } else if (Number.NEGATIVE_INFINITY === object) {
        switch(style){
            case "lowercase":
                return "-.inf";
            case "uppercase":
                return "-.INF";
            case "camelcase":
                return "-.Inf";
        }
    } else if (isNegativeZero(object)) {
        return "-0.0";
    }
    const res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || isNegativeZero(object));
}
const __float = new Type("tag:yaml.org,2002:float", {
    construct: constructYamlFloat,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isFloat,
    represent: representYamlFloat,
    resolve: resolveYamlFloat
});
function isHexCode(c) {
    return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
    return 48 <= c && c <= 55;
}
function isDecCode(c) {
    return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
    const max = data.length;
    let index = 0;
    let hasDigits = false;
    if (!max) return false;
    let ch = data[index];
    if (ch === "-" || ch === "+") {
        ch = data[++index];
    }
    if (ch === "0") {
        if (index + 1 === max) return true;
        ch = data[++index];
        if (ch === "b") {
            index++;
            for(; index < max; index++){
                ch = data[index];
                if (ch === "_") continue;
                if (ch !== "0" && ch !== "1") return false;
                hasDigits = true;
            }
            return hasDigits && ch !== "_";
        }
        if (ch === "x") {
            index++;
            for(; index < max; index++){
                ch = data[index];
                if (ch === "_") continue;
                if (!isHexCode(data.charCodeAt(index))) return false;
                hasDigits = true;
            }
            return hasDigits && ch !== "_";
        }
        for(; index < max; index++){
            ch = data[index];
            if (ch === "_") continue;
            if (!isOctCode(data.charCodeAt(index))) return false;
            hasDigits = true;
        }
        return hasDigits && ch !== "_";
    }
    if (ch === "_") return false;
    for(; index < max; index++){
        ch = data[index];
        if (ch === "_") continue;
        if (ch === ":") break;
        if (!isDecCode(data.charCodeAt(index))) {
            return false;
        }
        hasDigits = true;
    }
    if (!hasDigits || ch === "_") return false;
    if (ch !== ":") return true;
    return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}
function constructYamlInteger(data) {
    let value = data;
    const digits = [];
    if (value.indexOf("_") !== -1) {
        value = value.replace(/_/g, "");
    }
    let sign = 1;
    let ch = value[0];
    if (ch === "-" || ch === "+") {
        if (ch === "-") sign = -1;
        value = value.slice(1);
        ch = value[0];
    }
    if (value === "0") return 0;
    if (ch === "0") {
        if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
        if (value[1] === "x") return sign * parseInt(value, 16);
        return sign * parseInt(value, 8);
    }
    if (value.indexOf(":") !== -1) {
        value.split(":").forEach((v)=>{
            digits.unshift(parseInt(v, 10));
        });
        let valueInt = 0;
        let base = 1;
        digits.forEach((d)=>{
            valueInt += d * base;
            base *= 60;
        });
        return sign * valueInt;
    }
    return sign * parseInt(value, 10);
}
function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && object % 1 === 0 && !isNegativeZero(object);
}
const __int = new Type("tag:yaml.org,2002:int", {
    construct: constructYamlInteger,
    defaultStyle: "decimal",
    kind: "scalar",
    predicate: isInteger,
    represent: {
        binary (obj) {
            return obj >= 0 ? `0b${obj.toString(2)}` : `-0b${obj.toString(2).slice(1)}`;
        },
        octal (obj) {
            return obj >= 0 ? `0${obj.toString(8)}` : `-0${obj.toString(8).slice(1)}`;
        },
        decimal (obj) {
            return obj.toString(10);
        },
        hexadecimal (obj) {
            return obj >= 0 ? `0x${obj.toString(16).toUpperCase()}` : `-0x${obj.toString(16).toUpperCase().slice(1)}`;
        }
    },
    resolve: resolveYamlInteger,
    styleAliases: {
        binary: [
            2,
            "bin"
        ],
        decimal: [
            10,
            "dec"
        ],
        hexadecimal: [
            16,
            "hex"
        ],
        octal: [
            8,
            "oct"
        ]
    }
});
const map = new Type("tag:yaml.org,2002:map", {
    construct (data) {
        return data !== null ? data : {
        };
    },
    kind: "mapping"
});
function resolveYamlMerge(data) {
    return data === "<<" || data === null;
}
const merge = new Type("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: resolveYamlMerge
});
function resolveYamlNull(data) {
    const max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
    return null;
}
function isNull(object) {
    return object === null;
}
const nil = new Type("tag:yaml.org,2002:null", {
    construct: constructYamlNull,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isNull,
    represent: {
        canonical () {
            return "~";
        },
        lowercase () {
            return "null";
        },
        uppercase () {
            return "NULL";
        },
        camelcase () {
            return "Null";
        }
    },
    resolve: resolveYamlNull
});
const _hasOwnProperty = Object.prototype.hasOwnProperty;
const _toString = Object.prototype.toString;
function resolveYamlOmap(data) {
    const objectKeys = [];
    let pairKey = "";
    let pairHasKey = false;
    for (const pair of data){
        pairHasKey = false;
        if (_toString.call(pair) !== "[object Object]") return false;
        for(pairKey in pair){
            if (_hasOwnProperty.call(pair, pairKey)) {
                if (!pairHasKey) pairHasKey = true;
                else return false;
            }
        }
        if (!pairHasKey) return false;
        if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
        else return false;
    }
    return true;
}
function constructYamlOmap(data) {
    return data !== null ? data : [];
}
const omap = new Type("tag:yaml.org,2002:omap", {
    construct: constructYamlOmap,
    kind: "sequence",
    resolve: resolveYamlOmap
});
const _toString1 = Object.prototype.toString;
function resolveYamlPairs(data) {
    const result = new Array(data.length);
    for(let index = 0; index < data.length; index++){
        const pair = data[index];
        if (_toString1.call(pair) !== "[object Object]") return false;
        const keys = Object.keys(pair);
        if (keys.length !== 1) return false;
        result[index] = [
            keys[0],
            pair[keys[0]]
        ];
    }
    return true;
}
function constructYamlPairs(data) {
    if (data === null) return [];
    const result = new Array(data.length);
    for(let index = 0; index < data.length; index += 1){
        const pair = data[index];
        const keys = Object.keys(pair);
        result[index] = [
            keys[0],
            pair[keys[0]]
        ];
    }
    return result;
}
const pairs = new Type("tag:yaml.org,2002:pairs", {
    construct: constructYamlPairs,
    kind: "sequence",
    resolve: resolveYamlPairs
});
const seq = new Type("tag:yaml.org,2002:seq", {
    construct (data) {
        return data !== null ? data : [];
    },
    kind: "sequence"
});
const _hasOwnProperty1 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
    if (data === null) return true;
    for(const key in data){
        if (_hasOwnProperty1.call(data, key)) {
            if (data[key] !== null) return false;
        }
    }
    return true;
}
function constructYamlSet(data) {
    return data !== null ? data : {
    };
}
const set = new Type("tag:yaml.org,2002:set", {
    construct: constructYamlSet,
    kind: "mapping",
    resolve: resolveYamlSet
});
const str1 = new Type("tag:yaml.org,2002:str", {
    construct (data) {
        return data !== null ? data : "";
    },
    kind: "scalar"
});
const YAML_DATE_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9])" + "-([0-9][0-9])$");
const YAML_TIMESTAMP_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9]?)" + "-([0-9][0-9]?)" + "(?:[Tt]|[ \\t]+)" + "([0-9][0-9]?)" + ":([0-9][0-9])" + ":([0-9][0-9])" + "(?:\\.([0-9]*))?" + "(?:[ \\t]*(Z|([-+])([0-9][0-9]?)" + "(?::([0-9][0-9]))?))?$");
function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
}
function constructYamlTimestamp(data) {
    let match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null) throw new Error("Date resolve error");
    const year = +match[1];
    const month = +match[2] - 1;
    const day = +match[3];
    if (!match[4]) {
        return new Date(Date.UTC(year, month, day));
    }
    const hour = +match[4];
    const minute = +match[5];
    const second = +match[6];
    let fraction = 0;
    if (match[7]) {
        let partFraction = match[7].slice(0, 3);
        while(partFraction.length < 3){
            partFraction += "0";
        }
        fraction = +partFraction;
    }
    let delta = null;
    if (match[9]) {
        const tzHour = +match[10];
        const tzMinute = +(match[11] || 0);
        delta = (tzHour * 60 + tzMinute) * 60000;
        if (match[9] === "-") delta = -delta;
    }
    const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
}
function representYamlTimestamp(date) {
    return date.toISOString();
}
const timestamp = new Type("tag:yaml.org,2002:timestamp", {
    construct: constructYamlTimestamp,
    instanceOf: Date,
    kind: "scalar",
    represent: representYamlTimestamp,
    resolve: resolveYamlTimestamp
});
class State {
    constructor(schema = def){
        this.schema = schema;
    }
}
function isBoolean(value) {
    return typeof value === "boolean" || value instanceof Boolean;
}
function isObject(value) {
    return value !== null && typeof value === "object";
}
function repeat(str2, count) {
    let result = "";
    for(let cycle = 0; cycle < count; cycle++){
        result += str2;
    }
    return result;
}
function isNegativeZero(i1) {
    return i1 === 0 && Number.NEGATIVE_INFINITY === 1 / i1;
}
class Mark {
    constructor(name1, buffer, position1, line1, column){
        this.name = name1;
        this.buffer = buffer;
        this.position = position1;
        this.line = line1;
        this.column = column;
    }
    getSnippet(indent = 4, maxLength = 75) {
        if (!this.buffer) return null;
        let head = "";
        let start = this.position;
        while(start > 0 && "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1){
            start -= 1;
            if (this.position - start > maxLength / 2 - 1) {
                head = " ... ";
                start += 5;
                break;
            }
        }
        let tail = "";
        let end = this.position;
        while(end < this.buffer.length && "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1){
            end += 1;
            if (end - this.position > maxLength / 2 - 1) {
                tail = " ... ";
                end -= 5;
                break;
            }
        }
        const snippet = this.buffer.slice(start, end);
        return `${repeat(" ", indent)}${head}${snippet}${tail}\n${repeat(" ", indent + this.position - start + head.length)}^`;
    }
    toString(compact) {
        let snippet, where = "";
        if (this.name) {
            where += `in "${this.name}" `;
        }
        where += `at line ${this.line + 1}, column ${this.column + 1}`;
        if (!compact) {
            snippet = this.getSnippet();
            if (snippet) {
                where += `:\n${snippet}`;
            }
        }
        return where;
    }
}
const failsafe = new Schema({
    explicit: [
        str1,
        seq,
        map
    ]
});
const json = new Schema({
    implicit: [
        nil,
        bool,
        __int,
        __float
    ],
    include: [
        failsafe
    ]
});
const core = new Schema({
    include: [
        json
    ]
});
const def = new Schema({
    explicit: [
        binary,
        omap,
        pairs,
        set
    ],
    implicit: [
        timestamp,
        merge
    ],
    include: [
        core
    ]
});
class LoaderState extends State {
    documents = [];
    lineIndent = 0;
    lineStart = 0;
    position = 0;
    line = 0;
    result = "";
    constructor(input, { filename , schema: schema1 , onWarning , legacy: legacy1 = false , json: json1 = false , listener: listener1 = null  }){
        super(schema1);
        this.input = input;
        this.filename = filename;
        this.onWarning = onWarning;
        this.legacy = legacy1;
        this.json = json1;
        this.listener = listener1;
        this.implicitTypes = this.schema.compiledImplicit;
        this.typeMap = this.schema.compiledTypeMap;
        this.length = input.length;
    }
}
const _hasOwnProperty2 = Object.prototype.hasOwnProperty;
const CONTEXT_BLOCK_IN = 3;
const CONTEXT_BLOCK_OUT = 4;
const CHOMPING_STRIP = 2;
const CHOMPING_KEEP = 3;
const PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
const PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
const PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
const PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
const PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
    return Object.prototype.toString.call(obj);
}
function isEOL(c) {
    return c === 10 || c === 13;
}
function isWhiteSpace(c) {
    return c === 9 || c === 32;
}
function isWsOrEol(c) {
    return c === 9 || c === 32 || c === 10 || c === 13;
}
function isFlowIndicator(c) {
    return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
    if (48 <= c && c <= 57) {
        return c - 48;
    }
    const lc = c | 32;
    if (97 <= lc && lc <= 102) {
        return lc - 97 + 10;
    }
    return -1;
}
function escapedHexLen(c) {
    if (c === 120) {
        return 2;
    }
    if (c === 117) {
        return 4;
    }
    if (c === 85) {
        return 8;
    }
    return 0;
}
function fromDecimalCode(c) {
    if (48 <= c && c <= 57) {
        return c - 48;
    }
    return -1;
}
function simpleEscapeSequence(c) {
    return c === 48 ? "\x00" : c === 97 ? "\x07" : c === 98 ? "\x08" : c === 116 ? "\x09" : c === 9 ? "\x09" : c === 110 ? "\x0A" : c === 118 ? "\x0B" : c === 102 ? "\x0C" : c === 114 ? "\x0D" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? "\x22" : c === 47 ? "/" : c === 92 ? "\x5C" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
    if (c <= 65535) {
        return String.fromCharCode(c);
    }
    return String.fromCharCode((c - 65536 >> 10) + 55296, (c - 65536 & 1023) + 56320);
}
const simpleEscapeCheck = new Array(256);
const simpleEscapeMap = new Array(256);
for(let i1 = 0; i1 < 256; i1++){
    simpleEscapeCheck[i1] = simpleEscapeSequence(i1) ? 1 : 0;
    simpleEscapeMap[i1] = simpleEscapeSequence(i1);
}
function generateError(state, message4) {
    return new YAMLError(message4, new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart));
}
function throwError(state, message4) {
    throw generateError(state, message4);
}
function throwWarning(state, message4) {
    if (state.onWarning) {
        state.onWarning.call(null, generateError(state, message4));
    }
}
const directiveHandlers = {
    YAML (state, _name, ...args) {
        if (state.version !== null) {
            return throwError(state, "duplication of %YAML directive");
        }
        if (args.length !== 1) {
            return throwError(state, "YAML directive accepts exactly one argument");
        }
        const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
        if (match === null) {
            return throwError(state, "ill-formed argument of the YAML directive");
        }
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        if (major !== 1) {
            return throwError(state, "unacceptable YAML version of the document");
        }
        state.version = args[0];
        state.checkLineBreaks = minor < 2;
        if (minor !== 1 && minor !== 2) {
            return throwWarning(state, "unsupported YAML version of the document");
        }
    },
    TAG (state, _name, ...args) {
        if (args.length !== 2) {
            return throwError(state, "TAG directive accepts exactly two arguments");
        }
        const handle = args[0];
        const prefix = args[1];
        if (!PATTERN_TAG_HANDLE.test(handle)) {
            return throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
        }
        if (_hasOwnProperty2.call(state.tagMap, handle)) {
            return throwError(state, `there is a previously declared suffix for "${handle}" tag handle`);
        }
        if (!PATTERN_TAG_URI.test(prefix)) {
            return throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
        }
        if (typeof state.tagMap === "undefined") {
            state.tagMap = {
            };
        }
        state.tagMap[handle] = prefix;
    }
};
function captureSegment(state, start, end, checkJson) {
    let result;
    if (start < end) {
        result = state.input.slice(start, end);
        if (checkJson) {
            for(let position2 = 0, length = result.length; position2 < length; position2++){
                const character = result.charCodeAt(position2);
                if (!(character === 9 || 32 <= character && character <= 1114111)) {
                    return throwError(state, "expected valid JSON character");
                }
            }
        } else if (PATTERN_NON_PRINTABLE.test(result)) {
            return throwError(state, "the stream contains non-printable characters");
        }
        state.result += result;
    }
}
function mergeMappings(state, destination, source, overridableKeys) {
    if (!isObject(source)) {
        return throwError(state, "cannot merge mappings; the provided source object is unacceptable");
    }
    const keys = Object.keys(source);
    for(let i2 = 0, len = keys.length; i2 < len; i2++){
        const key = keys[i2];
        if (!_hasOwnProperty2.call(destination, key)) {
            destination[key] = source[key];
            overridableKeys[key] = true;
        }
    }
}
function storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
    if (Array.isArray(keyNode)) {
        keyNode = Array.prototype.slice.call(keyNode);
        for(let index = 0, quantity = keyNode.length; index < quantity; index++){
            if (Array.isArray(keyNode[index])) {
                return throwError(state, "nested arrays are not supported inside keys");
            }
            if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
                keyNode[index] = "[object Object]";
            }
        }
    }
    if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
        keyNode = "[object Object]";
    }
    keyNode = String(keyNode);
    if (result === null) {
        result = {
        };
    }
    if (keyTag === "tag:yaml.org,2002:merge") {
        if (Array.isArray(valueNode)) {
            for(let index = 0, quantity = valueNode.length; index < quantity; index++){
                mergeMappings(state, result, valueNode[index], overridableKeys);
            }
        } else {
            mergeMappings(state, result, valueNode, overridableKeys);
        }
    } else {
        if (!state.json && !_hasOwnProperty2.call(overridableKeys, keyNode) && _hasOwnProperty2.call(result, keyNode)) {
            state.line = startLine || state.line;
            state.position = startPos || state.position;
            return throwError(state, "duplicated mapping key");
        }
        result[keyNode] = valueNode;
        delete overridableKeys[keyNode];
    }
    return result;
}
function readLineBreak(state) {
    const ch = state.input.charCodeAt(state.position);
    if (ch === 10) {
        state.position++;
    } else if (ch === 13) {
        state.position++;
        if (state.input.charCodeAt(state.position) === 10) {
            state.position++;
        }
    } else {
        return throwError(state, "a line break is expected");
    }
    state.line += 1;
    state.lineStart = state.position;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
    let lineBreaks = 0, ch = state.input.charCodeAt(state.position);
    while(ch !== 0){
        while(isWhiteSpace(ch)){
            ch = state.input.charCodeAt(++state.position);
        }
        if (allowComments && ch === 35) {
            do {
                ch = state.input.charCodeAt(++state.position);
            }while (ch !== 10 && ch !== 13 && ch !== 0)
        }
        if (isEOL(ch)) {
            readLineBreak(state);
            ch = state.input.charCodeAt(state.position);
            lineBreaks++;
            state.lineIndent = 0;
            while(ch === 32){
                state.lineIndent++;
                ch = state.input.charCodeAt(++state.position);
            }
        } else {
            break;
        }
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
        throwWarning(state, "deficient indentation");
    }
    return lineBreaks;
}
function testDocumentSeparator(state) {
    let _position = state.position;
    let ch = state.input.charCodeAt(_position);
    if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
        _position += 3;
        ch = state.input.charCodeAt(_position);
        if (ch === 0 || isWsOrEol(ch)) {
            return true;
        }
    }
    return false;
}
function writeFoldedLines(state, count) {
    if (count === 1) {
        state.result += " ";
    } else if (count > 1) {
        state.result += repeat("\n", count - 1);
    }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    const kind = state.kind;
    const result = state.result;
    let ch = state.input.charCodeAt(state.position);
    if (isWsOrEol(ch) || isFlowIndicator(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
        return false;
    }
    let following;
    if (ch === 63 || ch === 45) {
        following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
            return false;
        }
    }
    state.kind = "scalar";
    state.result = "";
    let captureEnd, captureStart = captureEnd = state.position;
    let hasPendingContent = false;
    let line2 = 0;
    while(ch !== 0){
        if (ch === 58) {
            following = state.input.charCodeAt(state.position + 1);
            if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
                break;
            }
        } else if (ch === 35) {
            const preceding = state.input.charCodeAt(state.position - 1);
            if (isWsOrEol(preceding)) {
                break;
            }
        } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && isFlowIndicator(ch)) {
            break;
        } else if (isEOL(ch)) {
            line2 = state.line;
            const lineStart = state.lineStart;
            const lineIndent = state.lineIndent;
            skipSeparationSpace(state, false, -1);
            if (state.lineIndent >= nodeIndent) {
                hasPendingContent = true;
                ch = state.input.charCodeAt(state.position);
                continue;
            } else {
                state.position = captureEnd;
                state.line = line2;
                state.lineStart = lineStart;
                state.lineIndent = lineIndent;
                break;
            }
        }
        if (hasPendingContent) {
            captureSegment(state, captureStart, captureEnd, false);
            writeFoldedLines(state, state.line - line2);
            captureStart = captureEnd = state.position;
            hasPendingContent = false;
        }
        if (!isWhiteSpace(ch)) {
            captureEnd = state.position + 1;
        }
        ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result) {
        return true;
    }
    state.kind = kind;
    state.result = result;
    return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
    let ch, captureStart, captureEnd;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 39) {
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while((ch = state.input.charCodeAt(state.position)) !== 0){
        if (ch === 39) {
            captureSegment(state, captureStart, state.position, true);
            ch = state.input.charCodeAt(++state.position);
            if (ch === 39) {
                captureStart = state.position;
                state.position++;
                captureEnd = state.position;
            } else {
                return true;
            }
        } else if (isEOL(ch)) {
            captureSegment(state, captureStart, captureEnd, true);
            writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
            captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
            return throwError(state, "unexpected end of the document within a single quoted scalar");
        } else {
            state.position++;
            captureEnd = state.position;
        }
    }
    return throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 34) {
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    let captureEnd, captureStart = captureEnd = state.position;
    let tmp;
    while((ch = state.input.charCodeAt(state.position)) !== 0){
        if (ch === 34) {
            captureSegment(state, captureStart, state.position, true);
            state.position++;
            return true;
        }
        if (ch === 92) {
            captureSegment(state, captureStart, state.position, true);
            ch = state.input.charCodeAt(++state.position);
            if (isEOL(ch)) {
                skipSeparationSpace(state, false, nodeIndent);
            } else if (ch < 256 && simpleEscapeCheck[ch]) {
                state.result += simpleEscapeMap[ch];
                state.position++;
            } else if ((tmp = escapedHexLen(ch)) > 0) {
                let hexLength = tmp;
                let hexResult = 0;
                for(; hexLength > 0; hexLength--){
                    ch = state.input.charCodeAt(++state.position);
                    if ((tmp = fromHexCode(ch)) >= 0) {
                        hexResult = (hexResult << 4) + tmp;
                    } else {
                        return throwError(state, "expected hexadecimal character");
                    }
                }
                state.result += charFromCodepoint(hexResult);
                state.position++;
            } else {
                return throwError(state, "unknown escape sequence");
            }
            captureStart = captureEnd = state.position;
        } else if (isEOL(ch)) {
            captureSegment(state, captureStart, captureEnd, true);
            writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
            captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
            return throwError(state, "unexpected end of the document within a double quoted scalar");
        } else {
            state.position++;
            captureEnd = state.position;
        }
    }
    return throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
    let ch = state.input.charCodeAt(state.position);
    let terminator;
    let isMapping = true;
    let result = {
    };
    if (ch === 91) {
        terminator = 93;
        isMapping = false;
        result = [];
    } else if (ch === 123) {
        terminator = 125;
    } else {
        return false;
    }
    if (state.anchor !== null && typeof state.anchor != "undefined" && typeof state.anchorMap != "undefined") {
        state.anchorMap[state.anchor] = result;
    }
    ch = state.input.charCodeAt(++state.position);
    const tag1 = state.tag, anchor = state.anchor;
    let readNext = true;
    let valueNode, keyNode, keyTag = keyNode = valueNode = null, isExplicitPair, isPair = isExplicitPair = false;
    let following = 0, line2 = 0;
    const overridableKeys = {
    };
    while(ch !== 0){
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === terminator) {
            state.position++;
            state.tag = tag1;
            state.anchor = anchor;
            state.kind = isMapping ? "mapping" : "sequence";
            state.result = result;
            return true;
        }
        if (!readNext) {
            return throwError(state, "missed comma between flow collection entries");
        }
        keyTag = keyNode = valueNode = null;
        isPair = isExplicitPair = false;
        if (ch === 63) {
            following = state.input.charCodeAt(state.position + 1);
            if (isWsOrEol(following)) {
                isPair = isExplicitPair = true;
                state.position++;
                skipSeparationSpace(state, true, nodeIndent);
            }
        }
        line2 = state.line;
        composeNode(state, nodeIndent, 1, false, true);
        keyTag = state.tag || null;
        keyNode = state.result;
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if ((isExplicitPair || state.line === line2) && ch === 58) {
            isPair = true;
            ch = state.input.charCodeAt(++state.position);
            skipSeparationSpace(state, true, nodeIndent);
            composeNode(state, nodeIndent, 1, false, true);
            valueNode = state.result;
        }
        if (isMapping) {
            storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode);
        } else if (isPair) {
            result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
        } else {
            result.push(keyNode);
        }
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === 44) {
            readNext = true;
            ch = state.input.charCodeAt(++state.position);
        } else {
            readNext = false;
        }
    }
    return throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
    let chomping = 1, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false;
    let ch = state.input.charCodeAt(state.position);
    let folding = false;
    if (ch === 124) {
        folding = false;
    } else if (ch === 62) {
        folding = true;
    } else {
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    let tmp = 0;
    while(ch !== 0){
        ch = state.input.charCodeAt(++state.position);
        if (ch === 43 || ch === 45) {
            if (1 === chomping) {
                chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
            } else {
                return throwError(state, "repeat of a chomping mode identifier");
            }
        } else if ((tmp = fromDecimalCode(ch)) >= 0) {
            if (tmp === 0) {
                return throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
            } else if (!detectedIndent) {
                textIndent = nodeIndent + tmp - 1;
                detectedIndent = true;
            } else {
                return throwError(state, "repeat of an indentation width identifier");
            }
        } else {
            break;
        }
    }
    if (isWhiteSpace(ch)) {
        do {
            ch = state.input.charCodeAt(++state.position);
        }while (isWhiteSpace(ch))
        if (ch === 35) {
            do {
                ch = state.input.charCodeAt(++state.position);
            }while (!isEOL(ch) && ch !== 0)
        }
    }
    while(ch !== 0){
        readLineBreak(state);
        state.lineIndent = 0;
        ch = state.input.charCodeAt(state.position);
        while((!detectedIndent || state.lineIndent < textIndent) && ch === 32){
            state.lineIndent++;
            ch = state.input.charCodeAt(++state.position);
        }
        if (!detectedIndent && state.lineIndent > textIndent) {
            textIndent = state.lineIndent;
        }
        if (isEOL(ch)) {
            emptyLines++;
            continue;
        }
        if (state.lineIndent < textIndent) {
            if (chomping === 3) {
                state.result += repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
            } else if (chomping === 1) {
                if (didReadContent) {
                    state.result += "\n";
                }
            }
            break;
        }
        if (folding) {
            if (isWhiteSpace(ch)) {
                atMoreIndented = true;
                state.result += repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
            } else if (atMoreIndented) {
                atMoreIndented = false;
                state.result += repeat("\n", emptyLines + 1);
            } else if (emptyLines === 0) {
                if (didReadContent) {
                    state.result += " ";
                }
            } else {
                state.result += repeat("\n", emptyLines);
            }
        } else {
            state.result += repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        }
        didReadContent = true;
        detectedIndent = true;
        emptyLines = 0;
        const captureStart = state.position;
        while(!isEOL(ch) && ch !== 0){
            ch = state.input.charCodeAt(++state.position);
        }
        captureSegment(state, captureStart, state.position, false);
    }
    return true;
}
function readBlockSequence(state, nodeIndent) {
    let line2, following, detected = false, ch;
    const tag1 = state.tag, anchor = state.anchor, result = [];
    if (state.anchor !== null && typeof state.anchor !== "undefined" && typeof state.anchorMap !== "undefined") {
        state.anchorMap[state.anchor] = result;
    }
    ch = state.input.charCodeAt(state.position);
    while(ch !== 0){
        if (ch !== 45) {
            break;
        }
        following = state.input.charCodeAt(state.position + 1);
        if (!isWsOrEol(following)) {
            break;
        }
        detected = true;
        state.position++;
        if (skipSeparationSpace(state, true, -1)) {
            if (state.lineIndent <= nodeIndent) {
                result.push(null);
                ch = state.input.charCodeAt(state.position);
                continue;
            }
        }
        line2 = state.line;
        composeNode(state, nodeIndent, 3, false, true);
        result.push(state.result);
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if ((state.line === line2 || state.lineIndent > nodeIndent) && ch !== 0) {
            return throwError(state, "bad indentation of a sequence entry");
        } else if (state.lineIndent < nodeIndent) {
            break;
        }
    }
    if (detected) {
        state.tag = tag1;
        state.anchor = anchor;
        state.kind = "sequence";
        state.result = result;
        return true;
    }
    return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
    const tag1 = state.tag, anchor = state.anchor, result = {
    }, overridableKeys = {
    };
    let following, allowCompact = false, line2, pos, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
    if (state.anchor !== null && typeof state.anchor !== "undefined" && typeof state.anchorMap !== "undefined") {
        state.anchorMap[state.anchor] = result;
    }
    ch = state.input.charCodeAt(state.position);
    while(ch !== 0){
        following = state.input.charCodeAt(state.position + 1);
        line2 = state.line;
        pos = state.position;
        if ((ch === 63 || ch === 58) && isWsOrEol(following)) {
            if (ch === 63) {
                if (atExplicitKey) {
                    storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                    keyTag = keyNode = valueNode = null;
                }
                detected = true;
                atExplicitKey = true;
                allowCompact = true;
            } else if (atExplicitKey) {
                atExplicitKey = false;
                allowCompact = true;
            } else {
                return throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
            }
            state.position += 1;
            ch = following;
        } else if (composeNode(state, flowIndent, 2, false, true)) {
            if (state.line === line2) {
                ch = state.input.charCodeAt(state.position);
                while(isWhiteSpace(ch)){
                    ch = state.input.charCodeAt(++state.position);
                }
                if (ch === 58) {
                    ch = state.input.charCodeAt(++state.position);
                    if (!isWsOrEol(ch)) {
                        return throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
                    }
                    if (atExplicitKey) {
                        storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                        keyTag = keyNode = valueNode = null;
                    }
                    detected = true;
                    atExplicitKey = false;
                    allowCompact = false;
                    keyTag = state.tag;
                    keyNode = state.result;
                } else if (detected) {
                    return throwError(state, "can not read an implicit mapping pair; a colon is missed");
                } else {
                    state.tag = tag1;
                    state.anchor = anchor;
                    return true;
                }
            } else if (detected) {
                return throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
            } else {
                state.tag = tag1;
                state.anchor = anchor;
                return true;
            }
        } else {
            break;
        }
        if (state.line === line2 || state.lineIndent > nodeIndent) {
            if (composeNode(state, nodeIndent, 4, true, allowCompact)) {
                if (atExplicitKey) {
                    keyNode = state.result;
                } else {
                    valueNode = state.result;
                }
            }
            if (!atExplicitKey) {
                storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, line2, pos);
                keyTag = keyNode = valueNode = null;
            }
            skipSeparationSpace(state, true, -1);
            ch = state.input.charCodeAt(state.position);
        }
        if (state.lineIndent > nodeIndent && ch !== 0) {
            return throwError(state, "bad indentation of a mapping entry");
        } else if (state.lineIndent < nodeIndent) {
            break;
        }
    }
    if (atExplicitKey) {
        storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
    }
    if (detected) {
        state.tag = tag1;
        state.anchor = anchor;
        state.kind = "mapping";
        state.result = result;
    }
    return detected;
}
function readTagProperty(state) {
    let position2, isVerbatim = false, isNamed = false, tagHandle = "", tagName, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 33) return false;
    if (state.tag !== null) {
        return throwError(state, "duplication of a tag property");
    }
    ch = state.input.charCodeAt(++state.position);
    if (ch === 60) {
        isVerbatim = true;
        ch = state.input.charCodeAt(++state.position);
    } else if (ch === 33) {
        isNamed = true;
        tagHandle = "!!";
        ch = state.input.charCodeAt(++state.position);
    } else {
        tagHandle = "!";
    }
    position2 = state.position;
    if (isVerbatim) {
        do {
            ch = state.input.charCodeAt(++state.position);
        }while (ch !== 0 && ch !== 62)
        if (state.position < state.length) {
            tagName = state.input.slice(position2, state.position);
            ch = state.input.charCodeAt(++state.position);
        } else {
            return throwError(state, "unexpected end of the stream within a verbatim tag");
        }
    } else {
        while(ch !== 0 && !isWsOrEol(ch)){
            if (ch === 33) {
                if (!isNamed) {
                    tagHandle = state.input.slice(position2 - 1, state.position + 1);
                    if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                        return throwError(state, "named tag handle cannot contain such characters");
                    }
                    isNamed = true;
                    position2 = state.position + 1;
                } else {
                    return throwError(state, "tag suffix cannot contain exclamation marks");
                }
            }
            ch = state.input.charCodeAt(++state.position);
        }
        tagName = state.input.slice(position2, state.position);
        if (PATTERN_FLOW_INDICATORS.test(tagName)) {
            return throwError(state, "tag suffix cannot contain flow indicator characters");
        }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
        return throwError(state, `tag name cannot contain such characters: ${tagName}`);
    }
    if (isVerbatim) {
        state.tag = tagName;
    } else if (typeof state.tagMap !== "undefined" && _hasOwnProperty2.call(state.tagMap, tagHandle)) {
        state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === "!") {
        state.tag = `!${tagName}`;
    } else if (tagHandle === "!!") {
        state.tag = `tag:yaml.org,2002:${tagName}`;
    } else {
        return throwError(state, `undeclared tag handle "${tagHandle}"`);
    }
    return true;
}
function readAnchorProperty(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 38) return false;
    if (state.anchor !== null) {
        return throwError(state, "duplication of an anchor property");
    }
    ch = state.input.charCodeAt(++state.position);
    const position2 = state.position;
    while(ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)){
        ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === position2) {
        return throwError(state, "name of an anchor node must contain at least one character");
    }
    state.anchor = state.input.slice(position2, state.position);
    return true;
}
function readAlias(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 42) return false;
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while(ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)){
        ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
        return throwError(state, "name of an alias node must contain at least one character");
    }
    const alias = state.input.slice(_position, state.position);
    if (typeof state.anchorMap !== "undefined" && !Object.prototype.hasOwnProperty.call(state.anchorMap, alias)) {
        return throwError(state, `unidentified alias "${alias}"`);
    }
    if (typeof state.anchorMap !== "undefined") {
        state.result = state.anchorMap[alias];
    }
    skipSeparationSpace(state, true, -1);
    return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    let allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, type1, flowIndent, blockIndent;
    if (state.listener && state.listener !== null) {
        state.listener("open", state);
    }
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    const allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
        if (skipSeparationSpace(state, true, -1)) {
            atNewLine = true;
            if (state.lineIndent > parentIndent) {
                indentStatus = 1;
            } else if (state.lineIndent === parentIndent) {
                indentStatus = 0;
            } else if (state.lineIndent < parentIndent) {
                indentStatus = -1;
            }
        }
    }
    if (indentStatus === 1) {
        while(readTagProperty(state) || readAnchorProperty(state)){
            if (skipSeparationSpace(state, true, -1)) {
                atNewLine = true;
                allowBlockCollections = allowBlockStyles;
                if (state.lineIndent > parentIndent) {
                    indentStatus = 1;
                } else if (state.lineIndent === parentIndent) {
                    indentStatus = 0;
                } else if (state.lineIndent < parentIndent) {
                    indentStatus = -1;
                }
            } else {
                allowBlockCollections = false;
            }
        }
    }
    if (allowBlockCollections) {
        allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || 4 === nodeContext) {
        const cond = 1 === nodeContext || 2 === nodeContext;
        flowIndent = cond ? parentIndent : parentIndent + 1;
        blockIndent = state.position - state.lineStart;
        if (indentStatus === 1) {
            if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
                hasContent = true;
            } else {
                if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
                    hasContent = true;
                } else if (readAlias(state)) {
                    hasContent = true;
                    if (state.tag !== null || state.anchor !== null) {
                        return throwError(state, "alias node should not have Any properties");
                    }
                } else if (readPlainScalar(state, flowIndent, 1 === nodeContext)) {
                    hasContent = true;
                    if (state.tag === null) {
                        state.tag = "?";
                    }
                }
                if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                    state.anchorMap[state.anchor] = state.result;
                }
            }
        } else if (indentStatus === 0) {
            hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
        }
    }
    if (state.tag !== null && state.tag !== "!") {
        if (state.tag === "?") {
            for(let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex++){
                type1 = state.implicitTypes[typeIndex];
                if (type1.resolve(state.result)) {
                    state.result = type1.construct(state.result);
                    state.tag = type1.tag;
                    if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                        state.anchorMap[state.anchor] = state.result;
                    }
                    break;
                }
            }
        } else if (_hasOwnProperty2.call(state.typeMap[state.kind || "fallback"], state.tag)) {
            type1 = state.typeMap[state.kind || "fallback"][state.tag];
            if (state.result !== null && type1.kind !== state.kind) {
                return throwError(state, `unacceptable node kind for !<${state.tag}> tag; it should be "${type1.kind}", not "${state.kind}"`);
            }
            if (!type1.resolve(state.result)) {
                return throwError(state, `cannot resolve a node with !<${state.tag}> explicit tag`);
            } else {
                state.result = type1.construct(state.result);
                if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                    state.anchorMap[state.anchor] = state.result;
                }
            }
        } else {
            return throwError(state, `unknown tag !<${state.tag}>`);
        }
    }
    if (state.listener && state.listener !== null) {
        state.listener("close", state);
    }
    return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
    const documentStart = state.position;
    let position2, directiveName, directiveArgs, hasDirectives = false, ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = {
    };
    state.anchorMap = {
    };
    while((ch = state.input.charCodeAt(state.position)) !== 0){
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if (state.lineIndent > 0 || ch !== 37) {
            break;
        }
        hasDirectives = true;
        ch = state.input.charCodeAt(++state.position);
        position2 = state.position;
        while(ch !== 0 && !isWsOrEol(ch)){
            ch = state.input.charCodeAt(++state.position);
        }
        directiveName = state.input.slice(position2, state.position);
        directiveArgs = [];
        if (directiveName.length < 1) {
            return throwError(state, "directive name must not be less than one character in length");
        }
        while(ch !== 0){
            while(isWhiteSpace(ch)){
                ch = state.input.charCodeAt(++state.position);
            }
            if (ch === 35) {
                do {
                    ch = state.input.charCodeAt(++state.position);
                }while (ch !== 0 && !isEOL(ch))
                break;
            }
            if (isEOL(ch)) break;
            position2 = state.position;
            while(ch !== 0 && !isWsOrEol(ch)){
                ch = state.input.charCodeAt(++state.position);
            }
            directiveArgs.push(state.input.slice(position2, state.position));
        }
        if (ch !== 0) readLineBreak(state);
        if (_hasOwnProperty2.call(directiveHandlers, directiveName)) {
            directiveHandlers[directiveName](state, directiveName, ...directiveArgs);
        } else {
            throwWarning(state, `unknown document directive "${directiveName}"`);
        }
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
        return throwError(state, "directives end mark is expected");
    }
    composeNode(state, state.lineIndent - 1, 4, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
        throwWarning(state, "non-ASCII line breaks are interpreted as content");
    }
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
        if (state.input.charCodeAt(state.position) === 46) {
            state.position += 3;
            skipSeparationSpace(state, true, -1);
        }
        return;
    }
    if (state.position < state.length - 1) {
        return throwError(state, "end of the stream or a document separator is expected");
    } else {
        return;
    }
}
function loadDocuments(input1, options1) {
    input1 = String(input1);
    options1 = options1 || {
    };
    if (input1.length !== 0) {
        if (input1.charCodeAt(input1.length - 1) !== 10 && input1.charCodeAt(input1.length - 1) !== 13) {
            input1 += "\n";
        }
        if (input1.charCodeAt(0) === 65279) {
            input1 = input1.slice(1);
        }
    }
    const state = new LoaderState(input1, options1);
    state.input += "\0";
    while(state.input.charCodeAt(state.position) === 32){
        state.lineIndent += 1;
        state.position += 1;
    }
    while(state.position < state.length - 1){
        readDocument(state);
    }
    return state.documents;
}
function isCbFunction(fn) {
    return typeof fn === "function";
}
function loadAll(input1, iteratorOrOption, options1) {
    if (!isCbFunction(iteratorOrOption)) {
        return loadDocuments(input1, iteratorOrOption);
    }
    const documents = loadDocuments(input1, options1);
    const iterator = iteratorOrOption;
    for(let index = 0, length = documents.length; index < length; index++){
        iterator(documents[index]);
    }
    return void 0;
}
function load(input1, options1) {
    const documents = loadDocuments(input1, options1);
    if (documents.length === 0) {
        return;
    }
    if (documents.length === 1) {
        return documents[0];
    }
    throw new YAMLError("expected a single document in the stream, but found more");
}
function parse3(content, options1) {
    return load(content, options1);
}
function parseAll(content, iterator, options1) {
    return loadAll(content, iterator, options1);
}
const _hasOwnProperty3 = Object.prototype.hasOwnProperty;
function compileStyleMap(schema2, map1) {
    if (typeof map1 === "undefined" || map1 === null) return {
    };
    let type1;
    const result = {
    };
    const keys = Object.keys(map1);
    let tag1, style;
    for(let index = 0, length = keys.length; index < length; index += 1){
        tag1 = keys[index];
        style = String(map1[tag1]);
        if (tag1.slice(0, 2) === "!!") {
            tag1 = `tag:yaml.org,2002:${tag1.slice(2)}`;
        }
        type1 = schema2.compiledTypeMap.fallback[tag1];
        if (type1 && typeof type1.styleAliases !== "undefined" && _hasOwnProperty3.call(type1.styleAliases, style)) {
            style = type1.styleAliases[style];
        }
        result[tag1] = style;
    }
    return result;
}
class DumperState extends State {
    tag = null;
    result = "";
    duplicates = [];
    usedDuplicates = [];
    constructor({ schema: schema2 , indent =2 , noArrayIndent =false , skipInvalid =false , flowLevel =-1 , styles =null , sortKeys =false , lineWidth =80 , noRefs =false , noCompatMode =false , condenseFlow =false  }){
        super(schema2);
        this.indent = Math.max(1, indent);
        this.noArrayIndent = noArrayIndent;
        this.skipInvalid = skipInvalid;
        this.flowLevel = flowLevel;
        this.styleMap = compileStyleMap(this.schema, styles);
        this.sortKeys = sortKeys;
        this.lineWidth = lineWidth;
        this.noRefs = noRefs;
        this.noCompatMode = noCompatMode;
        this.condenseFlow = condenseFlow;
        this.implicitTypes = this.schema.compiledImplicit;
        this.explicitTypes = this.schema.compiledExplicit;
    }
}
const _toString2 = Object.prototype.toString;
const _hasOwnProperty4 = Object.prototype.hasOwnProperty;
const ESCAPE_SEQUENCES = {
};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
const DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF", 
];
function encodeHex(character) {
    const string = character.toString(16).toUpperCase();
    let handle;
    let length;
    if (character <= 255) {
        handle = "x";
        length = 2;
    } else if (character <= 65535) {
        handle = "u";
        length = 4;
    } else if (character <= 4294967295) {
        handle = "U";
        length = 8;
    } else {
        throw new YAMLError("code point within a string may not be greater than 0xFFFFFFFF");
    }
    return `\\${handle}${repeat("0", length - string.length)}${string}`;
}
function indentString(string, spaces) {
    const ind = repeat(" ", spaces), length = string.length;
    let position2 = 0, next = -1, result = "", line2;
    while(position2 < length){
        next = string.indexOf("\n", position2);
        if (next === -1) {
            line2 = string.slice(position2);
            position2 = length;
        } else {
            line2 = string.slice(position2, next + 1);
            position2 = next + 1;
        }
        if (line2.length && line2 !== "\n") result += ind;
        result += line2;
    }
    return result;
}
function generateNextLine(state, level) {
    return `\n${repeat(" ", state.indent * level)}`;
}
function testImplicitResolving(state, str2) {
    let type1;
    for(let index = 0, length = state.implicitTypes.length; index < length; index += 1){
        type1 = state.implicitTypes[index];
        if (type1.resolve(str2)) {
            return true;
        }
    }
    return false;
}
function isWhitespace(c) {
    return c === 32 || c === 9;
}
function isPrintable(c) {
    return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== 65279 || 65536 <= c && c <= 1114111;
}
function isPlainSafe(c) {
    return isPrintable(c) && c !== 65279 && c !== 44 && c !== 91 && c !== 93 && c !== 123 && c !== 125 && c !== 58 && c !== 35;
}
function isPlainSafeFirst(c) {
    return isPrintable(c) && c !== 65279 && !isWhitespace(c) && c !== 45 && c !== 63 && c !== 58 && c !== 44 && c !== 91 && c !== 93 && c !== 123 && c !== 125 && c !== 35 && c !== 38 && c !== 42 && c !== 33 && c !== 124 && c !== 62 && c !== 39 && c !== 34 && c !== 37 && c !== 64 && c !== 96;
}
function needIndentIndicator(string) {
    const leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
}
const STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth1, testAmbiguousType) {
    const shouldTrackWidth = lineWidth1 !== -1;
    let hasLineBreak = false, hasFoldableLine = false, previousLineBreak = -1, plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
    let __char, i2;
    if (singleLineOnly) {
        for(i2 = 0; i2 < string.length; i2++){
            __char = string.charCodeAt(i2);
            if (!isPrintable(__char)) {
                return 5;
            }
            plain = plain && isPlainSafe(__char);
        }
    } else {
        for(i2 = 0; i2 < string.length; i2++){
            __char = string.charCodeAt(i2);
            if (__char === 10) {
                hasLineBreak = true;
                if (shouldTrackWidth) {
                    hasFoldableLine = hasFoldableLine || i2 - previousLineBreak - 1 > lineWidth1 && string[previousLineBreak + 1] !== " ";
                    previousLineBreak = i2;
                }
            } else if (!isPrintable(__char)) {
                return 5;
            }
            plain = plain && isPlainSafe(__char);
        }
        hasFoldableLine = hasFoldableLine || shouldTrackWidth && i2 - previousLineBreak - 1 > lineWidth1 && string[previousLineBreak + 1] !== " ";
    }
    if (!hasLineBreak && !hasFoldableLine) {
        return plain && !testAmbiguousType(string) ? 1 : 2;
    }
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
        return 5;
    }
    return hasFoldableLine ? 4 : 3;
}
function foldLine(line2, width) {
    if (line2 === "" || line2[0] === " ") return line2;
    const breakRe = / [^ ]/g;
    let match;
    let start = 0, end, curr = 0, next = 0;
    let result = "";
    while(match = breakRe.exec(line2)){
        next = match.index;
        if (next - start > width) {
            end = curr > start ? curr : next;
            result += `\n${line2.slice(start, end)}`;
            start = end + 1;
        }
        curr = next;
    }
    result += "\n";
    if (line2.length - start > width && curr > start) {
        result += `${line2.slice(start, curr)}\n${line2.slice(curr + 1)}`;
    } else {
        result += line2.slice(start);
    }
    return result.slice(1);
}
function dropEndingNewline(string) {
    return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
    const lineRe = /(\n+)([^\n]*)/g;
    let result = (()=>{
        let nextLF = string.indexOf("\n");
        nextLF = nextLF !== -1 ? nextLF : string.length;
        lineRe.lastIndex = nextLF;
        return foldLine(string.slice(0, nextLF), width);
    })();
    let prevMoreIndented = string[0] === "\n" || string[0] === " ";
    let moreIndented;
    let match;
    while(match = lineRe.exec(string)){
        const prefix = match[1], line2 = match[2];
        moreIndented = line2[0] === " ";
        result += prefix + (!prevMoreIndented && !moreIndented && line2 !== "" ? "\n" : "") + foldLine(line2, width);
        prevMoreIndented = moreIndented;
    }
    return result;
}
function escapeString(string) {
    let result = "";
    let __char, nextChar;
    let escapeSeq;
    for(let i2 = 0; i2 < string.length; i2++){
        __char = string.charCodeAt(i2);
        if (__char >= 55296 && __char <= 56319) {
            nextChar = string.charCodeAt(i2 + 1);
            if (nextChar >= 56320 && nextChar <= 57343) {
                result += encodeHex((__char - 55296) * 1024 + nextChar - 56320 + 65536);
                i2++;
                continue;
            }
        }
        escapeSeq = ESCAPE_SEQUENCES[__char];
        result += !escapeSeq && isPrintable(__char) ? string[i2] : escapeSeq || encodeHex(__char);
    }
    return result;
}
function blockHeader(string, indentPerLevel) {
    const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
    const clip = string[string.length - 1] === "\n";
    const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
    const chomp = keep ? "+" : clip ? "" : "-";
    return `${indentIndicator}${chomp}\n`;
}
function writeScalar(state, string, level, iskey) {
    state.dump = (()=>{
        if (string.length === 0) {
            return "''";
        }
        if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
            return `'${string}'`;
        }
        const indent1 = state.indent * Math.max(1, level);
        const lineWidth1 = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent1);
        const singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
        function testAmbiguity(str2) {
            return testImplicitResolving(state, str2);
        }
        switch(chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth1, testAmbiguity)){
            case STYLE_PLAIN:
                return string;
            case STYLE_SINGLE:
                return `'${string.replace(/'/g, "''")}'`;
            case STYLE_LITERAL:
                return `|${blockHeader(string, state.indent)}${dropEndingNewline(indentString(string, indent1))}`;
            case STYLE_FOLDED:
                return `>${blockHeader(string, state.indent)}${dropEndingNewline(indentString(foldString(string, lineWidth1), indent1))}`;
            case STYLE_DOUBLE:
                return `"${escapeString(string)}"`;
            default:
                throw new YAMLError("impossible error: invalid scalar style");
        }
    })();
}
function writeFlowSequence(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    for(let index = 0, length = object.length; index < length; index += 1){
        if (writeNode(state, level, object[index], false, false)) {
            if (index !== 0) _result += `,${!state.condenseFlow ? " " : ""}`;
            _result += state.dump;
        }
    }
    state.tag = _tag;
    state.dump = `[${_result}]`;
}
function writeBlockSequence(state, level, object, compact = false) {
    let _result = "";
    const _tag = state.tag;
    for(let index = 0, length = object.length; index < length; index += 1){
        if (writeNode(state, level + 1, object[index], true, true)) {
            if (!compact || index !== 0) {
                _result += generateNextLine(state, level);
            }
            if (state.dump && 10 === state.dump.charCodeAt(0)) {
                _result += "-";
            } else {
                _result += "- ";
            }
            _result += state.dump;
        }
    }
    state.tag = _tag;
    state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
    let _result = "";
    const _tag = state.tag, objectKeyList = Object.keys(object);
    let pairBuffer, objectKey, objectValue;
    for(let index = 0, length = objectKeyList.length; index < length; index += 1){
        pairBuffer = state.condenseFlow ? '"' : "";
        if (index !== 0) pairBuffer += ", ";
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level, objectKey, false, false)) {
            continue;
        }
        if (state.dump.length > 1024) pairBuffer += "? ";
        pairBuffer += `${state.dump}${state.condenseFlow ? '"' : ""}:${state.condenseFlow ? "" : " "}`;
        if (!writeNode(state, level, objectValue, false, false)) {
            continue;
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = `{${_result}}`;
}
function writeBlockMapping(state, level, object, compact = false) {
    const _tag = state.tag, objectKeyList = Object.keys(object);
    let _result = "";
    if (state.sortKeys === true) {
        objectKeyList.sort();
    } else if (typeof state.sortKeys === "function") {
        objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
        throw new YAMLError("sortKeys must be a boolean or a function");
    }
    let pairBuffer = "", objectKey, objectValue, explicitPair;
    for(let index = 0, length = objectKeyList.length; index < length; index += 1){
        pairBuffer = "";
        if (!compact || index !== 0) {
            pairBuffer += generateNextLine(state, level);
        }
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level + 1, objectKey, true, true, true)) {
            continue;
        }
        explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
        if (explicitPair) {
            if (state.dump && 10 === state.dump.charCodeAt(0)) {
                pairBuffer += "?";
            } else {
                pairBuffer += "? ";
            }
        }
        pairBuffer += state.dump;
        if (explicitPair) {
            pairBuffer += generateNextLine(state, level);
        }
        if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
            continue;
        }
        if (state.dump && 10 === state.dump.charCodeAt(0)) {
            pairBuffer += ":";
        } else {
            pairBuffer += ": ";
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}";
}
function detectType(state, object, explicit = false) {
    const typeList = explicit ? state.explicitTypes : state.implicitTypes;
    let type1;
    let style;
    let _result;
    for(let index = 0, length = typeList.length; index < length; index += 1){
        type1 = typeList[index];
        if ((type1.instanceOf || type1.predicate) && (!type1.instanceOf || typeof object === "object" && object instanceof type1.instanceOf) && (!type1.predicate || type1.predicate(object))) {
            state.tag = explicit ? type1.tag : "?";
            if (type1.represent) {
                style = state.styleMap[type1.tag] || type1.defaultStyle;
                if (_toString2.call(type1.represent) === "[object Function]") {
                    _result = type1.represent(object, style);
                } else if (_hasOwnProperty4.call(type1.represent, style)) {
                    _result = type1.represent[style](object, style);
                } else {
                    throw new YAMLError(`!<${type1.tag}> tag resolver accepts not "${style}" style`);
                }
                state.dump = _result;
            }
            return true;
        }
    }
    return false;
}
function writeNode(state, level, object, block, compact, iskey = false) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
        detectType(state, object, true);
    }
    const type1 = _toString2.call(state.dump);
    if (block) {
        block = state.flowLevel < 0 || state.flowLevel > level;
    }
    const objectOrArray = type1 === "[object Object]" || type1 === "[object Array]";
    let duplicateIndex = -1;
    let duplicate = false;
    if (objectOrArray) {
        duplicateIndex = state.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
        compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
        state.dump = `*ref_${duplicateIndex}`;
    } else {
        if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
            state.usedDuplicates[duplicateIndex] = true;
        }
        if (type1 === "[object Object]") {
            if (block && Object.keys(state.dump).length !== 0) {
                writeBlockMapping(state, level, state.dump, compact);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex}${state.dump}`;
                }
            } else {
                writeFlowMapping(state, level, state.dump);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                }
            }
        } else if (type1 === "[object Array]") {
            const arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
            if (block && state.dump.length !== 0) {
                writeBlockSequence(state, arrayLevel, state.dump, compact);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex}${state.dump}`;
                }
            } else {
                writeFlowSequence(state, arrayLevel, state.dump);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                }
            }
        } else if (type1 === "[object String]") {
            if (state.tag !== "?") {
                writeScalar(state, state.dump, level, iskey);
            }
        } else {
            if (state.skipInvalid) return false;
            throw new YAMLError(`unacceptable kind of an object to dump ${type1}`);
        }
        if (state.tag !== null && state.tag !== "?") {
            state.dump = `!<${state.tag}> ${state.dump}`;
        }
    }
    return true;
}
function inspectNode(object, objects, duplicatesIndexes) {
    if (object !== null && typeof object === "object") {
        const index = objects.indexOf(object);
        if (index !== -1) {
            if (duplicatesIndexes.indexOf(index) === -1) {
                duplicatesIndexes.push(index);
            }
        } else {
            objects.push(object);
            if (Array.isArray(object)) {
                for(let idx = 0, length = object.length; idx < length; idx += 1){
                    inspectNode(object[idx], objects, duplicatesIndexes);
                }
            } else {
                const objectKeyList = Object.keys(object);
                for(let idx = 0, length = objectKeyList.length; idx < length; idx += 1){
                    inspectNode(object[objectKeyList[idx]], objects, duplicatesIndexes);
                }
            }
        }
    }
}
function getDuplicateReferences(object, state) {
    const objects = [], duplicatesIndexes = [];
    inspectNode(object, objects, duplicatesIndexes);
    const length = duplicatesIndexes.length;
    for(let index = 0; index < length; index += 1){
        state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
}
function dump(input1, options1) {
    options1 = options1 || {
    };
    const state = new DumperState(options1);
    if (!state.noRefs) getDuplicateReferences(input1, state);
    if (writeNode(state, 0, input1, true, true)) return `${state.dump}\n`;
    return "";
}
function stringify(obj, options1) {
    return dump(obj, options1);
}
const mod3 = function() {
    return {
        parse: parse3,
        parseAll: parseAll,
        stringify: stringify,
        CORE_SCHEMA: core,
        DEFAULT_SCHEMA: def,
        FAILSAFE_SCHEMA: failsafe,
        JSON_SCHEMA: json
    };
}();
class DefinitionProvider1 extends Utils {
    mapData = new Map();
    saveDataOfComponent(component, ctx) {
        try {
            const { value  } = ctx;
            const data = mod3.parse(value);
            this.mapData.set(component.uuid, {
                data
            });
        } catch (err) {
            this.error(`DefinitionProvider: ${err.message}\n${err.stack}`);
        }
    }
    async setDataToComponentFromFile(component) {
        try {
            const proto = component.elements.proto[0];
            let defData;
            const item = this.mapData.get(component.uuid);
            if (proto && "def" in proto.attributes) {
                if (component.isTyped) {
                    const position2 = MapPosition.mapNodes.get(proto);
                    this.error(`${component.file}:${position2.line}:${position2.column} \n\tcan't use def attribute with a component using declare modifier.`);
                }
                const defPath = proto.attributes.def.trim();
                const relativePath = join2(component.file, defPath);
                const remoteRelativePath = absolute1(component.file, defPath);
                const isAbsoluteRemote = [
                    "http",
                    "ws",
                    "https",
                    "ftp"
                ].includes(defPath.split("://")[0]);
                if (!defPath.endsWith(".yml") && !defPath.endsWith(".yaml")) {
                    this.error(`definition files require YAML extensions.\ncomponent: ${component.file}\ninput: ${defPath}`);
                }
                if (isAbsoluteRemote) {
                    const def1 = await fetchRemoteRessource(defPath);
                    if (!def1) {
                        this.error(`definition file ${defPath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`);
                    } else {
                        defData = mod3.parse(def1, {
                        });
                    }
                } else if (!!component.remote) {
                    const def1 = await fetchRemoteRessource(remoteRelativePath);
                    if (!def1) {
                        this.error(`definition file ${remoteRelativePath} is not reachable. \ncomponent: ${component.file}\ninput: ${defPath}`);
                    } else {
                        defData = mod3.parse(def1, {
                        });
                    }
                } else if (existsSync(defPath)) {
                    if (Deno.build.os !== "windows") {
                        Deno.chmodSync(defPath, 511);
                    }
                    const def1 = Deno.readTextFileSync(defPath);
                    defData = mod3.parse(def1, {
                    });
                } else if (!component.remote && existsSync(relativePath)) {
                    if (Deno.build.os !== "windows") {
                        Deno.chmodSync(relativePath, 511);
                    }
                    const def1 = Deno.readTextFileSync(relativePath);
                    defData = mod3.parse(def1, {
                    });
                } else {
                    const position2 = MapPosition.mapNodes.get(proto);
                    this.error(`${component.file}:${position2.line}:${position2.column}\n\tcan't find the definition file: ${defPath}`);
                }
            }
            if (defData) {
                const position2 = MapPosition.mapNodes.get(proto);
                switch(true){
                    case item && Array.isArray(defData) && !Array.isArray(item.data):
                        this.error(`${component.file}:${position2.line}:${position2.column}\n\t${proto.attributes.def} doesn't match def type of ${component.file}`);
                        break;
                    case item && !Array.isArray(defData) && Array.isArray(item.data):
                        this.error(`${component.file}:${position2.line}:${position2.column}\n\t${proto.attributes.def} doesn't match def type of ${component.file}`);
                        break;
                    case item && Array.isArray(defData) && Array.isArray(item.data):
                        if (item) {
                            component.data = [
                                ...item.data,
                                ...defData, 
                            ];
                        }
                        break;
                    case item && defData:
                        if (item && defData) {
                            component.data = {
                                ...item.data,
                                ...defData
                            };
                        }
                        break;
                    default:
                        component.data = defData;
                }
            } else if (item) {
                component.data = item.data;
            }
            this.saveContextToComponent(component);
        } catch (err) {
            this.error(`DefinitionProvider: ${err.message}\n${err.stack}`);
        }
    }
    saveContextToComponent(component) {
        try {
            component.context.data = component.data instanceof Object && !Array.isArray(component.data) ? Object.keys(component.data).map((key)=>{
                return `const ${key} = this.${key};`;
            }).join('\n') : '';
        } catch (err) {
            this.error(`DefinitionProvider: ${err.message}\n${err.stack}`);
        }
    }
    transformInheritedProperties(component) {
        try {
            this.trace('Inherit statements on def modifier.');
            const keys = Object.keys(component.data);
            const inheritRegExp = /^(inherit\s+)([^\s]+)+$/;
            keys.filter((key)=>{
                return inheritRegExp.test(key);
            }).forEach((key)=>{
                const property = key.replace(inheritRegExp, '$2');
                component.data[property] = component.data[key];
                component.requirements = component.requirements || [];
                component.requirements.push([
                    property,
                    'unknown'
                ]);
                this.trace(`${property} inherited. transformation of ${key}`);
                delete component.data[key];
            });
            this.trace('Inherit statements on def modifier done.');
        } catch (err) {
            this.error(`DefinitionProvider: ${err.message}\n${err.stack}`);
        }
    }
}
function translateReflection({ body , identifier , isBlock  }) {
    const cases = [];
    const getPropertyRegExpGI = /(this\.)([\w\.]*)+/gi;
    const getPropertyRegExp = /(this\.)([\w\.]*)+/;
    const a = body.match(getPropertyRegExpGI);
    const b = identifier.match(getPropertyRegExpGI);
    const array = [
        ...a ? a : [],
        ...b ? b : []
    ];
    const n = identifier.replace(/^(\.)/, '').replace(/^(.*?)(\[)(.*?)(\])(.*?)$/, "$1");
    if (array.length) {
        array.forEach((thisExpression)=>{
            const m = thisExpression.match(getPropertyRegExp);
            if (m) {
                const [input1, keywordThis, property] = m;
                const key = `'update:${property.replace(/^(\.)/, "")}'`;
                if (!cases.includes(key)) {
                    cases.push(key);
                }
            }
        });
        return (isBlock ? `\n        if ([${cases}].includes(_state as any) || _state === 0) {\n          ___("${n}", this, this${identifier} = (() => ${body})());\n        }` : `if ([${cases}].includes(_state as any) || _state === 0) {\n        ___("${n}", this, this${identifier} = ${body});\n        }`).trim();
    } else {
        return `\n      if (_state === 0) {\n        ___("${n}", this, this${identifier} = (() => ${body})());\n      }`;
    }
}
const items = [
    {
        name: "reflection",
        open: false,
        reg: /(this)\s*(.+?)\s*(=>)\s*(\d+_block)/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches || !typedExpressions) {
                throw new Error("typedExpressions or expressions or matches are missing");
            }
            const id = `<${__default1.next().value}reflection>`;
            const [input1, keywordThis, identifier, arrow, fnbody] = matches;
            let translate = fnbody;
            let translateIdentifier = identifier;
            function template() {
                translate = getDeepTranslation1(translate, expressions);
                translateIdentifier = getDeepTranslation1(translateIdentifier, expressions);
            }
            template();
            translate = translateReflection({
                body: translate,
                identifier: translateIdentifier,
                isBlock: true
            });
            template();
            typedExpressions.reflections.push(translate);
            return "";
        },
        close: false
    },
    {
        name: "reflection",
        open: false,
        reg: /(this)\s*(.+?)\s*(=>)(.*?)(?:§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches || !typedExpressions) {
                throw new Error("typedExpressions or expressions or matches are missing");
            }
            const id = `<${__default1.next().value}reflection>`;
            const [input1, keywordThis, identifier, arrow, fnbody] = matches;
            if (expressions) expressions[id] = value;
            if (fnbody) {
                let translate = fnbody.replace(/;/gi, "");
                let translateIdentifier = identifier;
                function template() {
                    translate = getDeepTranslation1(translate, expressions);
                    translateIdentifier = getDeepTranslation1(translateIdentifier, expressions);
                }
                template();
                translate = translateReflection({
                    body: translate,
                    identifier: translateIdentifier
                });
                template();
                typedExpressions.reflections.push(translate);
            }
            return "";
        },
        close: false
    },
    {
        name: "reflection",
        open: false,
        reg: /(this)\s*(.+?)\s*(=>)\s*([^\s]+)+/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const UpsupportedReflectionSyntax = new Error(`[Ogone] Unsupported syntax of reflection.\n${value}\nnot supported in this version of Ogone\n      `);
            return "";
        },
        close: false
    }, 
];
class ProtocolBodyConstructor1 extends Utils {
    setBeforeEachContext(component, ctx) {
        try {
            if (ctx.token === 'before-each') {
                component.modifiers.beforeEach = ctx.value;
            }
        } catch (err) {
            this.error(`ProtocolBodyConstructor: ${err.message}\n${err.stack}`);
        }
    }
    setComputeContext(component, ctx) {
        try {
            if (ctx.token === 'compute') {
                const expressions = {
                };
                const typedExpressions = __default();
                __default2({
                    array: nullish.concat(tokens).concat(items),
                    value: ctx.value,
                    typedExpressions,
                    expressions
                });
                component.modifiers.compute = typedExpressions.reflections.join('\n');
            }
        } catch (err) {
            this.error(`ProtocolBodyConstructor: ${err.message}\n${err.stack}`);
        }
    }
    setCaseContext(component, ctx) {
        try {
            if (ctx.token === 'case') {
                component.modifiers.cases.push(ctx);
            }
        } catch (err) {
            this.error(`ProtocolBodyConstructor: ${err.message}\n${err.stack}`);
        }
    }
}
const computed = [
    {
        open: false,
        reg: /\n+\s*(\&|\+|\<|\>|\||\=|\?|\:|\.)+/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!matches) return '';
            const [, sign] = matches;
            const id = `${__default1.next().value}_sign ${sign} `;
            if (expressions) expressions[id] = value;
            return `${sign}`;
        },
        close: false
    },
    {
        open: false,
        reg: /(\&|\+|(?!\d+_\w+)|(?<!\d+_\w+)|\||\=|\?|\:|\.)+\s*\n+/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!matches) return '';
            const [, sign] = matches;
            const id = `${__default1.next().value}_sign ${sign} `;
            if (expressions) expressions[id] = value;
            return id;
        },
        close: false
    }, 
];
class ProtocolReactivity1 extends Utils {
    expressions = {
    };
    getReactivity({ text , reactWith ='___'  }) {
        try {
            let result = '';
            this.reactWith = reactWith;
            this.typedExpressions = __default();
            this.expressions = {
            };
            result = __default2({
                typedExpressions: this.typedExpressions,
                expressions: this.expressions,
                value: text,
                array: nullish.concat(tokens)
            });
            result = this.renderInvalidations(result);
            Object.entries(this.typedExpressions.blocks).forEach(([key, value])=>{
                if (this.typedExpressions) {
                    const result2 = this.renderInvalidations(value);
                    this.typedExpressions.blocks[key] = result2;
                    this.expressions[key] = result2;
                }
            });
            Object.entries(this.typedExpressions.parentheses).forEach(([key, value])=>{
                if (this.typedExpressions) {
                    const result2 = this.renderInvalidations(value);
                    this.typedExpressions.parentheses[key] = result2;
                    this.expressions[key] = result2;
                }
            });
            return getDeepTranslation1(result, this.expressions);
        } catch (err) {
            this.error(`ProtoolReactivity: ${err.message}\n${err.stack}`);
        }
    }
    renderInvalidations(text) {
        try {
            let result = __default2({
                value: text,
                array: computed,
                typedExpressions: this.typedExpressions,
                expressions: this.expressions
            });
            const invalidatationRegExp = /(?<!\/\*ogone-skip\*\/)(\bthis\.)(.+?\b)(.*?)(\s*=\s*)(?!\>|\<)(.+?)(\n|;|\)$|$)/gi;
            const invalidatationShortOperationRegExp = /(?<!\/\*ogone-skip\*\/)(\bthis\.)(.+?\b)(.*?)([\+\-\*]+)(\n|;|\)$|$)/gi;
            const arrayModifier = /(?<!\/\*ogone-skip\*\/)(\bthis\.)(.+?\b)(([^;\{\}]*?)\.\s*(?:push|splice|pop|reverse|fill|copyWithin|shift|unshift|sort|set)(?:\d+_parenthese))+/gi;
            result = result.replace(invalidatationShortOperationRegExp, `${this.reactWith || '___'}("$2", this,\n/*ogone-skip*/$1$2$3$4\n)$5`);
            result = result.replace(invalidatationRegExp, `${this.reactWith || '___'}("$2", this,\n/*ogone-skip*/$1$2$3$4$5\n)$6`);
            result = result.replace(arrayModifier, `${this.reactWith || '___'}("$2", this, /*ogone-skip*/$&)`);
            return result;
        } catch (err) {
            this.error(`ProtoolReactivity: ${err.message}\n${err.stack}`);
        }
    }
}
var Context;
(function(Context1) {
    Context1["CASE_GATE"] = `\n    // @ts-ignore\n  if (typeof _state === "string" && ![{% declaredCases %}].includes(_state)) {\n    return;\n  }`;
    Context1["TEMPLATE_COMPONENT_RUNTIME"] = `({% async %} function ({% protocolAmbientType %} _state: _state, ctx: ctx, event: event, _once: number = 0) {\n    try {\n      {% body %}\n    } catch(err) {\n      // @ts-ignore\n      displayError('Error in the component: \\n\\t {% file %}' ,err.message, err);\n      throw err;\n    }\n  });`;
    Context1["TEMPLATE_COMPONENT_RUNTIME_BODY"] = `\n    {% beforeEach %}\n    {% reflections %}\n    {% caseGate %}\n    switch(_state) { {% switchBody %} }`;
    Context1["TEMPLATE_COMPONENT_RUNTIME_PROTOCOL"] = `{% async %} runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {\n    try {\n      {% body %}\n    } catch(err) {\n      // @ts-ignore\n      displayError('Error in the component: \\n\\t {% file %}' ,err.message, err);\n      throw err;\n    }\n  }`;
    Context1["TEMPLATE_COMPONENT_RUNTIME_PROTOCOL_AS_FUNCTION"] = `{% async %} function runtime (_state: string | number, ctx: any, event: any, _once: number = 0) {\n    try {\n      {% modules %}\n      {% body %}\n    } catch(err) {\n      // @ts-ignore\n      displayError('Error in the component: \\n\\t {% file %}' ,err.message, err);\n      throw err;\n    }\n  }`;
})(Context || (Context = {
}));
const members = [
    {
        reg: /\bOgone\b/,
        start: "\ndeclare interface OgoneInterface {",
        children: [
            {
                reg: /\bOgone.error\b/,
                value: `readonly error(\n          title: string,\n          description: string,\n          error: Error | TypeError | SyntaxError | { message: string },\n        ): void;`
            },
            {
                reg: /\bOgone.stores\b/,
                value: "readonly stores: { [k: string]: { [k: string]: any } };"
            },
            {
                reg: /\bOgone.require\b/,
                value: "readonly require: { [k: string]: any };"
            },
            {
                reg: /\bOgone.clients\b/,
                value: `readonly clients: [\n          string,\n          (namespace: string, dependency: string, overwrite?: boolean) => any,\n        ][];`
            },
            {
                reg: /\bOgone.render\b/,
                value: `readonly render: { [k: string]: Function };`
            },
            {
                reg: /\bOgone.contexts\b/,
                value: `readonly contexts: { [k: string]: Function };`
            },
            {
                reg: /\bOgone.components\b/,
                value: `readonly components: { [k: string]: Function };`
            },
            {
                reg: /\bOgone.classes\b/,
                value: `readonly classes: { [k: string]: any };`
            },
            {
                reg: /\bOgone.errorPanel\b/,
                value: `readonly errorPanel: any;`
            },
            {
                reg: /\bOgone.warnPanel\b/,
                value: `readonly warnPanel: any;`
            },
            {
                reg: /\bOgone.successPanel\b/,
                value: `readonly successPanel: any;`
            },
            {
                reg: /\bOgone.infosPanel\b/,
                value: `readonly infosPanel: any;`
            },
            {
                reg: /\bOgone.historyError\b/,
                value: `readonly historyError: any;`
            },
            {
                reg: /\bOgone.errors\b/,
                value: `readonly errors: number;`
            },
            {
                reg: /\bOgone.firstErrorPerf\b/,
                value: `readonly firstErrorPerf: any;`
            },
            {
                reg: /\bOgone.router\./,
                value: `readonly router: RouterBrowser;`
            },
            {
                reg: /\bOgone.DevTool\b/,
                value: `readonly DevTool: any | undefined;`
            },
            {
                reg: /\bOgone.ComponentCollectionManager\b/,
                value: `readonly ComponentCollectionManager: any | undefined;`
            }, 
        ],
        end: `};\n    declare var Ogone: OgoneInterface;\n    `
    },
    {
        reg: /\bOComponent\b/,
        value: "\ndeclare function OComponent(): any;"
    },
    {
        reg: /\b(RouterBrowser|Ogone.router)\b/,
        start: "\ndeclare interface RouterBrowser {",
        children: [
            {
                reg: /\b(Ogone.router.react)\b/,
                value: "react: Function[];"
            },
            {
                reg: /\b(Ogone.router.actualRoute)\b/,
                value: "actualRoute: null | string;"
            },
            {
                reg: /\b(Ogone.router.go)\b/,
                value: "go: (url: string, state?: any) => void;"
            },
            {
                reg: /\b(Ogone.router.openDevTool)\b/,
                value: "openDevTool: (opts: any) => void;"
            }, 
        ],
        end: "}"
    },
    {
        reg: /\bAsync\b/,
        start: "\ndeclare namespace Async {",
        children: [
            {
                reg: /\bAsync.resolve\b/,
                value: "export function resolve(): void;"
            }, 
        ],
        end: "}"
    },
    {
        reg: /\bStore\b/,
        start: "\ndeclare abstract class Store {",
        children: [
            {
                reg: /\bdispatch\b/,
                value: "public static dispatch(ns: string, ctx?: any): any"
            },
            {
                reg: /\bcommit\b/,
                value: "public static commit(ns: string, ctx?: any): any;"
            },
            {
                reg: /\bget\b/,
                value: "public static get(ns: string): any;"
            }, 
        ],
        end: "}"
    },
    {
        reg: /\bControllers\b/,
        value: `\n    declare const Controllers: { [k: string]: Controller; };\n    declare interface Controller {\n      get(rte: string): Promise<any>;\n      post(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;\n      put(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;\n      patch(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;\n      delete(rte: string, data: { [k: string]: any }, op: { [k: string]: any }): Promise<any>;\n    };\n    `
    },
    {
        reg: /\bRefs\b/,
        value: `\n    declare const Refs: {\n      [k: string]: HTMLElement[];\n    };`
    },
    {
        reg: /\b___\b/,
        value: "\ndeclare function ___(key: string, ctx: { [k: string]: any }, value?: any): void;"
    }, 
];
const __default3 = (text)=>{
    let result = "";
    function recursive(items1) {
        items1.forEach((rule)=>{
            if (!rule.reg.test(text)) return;
            if (rule.value) result += rule.value;
            if (rule.start) result += rule.start;
            if (rule.children) recursive(rule.children);
            if (rule.end) result += rule.end;
        });
    }
    recursive(members);
    return result;
};
var Protocol;
(function(Protocol1) {
    Protocol1["PROTOCOL_TEMPLATE"] = `\n    class Protocol {\n      {% data %}\n    }\n  `;
    Protocol1["BUILD"] = `\n    {% modules %}\n    export default {};\n    {% namespaces %}\n    {% protocol %}\n    declare const Deno: any;\n    type OgoneCOMPONENTComponent<T> = { children?: any; } & T;\n    type OgoneASYNCComponent<T> = OgoneCOMPONENTComponent<T>;\n    type OgoneSTOREComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;\n    type OgoneROUTERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;\n    type OgoneCONTROLLERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;\n\n    declare function h(...args: unknown[]): unknown;\n    declare function hf(...args: unknown[]): unknown;\n    declare namespace h.JSX {\n      export interface IntrinsicElements {\n        [k: string]: any;\n      }\n    }\n    {% allUsedComponents %}\n    class Component extends Protocol {\n      render() {\n        return {% tsx.length ? \`(\${tsx})\` : '' %};\n      }\n      {% runtime %}\n    }\n  `;
    Protocol1["USED_COMPONENT_TEMPLATE"] = `\n    declare function {% tagName %} (props: {% genericType %}<{\n      {% propsTypes || '' %}\n    }>): h.JSX.IntrinsicElements;`;
})(Protocol || (Protocol = {
}));
var ComponentEngine;
(function(ComponentEngine1) {
    ComponentEngine1["TemplateSyncWithWebcomponent"] = 'sync-template';
    ComponentEngine1["ComponentProxyReaction"] = 'proxy-reaction';
    ComponentEngine1["ComponentInlineReaction"] = 'inline-reaction';
    ComponentEngine1["NoStrictTagName"] = 'no-strict-tagname';
})(ComponentEngine || (ComponentEngine = {
}));
const Ogone = {
    types: {
    },
    root: false,
    require: {
    },
    stores: {
    },
    clients: [],
    arrays: {
    },
    render: {
    },
    protocols: {
    },
    contexts: {
    },
    components: {
    },
    classes: {
    },
    errorPanel: null,
    warnPanel: null,
    successPanel: null,
    infosPanel: null,
    errors: 0,
    firstErrorPerf: null,
    mod: {
        '*': []
    },
    ComponentCollectionManager: null,
    instances: {
    },
    routerReactions: [],
    actualRoute: null,
    files: [],
    directories: [],
    controllers: {
    },
    main: '',
    allowedTypes: [
        "app",
        "router",
        "store",
        "controller",
        "async",
        "component", 
    ],
    router: {
        react: [],
        actualRoute: null,
        go: (...args)=>{
            routerGo(...args);
        }
    },
    get isDeno () {
        return "Deno" in globalThis && !!Deno.chmod;
    }
};
var ClientRole;
(function(ClientRole1) {
    ClientRole1[ClientRole1["Standard"] = 0] = "Standard";
    ClientRole1[ClientRole1["Edition"] = 1] = "Edition";
})(ClientRole || (ClientRole = {
}));
class HMR {
    static FIFOMessages = [];
    static port = 3434;
    static isInErrorState = false;
    static isWaitingForServerPort = false;
    static heartBeatIntervalTime = 500;
    static components = {
    };
    static clients = new Map();
    static diagnostics = [];
    static listeners = new Map();
    static get connect() {
        return `ws://0.0.0.0:${this.port}/`;
    }
    static async sendError(error, diagnostics) {
        this.postMessage({
            error,
            diagnostics
        });
    }
    static removeErrors() {
        this.diagnostics.splice(0);
        this.error = void 0;
    }
    static get isInBrowser() {
        return typeof document !== 'undefined';
    }
    static get panelInformations() {
        if (!this.isInBrowser) throw new Error('cannot use panelInformations outside the browser');
        return this._panelInformations || (this._panelInformations = document.createElement('ul'));
    }
    static useOgone(ogone) {
        if (this.isInBrowser) {
            this.ogone = ogone;
            this.clientSettings();
        }
    }
    static clientSettings(shouldReload) {
        try {
            this.client = new WebSocket(this.connect);
        } catch (err) {
            return;
        }
        setTimeout(()=>{
            if (this.checkHeartBeat()) {
                if (shouldReload) {
                    this.clearInterval();
                    this.showHMRMessage('HMR reconnected, waiting for reload message', 'success');
                    this.showHMRMessage(`<span class="link" onclick="window.location.reload()">click here to reload it manually</span>`);
                    this.isWaitingForServerPort = true;
                }
            } else {
                this.showHMRMessage('heart beat goes on false', 'warn');
            }
        }, this.heartBeatIntervalTime);
        this.client.onmessage = (evt)=>{
            const payload = JSON.parse(evt.data);
            const { uuid , output , error , errorFile , diagnostics , type: type1 , pathToModule , uuidReq , port  } = payload;
            if (type1 === 'server') {
                const { search , pathname  } = window.location;
                window.location.assign(`http://localhost:${port}${pathname}${search}`);
                return;
            }
            if (type1 === 'reload') {
                window.location.reload();
                return;
            }
            if (type1 === 'resolved') {
                this.isInErrorState = false;
                this.hideHMRMessage();
                return;
            }
            if (type1 === 'style') {
                let style = document.querySelector(`style#${uuid}`);
                if (style) {
                    if (output !== style.innerHTML) style.innerHTML = output;
                } else {
                    style = document.createElement('style');
                    style.id = uuid;
                    style.innerHTML = output;
                    document.head.append(style);
                }
                return;
            }
            if (type1 === 'module') {
                this.getModule(pathToModule, uuidReq, uuid);
            }
            if (error) {
                this.hideHMRMessage();
                this.isInErrorState = true;
                console.error(error);
                let errorUuid;
                diagnostics.forEach((diag)=>{
                    let errorMessage = '';
                    const { sourceLine , messageText  } = diag;
                    if (diag) {
                        errorUuid = diag.fileName && diag.fileName.match(/(?<=\/)(?<uuid>[\w\d\-]+?)\.tsx$/)?.groups?.uuid || undefined;
                    }
                    const start = diag.start && diag.start.character || 0;
                    const end = diag.end && diag.end.character || 0;
                    const repeatNumber = end - start - 1;
                    let sourceline = diag && sourceLine || '';
                    sourceline = repeatNumber >= 0 ? sourceline.substring(0, start) + '<span class="critic">' + sourceline.substring(start, end) + '</span>' + sourceline.substring(end) : sourceline;
                    errorMessage = `\n<span class="critic">TS${diag && diag.code} [ERROR] </span>${diag && diag.messageChain && diag.messageChain.messageText || diag && diag.messageText || ''}\n${this.renderChainedDiags(diag && diag.messageChain && diag.messageChain.next || [])}\n${sourceline}\n`;
                    this.showHMRMessage(`\n${messageText || errorFile || 'Error found in application.'}\n${errorMessage}\n          `);
                });
                return;
            }
            this.rerenderComponents(uuid, output);
        };
        this.startHearBeat();
    }
    static renderChainedDiags(chainedDiags) {
        let result = ``;
        if (chainedDiags && chainedDiags.length) {
            for (const d of chainedDiags){
                const diag = d;
                result += `<span class="critic">TS${diag.code} [ERROR] </span>`;
                result += `${diag && diag.messageText}\n`;
            }
        }
        return result;
    }
    static rerenderComponents(uuid, output) {
        const savedComponents = this.components[uuid];
        if (savedComponents) {
            const setComponentToRerender = new Set();
            savedComponents.filter((c)=>c.routerCalling?.isRouter && c.routerCalling.isOriginalNode && c.actualTemplate === c
            ).forEach((c)=>{
                setComponentToRerender.add(c.routerCalling);
            });
            savedComponents.forEach((component)=>{
                if (component.isTemplate && component.original) {
                    setComponentToRerender.add(component.original);
                }
            });
            savedComponents.forEach((component)=>{
                if (component.isRoot) {
                    setComponentToRerender.add(component);
                }
            });
            if (output) {
                const replacement = eval(`((Ogone) => {\n          ${output}\n          console.warn('[Ogone] references are updated.');\n        })`);
                replacement(Ogone);
            }
            console.warn('[Ogone] rendering new components.');
            setComponentToRerender.forEach((component)=>{
                if (component) component.rerender();
            });
        }
    }
    static async getModule(pathToModule, uuidReq, uuid) {
        const iframe = document.createElement('iframe');
        document.body.append(iframe);
        iframe.name = 'HMR_IFRAME';
        iframe.srcdoc = `\n    < script>\n      window.loadModule = async (listener, path) => {\n        listener(await import(path));\n      };\n      window.postMessage('ready');\n    </ script>\n    `.replace(/\<(\/{0,1})\s+script/gi, '<$1script');
        iframe.addEventListener('load', ()=>{
            if (iframe.contentWindow) {
                iframe.contentWindow.addEventListener('message', async ()=>{
                    const { loadModule  } = iframe.contentWindow;
                    if (this.listeners.has(pathToModule)) {
                        const { listeners , graph  } = this.listeners.get(pathToModule);
                        for (let listener2 of listeners){
                            await loadModule(listener2, pathToModule + `?uuid_req=${uuidReq}`);
                        }
                    } else {
                        const entries = Array.from(this.listeners.entries());
                        const candidate = entries.find(([key, moduleGraph])=>{
                            return moduleGraph.graph.includes(pathToModule);
                        });
                        if (candidate) {
                            const [dependencyPath, dependency] = candidate;
                            for (let listener2 of dependency.listeners){
                                await loadModule(listener2, dependencyPath + `?uuid_req=${uuidReq}`);
                            }
                        } else {
                            console.warn('[Ogone] module not found.');
                            return;
                        }
                    }
                    iframe.remove();
                    this.rerenderComponents(uuid);
                });
            }
        });
        console.warn('[Ogone] updating module.');
    }
    static setServer(server) {
        this.server = server;
        this.server.on('connection', (ws)=>{
            this.cleanClients();
            if (this.diagnostics.length && this.error) {
                this.sendError(this.error, this.diagnostics);
            }
            const key = `client_${crypto.getRandomValues(new Uint16Array(10)).join('')}`;
            HMR.clients.set(key, {
                ready: false,
                connection: ws,
                role: 0
            });
        });
    }
    static postMessage(obj) {
        this.cleanClients();
        const message4 = JSON.stringify(obj);
        const entries = Array.from(this.clients.entries());
        entries.forEach(async ([key, client])=>{
            if (client?.connection.state !== 1 && !client.connection.isClosed && !this.FIFOMessages.includes(message4)) {
                this.FIFOMessages.push(message4);
            } else if (!client.ready) {
                this.sendFIFOMessages(key);
            }
            if (client && !client.connection.isClosed) {
                try {
                    await client.connection.send(message4);
                } catch (err) {
                }
            }
        });
    }
    static cleanClients() {
        const entries = Array.from(this.clients.entries());
        entries.forEach(([key, client])=>{
            if (client.connection.isClosed) {
                this.clients.delete(key);
            }
        });
    }
    static async sendFIFOMessages(id) {
        const entries = Array.from(this.clients.entries()).filter(([key, client])=>!client.ready && key === id
        );
        entries.forEach(async ([key, client])=>{
            this.FIFOMessages.forEach(async (m)=>{
                if (!client.connection.isClosed) {
                    await client.connection.send(m);
                    client.ready = client.connection.state === 1;
                }
            });
        });
    }
    static subscribe(pathToModule, listener) {
        if (!this.listeners.has(pathToModule)) this.listeners.set(pathToModule, {
            listeners: [
                listener
            ],
            graph: []
        });
        else {
            const candidate = this.listeners.get(pathToModule);
            candidate.listeners.push(listener);
        }
    }
    static setGraph(pathToModule, graph) {
        if (this.listeners.has(pathToModule)) {
            const candidate = this.listeners.get(pathToModule);
            if (candidate) candidate.graph = candidate.graph.concat(graph);
        }
    }
    static beforeClosing() {
        if (typeof document === 'undefined') {
            this.postMessage({
                type: 'close'
            });
        } else if (this.client) {
            this.clearInterval();
            this.client.send(JSON.stringify({
                type: 'close'
            }));
        }
    }
    static clearInterval() {
        clearInterval(this.heartBeatInterval);
    }
    static checkHeartBeat() {
        let heartbeat = true;
        if (this.client) {
            if (this.client.readyState === 0) return true;
            if (this.client.readyState > 1) {
                heartbeat = false;
            } else {
                try {
                    this.client.send('');
                } catch (err) {
                    heartbeat = false;
                }
            }
        }
        return heartbeat;
    }
    static startHearBeat() {
        this.clearInterval();
        this.heartBeatInterval = setInterval(()=>{
            if (!this.checkHeartBeat()) {
                this.showHMRMessage('HMR disconnected - retrying in 1s ...');
                this.clearInterval();
                setTimeout(()=>{
                    this.showHMRMessage('HMR disconnected - sending heart beat message');
                    this.clientSettings(true);
                }, 1000);
            }
        }, this.heartBeatIntervalTime);
    }
    static showHMRMessage(message, messageType = '') {
        if (this.isInBrowser) {
            if (!this.panelInformations.isConnected) {
                const style = document.createElement('style');
                style.innerHTML = `\n        .hmr--panel {\n          display: flex;\n          flex-direction: column;\n          justify-content: flex-end;\n          position: fixed;\n          z-index: 50000;\n          background: #2a2a2d;\n          width: 100vw;\n          height: 100vh;\n          padding-right: 15px;\n          top: 0;\n          margin: 0;\n          overflow: auto;\n          list-style: none;\n        }\n        .hmr--message {\n          padding: 5px;\n          margin: 0px 2px;\n          color: #9ea0a0;\n          font-family: sans-serif;\n        }\n        .hmr--message .hmr--infos {\n          color: #4a4a4d;\n        }\n        .hmr--message .hmr--title {\n          color: #7d7a7d;\n        }\n        .hmr--message .hmr--message {\n          color: inherit;\n          white-space: pre-wrap;\n        }\n        .hmr--message .error {\n          color: #fb7191;\n        }\n        .hmr--message .success {\n          color: #91fba1;\n        }\n        .hmr--message .critic {\n          color: #ff7191;\n          text-decoration: underline;\n        }\n        .hmr--message .link {\n          text-decoration: underline;\n          cursor: pointer;\n        }\n        .hmr--message .warn {\n          color: #fff2ae;\n        }\n        `;
                document.body.append(this.panelInformations);
                document.head.append(style);
            }
            this.addMessageToHMR(message, messageType);
            if (!this.panelInformations.classList.contains('hmr--panel')) {
                this.panelInformations.classList.add('hmr--panel');
            }
        }
    }
    static addMessageToHMR(message, type = '') {
        this.panelInformations.innerHTML += `\n    <li class="hmr--message">\n      <span class="hmr--infos">${new Date().toUTCString()}</span><span class="hmr--title"> Ogone - </span><span class="hmr--message ${type}"> ${message}</span> </li>\n    `;
    }
    static hideHMRMessage() {
        if (this.isInErrorState) return;
        this.panelInformations.classList.remove('hmr--panel');
        this.panelInformations.innerHTML = '';
    }
}
const items1 = [
    {
        name: "declarations",
        open: false,
        reg: /(use)\s+(.*?)(\s+as\s+)/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            throw new Error(`use syntax is no more supported, please use a default import instead: import MyComponent from 'path/to/component.o3'\ninput: ${value}`);
        },
        close: false
    }, 
];
let rid = 0;
const items2 = [
    {
        name: "linkCases",
        open: false,
        reg: /\s*(\*){0,1}execute\s+(\b(default)\b)\s*(;|\n+)/,
        id: (value, match, typedExpressions, expressions)=>{
            if (!expressions || !match) {
                throw new Error("expressions or matches are missing");
            }
            const [inpute, runOnce] = match;
            if (!runOnce) {
                rid++;
                return `_once !== ${rid} ? ____r(0, [], ${rid}) : null; return;`;
            }
            return `____r(0, [], _once || null); return;`;
        },
        close: false
    },
    {
        name: "linkCases",
        open: false,
        reg: /\s*(\*){0,1}execute\s+(case|default)\s*/,
        id: (value, match, typedExpressions, expressions)=>{
            if (!expressions || !match) {
                throw new Error("expressions or matches are missing");
            }
            throw new Error(`\n      the following syntax is not supported\n\n        please one of those syntaxes:\n          execute case 'casename' use [ctx, event];\n          execute case 'casename';\n          execute default;\n        It assumes that cases are strings in proto.\n        It can change in the future, do not hesitate to make a pull request on it.\n      `);
        },
        close: false
    }, 
];
const items3 = [
    {
        name: "declarations",
        open: false,
        reg: /(require)\s+(.+?)(as)/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches || !typedExpressions) {
                throw new Error("expressions or matches are missing");
            }
            throw new SyntaxError(`[Ogone] 0.28.0\n      the require syntax is no more supported,\n      please use the declare or def modifier and add the statement inherit before the name of the property\n        example:\n          <proto>\n            declare:\n              inherit name;\n              inherit myProp: string = 'value';\n              public inherit state: 'normal' | 'activated' = 'normal';\n          </proto>\n      `);
        },
        close: false
    }, 
];
function getMembers(tokens1) {
    let result = {
        members: [],
        hasDefault: false,
        hasMembers: false,
        hasAllAs: false,
        default: {
            alias: void 0,
            name: ''
        },
        allAs: void 0
    };
    const membersRegExpGI = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:[\}\,])/gi;
    const membersRegExp = /\b(.*?)(?:\s+(?:as)\s+(.*?)){0,1}(?:[\}\,])/i;
    const allAsRegExp = /(\*)\s+(?:as)\s+(.+?)(?:(\,|\s))/i;
    const defaultRegExp = /(.+?)(?=\b)/i;
    let text = tokens1.replace(/\n,/gi, ",").trim();
    text.split(/(?=\{)/gi).filter((p)=>p.indexOf('}') > -1 && p.indexOf('{') > -1
    ).forEach((substring)=>{
        substring.split(/(?:\{)/gi).forEach((part1)=>{
            const content = part1.split('}')[0];
            const m = `${content.trim()},`.match(membersRegExpGI);
            if (m) {
                m.forEach((match)=>{
                    const p = match.match(membersRegExp);
                    if (p) {
                        const [, variable, alias] = p;
                        if (variable) {
                            result.hasMembers = true;
                            result.members.push({
                                name: variable.trim(),
                                alias: alias?.trim()
                            });
                        }
                    }
                });
                text = text.replace(`{${content}}`, '');
            }
        });
    });
    let allAsTokenMatch = `${text} `.match(allAsRegExp);
    while(allAsTokenMatch){
        const [input1, asterix, name1] = allAsTokenMatch;
        result.allAs = name1;
        text = text.replace(input1.trim(), '');
        allAsTokenMatch = `${text} `.match(allAsRegExp);
        result.hasAllAs = true;
    }
    const defaultTokenMatch = text.match(defaultRegExp);
    if (defaultTokenMatch) {
        const [input1, name1] = defaultTokenMatch;
        result.default.name = name1;
        text = text.replace(input1, '');
        result.hasDefault = true;
    }
    return result;
}
const AllExports = [
    {
        name: "export default",
        open: false,
        reg: /(\bexport\b)\s*(\b(default)\b)(.*?)(§{2}endExpression\d+§{2}|;|\n+)/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const [exp, def1, def2, token] = matches;
            const id = `§§export${__default1.next().value}§§`;
            expressions[id] = value;
            if (typedExpressions) {
                typedExpressions.exports['default'] = {
                    key: id,
                    default: true,
                    defaultName: null,
                    members: [],
                    path: "",
                    member: false,
                    value: getDeepTranslation1(token, expressions),
                    type: "default"
                };
            }
            return '';
        },
        close: false
    },
    {
        name: "export vars",
        open: false,
        reg: /(\bexport\b)\s*(const|let|var)(.*?)((?:\:)(.*?)){0,1}(?:\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+))(.*?)(§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§export${__default1.next().value}§§`;
            const [input1, exp, constorLet, key, optional, types, val] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                typedExpressions.exports[key] = {
                    key: id,
                    default: false,
                    defaultName: null,
                    name: key.trim(),
                    members: [],
                    path: "",
                    member: true,
                    type: "member",
                    value: val
                };
            }
            return '';
        },
        close: false
    },
    {
        name: "export function",
        open: false,
        reg: /(\bexport\b)\s*(\bfunction\b)(.*?)(\<(?:.*?)\>){0,1}(\d+_parenthese)((?:\:)(.*?)){0,1}(.*?)(§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§export${__default1.next().value}§§`;
            const [input1, exp, func, key] = matches;
            const [input2, exp2, ...f2] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                typedExpressions.exports[key] = {
                    key: id,
                    default: false,
                    defaultName: null,
                    members: [],
                    name: key.trim(),
                    path: "",
                    member: true,
                    type: "function",
                    value: getDeepTranslation1(f2.join(''), expressions)
                };
            }
            return '';
        },
        close: false
    },
    {
        name: "export class",
        open: false,
        reg: /(\bexport\b)\s+(\bclass\b)(.*?)(\bextends\b(.*?)){0,1}(§{2}block\w*\d+§{2})\s*(?:§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§export${__default1.next().value}§§`;
            const [input1, exp, cl, key] = matches;
            const [input2, exp2, ...klass] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                typedExpressions.exports[key] = {
                    key: id,
                    default: false,
                    defaultName: null,
                    members: [],
                    name: key.trim(),
                    path: "",
                    member: true,
                    type: "class",
                    value: getDeepTranslation1(klass.join(''), expressions)
                };
            }
            return '';
        },
        close: false
    },
    {
        name: "export * from",
        open: false,
        reg: /\s*(\bexport\b)(.*?)(\bfrom\b)\s*(\d+_string)\s*(?:§{2}endExpression\d+§{2}|;|\n+)/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§export${__default1.next().value}§§`;
            const [input1, imp, key, f, id2] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                const tokens1 = getDeepTranslation1(key, expressions);
                const exportDescription = getMembers(getDeepTranslation1(tokens1, expressions));
                typedExpressions.exports[key] = {
                    key: id,
                    default: false,
                    member: true,
                    members: exportDescription.members,
                    defaultName: exportDescription.default.alias || exportDescription.default.name || null,
                    path: getDeepTranslation1(id2, expressions).replace(/["'`]/gi, ''),
                    type: "all",
                    value: getDeepTranslation1(key, expressions).trim()
                };
            }
            return '';
        },
        close: false
    }, 
];
function getHmrModuleSystem({ variable , registry , isDefault , isAllAs , isMember , path: path1  }) {
    let result = getDeepTranslation1(`\n    let $_1 = $_2["$_3"]$_4;\n    $_2['*'].push(["$_3", (m) => {\n      if (!this.activated) return false;\n      $_1 = m$_4;\n      this.runtime('destroy');\n      this.runtime(0);\n      return this.activated;\n    }]);`, {
        $_1: variable,
        $_2: registry,
        $_3: path1,
        $_4: isDefault ? '.default' : isMember ? `.${variable}` : ''
    });
    return result;
}
const esm = [
    {
        name: "ambient import",
        open: false,
        reg: /\s*(\bimport\b)\s+(\d+_string)\s*(§{2}endExpression\d+§{2}|;|\n+)?/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§import${__default1.next().value}§§`;
            const [input1, imp, id2] = matches;
            expressions[id] = value;
            if (typedExpressions) {
                const path1 = getDeepTranslation1(id2, expressions).replace(/['"`]/gi, "");
                const type2 = path1.startsWith('.') ? 'relative' : path1.startsWith('@') ? 'absolute' : 'remote';
                const isRemote = path1.startsWith('http://') || path1.startsWith('https://');
                typedExpressions.imports[id] = {
                    key: id,
                    uuid: `a${crypto.getRandomValues(new Uint32Array(1)).join('')}`,
                    value,
                    path: path1,
                    type: type2,
                    isRemote,
                    ambient: true,
                    allAs: false,
                    object: false,
                    default: false,
                    defaultName: null,
                    allAsName: null,
                    getHmrModuleSystem,
                    members: []
                };
            }
            return id;
        },
        close: false
    },
    {
        name: "all imports",
        open: false,
        reg: /(\bimport\b)(\s+(?:component|type)\s+){0,1}(.+?)(\bfrom\b)(.*?)(?=(§{2}endExpression\d+§{2}|;|\n+))/i,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            const id = `§§import${__default1.next().value}§§`;
            const [input1, imp, importType, tokens1, f, str2] = matches;
            expressions[id] = value;
            const isComponent = importType && importType.trim() === 'component' || false;
            const isType = importType && importType.trim() === 'type' || false;
            if (typedExpressions) {
                const importDescription = getMembers(getDeepTranslation1(tokens1, expressions));
                const path1 = getDeepTranslation1(str2, expressions).replace(/['"\s`]/gi, "");
                const isRemote = path1.startsWith('http://') || path1.startsWith('https://');
                const type2 = path1.startsWith('.') ? 'relative' : path1.startsWith('@') ? 'absolute' : 'remote';
                typedExpressions.imports[id] = {
                    key: id,
                    type: type2,
                    isComponent,
                    isType,
                    isRemote,
                    uuid: `a${crypto.getRandomValues(new Uint32Array(1)).join('')}`,
                    ambient: false,
                    allAs: importDescription.hasAllAs,
                    object: importDescription.hasMembers,
                    default: importDescription.hasDefault,
                    defaultName: importDescription.default.alias || importDescription.default.name || null,
                    allAsName: importDescription.allAs || null,
                    path: path1,
                    value: getDeepTranslation1(value, expressions),
                    members: importDescription.members,
                    getHmrModuleSystem
                };
            }
            return !!isComponent ? '' : id;
        },
        close: false
    },
    {
        name: "fallback import",
        open: false,
        reg: /(\bimport\b)(.*?)(\bfrom\b)(.*?)(?=(§{2}endExpression\d+§{2}|;|\n+))/,
        id: (value, matches, typedExpressions, expressions)=>{
            if (!expressions || !matches) {
                throw new Error("expressions or matches are missing");
            }
            throw new Error(`this syntax of import is not supported\ninput:${getDeepTranslation1(value, expressions)}`);
        },
        close: false
    },
    ...AllExports
];
class AssetsParser1 extends Utils {
    parseUseStatement(value) {
        try {
            const result = {
                value: null,
                body: __default()
            };
            const expressions = {
            };
            __default2({
                expressions,
                value,
                typedExpressions: result.body,
                array: [
                    ...nullish,
                    ...tokens,
                    ...items1
                ]
            });
            return result;
        } catch (err) {
            this.error(`AssetsParser: ${err.message}\n${err.stack}`);
        }
    }
    transformLinkStatement(value) {
        try {
            const result = {
                value: null,
                body: __default()
            };
            const expressions = {
            };
            const newValue = __default2({
                expressions,
                value,
                typedExpressions: result.body,
                array: [
                    ...nullish,
                    ...tokens,
                    ...items2
                ]
            });
            return getDeepTranslation1(newValue, expressions);
        } catch (err) {
            this.error(`AssetsParser: ${err.message}\n${err.stack}`);
        }
    }
    parseImportStatement(value) {
        try {
            const result = {
                value: null,
                body: __default()
            };
            const expressions = {
            };
            __default2({
                expressions,
                value,
                typedExpressions: result.body,
                array: [
                    ...nullish,
                    ...tokens,
                    ...esm
                ]
            });
            return result;
        } catch (err) {
            this.error(`AssetsParser: ${err.message}\n${err.stack}`);
        }
    }
    parseRequireStatement(value) {
        try {
            const result = {
                value: null,
                body: __default()
            };
            const expressions = {
            };
            __default2({
                expressions,
                value,
                typedExpressions: result.body,
                array: [
                    ...nullish,
                    ...tokens,
                    ...items3
                ]
            });
            return result;
        } catch (err) {
            this.error(`AssetsParser: ${err.message}\n${err.stack}`);
        }
    }
}
const __default4 = (p)=>p.replace(/[\-\/\.]/gi, '_')
;
var HTMLDocument1;
(function(HTMLDocument2) {
    HTMLDocument2["PAGE"] = `\n    <html>\n        <head>\n            {% head %}\n        </head>\n        <body>\n            {% dom %}\n            {% script %}\n        </body>\n    </html>\n    `;
    HTMLDocument2["PAGE_BUILD"] = `\n    <html>\n        <head>\n            {% head %}\n        </head>\n        <body>\n            {% dom %}{% script %}\n        </body>\n    </html>\n    `;
})(HTMLDocument1 || (HTMLDocument1 = {
}));
const getHeaderContentTypeOf = function(url) {
    let matched = url.match(/\.([^\s]*)+$/);
    let result = {
        txt: "text/plain",
        gif: "image/gif",
        jpeg: "image/jpeg",
        png: "image/png",
        svg: "image/svg+xml",
        html: "text/html",
        css: "text/css",
        js: "text/javascript",
        ts: "text/javascript",
        webp: "image/webp",
        midi: "audio/midi",
        mpeg: "audio/mpeg",
        webm: "audio/webm",
        ogg: "audio/ogg",
        wav: "audio/wave, audio/wav, audio/x-wav, audio/x-pn-wav"
    };
    if (matched) {
        let extension = matched[1] || "txt";
        let contentType = result[extension] || result.txt;
        return [
            "Content-Type",
            contentType
        ];
    }
    return result.txt;
};
var BoilerPlate;
(function(BoilerPlate1) {
    BoilerPlate1["ROOT_COMPONENT_PREVENT_COMPONENT_TYPE_ERROR"] = `\n    import component Subject from "{% filePath %}";\n    <template>\n      <Subject />\n    </template>\n    <proto type="app" engine="no-strict-tagname">\n    </proto>\n    `;
})(BoilerPlate || (BoilerPlate = {
}));
const osType = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    const navigator1 = globalThis.navigator;
    if (navigator1?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows1 = osType === "windows";
const CHAR_FORWARD_SLASH1 = 47;
function assertPath1(path1) {
    if (typeof path1 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path1)}`);
    }
}
function isPosixPathSeparator1(code1) {
    return code1 === 47;
}
function isPathSeparator1(code1) {
    return isPosixPathSeparator1(code1) || code1 === 92;
}
function isWindowsDeviceRoot1(code1) {
    return code1 >= 97 && code1 <= 122 || code1 >= 65 && code1 <= 90;
}
function normalizeString1(path1, allowAboveRoot, separator, isPathSeparator2) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code1;
    for(let i2 = 0, len = path1.length; i2 <= len; ++i2){
        if (i2 < len) code1 = path1.charCodeAt(i2);
        else if (isPathSeparator2(code1)) break;
        else code1 = CHAR_FORWARD_SLASH1;
        if (isPathSeparator2(code1)) {
            if (lastSlash === i2 - 1 || dots === 1) {
            } else if (lastSlash !== i2 - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i2;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i2;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path1.slice(lastSlash + 1, i2);
                else res = path1.slice(lastSlash + 1, i2);
                lastSegmentLength = i2 - lastSlash - 1;
            }
            lastSlash = i2;
            dots = 0;
        } else if (code1 === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format1(sep3, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep3 + base;
}
const WHITESPACE_ENCODINGS = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace(string) {
    return string.replaceAll(/[\s]/g, (c)=>{
        return WHITESPACE_ENCODINGS[c] ?? c;
    });
}
class DenoStdInternalError1 extends Error {
    constructor(message4){
        super(message4);
        this.name = "DenoStdInternalError";
    }
}
function assert1(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError1(msg);
    }
}
const sep3 = "\\";
const delimiter3 = ";";
function resolve4(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i2 = pathSegments.length - 1; i2 >= -1; i2--){
        let path1;
        if (i2 >= 0) {
            path1 = pathSegments[i2];
        } else if (!resolvedDevice) {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path1 = Deno.cwd();
        } else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path1 = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path1 === undefined || path1.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path1 = `${resolvedDevice}\\`;
            }
        }
        assertPath1(path1);
        const len = path1.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute3 = false;
        const code1 = path1.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator1(code1)) {
                isAbsolute3 = true;
                if (isPathSeparator1(path1.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator1(path1.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path1.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator1(path1.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator1(path1.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path1.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path1.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot1(code1)) {
                if (path1.charCodeAt(1) === 58) {
                    device = path1.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator1(path1.charCodeAt(2))) {
                            isAbsolute3 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator1(code1)) {
            rootEnd = 1;
            isAbsolute3 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path1.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute3;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString1(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator1);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize3(path1) {
    assertPath1(path1);
    const len = path1.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute3 = false;
    const code1 = path1.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code1)) {
            isAbsolute3 = true;
            if (isPathSeparator1(path1.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path1.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path1.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path1.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path1.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path1.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path1.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot1(code1)) {
            if (path1.charCodeAt(1) === 58) {
                device = path1.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path1.charCodeAt(2))) {
                        isAbsolute3 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator1(code1)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString1(path1.slice(rootEnd), !isAbsolute3, "\\", isPathSeparator1);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute3) tail = ".";
    if (tail.length > 0 && isPathSeparator1(path1.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute3) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute3) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute3(path1) {
    assertPath1(path1);
    const len = path1.length;
    if (len === 0) return false;
    const code1 = path1.charCodeAt(0);
    if (isPathSeparator1(code1)) {
        return true;
    } else if (isWindowsDeviceRoot1(code1)) {
        if (len > 2 && path1.charCodeAt(1) === 58) {
            if (isPathSeparator1(path1.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join3(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i2 = 0; i2 < pathsCount; ++i2){
        const path1 = paths[i2];
        assertPath1(path1);
        if (path1.length > 0) {
            if (joined === undefined) joined = firstPart = path1;
            else joined += `\\${path1}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert1(firstPart != null);
    if (isPathSeparator1(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator1(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator1(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator1(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize3(joined);
}
function relative3(from, to) {
    assertPath1(from);
    assertPath1(to);
    if (from === to) return "";
    const fromOrig = resolve4(from);
    const toOrig = resolve4(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i2 = 0;
    for(; i2 <= length; ++i2){
        if (i2 === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i2) === 92) {
                    return toOrig.slice(toStart + i2 + 1);
                } else if (i2 === 2) {
                    return toOrig.slice(toStart + i2);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i2) === 92) {
                    lastCommonSep = i2;
                } else if (i2 === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i2);
        const toCode = to.charCodeAt(toStart + i2);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i2;
    }
    if (i2 !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2){
        if (i2 === fromEnd || from.charCodeAt(i2) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath3(path1) {
    if (typeof path1 !== "string") return path1;
    if (path1.length === 0) return "";
    const resolvedPath = resolve4(path1);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code1 = resolvedPath.charCodeAt(2);
                if (code1 !== 63 && code1 !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot1(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path1;
}
function dirname3(path1) {
    assertPath1(path1);
    const len = path1.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code1 = path1.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code1)) {
            rootEnd = offset = 1;
            if (isPathSeparator1(path1.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path1.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path1.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path1.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path1;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code1)) {
            if (path1.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator1(path1.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator1(code1)) {
        return path1;
    }
    for(let i2 = len - 1; i2 >= offset; --i2){
        if (isPathSeparator1(path1.charCodeAt(i2))) {
            if (!matchedSlash) {
                end = i2;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path1.slice(0, end);
}
function basename3(path1, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path1);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i2;
    if (path1.length >= 2) {
        const drive = path1.charCodeAt(0);
        if (isWindowsDeviceRoot1(drive)) {
            if (path1.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path1.length) {
        if (ext.length === path1.length && ext === path1) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i2 = path1.length - 1; i2 >= start; --i2){
            const code1 = path1.charCodeAt(i2);
            if (isPathSeparator1(code1)) {
                if (!matchedSlash) {
                    start = i2 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i2 + 1;
                }
                if (extIdx >= 0) {
                    if (code1 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
                            end = i2;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path1.length;
        return path1.slice(start, end);
    } else {
        for(i2 = path1.length - 1; i2 >= start; --i2){
            if (isPathSeparator1(path1.charCodeAt(i2))) {
                if (!matchedSlash) {
                    start = i2 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i2 + 1;
            }
        }
        if (end === -1) return "";
        return path1.slice(start, end);
    }
}
function extname3(path1) {
    assertPath1(path1);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path1.length >= 2 && path1.charCodeAt(1) === 58 && isWindowsDeviceRoot1(path1.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i2 = path1.length - 1; i2 >= start; --i2){
        const code1 = path1.charCodeAt(i2);
        if (isPathSeparator1(code1)) {
            if (!matchedSlash) {
                startPart = i2 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i2;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path1.slice(startDot, end);
}
function format3(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format1("\\", pathObject);
}
function parse4(path1) {
    assertPath1(path1);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path1.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code1 = path1.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code1)) {
            rootEnd = 1;
            if (isPathSeparator1(path1.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path1.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path1.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path1.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code1)) {
            if (path1.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path1.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path1;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path1;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator1(code1)) {
        ret.root = ret.dir = path1;
        return ret;
    }
    if (rootEnd > 0) ret.root = path1.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i2 = path1.length - 1;
    let preDotState = 0;
    for(; i2 >= rootEnd; --i2){
        code1 = path1.charCodeAt(i2);
        if (isPathSeparator1(code1)) {
            if (!matchedSlash) {
                startPart = i2 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i2;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path1.slice(startPart, end);
        }
    } else {
        ret.name = path1.slice(startPart, startDot);
        ret.base = path1.slice(startPart, end);
        ret.ext = path1.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path1.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl3(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path1 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path1 = `\\\\${url.hostname}${path1}`;
    }
    return path1;
}
function toFileUrl(path1) {
    if (!isAbsolute3(path1)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path1.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod4 = function() {
    return {
        sep: sep3,
        delimiter: delimiter3,
        resolve: resolve4,
        normalize: normalize3,
        isAbsolute: isAbsolute3,
        join: join3,
        relative: relative3,
        toNamespacedPath: toNamespacedPath3,
        dirname: dirname3,
        basename: basename3,
        extname: extname3,
        format: format3,
        parse: parse4,
        fromFileUrl: fromFileUrl3,
        toFileUrl: toFileUrl
    };
}();
const sep4 = "/";
const delimiter4 = ":";
function resolve5(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i2 = pathSegments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--){
        let path1;
        if (i2 >= 0) path1 = pathSegments[i2];
        else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path1 = Deno.cwd();
        }
        assertPath1(path1);
        if (path1.length === 0) {
            continue;
        }
        resolvedPath = `${path1}/${resolvedPath}`;
        resolvedAbsolute = path1.charCodeAt(0) === CHAR_FORWARD_SLASH1;
    }
    resolvedPath = normalizeString1(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator1);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize4(path1) {
    assertPath1(path1);
    if (path1.length === 0) return ".";
    const isAbsolute4 = path1.charCodeAt(0) === 47;
    const trailingSeparator = path1.charCodeAt(path1.length - 1) === 47;
    path1 = normalizeString1(path1, !isAbsolute4, "/", isPosixPathSeparator1);
    if (path1.length === 0 && !isAbsolute4) path1 = ".";
    if (path1.length > 0 && trailingSeparator) path1 += "/";
    if (isAbsolute4) return `/${path1}`;
    return path1;
}
function isAbsolute4(path1) {
    assertPath1(path1);
    return path1.length > 0 && path1.charCodeAt(0) === 47;
}
function join4(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i2 = 0, len = paths.length; i2 < len; ++i2){
        const path1 = paths[i2];
        assertPath1(path1);
        if (path1.length > 0) {
            if (!joined) joined = path1;
            else joined += `/${path1}`;
        }
    }
    if (!joined) return ".";
    return normalize4(joined);
}
function relative4(from, to) {
    assertPath1(from);
    assertPath1(to);
    if (from === to) return "";
    from = resolve5(from);
    to = resolve5(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i2 = 0;
    for(; i2 <= length; ++i2){
        if (i2 === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i2) === 47) {
                    return to.slice(toStart + i2 + 1);
                } else if (i2 === 0) {
                    return to.slice(toStart + i2);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i2) === 47) {
                    lastCommonSep = i2;
                } else if (i2 === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i2);
        const toCode = to.charCodeAt(toStart + i2);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i2;
    }
    let out = "";
    for(i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2){
        if (i2 === fromEnd || from.charCodeAt(i2) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath4(path1) {
    return path1;
}
function dirname4(path1) {
    assertPath1(path1);
    if (path1.length === 0) return ".";
    const hasRoot = path1.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i2 = path1.length - 1; i2 >= 1; --i2){
        if (path1.charCodeAt(i2) === 47) {
            if (!matchedSlash) {
                end = i2;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path1.slice(0, end);
}
function basename4(path1, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path1);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i2;
    if (ext !== undefined && ext.length > 0 && ext.length <= path1.length) {
        if (ext.length === path1.length && ext === path1) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i2 = path1.length - 1; i2 >= 0; --i2){
            const code1 = path1.charCodeAt(i2);
            if (code1 === 47) {
                if (!matchedSlash) {
                    start = i2 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i2 + 1;
                }
                if (extIdx >= 0) {
                    if (code1 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
                            end = i2;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path1.length;
        return path1.slice(start, end);
    } else {
        for(i2 = path1.length - 1; i2 >= 0; --i2){
            if (path1.charCodeAt(i2) === 47) {
                if (!matchedSlash) {
                    start = i2 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i2 + 1;
            }
        }
        if (end === -1) return "";
        return path1.slice(start, end);
    }
}
function extname4(path1) {
    assertPath1(path1);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i2 = path1.length - 1; i2 >= 0; --i2){
        const code1 = path1.charCodeAt(i2);
        if (code1 === 47) {
            if (!matchedSlash) {
                startPart = i2 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i2;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path1.slice(startDot, end);
}
function format4(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format1("/", pathObject);
}
function parse5(path1) {
    assertPath1(path1);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path1.length === 0) return ret;
    const isAbsolute5 = path1.charCodeAt(0) === 47;
    let start;
    if (isAbsolute5) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i2 = path1.length - 1;
    let preDotState = 0;
    for(; i2 >= start; --i2){
        const code1 = path1.charCodeAt(i2);
        if (code1 === 47) {
            if (!matchedSlash) {
                startPart = i2 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i2;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute5) {
                ret.base = ret.name = path1.slice(1, end);
            } else {
                ret.base = ret.name = path1.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute5) {
            ret.name = path1.slice(1, startDot);
            ret.base = path1.slice(1, end);
        } else {
            ret.name = path1.slice(startPart, startDot);
            ret.base = path1.slice(startPart, end);
        }
        ret.ext = path1.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path1.slice(0, startPart - 1);
    else if (isAbsolute5) ret.dir = "/";
    return ret;
}
function fromFileUrl4(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path1) {
    if (!isAbsolute4(path1)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path1.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod5 = function() {
    return {
        sep: sep4,
        delimiter: delimiter4,
        resolve: resolve5,
        normalize: normalize4,
        isAbsolute: isAbsolute4,
        join: join4,
        relative: relative4,
        toNamespacedPath: toNamespacedPath4,
        dirname: dirname4,
        basename: basename4,
        extname: extname4,
        format: format4,
        parse: parse5,
        fromFileUrl: fromFileUrl4,
        toFileUrl: toFileUrl1
    };
}();
const path1 = isWindows1 ? mod4 : mod5;
const { basename: basename5 , delimiter: delimiter5 , dirname: dirname5 , extname: extname5 , format: format5 , fromFileUrl: fromFileUrl5 , isAbsolute: isAbsolute5 , join: join5 , normalize: normalize5 , parse: parse6 , relative: relative5 , resolve: resolve6 , sep: sep5 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath5 ,  } = path1;
function isSubdir(src, dest, sep6 = sep5) {
    if (src === dest) {
        return false;
    }
    const srcArray = src.split(sep6);
    const destArray = dest.split(sep6);
    return srcArray.every((current, i2)=>destArray[i2] === current
    );
}
function getFileInfoType(fileInfo) {
    return fileInfo.isFile ? "file" : fileInfo.isDirectory ? "dir" : fileInfo.isSymlink ? "symlink" : undefined;
}
async function ensureDir(dir) {
    try {
        const fileInfo = await Deno.lstat(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            await Deno.mkdir(dir, {
                recursive: true
            });
            return;
        }
        throw err;
    }
}
async function ensureValidCopy(src, dest, options1) {
    let destStat;
    try {
        destStat = await Deno.lstat(dest);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return;
        }
        throw err;
    }
    if (options1.isFolder && !destStat.isDirectory) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!options1.overwrite) {
        throw new Error(`'${dest}' already exists.`);
    }
    return destStat;
}
async function copyFile(src, dest, options1) {
    await ensureValidCopy(src, dest, options1);
    await Deno.copyFile(src, dest);
    if (options1.preserveTimestamps) {
        const statInfo = await Deno.stat(src);
        assert1(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert1(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
async function copySymLink(src, dest, options1) {
    await ensureValidCopy(src, dest, options1);
    const originSrcFilePath = await Deno.readLink(src);
    const type2 = getFileInfoType(await Deno.lstat(src));
    if (isWindows1) {
        await Deno.symlink(originSrcFilePath, dest, {
            type: type2 === "dir" ? "dir" : "file"
        });
    } else {
        await Deno.symlink(originSrcFilePath, dest);
    }
    if (options1.preserveTimestamps) {
        const statInfo = await Deno.lstat(src);
        assert1(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert1(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
async function copyDir(src, dest, options1) {
    const destStat = await ensureValidCopy(src, dest, {
        ...options1,
        isFolder: true
    });
    if (!destStat) {
        await ensureDir(dest);
    }
    if (options1.preserveTimestamps) {
        const srcStatInfo = await Deno.stat(src);
        assert1(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert1(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, srcStatInfo.atime, srcStatInfo.mtime);
    }
    for await (const entry of Deno.readDir(src)){
        const srcPath = join5(src, entry.name);
        const destPath = join5(dest, basename5(srcPath));
        if (entry.isSymlink) {
            await copySymLink(srcPath, destPath, options1);
        } else if (entry.isDirectory) {
            await copyDir(srcPath, destPath, options1);
        } else if (entry.isFile) {
            await copyFile(srcPath, destPath, options1);
        }
    }
}
async function copy(src, dest, options1 = {
}) {
    src = resolve6(src);
    dest = resolve6(dest);
    if (src === dest) {
        throw new Error("Source and destination cannot be the same.");
    }
    const srcStat = await Deno.lstat(src);
    if (srcStat.isDirectory && isSubdir(src, dest)) {
        throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
    }
    if (srcStat.isSymlink) {
        await copySymLink(src, dest, options1);
    } else if (srcStat.isDirectory) {
        await copyDir(src, dest, options1);
    } else if (srcStat.isFile) {
        await copyFile(src, dest, options1);
    }
}
class DenoStdInternalError2 extends Error {
    constructor(message5){
        super(message5);
        this.name = "DenoStdInternalError";
    }
}
function assert2(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError2(msg);
    }
}
const osType1 = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    const navigator1 = globalThis.navigator;
    if (navigator1?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows2 = osType1 === "windows";
const CHAR_FORWARD_SLASH2 = 47;
function assertPath2(path2) {
    if (typeof path2 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path2)}`);
    }
}
function isPosixPathSeparator2(code1) {
    return code1 === 47;
}
function isPathSeparator2(code1) {
    return isPosixPathSeparator2(code1) || code1 === 92;
}
function isWindowsDeviceRoot2(code1) {
    return code1 >= 97 && code1 <= 122 || code1 >= 65 && code1 <= 90;
}
function normalizeString2(path2, allowAboveRoot, separator, isPathSeparator3) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code1;
    for(let i2 = 0, len = path2.length; i2 <= len; ++i2){
        if (i2 < len) code1 = path2.charCodeAt(i2);
        else if (isPathSeparator3(code1)) break;
        else code1 = CHAR_FORWARD_SLASH2;
        if (isPathSeparator3(code1)) {
            if (lastSlash === i2 - 1 || dots === 1) {
            } else if (lastSlash !== i2 - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i2;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i2;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path2.slice(lastSlash + 1, i2);
                else res = path2.slice(lastSlash + 1, i2);
                lastSegmentLength = i2 - lastSlash - 1;
            }
            lastSlash = i2;
            dots = 0;
        } else if (code1 === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format2(sep6, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep6 + base;
}
const sep6 = "\\";
const delimiter6 = ";";
function resolve7(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i2 = pathSegments.length - 1; i2 >= -1; i2--){
        let path2;
        if (i2 >= 0) {
            path2 = pathSegments[i2];
        } else if (!resolvedDevice) {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path2 = Deno.cwd();
        } else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path2 = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path2 === undefined || path2.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path2 = `${resolvedDevice}\\`;
            }
        }
        assertPath2(path2);
        const len = path2.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute6 = false;
        const code1 = path2.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator2(code1)) {
                isAbsolute6 = true;
                if (isPathSeparator2(path2.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator2(path2.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path2.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator2(path2.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator2(path2.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path2.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path2.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot2(code1)) {
                if (path2.charCodeAt(1) === 58) {
                    device = path2.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator2(path2.charCodeAt(2))) {
                            isAbsolute6 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator2(code1)) {
            rootEnd = 1;
            isAbsolute6 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path2.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute6;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString2(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator2);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize6(path2) {
    assertPath2(path2);
    const len = path2.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute6 = false;
    const code1 = path2.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator2(code1)) {
            isAbsolute6 = true;
            if (isPathSeparator2(path2.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator2(path2.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path2.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator2(path2.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator2(path2.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path2.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path2.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot2(code1)) {
            if (path2.charCodeAt(1) === 58) {
                device = path2.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator2(path2.charCodeAt(2))) {
                        isAbsolute6 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator2(code1)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString2(path2.slice(rootEnd), !isAbsolute6, "\\", isPathSeparator2);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute6) tail = ".";
    if (tail.length > 0 && isPathSeparator2(path2.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute6) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute6) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute6(path2) {
    assertPath2(path2);
    const len = path2.length;
    if (len === 0) return false;
    const code1 = path2.charCodeAt(0);
    if (isPathSeparator2(code1)) {
        return true;
    } else if (isWindowsDeviceRoot2(code1)) {
        if (len > 2 && path2.charCodeAt(1) === 58) {
            if (isPathSeparator2(path2.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join6(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i2 = 0; i2 < pathsCount; ++i2){
        const path2 = paths[i2];
        assertPath2(path2);
        if (path2.length > 0) {
            if (joined === undefined) joined = firstPart = path2;
            else joined += `\\${path2}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert2(firstPart != null);
    if (isPathSeparator2(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator2(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator2(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator2(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize6(joined);
}
function relative6(from, to) {
    assertPath2(from);
    assertPath2(to);
    if (from === to) return "";
    const fromOrig = resolve7(from);
    const toOrig = resolve7(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i2 = 0;
    for(; i2 <= length; ++i2){
        if (i2 === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i2) === 92) {
                    return toOrig.slice(toStart + i2 + 1);
                } else if (i2 === 2) {
                    return toOrig.slice(toStart + i2);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i2) === 92) {
                    lastCommonSep = i2;
                } else if (i2 === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i2);
        const toCode = to.charCodeAt(toStart + i2);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i2;
    }
    if (i2 !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2){
        if (i2 === fromEnd || from.charCodeAt(i2) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath6(path2) {
    if (typeof path2 !== "string") return path2;
    if (path2.length === 0) return "";
    const resolvedPath = resolve7(path2);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code1 = resolvedPath.charCodeAt(2);
                if (code1 !== 63 && code1 !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot2(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path2;
}
function dirname6(path2) {
    assertPath2(path2);
    const len = path2.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code1 = path2.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator2(code1)) {
            rootEnd = offset = 1;
            if (isPathSeparator2(path2.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator2(path2.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator2(path2.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator2(path2.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path2;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot2(code1)) {
            if (path2.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator2(path2.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator2(code1)) {
        return path2;
    }
    for(let i2 = len - 1; i2 >= offset; --i2){
        if (isPathSeparator2(path2.charCodeAt(i2))) {
            if (!matchedSlash) {
                end = i2;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path2.slice(0, end);
}
function basename6(path2, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath2(path2);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i2;
    if (path2.length >= 2) {
        const drive = path2.charCodeAt(0);
        if (isWindowsDeviceRoot2(drive)) {
            if (path2.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path2.length) {
        if (ext.length === path2.length && ext === path2) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i2 = path2.length - 1; i2 >= start; --i2){
            const code1 = path2.charCodeAt(i2);
            if (isPathSeparator2(code1)) {
                if (!matchedSlash) {
                    start = i2 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i2 + 1;
                }
                if (extIdx >= 0) {
                    if (code1 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
                            end = i2;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path2.length;
        return path2.slice(start, end);
    } else {
        for(i2 = path2.length - 1; i2 >= start; --i2){
            if (isPathSeparator2(path2.charCodeAt(i2))) {
                if (!matchedSlash) {
                    start = i2 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i2 + 1;
            }
        }
        if (end === -1) return "";
        return path2.slice(start, end);
    }
}
function extname6(path2) {
    assertPath2(path2);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path2.length >= 2 && path2.charCodeAt(1) === 58 && isWindowsDeviceRoot2(path2.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i2 = path2.length - 1; i2 >= start; --i2){
        const code1 = path2.charCodeAt(i2);
        if (isPathSeparator2(code1)) {
            if (!matchedSlash) {
                startPart = i2 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i2;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path2.slice(startDot, end);
}
function format6(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format2("\\", pathObject);
}
function parse7(path2) {
    assertPath2(path2);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path2.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code1 = path2.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator2(code1)) {
            rootEnd = 1;
            if (isPathSeparator2(path2.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator2(path2.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator2(path2.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator2(path2.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot2(code1)) {
            if (path2.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator2(path2.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path2;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path2;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator2(code1)) {
        ret.root = ret.dir = path2;
        return ret;
    }
    if (rootEnd > 0) ret.root = path2.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i2 = path2.length - 1;
    let preDotState = 0;
    for(; i2 >= rootEnd; --i2){
        code1 = path2.charCodeAt(i2);
        if (isPathSeparator2(code1)) {
            if (!matchedSlash) {
                startPart = i2 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i2;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path2.slice(startPart, end);
        }
    } else {
        ret.name = path2.slice(startPart, startDot);
        ret.base = path2.slice(startPart, end);
        ret.ext = path2.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path2.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl6(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path2 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path2 = `\\\\${url.hostname}${path2}`;
    }
    return path2;
}
function toFileUrl3(path2) {
    if (!isAbsolute6(path2)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path2.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\][^/\\]))?(.*)/);
    const url = new URL("file:///");
    url.pathname = pathname.replace(/%/g, "%25");
    if (hostname != null) {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod6 = function() {
    return {
        sep: sep6,
        delimiter: delimiter6,
        resolve: resolve7,
        normalize: normalize6,
        isAbsolute: isAbsolute6,
        join: join6,
        relative: relative6,
        toNamespacedPath: toNamespacedPath6,
        dirname: dirname6,
        basename: basename6,
        extname: extname6,
        format: format6,
        parse: parse7,
        fromFileUrl: fromFileUrl6,
        toFileUrl: toFileUrl3
    };
}();
const sep7 = "/";
const delimiter7 = ":";
function resolve8(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i2 = pathSegments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--){
        let path2;
        if (i2 >= 0) path2 = pathSegments[i2];
        else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path2 = Deno.cwd();
        }
        assertPath2(path2);
        if (path2.length === 0) {
            continue;
        }
        resolvedPath = `${path2}/${resolvedPath}`;
        resolvedAbsolute = path2.charCodeAt(0) === CHAR_FORWARD_SLASH2;
    }
    resolvedPath = normalizeString2(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator2);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize7(path2) {
    assertPath2(path2);
    if (path2.length === 0) return ".";
    const isAbsolute7 = path2.charCodeAt(0) === 47;
    const trailingSeparator = path2.charCodeAt(path2.length - 1) === 47;
    path2 = normalizeString2(path2, !isAbsolute7, "/", isPosixPathSeparator2);
    if (path2.length === 0 && !isAbsolute7) path2 = ".";
    if (path2.length > 0 && trailingSeparator) path2 += "/";
    if (isAbsolute7) return `/${path2}`;
    return path2;
}
function isAbsolute7(path2) {
    assertPath2(path2);
    return path2.length > 0 && path2.charCodeAt(0) === 47;
}
function join7(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i2 = 0, len = paths.length; i2 < len; ++i2){
        const path2 = paths[i2];
        assertPath2(path2);
        if (path2.length > 0) {
            if (!joined) joined = path2;
            else joined += `/${path2}`;
        }
    }
    if (!joined) return ".";
    return normalize7(joined);
}
function relative7(from, to) {
    assertPath2(from);
    assertPath2(to);
    if (from === to) return "";
    from = resolve8(from);
    to = resolve8(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i2 = 0;
    for(; i2 <= length; ++i2){
        if (i2 === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i2) === 47) {
                    return to.slice(toStart + i2 + 1);
                } else if (i2 === 0) {
                    return to.slice(toStart + i2);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i2) === 47) {
                    lastCommonSep = i2;
                } else if (i2 === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i2);
        const toCode = to.charCodeAt(toStart + i2);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i2;
    }
    let out = "";
    for(i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2){
        if (i2 === fromEnd || from.charCodeAt(i2) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath7(path2) {
    return path2;
}
function dirname7(path2) {
    assertPath2(path2);
    if (path2.length === 0) return ".";
    const hasRoot = path2.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i2 = path2.length - 1; i2 >= 1; --i2){
        if (path2.charCodeAt(i2) === 47) {
            if (!matchedSlash) {
                end = i2;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path2.slice(0, end);
}
function basename7(path2, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath2(path2);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i2;
    if (ext !== undefined && ext.length > 0 && ext.length <= path2.length) {
        if (ext.length === path2.length && ext === path2) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i2 = path2.length - 1; i2 >= 0; --i2){
            const code1 = path2.charCodeAt(i2);
            if (code1 === 47) {
                if (!matchedSlash) {
                    start = i2 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i2 + 1;
                }
                if (extIdx >= 0) {
                    if (code1 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
                            end = i2;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path2.length;
        return path2.slice(start, end);
    } else {
        for(i2 = path2.length - 1; i2 >= 0; --i2){
            if (path2.charCodeAt(i2) === 47) {
                if (!matchedSlash) {
                    start = i2 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i2 + 1;
            }
        }
        if (end === -1) return "";
        return path2.slice(start, end);
    }
}
function extname7(path2) {
    assertPath2(path2);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i2 = path2.length - 1; i2 >= 0; --i2){
        const code1 = path2.charCodeAt(i2);
        if (code1 === 47) {
            if (!matchedSlash) {
                startPart = i2 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i2;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path2.slice(startDot, end);
}
function format7(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format2("/", pathObject);
}
function parse8(path2) {
    assertPath2(path2);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path2.length === 0) return ret;
    const isAbsolute8 = path2.charCodeAt(0) === 47;
    let start;
    if (isAbsolute8) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i2 = path2.length - 1;
    let preDotState = 0;
    for(; i2 >= start; --i2){
        const code1 = path2.charCodeAt(i2);
        if (code1 === 47) {
            if (!matchedSlash) {
                startPart = i2 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
        }
        if (code1 === 46) {
            if (startDot === -1) startDot = i2;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute8) {
                ret.base = ret.name = path2.slice(1, end);
            } else {
                ret.base = ret.name = path2.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute8) {
            ret.name = path2.slice(1, startDot);
            ret.base = path2.slice(1, end);
        } else {
            ret.name = path2.slice(startPart, startDot);
            ret.base = path2.slice(startPart, end);
        }
        ret.ext = path2.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path2.slice(0, startPart - 1);
    else if (isAbsolute8) ret.dir = "/";
    return ret;
}
function fromFileUrl7(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl4(path2) {
    if (!isAbsolute7(path2)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = path2.replace(/%/g, "%25").replace(/\\/g, "%5C");
    return url;
}
const mod7 = function() {
    return {
        sep: sep7,
        delimiter: delimiter7,
        resolve: resolve8,
        normalize: normalize7,
        isAbsolute: isAbsolute7,
        join: join7,
        relative: relative7,
        toNamespacedPath: toNamespacedPath7,
        dirname: dirname7,
        basename: basename7,
        extname: extname7,
        format: format7,
        parse: parse8,
        fromFileUrl: fromFileUrl7,
        toFileUrl: toFileUrl4
    };
}();
const path2 = isWindows2 ? mod6 : mod7;
const { basename: basename8 , delimiter: delimiter8 , dirname: dirname8 , extname: extname8 , format: format8 , fromFileUrl: fromFileUrl8 , isAbsolute: isAbsolute8 , join: join8 , normalize: normalize8 , parse: parse9 , relative: relative8 , resolve: resolve9 , sep: sep8 , toFileUrl: toFileUrl5 , toNamespacedPath: toNamespacedPath8 ,  } = path2;
function _createWalkEntrySync(path3) {
    path3 = normalize8(path3);
    const name1 = basename8(path3);
    const info = Deno.statSync(path3);
    return {
        path: path3,
        name: name1,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink
    };
}
function include(path3, exts, match, skip) {
    if (exts && !exts.some((ext)=>path3.endsWith(ext)
    )) {
        return false;
    }
    if (match && !match.some((pattern)=>!!path3.match(pattern)
    )) {
        return false;
    }
    if (skip && skip.some((pattern)=>!!path3.match(pattern)
    )) {
        return false;
    }
    return true;
}
function* walkSync(root, { maxDepth =Infinity , includeFiles =true , includeDirs =true , followSymlinks =false , exts =undefined , match =undefined , skip =undefined  } = {
}) {
    if (maxDepth < 0) {
        return;
    }
    if (includeDirs && include(root, exts, match, skip)) {
        yield _createWalkEntrySync(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    for (const entry of Deno.readDirSync(root)){
        assert2(entry.name != null);
        let path3 = join8(root, entry.name);
        if (entry.isSymlink) {
            if (followSymlinks) {
                path3 = Deno.realPathSync(path3);
            } else {
                continue;
            }
        }
        if (entry.isFile) {
            if (includeFiles && include(path3, exts, match, skip)) {
                yield {
                    path: path3,
                    ...entry
                };
            }
        } else {
            yield* walkSync(path3, {
                maxDepth: maxDepth - 1,
                includeFiles,
                includeDirs,
                followSymlinks,
                exts,
                match,
                skip
            });
        }
    }
}
class ModuleErrors extends Utils {
    static checkDiagnostics(bundle, diagnostics, onError) {
        try {
            const { blue: blue1 , red: red1 , gray: gray1 ,  } = mod;
            function renderChainedDiags(chainedDiags) {
                let result = ``;
                const { red: red2  } = mod;
                if (chainedDiags && chainedDiags.length) {
                    for (const d of chainedDiags){
                        const diag = d;
                        result += red2(`TS${diag.code} [ERROR] `);
                        result += `${diag && diag.messageText}\n`;
                    }
                }
                return result;
            }
            if (diagnostics && diagnostics.length) {
                let errors = '';
                if (onError) {
                    onError();
                }
                let errorUuid;
                for (const d of diagnostics.filter((d1)=>!!d1.start
                )){
                    const diag = d;
                    if (diag) {
                        errorUuid = diag.fileName && diag.fileName.match(/(?<=\/)(?<uuid>[\w\d\-]+?)\.tsx$/)?.groups?.uuid || undefined;
                    }
                    const start = diag.start && diag.start.character || 0;
                    const end = diag.end && diag.end.character || 0;
                    const repeatNumber = end - start - 1;
                    const underline1 = red1(`${' '.repeat(start)}^${'~'.repeat(repeatNumber > 0 ? repeatNumber : 0)}`);
                    let sourceline = diag && diag.sourceLine || '';
                    sourceline = repeatNumber >= 0 ? gray1(sourceline.substring(0, start)) + red1(sourceline.substring(start, end)) + gray1(sourceline.substring(end)) : red1(sourceline);
                    errors += `\n        ${red1(`TS${diag && diag.code} [ERROR]`)} ${blue1(diag && diag.messageChain && diag.messageChain.messageText || diag && diag.messageText || '')}\n        ${blue1(renderChainedDiags(diag && diag.messageChain && diag.messageChain.next || []))}\n          ${sourceline}\n          ${underline1}`;
                    if (errorUuid) {
                        const component = Array.from(bundle.components.values()).find((component1)=>component1.uuid === errorUuid
                        );
                        if (component) {
                            let node = component.rootNode.nodeList.slice().reverse().find((node1)=>{
                                const tsx = node1.getOuterTSX(component).trim();
                                const truth = tsx.startsWith(diag.sourceLine.trim()) || tsx.includes(diag.sourceLine.trim());
                                return truth;
                            });
                            if (!node) {
                                const proto = component.elements.proto[0];
                                if (proto) {
                                    const innerHTML = proto.getInnerHTML();
                                    const truth = innerHTML.startsWith(diag.sourceLine.trim()) || innerHTML.includes(diag.sourceLine.trim());
                                    if (truth) {
                                        node = proto;
                                    }
                                }
                            }
                            const position2 = MapPosition.mapNodes.get(node);
                            if (position2) {
                                errors += `\n                at ${blue1(component && component.file || '')}:${position2.line}:${diag.start && diag.start.character || position2.column}\n                `;
                            } else {
                                errors += `\n                at ${blue1(component && component.file || '')}:${diag.start && diag.start.line + 1 || ''}:${diag.start && diag.start.character || ''}\n                `;
                            }
                        }
                    }
                }
                this.ShowErrors(`\n${errors}`, diagnostics);
            } else {
                HMR.removeErrors();
                return;
            }
        } catch (err) {
            this.error(`ModuleErrors: ${err.message}\n${err.stack}`);
        }
    }
    static ShowErrors(message, diagnostics) {
        try {
            const { bgRed: bgRed1 , red: red1 , bold: bold1 , yellow: yellow1  } = mod;
            const m = ModuleErrors.message(`${bgRed1("  ERROR  ")} ${red1(message)}`, {
                returns: true
            });
            console.error(m);
            HMR.error = m;
            HMR.diagnostics = diagnostics;
            HMR.sendError(m, diagnostics);
            setTimeout(()=>{
                if (!Configuration.OgoneDesignerOpened) {
                    Deno.exit(1);
                }
            }, 500);
        } catch (err) {
            this.error(`ModuleErrors: ${err.message}\n${err.stack}`);
        }
    }
}
let i2 = 0;
class TSXContextCreator1 extends Utils {
    static subdistFolderURL = './.ogone';
    static createsubdistFolderURL = './.ogone';
    static globalAppContextURL = './.ogone/ts_context.ts';
    static globalAppContextFile = '';
    static mapCreatedFiles = [];
    static cleanDistFolder() {
        const files = walkSync(TSXContextCreator1.subdistFolderURL, {
            includeFiles: true,
            includeDirs: false
        });
        for (let file of files){
            if (file.path.includes('.cache')) continue;
            Deno.removeSync(file.path);
        }
    }
    async read(bundle, opts = {
    }) {
        const startPerf = performance.now();
        try {
            const { checkOnly  } = opts;
            let hasError = false;
            this.warn(`Type checking.`);
            const entries = Array.from(bundle.components.entries());
            for await (const [key, component] of entries){
                if (checkOnly && component.isTyped && (component.file === checkOnly || component.file.endsWith(checkOnly) || checkOnly && checkOnly.endsWith(component.file))) {
                    await this.createContext(bundle, component);
                } else if (!checkOnly && component.isTyped) {
                    await this.createContext(bundle, component);
                }
            }
            const diagnosticError = await this.readContext(bundle);
            if (diagnosticError) {
                hasError = diagnosticError;
            }
            if (!hasError) {
                this.infos(`Type checking took ~${Math.floor(performance.now() - startPerf)} ms`);
                this.success('no type error found.');
                HMR.postMessage({
                    type: 'resolved'
                });
            }
        } catch (err) {
            this.error(`TSXContextCreator: ${err.message}\n${err.stack}`);
        }
    }
    static createDistFolder() {
        if (!existsSync('.ogone')) {
            Deno.mkdirSync('.ogone');
        }
    }
    async createContext(bundle, component) {
        const newpath = `./.ogone/${component.uuid}.tsx`;
        const { protocol  } = component.context;
        Deno.writeTextFileSync(newpath, protocol);
        TSXContextCreator1.mapCreatedFiles.push(newpath);
        const componentName = `comp${i2++}`;
        TSXContextCreator1.globalAppContextFile += `\n    /**\n     * Context of ${component.file}\n     * */\n      import ${componentName} from './${component.uuid}.tsx';\n      // @ts-ignore\n      ${componentName}['set'] = 0;\n      `;
    }
    async readContext(bundle) {
        try {
            const { green: green1 , gray: gray1  } = mod;
            Deno.writeTextFileSync(TSXContextCreator1.globalAppContextURL, TSXContextCreator1.globalAppContextFile);
            TSXContextCreator1.mapCreatedFiles.push(TSXContextCreator1.globalAppContextURL);
            const resultEmit = await Deno.emit(TSXContextCreator1.globalAppContextURL, {
                bundle: 'esm',
                compilerOptions: {
                    module: "esnext",
                    target: "esnext",
                    noImplicitThis: false,
                    noFallthroughCasesInSwitch: false,
                    allowJs: false,
                    removeComments: false,
                    experimentalDecorators: false,
                    noImplicitAny: true,
                    allowUnreachableCode: false,
                    jsx: "react",
                    jsxFactory: "h",
                    jsxFragmentFactory: "hf",
                    lib: [
                        "dom",
                        "esnext",
                        "es2019"
                    ],
                    inlineSourceMap: false,
                    inlineSources: false,
                    alwaysStrict: true,
                    sourceMap: false,
                    strictFunctionTypes: true
                }
            });
            const { diagnostics: diags  } = resultEmit;
            ModuleErrors.checkDiagnostics(bundle, diags);
            if (diags && diags.length) {
                return true;
            }
            return false;
        } catch (err) {
            this.error(`TSXContextCreator: ${err.message}\n${err.stack}`);
        }
    }
}
function deferred1() {
    let methods;
    const promise = new Promise((resolve10, reject)=>{
        methods = {
            resolve: resolve10,
            reject
        };
    });
    return Object.assign(promise, methods);
}
class MuxAsyncIterator1 {
    iteratorCount = 0;
    yields = [];
    throws = [];
    signal = deferred1();
    add(iterator) {
        ++this.iteratorCount;
        this.callIteratorNext(iterator);
    }
    async callIteratorNext(iterator) {
        try {
            const { value , done  } = await iterator.next();
            if (done) {
                --this.iteratorCount;
            } else {
                this.yields.push({
                    iterator,
                    value
                });
            }
        } catch (e) {
            this.throws.push(e);
        }
        this.signal.resolve();
    }
    async *iterate() {
        while(this.iteratorCount > 0){
            await this.signal;
            for(let i3 = 0; i3 < this.yields.length; i3++){
                const { iterator , value  } = this.yields[i3];
                yield value;
                this.callIteratorNext(iterator);
            }
            if (this.throws.length) {
                for (const e of this.throws){
                    throw e;
                }
                this.throws.length = 0;
            }
            this.yields.length = 0;
            this.signal = deferred1();
        }
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
const ANSI_PATTERN1 = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
var DiffType1;
(function(DiffType2) {
    DiffType2["removed"] = "removed";
    DiffType2["common"] = "common";
    DiffType2["added"] = "added";
})(DiffType1 || (DiffType1 = {
}));
class AssertionError1 extends Error {
    constructor(message6){
        super(message6);
        this.name = "AssertionError";
    }
}
function validateIntegerRange(value, name1, min = -2147483648, max = 2147483647) {
    if (!Number.isInteger(value)) {
        throw new Error(`${name1} must be 'an integer' but was ${value}`);
    }
    if (value < min || value > max) {
        throw new Error(`${name1} must be >= ${min} && <= ${max}. Value was ${value}`);
    }
}
class DenoStdInternalError3 extends Error {
    constructor(message7){
        super(message7);
        this.name = "DenoStdInternalError";
    }
}
function assert3(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError3(msg);
    }
}
function createIterResult(value, done) {
    return {
        value,
        done
    };
}
let defaultMaxListeners = 10;
class EventEmitter {
    static captureRejectionSymbol = Symbol.for("nodejs.rejection");
    static errorMonitor = Symbol("events.errorMonitor");
    static get defaultMaxListeners() {
        return defaultMaxListeners;
    }
    static set defaultMaxListeners(value) {
        defaultMaxListeners = value;
    }
    constructor(){
        this._events = new Map();
    }
    _addListener(eventName, listener, prepend) {
        this.emit("newListener", eventName, listener);
        if (this._events.has(eventName)) {
            const listeners = this._events.get(eventName);
            if (prepend) {
                listeners.unshift(listener);
            } else {
                listeners.push(listener);
            }
        } else {
            this._events.set(eventName, [
                listener
            ]);
        }
        const max = this.getMaxListeners();
        if (max > 0 && this.listenerCount(eventName) > max) {
            const warning = new Error(`Possible EventEmitter memory leak detected.\n         ${this.listenerCount(eventName)} ${eventName.toString()} listeners.\n         Use emitter.setMaxListeners() to increase limit`);
            warning.name = "MaxListenersExceededWarning";
            console.warn(warning);
        }
        return this;
    }
    addListener(eventName, listener) {
        return this._addListener(eventName, listener, false);
    }
    emit(eventName, ...args) {
        if (this._events.has(eventName)) {
            if (eventName === "error" && this._events.get(EventEmitter.errorMonitor)) {
                this.emit(EventEmitter.errorMonitor, ...args);
            }
            const listeners = this._events.get(eventName).slice();
            for (const listener3 of listeners){
                try {
                    listener3.apply(this, args);
                } catch (err) {
                    this.emit("error", err);
                }
            }
            return true;
        } else if (eventName === "error") {
            if (this._events.get(EventEmitter.errorMonitor)) {
                this.emit(EventEmitter.errorMonitor, ...args);
            }
            const errMsg = args.length > 0 ? args[0] : Error("Unhandled error.");
            throw errMsg;
        }
        return false;
    }
    eventNames() {
        return Array.from(this._events.keys());
    }
    getMaxListeners() {
        return this.maxListeners || EventEmitter.defaultMaxListeners;
    }
    listenerCount(eventName) {
        if (this._events.has(eventName)) {
            return this._events.get(eventName).length;
        } else {
            return 0;
        }
    }
    static listenerCount(emitter, eventName) {
        return emitter.listenerCount(eventName);
    }
    _listeners(target, eventName, unwrap) {
        if (!target._events.has(eventName)) {
            return [];
        }
        const eventListeners = target._events.get(eventName);
        return unwrap ? this.unwrapListeners(eventListeners) : eventListeners.slice(0);
    }
    unwrapListeners(arr) {
        const unwrappedListeners = new Array(arr.length);
        for(let i3 = 0; i3 < arr.length; i3++){
            unwrappedListeners[i3] = arr[i3]["listener"] || arr[i3];
        }
        return unwrappedListeners;
    }
    listeners(eventName) {
        return this._listeners(this, eventName, true);
    }
    rawListeners(eventName) {
        return this._listeners(this, eventName, false);
    }
    off(eventName, listener) {
        return this.removeListener(eventName, listener);
    }
    on(eventName, listener) {
        return this._addListener(eventName, listener, false);
    }
    once(eventName, listener) {
        const wrapped = this.onceWrap(eventName, listener);
        this.on(eventName, wrapped);
        return this;
    }
    onceWrap(eventName, listener) {
        const wrapper = function(...args) {
            this.context.removeListener(this.eventName, this.rawListener);
            this.listener.apply(this.context, args);
        };
        const wrapperContext = {
            eventName: eventName,
            listener: listener,
            rawListener: wrapper,
            context: this
        };
        const wrapped = wrapper.bind(wrapperContext);
        wrapperContext.rawListener = wrapped;
        wrapped.listener = listener;
        return wrapped;
    }
    prependListener(eventName, listener) {
        return this._addListener(eventName, listener, true);
    }
    prependOnceListener(eventName, listener) {
        const wrapped = this.onceWrap(eventName, listener);
        this.prependListener(eventName, wrapped);
        return this;
    }
    removeAllListeners(eventName) {
        if (this._events === undefined) {
            return this;
        }
        if (eventName) {
            if (this._events.has(eventName)) {
                const listeners = this._events.get(eventName).slice();
                this._events.delete(eventName);
                for (const listener3 of listeners){
                    this.emit("removeListener", eventName, listener3);
                }
            }
        } else {
            const eventList = this.eventNames();
            eventList.map((value)=>{
                this.removeAllListeners(value);
            });
        }
        return this;
    }
    removeListener(eventName, listener) {
        if (this._events.has(eventName)) {
            const arr = this._events.get(eventName);
            assert3(arr);
            let listenerIndex = -1;
            for(let i3 = arr.length - 1; i3 >= 0; i3--){
                if (arr[i3] == listener || arr[i3] && arr[i3]["listener"] == listener) {
                    listenerIndex = i3;
                    break;
                }
            }
            if (listenerIndex >= 0) {
                arr.splice(listenerIndex, 1);
                this.emit("removeListener", eventName, listener);
                if (arr.length === 0) {
                    this._events.delete(eventName);
                }
            }
        }
        return this;
    }
    setMaxListeners(n) {
        if (n !== Infinity) {
            if (n === 0) {
                n = Infinity;
            } else {
                validateIntegerRange(n, "maxListeners", 0);
            }
        }
        this.maxListeners = n;
        return this;
    }
    static once(emitter, name) {
        return new Promise((resolve10, reject)=>{
            if (emitter instanceof EventTarget) {
                emitter.addEventListener(name, (...args)=>{
                    resolve10(args);
                }, {
                    once: true,
                    passive: false,
                    capture: false
                });
                return;
            } else if (emitter instanceof EventEmitter) {
                const eventListener = (...args)=>{
                    if (errorListener !== undefined) {
                        emitter.removeListener("error", errorListener);
                    }
                    resolve10(args);
                };
                let errorListener;
                if (name !== "error") {
                    errorListener = (err)=>{
                        emitter.removeListener(name, eventListener);
                        reject(err);
                    };
                    emitter.once("error", errorListener);
                }
                emitter.once(name, eventListener);
                return;
            }
        });
    }
    static on(emitter, event) {
        const unconsumedEventValues = [];
        const unconsumedPromises = [];
        let error = null;
        let finished = false;
        const iterator = {
            next () {
                const value = unconsumedEventValues.shift();
                if (value) {
                    return Promise.resolve(createIterResult(value, false));
                }
                if (error) {
                    const p = Promise.reject(error);
                    error = null;
                    return p;
                }
                if (finished) {
                    return Promise.resolve(createIterResult(undefined, true));
                }
                return new Promise(function(resolve10, reject) {
                    unconsumedPromises.push({
                        resolve: resolve10,
                        reject
                    });
                });
            },
            return () {
                emitter.removeListener(event, eventHandler);
                emitter.removeListener("error", errorHandler);
                finished = true;
                for (const promise of unconsumedPromises){
                    promise.resolve(createIterResult(undefined, true));
                }
                return Promise.resolve(createIterResult(undefined, true));
            },
            throw (err) {
                error = err;
                emitter.removeListener(event, eventHandler);
                emitter.removeListener("error", errorHandler);
            },
            [Symbol.asyncIterator] () {
                return this;
            }
        };
        emitter.on(event, eventHandler);
        emitter.on("error", errorHandler);
        return iterator;
        function eventHandler(...args) {
            const promise = unconsumedPromises.shift();
            if (promise) {
                promise.resolve(createIterResult(args, false));
            } else {
                unconsumedEventValues.push(args);
            }
        }
        function errorHandler(err) {
            finished = true;
            const toError = unconsumedPromises.shift();
            if (toError) {
                toError.reject(err);
            } else {
                error = err;
            }
            iterator.return();
        }
    }
}
function concat1(...buf) {
    let length = 0;
    for (const b of buf){
        length += b.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const b1 of buf){
        output.set(b1, index);
        index += b1.length;
    }
    return output;
}
function copy1(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const DEFAULT_BUF_SIZE1 = 4096;
const MIN_BUF_SIZE1 = 16;
const CR1 = "\r".charCodeAt(0);
const LF1 = "\n".charCodeAt(0);
class BufferFullError1 extends Error {
    name = "BufferFullError";
    constructor(partial1){
        super("Buffer full");
        this.partial = partial1;
    }
}
class PartialReadError1 extends Deno.errors.UnexpectedEof {
    name = "PartialReadError";
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader1 {
    r = 0;
    w = 0;
    eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader1 ? r : new BufReader1(r, size);
    }
    constructor(rd2, size4 = 4096){
        if (size4 < 16) {
            size4 = MIN_BUF_SIZE1;
        }
        this._reset(new Uint8Array(size4), rd2);
    }
    size() {
        return this.buf.byteLength;
    }
    buffered() {
        return this.w - this.r;
    }
    async _fill() {
        if (this.r > 0) {
            this.buf.copyWithin(0, this.r, this.w);
            this.w -= this.r;
            this.r = 0;
        }
        if (this.w >= this.buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i3 = 100; i3 > 0; i3--){
            const rr = await this.rd.read(this.buf.subarray(this.w));
            if (rr === null) {
                this.eof = true;
                return;
            }
            assert3(rr >= 0, "negative read");
            this.w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    }
    reset(r) {
        this._reset(this.buf, r);
    }
    _reset(buf, rd) {
        this.buf = buf;
        this.rd = rd;
        this.eof = false;
    }
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.r === this.w) {
            if (p.byteLength >= this.buf.byteLength) {
                const rr1 = await this.rd.read(p);
                const nread = rr1 ?? 0;
                assert3(nread >= 0, "negative read");
                return rr1;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert3(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copy1(this.buf.subarray(this.r, this.w), p, 0);
        this.r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError1();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.r === this.w){
            if (this.eof) return null;
            await this._fill();
        }
        const c = this.buf[this.r];
        this.r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer1 = await this.readSlice(delim.charCodeAt(0));
        if (buffer1 === null) return null;
        return new TextDecoder().decode(buffer1);
    }
    async readLine() {
        let line2;
        try {
            line2 = await this.readSlice(LF1);
        } catch (err) {
            let { partial: partial2  } = err;
            assert3(partial2 instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            if (!(err instanceof BufferFullError1)) {
                throw err;
            }
            if (!this.eof && partial2.byteLength > 0 && partial2[partial2.byteLength - 1] === CR1) {
                assert3(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial2 = partial2.subarray(0, partial2.byteLength - 1);
            }
            return {
                line: partial2,
                more: !this.eof
            };
        }
        if (line2 === null) {
            return null;
        }
        if (line2.byteLength === 0) {
            return {
                line: line2,
                more: false
            };
        }
        if (line2[line2.byteLength - 1] == LF1) {
            let drop = 1;
            if (line2.byteLength > 1 && line2[line2.byteLength - 2] === CR1) {
                drop = 2;
            }
            line2 = line2.subarray(0, line2.byteLength - drop);
        }
        return {
            line: line2,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i3 = this.buf.subarray(this.r + s, this.w).indexOf(delim);
            if (i3 >= 0) {
                i3 += s;
                slice = this.buf.subarray(this.r, this.r + i3 + 1);
                this.r += i3 + 1;
                break;
            }
            if (this.eof) {
                if (this.r === this.w) {
                    return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
            }
            if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError1(oldbuf);
            }
            s = this.w - this.r;
            try {
                await this._fill();
            } catch (err) {
                err.partial = slice;
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.w - this.r;
        while(avail < n && avail < this.buf.byteLength && !this.eof){
            try {
                await this._fill();
            } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
            }
            avail = this.w - this.r;
        }
        if (avail === 0 && this.eof) {
            return null;
        } else if (avail < n && this.eof) {
            return this.buf.subarray(this.r, this.r + avail);
        } else if (avail < n) {
            throw new BufferFullError1(this.buf.subarray(this.r, this.w));
        }
        return this.buf.subarray(this.r, this.r + n);
    }
}
class AbstractBufBase1 {
    usedBufferBytes = 0;
    err = null;
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter1 extends AbstractBufBase1 {
    static create(writer, size = 4096) {
        return writer instanceof BufWriter1 ? writer : new BufWriter1(writer, size);
    }
    constructor(writer3, size5 = 4096){
        super();
        this.writer = writer3;
        if (size5 <= 0) {
            size5 = DEFAULT_BUF_SIZE1;
        }
        this.buf = new Uint8Array(size5);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await Deno.writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.writer.write(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync1 extends AbstractBufBase1 {
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync1 ? writer : new BufWriterSync1(writer, size);
    }
    constructor(writer4, size6 = 4096){
        super();
        this.writer = writer4;
        if (size6 <= 0) {
            size6 = DEFAULT_BUF_SIZE1;
        }
        this.buf = new Uint8Array(size6);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            Deno.writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const invalidHeaderCharRegex1 = /[^\t\x20-\x7e\x80-\xff]/g;
function str2(buf) {
    if (buf == null) {
        return "";
    } else {
        return new TextDecoder().decode(buf);
    }
}
function charCode1(s) {
    return s.charCodeAt(0);
}
class TextProtoReader1 {
    constructor(r2){
        this.r = r2;
    }
    async readLine() {
        const s = await this.readLineSlice();
        if (s === null) return null;
        return str2(s);
    }
    async readMIMEHeader() {
        const m = new Headers();
        let line2;
        let buf = await this.r.peek(1);
        if (buf === null) {
            return null;
        } else if (buf[0] == charCode1(" ") || buf[0] == charCode1("\t")) {
            line2 = await this.readLineSlice();
        }
        buf = await this.r.peek(1);
        if (buf === null) {
            throw new Deno.errors.UnexpectedEof();
        } else if (buf[0] == charCode1(" ") || buf[0] == charCode1("\t")) {
            throw new Deno.errors.InvalidData(`malformed MIME header initial line: ${str2(line2)}`);
        }
        while(true){
            const kv = await this.readLineSlice();
            if (kv === null) throw new Deno.errors.UnexpectedEof();
            if (kv.byteLength === 0) return m;
            let i3 = kv.indexOf(charCode1(":"));
            if (i3 < 0) {
                throw new Deno.errors.InvalidData(`malformed MIME header line: ${str2(kv)}`);
            }
            const key = str2(kv.subarray(0, i3));
            if (key == "") {
                continue;
            }
            i3++;
            while(i3 < kv.byteLength && (kv[i3] == charCode1(" ") || kv[i3] == charCode1("\t"))){
                i3++;
            }
            const value = str2(kv.subarray(i3)).replace(invalidHeaderCharRegex1, encodeURI);
            try {
                m.append(key, value);
            } catch  {
            }
        }
    }
    async readLineSlice() {
        let line2;
        while(true){
            const r3 = await this.r.readLine();
            if (r3 === null) return null;
            const { line: l , more  } = r3;
            if (!line2 && !more) {
                if (this.skipSpace(l) === 0) {
                    return new Uint8Array(0);
                }
                return l;
            }
            line2 = line2 ? concat1(line2, l) : l;
            if (!more) {
                break;
            }
        }
        return line2;
    }
    skipSpace(l) {
        let n = 0;
        for(let i3 = 0; i3 < l.length; i3++){
            if (l[i3] === charCode1(" ") || l[i3] === charCode1("\t")) {
                continue;
            }
            n++;
        }
        return n;
    }
}
var Status1;
(function(Status2) {
    Status2[Status2["Continue"] = 100] = "Continue";
    Status2[Status2["SwitchingProtocols"] = 101] = "SwitchingProtocols";
    Status2[Status2["Processing"] = 102] = "Processing";
    Status2[Status2["EarlyHints"] = 103] = "EarlyHints";
    Status2[Status2["OK"] = 200] = "OK";
    Status2[Status2["Created"] = 201] = "Created";
    Status2[Status2["Accepted"] = 202] = "Accepted";
    Status2[Status2["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
    Status2[Status2["NoContent"] = 204] = "NoContent";
    Status2[Status2["ResetContent"] = 205] = "ResetContent";
    Status2[Status2["PartialContent"] = 206] = "PartialContent";
    Status2[Status2["MultiStatus"] = 207] = "MultiStatus";
    Status2[Status2["AlreadyReported"] = 208] = "AlreadyReported";
    Status2[Status2["IMUsed"] = 226] = "IMUsed";
    Status2[Status2["MultipleChoices"] = 300] = "MultipleChoices";
    Status2[Status2["MovedPermanently"] = 301] = "MovedPermanently";
    Status2[Status2["Found"] = 302] = "Found";
    Status2[Status2["SeeOther"] = 303] = "SeeOther";
    Status2[Status2["NotModified"] = 304] = "NotModified";
    Status2[Status2["UseProxy"] = 305] = "UseProxy";
    Status2[Status2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    Status2[Status2["PermanentRedirect"] = 308] = "PermanentRedirect";
    Status2[Status2["BadRequest"] = 400] = "BadRequest";
    Status2[Status2["Unauthorized"] = 401] = "Unauthorized";
    Status2[Status2["PaymentRequired"] = 402] = "PaymentRequired";
    Status2[Status2["Forbidden"] = 403] = "Forbidden";
    Status2[Status2["NotFound"] = 404] = "NotFound";
    Status2[Status2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    Status2[Status2["NotAcceptable"] = 406] = "NotAcceptable";
    Status2[Status2["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
    Status2[Status2["RequestTimeout"] = 408] = "RequestTimeout";
    Status2[Status2["Conflict"] = 409] = "Conflict";
    Status2[Status2["Gone"] = 410] = "Gone";
    Status2[Status2["LengthRequired"] = 411] = "LengthRequired";
    Status2[Status2["PreconditionFailed"] = 412] = "PreconditionFailed";
    Status2[Status2["RequestEntityTooLarge"] = 413] = "RequestEntityTooLarge";
    Status2[Status2["RequestURITooLong"] = 414] = "RequestURITooLong";
    Status2[Status2["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    Status2[Status2["RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
    Status2[Status2["ExpectationFailed"] = 417] = "ExpectationFailed";
    Status2[Status2["Teapot"] = 418] = "Teapot";
    Status2[Status2["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    Status2[Status2["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    Status2[Status2["Locked"] = 423] = "Locked";
    Status2[Status2["FailedDependency"] = 424] = "FailedDependency";
    Status2[Status2["TooEarly"] = 425] = "TooEarly";
    Status2[Status2["UpgradeRequired"] = 426] = "UpgradeRequired";
    Status2[Status2["PreconditionRequired"] = 428] = "PreconditionRequired";
    Status2[Status2["TooManyRequests"] = 429] = "TooManyRequests";
    Status2[Status2["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    Status2[Status2["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    Status2[Status2["InternalServerError"] = 500] = "InternalServerError";
    Status2[Status2["NotImplemented"] = 501] = "NotImplemented";
    Status2[Status2["BadGateway"] = 502] = "BadGateway";
    Status2[Status2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    Status2[Status2["GatewayTimeout"] = 504] = "GatewayTimeout";
    Status2[Status2["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
    Status2[Status2["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    Status2[Status2["InsufficientStorage"] = 507] = "InsufficientStorage";
    Status2[Status2["LoopDetected"] = 508] = "LoopDetected";
    Status2[Status2["NotExtended"] = 510] = "NotExtended";
    Status2[Status2["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(Status1 || (Status1 = {
}));
const STATUS_TEXT1 = new Map([
    [
        Status1.Continue,
        "Continue"
    ],
    [
        Status1.SwitchingProtocols,
        "Switching Protocols"
    ],
    [
        Status1.Processing,
        "Processing"
    ],
    [
        Status1.EarlyHints,
        "Early Hints"
    ],
    [
        Status1.OK,
        "OK"
    ],
    [
        Status1.Created,
        "Created"
    ],
    [
        Status1.Accepted,
        "Accepted"
    ],
    [
        Status1.NonAuthoritativeInfo,
        "Non-Authoritative Information"
    ],
    [
        Status1.NoContent,
        "No Content"
    ],
    [
        Status1.ResetContent,
        "Reset Content"
    ],
    [
        Status1.PartialContent,
        "Partial Content"
    ],
    [
        Status1.MultiStatus,
        "Multi-Status"
    ],
    [
        Status1.AlreadyReported,
        "Already Reported"
    ],
    [
        Status1.IMUsed,
        "IM Used"
    ],
    [
        Status1.MultipleChoices,
        "Multiple Choices"
    ],
    [
        Status1.MovedPermanently,
        "Moved Permanently"
    ],
    [
        Status1.Found,
        "Found"
    ],
    [
        Status1.SeeOther,
        "See Other"
    ],
    [
        Status1.NotModified,
        "Not Modified"
    ],
    [
        Status1.UseProxy,
        "Use Proxy"
    ],
    [
        Status1.TemporaryRedirect,
        "Temporary Redirect"
    ],
    [
        Status1.PermanentRedirect,
        "Permanent Redirect"
    ],
    [
        Status1.BadRequest,
        "Bad Request"
    ],
    [
        Status1.Unauthorized,
        "Unauthorized"
    ],
    [
        Status1.PaymentRequired,
        "Payment Required"
    ],
    [
        Status1.Forbidden,
        "Forbidden"
    ],
    [
        Status1.NotFound,
        "Not Found"
    ],
    [
        Status1.MethodNotAllowed,
        "Method Not Allowed"
    ],
    [
        Status1.NotAcceptable,
        "Not Acceptable"
    ],
    [
        Status1.ProxyAuthRequired,
        "Proxy Authentication Required"
    ],
    [
        Status1.RequestTimeout,
        "Request Timeout"
    ],
    [
        Status1.Conflict,
        "Conflict"
    ],
    [
        Status1.Gone,
        "Gone"
    ],
    [
        Status1.LengthRequired,
        "Length Required"
    ],
    [
        Status1.PreconditionFailed,
        "Precondition Failed"
    ],
    [
        Status1.RequestEntityTooLarge,
        "Request Entity Too Large"
    ],
    [
        Status1.RequestURITooLong,
        "Request URI Too Long"
    ],
    [
        Status1.UnsupportedMediaType,
        "Unsupported Media Type"
    ],
    [
        Status1.RequestedRangeNotSatisfiable,
        "Requested Range Not Satisfiable"
    ],
    [
        Status1.ExpectationFailed,
        "Expectation Failed"
    ],
    [
        Status1.Teapot,
        "I'm a teapot"
    ],
    [
        Status1.MisdirectedRequest,
        "Misdirected Request"
    ],
    [
        Status1.UnprocessableEntity,
        "Unprocessable Entity"
    ],
    [
        Status1.Locked,
        "Locked"
    ],
    [
        Status1.FailedDependency,
        "Failed Dependency"
    ],
    [
        Status1.TooEarly,
        "Too Early"
    ],
    [
        Status1.UpgradeRequired,
        "Upgrade Required"
    ],
    [
        Status1.PreconditionRequired,
        "Precondition Required"
    ],
    [
        Status1.TooManyRequests,
        "Too Many Requests"
    ],
    [
        Status1.RequestHeaderFieldsTooLarge,
        "Request Header Fields Too Large"
    ],
    [
        Status1.UnavailableForLegalReasons,
        "Unavailable For Legal Reasons"
    ],
    [
        Status1.InternalServerError,
        "Internal Server Error"
    ],
    [
        Status1.NotImplemented,
        "Not Implemented"
    ],
    [
        Status1.BadGateway,
        "Bad Gateway"
    ],
    [
        Status1.ServiceUnavailable,
        "Service Unavailable"
    ],
    [
        Status1.GatewayTimeout,
        "Gateway Timeout"
    ],
    [
        Status1.HTTPVersionNotSupported,
        "HTTP Version Not Supported"
    ],
    [
        Status1.VariantAlsoNegotiates,
        "Variant Also Negotiates"
    ],
    [
        Status1.InsufficientStorage,
        "Insufficient Storage"
    ],
    [
        Status1.LoopDetected,
        "Loop Detected"
    ],
    [
        Status1.NotExtended,
        "Not Extended"
    ],
    [
        Status1.NetworkAuthenticationRequired,
        "Network Authentication Required"
    ], 
]);
function emptyReader1() {
    return {
        read (_) {
            return Promise.resolve(null);
        }
    };
}
function bodyReader1(contentLength, r3) {
    let totalRead = 0;
    let finished = false;
    async function read(buf) {
        if (finished) return null;
        let result;
        const remaining = contentLength - totalRead;
        if (remaining >= buf.byteLength) {
            result = await r3.read(buf);
        } else {
            const readBuf = buf.subarray(0, remaining);
            result = await r3.read(readBuf);
        }
        if (result !== null) {
            totalRead += result;
        }
        finished = totalRead === contentLength;
        return result;
    }
    return {
        read
    };
}
function chunkedBodyReader1(h, r3) {
    const tp = new TextProtoReader1(r3);
    let finished = false;
    const chunks = [];
    async function read(buf) {
        if (finished) return null;
        const [chunk] = chunks;
        if (chunk) {
            const chunkRemaining = chunk.data.byteLength - chunk.offset;
            const readLength = Math.min(chunkRemaining, buf.byteLength);
            for(let i3 = 0; i3 < readLength; i3++){
                buf[i3] = chunk.data[chunk.offset + i3];
            }
            chunk.offset += readLength;
            if (chunk.offset === chunk.data.byteLength) {
                chunks.shift();
                if (await tp.readLine() === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
            }
            return readLength;
        }
        const line2 = await tp.readLine();
        if (line2 === null) throw new Deno.errors.UnexpectedEof();
        const [chunkSizeString] = line2.split(";");
        const chunkSize = parseInt(chunkSizeString, 16);
        if (Number.isNaN(chunkSize) || chunkSize < 0) {
            throw new Deno.errors.InvalidData("Invalid chunk size");
        }
        if (chunkSize > 0) {
            if (chunkSize > buf.byteLength) {
                let eof = await r3.readFull(buf);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                const restChunk = new Uint8Array(chunkSize - buf.byteLength);
                eof = await r3.readFull(restChunk);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                } else {
                    chunks.push({
                        offset: 0,
                        data: restChunk
                    });
                }
                return buf.byteLength;
            } else {
                const bufToFill = buf.subarray(0, chunkSize);
                const eof = await r3.readFull(bufToFill);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                if (await tp.readLine() === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                return chunkSize;
            }
        } else {
            assert3(chunkSize === 0);
            if (await r3.readLine() === null) {
                throw new Deno.errors.UnexpectedEof();
            }
            await readTrailers2(h, r3);
            finished = true;
            return null;
        }
    }
    return {
        read
    };
}
function isProhibidedForTrailer1(key) {
    const s = new Set([
        "transfer-encoding",
        "content-length",
        "trailer"
    ]);
    return s.has(key.toLowerCase());
}
async function readTrailers2(headers, r3) {
    const trailers = parseTrailer2(headers.get("trailer"));
    if (trailers == null) return;
    const trailerNames = [
        ...trailers.keys()
    ];
    const tp = new TextProtoReader1(r3);
    const result = await tp.readMIMEHeader();
    if (result == null) {
        throw new Deno.errors.InvalidData("Missing trailer header.");
    }
    const undeclared = [
        ...result.keys()
    ].filter((k)=>!trailerNames.includes(k)
    );
    if (undeclared.length > 0) {
        throw new Deno.errors.InvalidData(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    for (const [k, v] of result){
        headers.append(k, v);
    }
    const missingTrailers = trailerNames.filter((k1)=>!result.has(k1)
    );
    if (missingTrailers.length > 0) {
        throw new Deno.errors.InvalidData(`Missing trailers: ${Deno.inspect(missingTrailers)}.`);
    }
    headers.delete("trailer");
}
function parseTrailer2(field) {
    if (field == null) {
        return undefined;
    }
    const trailerNames = field.split(",").map((v)=>v.trim().toLowerCase()
    );
    if (trailerNames.length === 0) {
        throw new Deno.errors.InvalidData("Empty trailer header.");
    }
    const prohibited = trailerNames.filter((k)=>isProhibidedForTrailer1(k)
    );
    if (prohibited.length > 0) {
        throw new Deno.errors.InvalidData(`Prohibited trailer names: ${Deno.inspect(prohibited)}.`);
    }
    return new Headers(trailerNames.map((key)=>[
            key,
            ""
        ]
    ));
}
async function writeChunkedBody1(w, r3) {
    const encoder1 = new TextEncoder();
    for await (const chunk of Deno.iter(r3)){
        if (chunk.byteLength <= 0) continue;
        const start = encoder1.encode(`${chunk.byteLength.toString(16)}\r\n`);
        const end = encoder1.encode("\r\n");
        await w.write(start);
        await w.write(chunk);
        await w.write(end);
        await w.flush();
    }
    const endChunk = encoder1.encode("0\r\n\r\n");
    await w.write(endChunk);
}
async function writeTrailers1(w, headers, trailers) {
    const trailer = headers.get("trailer");
    if (trailer === null) {
        throw new TypeError("Missing trailer header.");
    }
    const transferEncoding = headers.get("transfer-encoding");
    if (transferEncoding === null || !transferEncoding.match(/^chunked/)) {
        throw new TypeError(`Trailers are only allowed for "transfer-encoding: chunked", got "transfer-encoding: ${transferEncoding}".`);
    }
    const writer5 = BufWriter1.create(w);
    const trailerNames = trailer.split(",").map((s)=>s.trim().toLowerCase()
    );
    const prohibitedTrailers = trailerNames.filter((k)=>isProhibidedForTrailer1(k)
    );
    if (prohibitedTrailers.length > 0) {
        throw new TypeError(`Prohibited trailer names: ${Deno.inspect(prohibitedTrailers)}.`);
    }
    const undeclared = [
        ...trailers.keys()
    ].filter((k)=>!trailerNames.includes(k)
    );
    if (undeclared.length > 0) {
        throw new TypeError(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    const encoder1 = new TextEncoder();
    for (const [key, value] of trailers){
        await writer5.write(encoder1.encode(`${key}: ${value}\r\n`));
    }
    await writer5.write(encoder1.encode("\r\n"));
    await writer5.flush();
}
async function writeResponse1(w, r3) {
    const protoMajor = 1;
    const protoMinor = 1;
    const statusCode = r3.status || 200;
    const statusText = STATUS_TEXT1.get(statusCode);
    const writer5 = BufWriter1.create(w);
    const encoder1 = new TextEncoder();
    if (!statusText) {
        throw new Deno.errors.InvalidData("Bad status code");
    }
    if (!r3.body) {
        r3.body = new Uint8Array();
    }
    if (typeof r3.body === "string") {
        r3.body = encoder1.encode(r3.body);
    }
    let out = `HTTP/${1}.${1} ${statusCode} ${statusText}\r\n`;
    const headers = r3.headers ?? new Headers();
    if (r3.body && !headers.get("content-length")) {
        if (r3.body instanceof Uint8Array) {
            out += `content-length: ${r3.body.byteLength}\r\n`;
        } else if (!headers.get("transfer-encoding")) {
            out += "transfer-encoding: chunked\r\n";
        }
    }
    for (const [key, value] of headers){
        out += `${key}: ${value}\r\n`;
    }
    out += `\r\n`;
    const header = encoder1.encode(out);
    const n = await writer5.write(header);
    assert3(n === header.byteLength);
    if (r3.body instanceof Uint8Array) {
        const n1 = await writer5.write(r3.body);
        assert3(n1 === r3.body.byteLength);
    } else if (headers.has("content-length")) {
        const contentLength = headers.get("content-length");
        assert3(contentLength != null);
        const bodyLength = parseInt(contentLength);
        const n1 = await Deno.copy(r3.body, writer5);
        assert3(n1 === bodyLength);
    } else {
        await writeChunkedBody1(writer5, r3.body);
    }
    if (r3.trailers) {
        const t = await r3.trailers();
        await writeTrailers1(writer5, headers, t);
    }
    await writer5.flush();
}
class ServerRequest1 {
    #done=deferred();
    #contentLength=undefined;
    #body=undefined;
    #finalized=false;
    get done() {
        return this.#done.then((e)=>e
        );
    }
    get contentLength() {
        if (this.#contentLength === undefined) {
            const cl = this.headers.get("content-length");
            if (cl) {
                this.#contentLength = parseInt(cl);
                if (Number.isNaN(this.#contentLength)) {
                    this.#contentLength = null;
                }
            } else {
                this.#contentLength = null;
            }
        }
        return this.#contentLength;
    }
    get body() {
        if (!this.#body) {
            if (this.contentLength != null) {
                this.#body = bodyReader1(this.contentLength, this.r);
            } else {
                const transferEncoding = this.headers.get("transfer-encoding");
                if (transferEncoding != null) {
                    const parts = transferEncoding.split(",").map((e)=>e.trim().toLowerCase()
                    );
                    assert3(parts.includes("chunked"), 'transfer-encoding must include "chunked" if content-length is not set');
                    this.#body = chunkedBodyReader1(this.headers, this.r);
                } else {
                    this.#body = emptyReader1();
                }
            }
        }
        return this.#body;
    }
    async respond(r) {
        let err;
        try {
            await writeResponse1(this.w, r);
        } catch (e) {
            try {
                this.conn.close();
            } catch  {
            }
            err = e;
        }
        this.#done.resolve(err);
        if (err) {
            throw err;
        }
    }
    async finalize() {
        if (this.#finalized) return;
        const body = this.body;
        const buf = new Uint8Array(1024);
        while(await body.read(buf) !== null){
        }
        this.#finalized = true;
    }
}
function parseHTTPVersion1(vers) {
    switch(vers){
        case "HTTP/1.1":
            return [
                1,
                1
            ];
        case "HTTP/1.0":
            return [
                1,
                0
            ];
        default:
            {
                const Big = 1000000;
                if (!vers.startsWith("HTTP/")) {
                    break;
                }
                const dot = vers.indexOf(".");
                if (dot < 0) {
                    break;
                }
                const majorStr = vers.substring(vers.indexOf("/") + 1, dot);
                const major = Number(majorStr);
                if (!Number.isInteger(major) || major < 0 || major > 1000000) {
                    break;
                }
                const minorStr = vers.substring(dot + 1);
                const minor = Number(minorStr);
                if (!Number.isInteger(minor) || minor < 0 || minor > 1000000) {
                    break;
                }
                return [
                    major,
                    minor
                ];
            }
    }
    throw new Error(`malformed HTTP version ${vers}`);
}
async function readRequest1(conn, bufr) {
    const tp = new TextProtoReader1(bufr);
    const firstLine = await tp.readLine();
    if (firstLine === null) return null;
    const headers = await tp.readMIMEHeader();
    if (headers === null) throw new Deno.errors.UnexpectedEof();
    const req = new ServerRequest1();
    req.conn = conn;
    req.r = bufr;
    [req.method, req.url, req.proto] = firstLine.split(" ", 3);
    [req.protoMajor, req.protoMinor] = parseHTTPVersion1(req.proto);
    req.headers = headers;
    fixLength2(req);
    return req;
}
class Server1 {
    #closing=false;
    #connections=[];
    constructor(listener3){
        this.listener = listener3;
    }
    close() {
        this.#closing = true;
        this.listener.close();
        for (const conn of this.#connections){
            try {
                conn.close();
            } catch (e) {
                if (!(e instanceof Deno.errors.BadResource)) {
                    throw e;
                }
            }
        }
    }
    async *iterateHttpRequests(conn) {
        const reader = new BufReader1(conn);
        const writer5 = new BufWriter1(conn);
        while(!this.#closing){
            let request;
            try {
                request = await readRequest1(conn, reader);
            } catch (error) {
                if (error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof) {
                    try {
                        await writeResponse1(writer5, {
                            status: 400,
                            body: new TextEncoder().encode(`${error.message}\r\n\r\n`)
                        });
                    } catch (error1) {
                    }
                }
                break;
            }
            if (request === null) {
                break;
            }
            request.w = writer5;
            yield request;
            const responseError = await request.done;
            if (responseError) {
                this.untrackConnection(request.conn);
                return;
            }
            try {
                await request.finalize();
            } catch (error) {
                break;
            }
        }
        this.untrackConnection(conn);
        try {
            conn.close();
        } catch (e) {
        }
    }
    trackConnection(conn) {
        this.#connections.push(conn);
    }
    untrackConnection(conn) {
        const index = this.#connections.indexOf(conn);
        if (index !== -1) {
            this.#connections.splice(index, 1);
        }
    }
    async *acceptConnAndIterateHttpRequests(mux) {
        if (this.#closing) return;
        let conn;
        try {
            conn = await this.listener.accept();
        } catch (error) {
            if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset) {
                return mux.add(this.acceptConnAndIterateHttpRequests(mux));
            }
            throw error;
        }
        this.trackConnection(conn);
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        yield* this.iterateHttpRequests(conn);
    }
    [Symbol.asyncIterator]() {
        const mux = new MuxAsyncIterator1();
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        return mux.iterate();
    }
}
function _parseAddrFromStr(addr) {
    let url;
    try {
        const host = addr.startsWith(":") ? `0.0.0.0${addr}` : addr;
        url = new URL(`http://${host}`);
    } catch  {
        throw new TypeError("Invalid address.");
    }
    if (url.username || url.password || url.pathname != "/" || url.search || url.hash) {
        throw new TypeError("Invalid address.");
    }
    return {
        hostname: url.hostname,
        port: url.port === "" ? 80 : Number(url.port)
    };
}
function serve(addr) {
    if (typeof addr === "string") {
        addr = _parseAddrFromStr(addr);
    }
    const listener4 = Deno.listen(addr);
    return new Server1(listener4);
}
function fixLength2(req) {
    const contentLength = req.headers.get("Content-Length");
    if (contentLength) {
        const arrClen = contentLength.split(",");
        if (arrClen.length > 1) {
            const distinct = [
                ...new Set(arrClen.map((e)=>e.trim()
                ))
            ];
            if (distinct.length > 1) {
                throw Error("cannot contain multiple Content-Length headers");
            } else {
                req.headers.set("Content-Length", distinct[0]);
            }
        }
        const c = req.headers.get("Content-Length");
        if (req.method === "HEAD" && c && c !== "0") {
            throw Error("http: method cannot contain a Content-Length");
        }
        if (c && req.headers.has("transfer-encoding")) {
            throw new Error("http: Transfer-Encoding and Content-Length cannot be send together");
        }
    }
}
async function readShort(buf) {
    const high = await buf.readByte();
    if (high === null) return null;
    const low = await buf.readByte();
    if (low === null) throw new Deno.errors.UnexpectedEof();
    return high << 8 | low;
}
async function readInt(buf) {
    const high = await readShort(buf);
    if (high === null) return null;
    const low = await readShort(buf);
    if (low === null) throw new Deno.errors.UnexpectedEof();
    return high << 16 | low;
}
const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
async function readLong(buf) {
    const high = await readInt(buf);
    if (high === null) return null;
    const low = await readInt(buf);
    if (low === null) throw new Deno.errors.UnexpectedEof();
    const big = BigInt(high) << 32n | BigInt(low);
    if (big > MAX_SAFE_INTEGER) {
        throw new RangeError("Long value too big to be represented as a JavaScript number.");
    }
    return Number(big);
}
function sliceLongToBytes(d, dest = new Array(8)) {
    let big = BigInt(d);
    for(let i3 = 0; i3 < 8; i3++){
        dest[7 - i3] = Number(big & 255n);
        big >>= 8n;
    }
    return dest;
}
const HEX_CHARS = "0123456789abcdef".split("");
const EXTRA = [
    -2147483648,
    8388608,
    32768,
    128
];
const SHIFT = [
    24,
    16,
    8,
    0
];
const blocks = [];
class Sha1 {
    #blocks;
    #block;
    #start;
    #bytes;
    #hBytes;
    #finalized;
    #hashed;
    #h0=1732584193;
    #h1=4023233417;
    #h2=2562383102;
    #h3=271733878;
    #h4=3285377520;
    #lastByteIndex=0;
    constructor(sharedMemory1 = false){
        this.init(sharedMemory1);
    }
    init(sharedMemory) {
        if (sharedMemory) {
            blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
            this.#blocks = blocks;
        } else {
            this.#blocks = [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
            ];
        }
        this.#h0 = 1732584193;
        this.#h1 = 4023233417;
        this.#h2 = 2562383102;
        this.#h3 = 271733878;
        this.#h4 = 3285377520;
        this.#block = this.#start = this.#bytes = this.#hBytes = 0;
        this.#finalized = this.#hashed = false;
    }
    update(message) {
        if (this.#finalized) {
            return this;
        }
        let msg;
        if (message instanceof ArrayBuffer) {
            msg = new Uint8Array(message);
        } else {
            msg = message;
        }
        let index = 0;
        const length = msg.length;
        const blocks1 = this.#blocks;
        while(index < length){
            let i3;
            if (this.#hashed) {
                this.#hashed = false;
                blocks1[0] = this.#block;
                blocks1[16] = blocks1[1] = blocks1[2] = blocks1[3] = blocks1[4] = blocks1[5] = blocks1[6] = blocks1[7] = blocks1[8] = blocks1[9] = blocks1[10] = blocks1[11] = blocks1[12] = blocks1[13] = blocks1[14] = blocks1[15] = 0;
            }
            if (typeof msg !== "string") {
                for(i3 = this.#start; index < length && i3 < 64; ++index){
                    blocks1[i3 >> 2] |= msg[index] << SHIFT[(i3++) & 3];
                }
            } else {
                for(i3 = this.#start; index < length && i3 < 64; ++index){
                    let code1 = msg.charCodeAt(index);
                    if (code1 < 128) {
                        blocks1[i3 >> 2] |= code1 << SHIFT[(i3++) & 3];
                    } else if (code1 < 2048) {
                        blocks1[i3 >> 2] |= (192 | code1 >> 6) << SHIFT[(i3++) & 3];
                        blocks1[i3 >> 2] |= (128 | code1 & 63) << SHIFT[(i3++) & 3];
                    } else if (code1 < 55296 || code1 >= 57344) {
                        blocks1[i3 >> 2] |= (224 | code1 >> 12) << SHIFT[(i3++) & 3];
                        blocks1[i3 >> 2] |= (128 | code1 >> 6 & 63) << SHIFT[(i3++) & 3];
                        blocks1[i3 >> 2] |= (128 | code1 & 63) << SHIFT[(i3++) & 3];
                    } else {
                        code1 = 65536 + ((code1 & 1023) << 10 | msg.charCodeAt(++index) & 1023);
                        blocks1[i3 >> 2] |= (240 | code1 >> 18) << SHIFT[(i3++) & 3];
                        blocks1[i3 >> 2] |= (128 | code1 >> 12 & 63) << SHIFT[(i3++) & 3];
                        blocks1[i3 >> 2] |= (128 | code1 >> 6 & 63) << SHIFT[(i3++) & 3];
                        blocks1[i3 >> 2] |= (128 | code1 & 63) << SHIFT[(i3++) & 3];
                    }
                }
            }
            this.#lastByteIndex = i3;
            this.#bytes += i3 - this.#start;
            if (i3 >= 64) {
                this.#block = blocks1[16];
                this.#start = i3 - 64;
                this.hash();
                this.#hashed = true;
            } else {
                this.#start = i3;
            }
        }
        if (this.#bytes > 4294967295) {
            this.#hBytes += this.#bytes / 4294967296 >>> 0;
            this.#bytes = this.#bytes >>> 0;
        }
        return this;
    }
    finalize() {
        if (this.#finalized) {
            return;
        }
        this.#finalized = true;
        const blocks1 = this.#blocks;
        const i3 = this.#lastByteIndex;
        blocks1[16] = this.#block;
        blocks1[i3 >> 2] |= EXTRA[i3 & 3];
        this.#block = blocks1[16];
        if (i3 >= 56) {
            if (!this.#hashed) {
                this.hash();
            }
            blocks1[0] = this.#block;
            blocks1[16] = blocks1[1] = blocks1[2] = blocks1[3] = blocks1[4] = blocks1[5] = blocks1[6] = blocks1[7] = blocks1[8] = blocks1[9] = blocks1[10] = blocks1[11] = blocks1[12] = blocks1[13] = blocks1[14] = blocks1[15] = 0;
        }
        blocks1[14] = this.#hBytes << 3 | this.#bytes >>> 29;
        blocks1[15] = this.#bytes << 3;
        this.hash();
    }
    hash() {
        let a = this.#h0;
        let b = this.#h1;
        let c = this.#h2;
        let d = this.#h3;
        let e = this.#h4;
        let f;
        let j;
        let t;
        const blocks1 = this.#blocks;
        for(j = 16; j < 80; ++j){
            t = blocks1[j - 3] ^ blocks1[j - 8] ^ blocks1[j - 14] ^ blocks1[j - 16];
            blocks1[j] = t << 1 | t >>> 31;
        }
        for(j = 0; j < 20; j += 5){
            f = b & c | ~b & d;
            t = a << 5 | a >>> 27;
            e = t + f + e + 1518500249 + blocks1[j] >>> 0;
            b = b << 30 | b >>> 2;
            f = a & b | ~a & c;
            t = e << 5 | e >>> 27;
            d = t + f + d + 1518500249 + blocks1[j + 1] >>> 0;
            a = a << 30 | a >>> 2;
            f = e & a | ~e & b;
            t = d << 5 | d >>> 27;
            c = t + f + c + 1518500249 + blocks1[j + 2] >>> 0;
            e = e << 30 | e >>> 2;
            f = d & e | ~d & a;
            t = c << 5 | c >>> 27;
            b = t + f + b + 1518500249 + blocks1[j + 3] >>> 0;
            d = d << 30 | d >>> 2;
            f = c & d | ~c & e;
            t = b << 5 | b >>> 27;
            a = t + f + a + 1518500249 + blocks1[j + 4] >>> 0;
            c = c << 30 | c >>> 2;
        }
        for(; j < 40; j += 5){
            f = b ^ c ^ d;
            t = a << 5 | a >>> 27;
            e = t + f + e + 1859775393 + blocks1[j] >>> 0;
            b = b << 30 | b >>> 2;
            f = a ^ b ^ c;
            t = e << 5 | e >>> 27;
            d = t + f + d + 1859775393 + blocks1[j + 1] >>> 0;
            a = a << 30 | a >>> 2;
            f = e ^ a ^ b;
            t = d << 5 | d >>> 27;
            c = t + f + c + 1859775393 + blocks1[j + 2] >>> 0;
            e = e << 30 | e >>> 2;
            f = d ^ e ^ a;
            t = c << 5 | c >>> 27;
            b = t + f + b + 1859775393 + blocks1[j + 3] >>> 0;
            d = d << 30 | d >>> 2;
            f = c ^ d ^ e;
            t = b << 5 | b >>> 27;
            a = t + f + a + 1859775393 + blocks1[j + 4] >>> 0;
            c = c << 30 | c >>> 2;
        }
        for(; j < 60; j += 5){
            f = b & c | b & d | c & d;
            t = a << 5 | a >>> 27;
            e = t + f + e - 1894007588 + blocks1[j] >>> 0;
            b = b << 30 | b >>> 2;
            f = a & b | a & c | b & c;
            t = e << 5 | e >>> 27;
            d = t + f + d - 1894007588 + blocks1[j + 1] >>> 0;
            a = a << 30 | a >>> 2;
            f = e & a | e & b | a & b;
            t = d << 5 | d >>> 27;
            c = t + f + c - 1894007588 + blocks1[j + 2] >>> 0;
            e = e << 30 | e >>> 2;
            f = d & e | d & a | e & a;
            t = c << 5 | c >>> 27;
            b = t + f + b - 1894007588 + blocks1[j + 3] >>> 0;
            d = d << 30 | d >>> 2;
            f = c & d | c & e | d & e;
            t = b << 5 | b >>> 27;
            a = t + f + a - 1894007588 + blocks1[j + 4] >>> 0;
            c = c << 30 | c >>> 2;
        }
        for(; j < 80; j += 5){
            f = b ^ c ^ d;
            t = a << 5 | a >>> 27;
            e = t + f + e - 899497514 + blocks1[j] >>> 0;
            b = b << 30 | b >>> 2;
            f = a ^ b ^ c;
            t = e << 5 | e >>> 27;
            d = t + f + d - 899497514 + blocks1[j + 1] >>> 0;
            a = a << 30 | a >>> 2;
            f = e ^ a ^ b;
            t = d << 5 | d >>> 27;
            c = t + f + c - 899497514 + blocks1[j + 2] >>> 0;
            e = e << 30 | e >>> 2;
            f = d ^ e ^ a;
            t = c << 5 | c >>> 27;
            b = t + f + b - 899497514 + blocks1[j + 3] >>> 0;
            d = d << 30 | d >>> 2;
            f = c ^ d ^ e;
            t = b << 5 | b >>> 27;
            a = t + f + a - 899497514 + blocks1[j + 4] >>> 0;
            c = c << 30 | c >>> 2;
        }
        this.#h0 = this.#h0 + a >>> 0;
        this.#h1 = this.#h1 + b >>> 0;
        this.#h2 = this.#h2 + c >>> 0;
        this.#h3 = this.#h3 + d >>> 0;
        this.#h4 = this.#h4 + e >>> 0;
    }
    hex() {
        this.finalize();
        const h0 = this.#h0;
        const h1 = this.#h1;
        const h2 = this.#h2;
        const h3 = this.#h3;
        const h4 = this.#h4;
        return HEX_CHARS[h0 >> 28 & 15] + HEX_CHARS[h0 >> 24 & 15] + HEX_CHARS[h0 >> 20 & 15] + HEX_CHARS[h0 >> 16 & 15] + HEX_CHARS[h0 >> 12 & 15] + HEX_CHARS[h0 >> 8 & 15] + HEX_CHARS[h0 >> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >> 28 & 15] + HEX_CHARS[h1 >> 24 & 15] + HEX_CHARS[h1 >> 20 & 15] + HEX_CHARS[h1 >> 16 & 15] + HEX_CHARS[h1 >> 12 & 15] + HEX_CHARS[h1 >> 8 & 15] + HEX_CHARS[h1 >> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >> 28 & 15] + HEX_CHARS[h2 >> 24 & 15] + HEX_CHARS[h2 >> 20 & 15] + HEX_CHARS[h2 >> 16 & 15] + HEX_CHARS[h2 >> 12 & 15] + HEX_CHARS[h2 >> 8 & 15] + HEX_CHARS[h2 >> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >> 28 & 15] + HEX_CHARS[h3 >> 24 & 15] + HEX_CHARS[h3 >> 20 & 15] + HEX_CHARS[h3 >> 16 & 15] + HEX_CHARS[h3 >> 12 & 15] + HEX_CHARS[h3 >> 8 & 15] + HEX_CHARS[h3 >> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >> 28 & 15] + HEX_CHARS[h4 >> 24 & 15] + HEX_CHARS[h4 >> 20 & 15] + HEX_CHARS[h4 >> 16 & 15] + HEX_CHARS[h4 >> 12 & 15] + HEX_CHARS[h4 >> 8 & 15] + HEX_CHARS[h4 >> 4 & 15] + HEX_CHARS[h4 & 15];
    }
    toString() {
        return this.hex();
    }
    digest() {
        this.finalize();
        const h0 = this.#h0;
        const h1 = this.#h1;
        const h2 = this.#h2;
        const h3 = this.#h3;
        const h4 = this.#h4;
        return [
            h0 >> 24 & 255,
            h0 >> 16 & 255,
            h0 >> 8 & 255,
            h0 & 255,
            h1 >> 24 & 255,
            h1 >> 16 & 255,
            h1 >> 8 & 255,
            h1 & 255,
            h2 >> 24 & 255,
            h2 >> 16 & 255,
            h2 >> 8 & 255,
            h2 & 255,
            h3 >> 24 & 255,
            h3 >> 16 & 255,
            h3 >> 8 & 255,
            h3 & 255,
            h4 >> 24 & 255,
            h4 >> 16 & 255,
            h4 >> 8 & 255,
            h4 & 255, 
        ];
    }
    array() {
        return this.digest();
    }
    arrayBuffer() {
        this.finalize();
        const buffer1 = new ArrayBuffer(20);
        const dataView = new DataView(buffer1);
        dataView.setUint32(0, this.#h0);
        dataView.setUint32(4, this.#h1);
        dataView.setUint32(8, this.#h2);
        dataView.setUint32(12, this.#h3);
        dataView.setUint32(16, this.#h4);
        return buffer1;
    }
}
class HmacSha1 extends Sha1 {
    #sharedMemory;
    #inner;
    #oKeyPad;
    constructor(secretKey, sharedMemory2 = false){
        super(sharedMemory2);
        let key;
        if (typeof secretKey === "string") {
            const bytes = [];
            const length = secretKey.length;
            let index = 0;
            for(let i3 = 0; i3 < length; i3++){
                let code1 = secretKey.charCodeAt(i3);
                if (code1 < 128) {
                    bytes[index++] = code1;
                } else if (code1 < 2048) {
                    bytes[index++] = 192 | code1 >> 6;
                    bytes[index++] = 128 | code1 & 63;
                } else if (code1 < 55296 || code1 >= 57344) {
                    bytes[index++] = 224 | code1 >> 12;
                    bytes[index++] = 128 | code1 >> 6 & 63;
                    bytes[index++] = 128 | code1 & 63;
                } else {
                    code1 = 65536 + ((code1 & 1023) << 10 | secretKey.charCodeAt(++i3) & 1023);
                    bytes[index++] = 240 | code1 >> 18;
                    bytes[index++] = 128 | code1 >> 12 & 63;
                    bytes[index++] = 128 | code1 >> 6 & 63;
                    bytes[index++] = 128 | code1 & 63;
                }
            }
            key = bytes;
        } else {
            if (secretKey instanceof ArrayBuffer) {
                key = new Uint8Array(secretKey);
            } else {
                key = secretKey;
            }
        }
        if (key.length > 64) {
            key = new Sha1(true).update(key).array();
        }
        const oKeyPad = [];
        const iKeyPad = [];
        for(let i3 = 0; i3 < 64; i3++){
            const b = key[i3] || 0;
            oKeyPad[i3] = 92 ^ b;
            iKeyPad[i3] = 54 ^ b;
        }
        this.update(iKeyPad);
        this.#oKeyPad = oKeyPad;
        this.#inner = true;
        this.#sharedMemory = sharedMemory2;
    }
    finalize() {
        super.finalize();
        if (this.#inner) {
            this.#inner = false;
            const innerHash = this.array();
            super.init(this.#sharedMemory);
            this.update(this.#oKeyPad);
            this.update(innerHash);
            super.finalize();
        }
    }
}
var OpCode;
(function(OpCode1) {
    OpCode1[OpCode1["Continue"] = 0] = "Continue";
    OpCode1[OpCode1["TextFrame"] = 1] = "TextFrame";
    OpCode1[OpCode1["BinaryFrame"] = 2] = "BinaryFrame";
    OpCode1[OpCode1["Close"] = 8] = "Close";
    OpCode1[OpCode1["Ping"] = 9] = "Ping";
    OpCode1[OpCode1["Pong"] = 10] = "Pong";
})(OpCode || (OpCode = {
}));
function unmask(payload, mask) {
    if (mask) {
        for(let i4 = 0, len = payload.length; i4 < len; i4++){
            payload[i4] ^= mask[i4 & 3];
        }
    }
}
async function writeFrame(frame, writer5) {
    const payloadLength = frame.payload.byteLength;
    let header;
    const hasMask = frame.mask ? 128 : 0;
    if (frame.mask && frame.mask.byteLength !== 4) {
        throw new Error("invalid mask. mask must be 4 bytes: length=" + frame.mask.byteLength);
    }
    if (payloadLength < 126) {
        header = new Uint8Array([
            128 | frame.opcode,
            hasMask | payloadLength
        ]);
    } else if (payloadLength < 65535) {
        header = new Uint8Array([
            128 | frame.opcode,
            hasMask | 126,
            payloadLength >>> 8,
            payloadLength & 255, 
        ]);
    } else {
        header = new Uint8Array([
            128 | frame.opcode,
            hasMask | 127,
            ...sliceLongToBytes(payloadLength), 
        ]);
    }
    if (frame.mask) {
        header = concat1(header, frame.mask);
    }
    unmask(frame.payload, frame.mask);
    header = concat1(header, frame.payload);
    const w = BufWriter1.create(writer5);
    await w.write(header);
    await w.flush();
}
async function readFrame(buf) {
    let b = await buf.readByte();
    assert3(b !== null);
    let isLastFrame = false;
    switch(b >>> 4){
        case 8:
            isLastFrame = true;
            break;
        case 0:
            isLastFrame = false;
            break;
        default:
            throw new Error("invalid signature");
    }
    const opcode = b & 15;
    b = await buf.readByte();
    assert3(b !== null);
    const hasMask = b >>> 7;
    let payloadLength = b & 127;
    if (payloadLength === 126) {
        const l = await readShort(buf);
        assert3(l !== null);
        payloadLength = l;
    } else if (payloadLength === 127) {
        const l = await readLong(buf);
        assert3(l !== null);
        payloadLength = Number(l);
    }
    let mask;
    if (hasMask) {
        mask = new Uint8Array(4);
        assert3(await buf.readFull(mask) !== null);
    }
    const payload = new Uint8Array(payloadLength);
    assert3(await buf.readFull(payload) !== null);
    return {
        isLastFrame,
        opcode,
        mask,
        payload
    };
}
class WebSocketImpl {
    sendQueue = [];
    constructor({ conn , bufReader , bufWriter , mask  }){
        this.conn = conn;
        this.mask = mask;
        this.bufReader = bufReader || new BufReader1(conn);
        this.bufWriter = bufWriter || new BufWriter1(conn);
    }
    async *[Symbol.asyncIterator]() {
        const decoder1 = new TextDecoder();
        let frames = [];
        let payloadsLength = 0;
        while(!this._isClosed){
            let frame;
            try {
                frame = await readFrame(this.bufReader);
            } catch (e) {
                this.ensureSocketClosed();
                break;
            }
            unmask(frame.payload, frame.mask);
            switch(frame.opcode){
                case OpCode.TextFrame:
                case OpCode.BinaryFrame:
                case OpCode.Continue:
                    frames.push(frame);
                    payloadsLength += frame.payload.length;
                    if (frame.isLastFrame) {
                        const concat2 = new Uint8Array(payloadsLength);
                        let offs = 0;
                        for (const frame1 of frames){
                            concat2.set(frame1.payload, offs);
                            offs += frame1.payload.length;
                        }
                        if (frames[0].opcode === OpCode.TextFrame) {
                            yield decoder1.decode(concat2);
                        } else {
                            yield concat2;
                        }
                        frames = [];
                        payloadsLength = 0;
                    }
                    break;
                case OpCode.Close:
                    {
                        const code1 = frame.payload[0] << 8 | frame.payload[1];
                        const reason = decoder1.decode(frame.payload.subarray(2, frame.payload.length));
                        await this.close(code1, reason);
                        yield {
                            code: code1,
                            reason
                        };
                        return;
                    }
                case OpCode.Ping:
                    await this.enqueue({
                        opcode: OpCode.Pong,
                        payload: frame.payload,
                        isLastFrame: true
                    });
                    yield [
                        "ping",
                        frame.payload
                    ];
                    break;
                case OpCode.Pong:
                    yield [
                        "pong",
                        frame.payload
                    ];
                    break;
                default:
            }
        }
    }
    dequeue() {
        const [entry] = this.sendQueue;
        if (!entry) return;
        if (this._isClosed) return;
        const { d , frame  } = entry;
        writeFrame(frame, this.bufWriter).then(()=>d.resolve()
        ).catch((e)=>d.reject(e)
        ).finally(()=>{
            this.sendQueue.shift();
            this.dequeue();
        });
    }
    enqueue(frame) {
        if (this._isClosed) {
            throw new Deno.errors.ConnectionReset("Socket has already been closed");
        }
        const d = deferred1();
        this.sendQueue.push({
            d,
            frame
        });
        if (this.sendQueue.length === 1) {
            this.dequeue();
        }
        return d;
    }
    send(data) {
        const opcode = typeof data === "string" ? OpCode.TextFrame : OpCode.BinaryFrame;
        const payload = typeof data === "string" ? new TextEncoder().encode(data) : data;
        const isLastFrame = true;
        const frame = {
            isLastFrame: true,
            opcode,
            payload,
            mask: this.mask
        };
        return this.enqueue(frame);
    }
    ping(data = "") {
        const payload = typeof data === "string" ? new TextEncoder().encode(data) : data;
        const frame = {
            isLastFrame: true,
            opcode: OpCode.Ping,
            mask: this.mask,
            payload
        };
        return this.enqueue(frame);
    }
    _isClosed = false;
    get isClosed() {
        return this._isClosed;
    }
    async close(code = 1000, reason) {
        try {
            const header = [
                code >>> 8,
                code & 255
            ];
            let payload;
            if (reason) {
                const reasonBytes = new TextEncoder().encode(reason);
                payload = new Uint8Array(2 + reasonBytes.byteLength);
                payload.set(header);
                payload.set(reasonBytes, 2);
            } else {
                payload = new Uint8Array(header);
            }
            await this.enqueue({
                isLastFrame: true,
                opcode: OpCode.Close,
                mask: this.mask,
                payload
            });
        } catch (e) {
            throw e;
        } finally{
            this.ensureSocketClosed();
        }
    }
    closeForce() {
        this.ensureSocketClosed();
    }
    ensureSocketClosed() {
        if (this.isClosed) return;
        try {
            this.conn.close();
        } catch (e) {
            console.error(e);
        } finally{
            this._isClosed = true;
            const rest = this.sendQueue;
            this.sendQueue = [];
            rest.forEach((e)=>e.d.reject(new Deno.errors.ConnectionReset("Socket has already been closed"))
            );
        }
    }
}
function acceptable(req) {
    const upgrade = req.headers.get("upgrade");
    if (!upgrade || upgrade.toLowerCase() !== "websocket") {
        return false;
    }
    const secKey = req.headers.get("sec-websocket-key");
    return req.headers.has("sec-websocket-key") && typeof secKey === "string" && secKey.length > 0;
}
const kGUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
function createSecAccept(nonce) {
    const sha1 = new Sha1();
    sha1.update(nonce + kGUID);
    const bytes = sha1.digest();
    return btoa(String.fromCharCode(...bytes));
}
async function acceptWebSocket(req) {
    const { conn: conn1 , headers , bufReader: bufReader1 , bufWriter: bufWriter1  } = req;
    if (acceptable(req)) {
        const sock = new WebSocketImpl({
            conn: conn1,
            bufReader: bufReader1,
            bufWriter: bufWriter1
        });
        const secKey = headers.get("sec-websocket-key");
        if (typeof secKey !== "string") {
            throw new Error("sec-websocket-key is not provided");
        }
        const secAccept = createSecAccept(secKey);
        const newHeaders = new Headers({
            Upgrade: "websocket",
            Connection: "Upgrade",
            "Sec-WebSocket-Accept": secAccept
        });
        const secProtocol = headers.get("sec-websocket-protocol");
        if (typeof secProtocol === "string") {
            newHeaders.set("Sec-WebSocket-Protocol", secProtocol);
        }
        const secVersion = headers.get("sec-websocket-version");
        if (typeof secVersion === "string") {
            newHeaders.set("Sec-WebSocket-Version", secVersion);
        }
        await writeResponse1(bufWriter1, {
            status: 101,
            headers: newHeaders
        });
        return sock;
    }
    throw new Error("request is not acceptable");
}
class WebSocketError extends Error {
    constructor(e){
        super(e);
        Object.setPrototypeOf(this, WebSocketError.prototype);
    }
}
var WebSocketState;
(function(WebSocketState1) {
    WebSocketState1[WebSocketState1["CONNECTING"] = 0] = "CONNECTING";
    WebSocketState1[WebSocketState1["OPEN"] = 1] = "OPEN";
    WebSocketState1[WebSocketState1["CLOSING"] = 2] = "CLOSING";
    WebSocketState1[WebSocketState1["CLOSED"] = 3] = "CLOSED";
})(WebSocketState || (WebSocketState = {
}));
class WebSocketServer extends EventEmitter {
    clients = new Set();
    server = undefined;
    constructor(port1 = 8080, realIpHeader = null){
        super();
        this.port = port1;
        this.realIpHeader = realIpHeader;
        this.connect();
    }
    async connect() {
        this.server = serve(`:${this.port}`);
        for await (const req of this.server){
            const { conn: conn1 , r: bufReader1 , w: bufWriter1 , headers  } = req;
            try {
                const sock = await acceptWebSocket({
                    conn: conn1,
                    bufReader: bufReader1,
                    bufWriter: bufWriter1,
                    headers
                });
                if (this.realIpHeader && "hostname" in sock.conn.remoteAddr) {
                    if (!req.headers.has(this.realIpHeader)) {
                        this.emit("error", new Error("specified real ip header does not exist"));
                    } else {
                        sock.conn.remoteAddr.hostname = req.headers.get(this.realIpHeader) || sock.conn.remoteAddr.hostname;
                    }
                }
                const ws = new WebSocketAcceptedClient(sock);
                this.clients.add(ws);
                this.emit("connection", ws);
            } catch (err) {
                this.emit("error", err);
                await req.respond({
                    status: 400
                });
            }
        }
    }
    async close() {
        this.server?.close();
        this.clients.clear();
    }
}
class WebSocketAcceptedClient extends EventEmitter {
    state = WebSocketState.CONNECTING;
    constructor(sock){
        super();
        this.webSocket = sock;
        this.open();
    }
    async open() {
        this.state = WebSocketState.OPEN;
        this.emit("open");
        try {
        } catch (err) {
            this.emit("close", err);
            if (!this.webSocket.isClosed) {
                await this.webSocket.close(1000).catch((e1)=>{
                    if (this.state === WebSocketState.CLOSING && this.webSocket.isClosed) {
                        this.state = WebSocketState.CLOSED;
                        return;
                    }
                    throw new WebSocketError(e1);
                });
            }
        }
    }
    async ping(message) {
        if (this.state === WebSocketState.CONNECTING) {
            throw new WebSocketError("WebSocket is not open: state 0 (CONNECTING)");
        }
        return this.webSocket.ping(message);
    }
    async send(message) {
        if (this.state === WebSocketState.CONNECTING) {
            throw new WebSocketError("WebSocket is not open: state 0 (CONNECTING)");
        }
        return this.webSocket.send(message);
    }
    async close(code = 1000, reason) {
        if (this.state === WebSocketState.CLOSING || this.state === WebSocketState.CLOSED) {
            return;
        }
        this.state = WebSocketState.CLOSING;
        return this.webSocket.close(code, reason);
    }
    async closeForce() {
        if (this.state === WebSocketState.CLOSING || this.state === WebSocketState.CLOSED) {
            return;
        }
        this.state = WebSocketState.CLOSING;
        return this.webSocket.closeForce();
    }
    get isClosed() {
        return this.webSocket.isClosed;
    }
}
class StandardWebSocketClient extends EventEmitter {
    constructor(endpoint){
        super();
        this.endpoint = endpoint;
        if (this.endpoint !== undefined) {
            this.webSocket = new WebSocket(endpoint);
            this.webSocket.onopen = ()=>this.emit("open")
            ;
            this.webSocket.onmessage = (message8)=>this.emit("open", message8)
            ;
            this.webSocket.onclose = ()=>this.emit("close")
            ;
            this.webSocket.onerror = ()=>this.emit("error")
            ;
        }
    }
    async ping(message) {
        if (this.webSocket?.readyState === WebSocketState.CONNECTING) {
            throw new WebSocketError("WebSocket is not open: state 0 (CONNECTING)");
        }
        return this.webSocket.send("ping");
    }
    async send(message) {
        if (this.webSocket?.readyState === WebSocketState.CONNECTING) {
            throw new WebSocketError("WebSocket is not open: state 0 (CONNECTING)");
        }
        return this.webSocket.send(message);
    }
    async close(code = 1000, reason) {
        if (this.webSocket.readyState === WebSocketState.CLOSING || this.webSocket.readyState === WebSocketState.CLOSED) {
            return;
        }
        return this.webSocket.close(code, reason);
    }
    closeForce() {
        throw new Error("Method not implemented.");
    }
    get isClosed() {
        return this.webSocket.readyState === WebSocketState.CLOSED;
    }
}
var Deployer;
(function(Deployer1) {
    Deployer1["App"] = `\nconst files: { [k: string]: string } = {\n  template: void 0,\n  script: void 0,\n  style: void 0,\n};\nasync function handleRequest(request) {\n  const { pathname: PATHNAME } = new URL(request.url);\n  switch(true) {\n    {% requests %}\n    case PATHNAME === '/app.js':\n      files.script = files.script || await (\n        await (\n          await fetch(new URL('./app.js', import.meta.url).href)\n        ).blob()\n      ).text();\n      return new Response(files.script, {\n        headers: {\n          "content-type": "application/javascript; charset=UTF-8",\n        },\n      });\n    case PATHNAME === '/style.css':\n      files.style = files.style || await (\n        await (\n          await fetch(new URL('./style.css', import.meta.url).href)\n        ).blob()\n      ).text();\n      return new Response(files.style, {\n        headers: {\n          "content-type": "text/css; charset=UTF-8",\n        },\n      });\n    default:\n      files.template = files.template || await (\n        await (\n          await fetch(new URL('./index.html', import.meta.url).href)\n        ).blob()\n      ).text();\n      return new Response(files.template, {\n        headers: {\n          "content-type": "text/html; charset=UTF-8",\n        },\n      });\n      break;\n  }\n}\naddEventListener("fetch", async (event) => {\n  event.respondWith(await handleRequest(event.request));\n});\n`;
})(Deployer || (Deployer = {
}));
class WebviewEngine extends Utils {
    static subDistFolderURL = './.ogone/channel';
    static portFileURL = join2(WebviewEngine.subDistFolderURL, 'port');
    static applicationFileURL = join2(WebviewEngine.subDistFolderURL, 'application');
    static componentTextFileURL = join2(WebviewEngine.subDistFolderURL, 'component.json');
    static application = '<script>setTimeout(() => window.location.reload(), 1000);</script>';
    static clients = new Map();
    static initFolder() {
        if (!existsSync(this.subDistFolderURL)) {
            Deno.mkdirSync(this.subDistFolderURL);
        }
        Deno.writeTextFileSync(this.componentTextFileURL, '{}');
        Deno.writeTextFileSync(this.applicationFileURL, 'application file');
        this.watch();
    }
    static async watch() {
        this.watcher = Deno.watchFs(this.componentTextFileURL);
        for await (let event of this.watcher){
            const { kind  } = event;
            if (kind === 'access') {
                this.clients.forEach((client)=>{
                    const text = Deno.readTextFileSync(this.componentTextFileURL);
                    client(text);
                });
            }
        }
    }
    static updateDevServerPortFile(port) {
        try {
            Deno.writeTextFileSync(this.portFileURL, port && port.toString() || Configuration.port.toString());
        } catch (err) {
            this.error(`WebviewEngine: ${err.message}`);
        }
    }
    static updateDevServerApplicationFile(source) {
        try {
            Deno.writeTextFileSync(this.applicationFileURL, source);
            this.application = source;
        } catch (err) {
            this.error(`WebviewEngine: ${err.message}`);
        }
    }
    static getApplication() {
        try {
            if (!existsSync(this.applicationFileURL)) return this.application;
            return Deno.readTextFileSync(this.applicationFileURL);
        } catch (err) {
            this.error(`WebviewEngine: ${err.message}`);
        }
    }
    static subscribe(uuid = '', client) {
        this.clients.set(uuid, client);
    }
    static remove(uuid) {
        return this.clients.delete(uuid);
    }
}
const { lstat , lstatSync  } = Deno;
function existsSync1(filePath) {
    try {
        lstatSync(filePath);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
class ComponentsSubscriber1 extends Utils {
    AssetsParser = new AssetsParser1();
    async startRecursiveInspectionOfComponent(textFile, p, bundle, opts = {
        remote: false,
        baseUrl: "",
        current: "",
        item: null
    }) {
        try {
            const splitTextUseFirstPart = textFile.split(/\<([a-zA-Z0-9]*)+/i)[0];
            const tokens1 = this.AssetsParser.parseImportStatement(splitTextUseFirstPart);
            if (opts && opts.remote) {
                bundle.remotes.push({
                    file: textFile,
                    base: opts.base,
                    path: opts.current,
                    item: opts.item,
                    parent: opts.parent
                });
            } else {
                bundle.files.push({
                    path: p,
                    file: textFile,
                    item: opts.item,
                    parent: opts.parent
                });
            }
            if (tokens1.body && tokens1.body.imports) {
                for await (let item of Object.values(tokens1.body.imports)){
                    const { path: inputPath , type: type2 , isComponent  } = item;
                    if (!isComponent) return;
                    const path3 = inputPath.replace(/^@\//, '');
                    if (path3 === p) {
                        if (opts.recursive) {
                            this.error(`${path3}\n                Cannot import the same component inside the component.\n                please use the tag 'Self' like following:\n                  <Self />\n              `);
                            continue;
                        }
                        await this.startRecursiveInspectionOfComponent(textFile, path3, bundle, {
                            item,
                            parent: path3,
                            recursive: true
                        });
                        continue;
                    }
                    if (type2 === "remote") {
                        this.warn("Downloading", path3);
                        const file = await fetchRemoteRessource(path3);
                        if (file) {
                            await this.startRecursiveInspectionOfComponent(file, path3, bundle, {
                                remote: true,
                                base: path3.match(/(http|https|ws|wss|ftp|tcp|fttp)(\:\/{2}[^\/]+)/gi)[0],
                                current: path3,
                                item,
                                parent: p
                            });
                        } else {
                            this.error(`unreachable remote component.\t\t\ninput: ${path3}`);
                        }
                    } else if (type2 === "absolute" && existsSync1(path3)) {
                        if (Deno.build.os !== "windows") {
                            Deno.chmodSync(path3, 511);
                        }
                        const file = Deno.readTextFileSync(path3);
                        await this.startRecursiveInspectionOfComponent(file, path3, bundle, {
                            item,
                            parent: p
                        });
                    } else if (opts.remote && type2 === "relative" && opts.base) {
                        const newPath = `${opts.current.split("://")[0]}://${absolute1(opts.current.split("://")[1], path3)}`;
                        this.warn(`Downloading ${newPath}`);
                        const file = await fetchRemoteRessource(newPath);
                        if (file) {
                            await this.startRecursiveInspectionOfComponent(file, newPath, bundle, {
                                ...opts,
                                item,
                                current: newPath,
                                parent: p
                            });
                        } else {
                            this.error(`unreachable remote component.\t\t\ninput: ${newPath}`);
                        }
                    } else if (!opts.remote && type2 === "relative") {
                        const newPath = absolute1(p, path3);
                        if (existsSync1(newPath)) {
                            if (Deno.build.os !== "windows") {
                                Deno.chmodSync(newPath, 511);
                            }
                            const file = Deno.readTextFileSync(newPath);
                            await this.startRecursiveInspectionOfComponent(file, newPath, bundle, {
                                item,
                                parent: p
                            });
                        } else {
                            this.error(`component not found. input: ${path3}`);
                        }
                    } else {
                        this.error(`component not found. input: ${path3}`);
                    }
                }
            }
        } catch (err) {
            this.error(`ComponentSubscriber: ${err.message}\n${err.stack}`);
        }
    }
    async inspect(entrypoint, bundle) {
        try {
            if (existsSync1(entrypoint)) {
                if (Deno.build.os !== "windows") {
                    Deno.chmodSync(entrypoint, 511);
                }
                const rootComponentFile = Deno.readTextFileSync(entrypoint);
                await this.startRecursiveInspectionOfComponent(rootComponentFile, entrypoint, bundle, {
                    item: {
                        path: entrypoint
                    },
                    parent: entrypoint
                });
            } else {
                this.error(`entrypoint file doesn't exist \n\t${entrypoint}`);
            }
        } catch (err) {
            this.error(`ComponentSubscriber: ${err.message}\n${err.stack}`);
        }
    }
}
let id1;
function getId(type2) {
    id1 = crypto.getRandomValues(new Uint8Array(8)).join('');
    return `${type2}${id1}`;
}
class CSSScoper1 {
    preserveRegexp(str, expressions, regexp) {
        const reg = /\{([^\{\}])*\}/;
        const kReg = regexp;
        let result = str;
        while(result.match(reg)){
            const [input1] = result.match(reg);
            const key1 = getId("block");
            const content = input1;
            expressions[key1] = content;
            result = result.replace(content, key1);
        }
        const regExp = /(block\d+)/gi;
        const matches = result.match(regExp);
        if (matches) {
            matches.forEach((block, i4, arr)=>{
                const endIndex = result.indexOf(block) + block.length;
                const previousBlock = arr[i4 - 1];
                let startIndex = previousBlock ? result.indexOf(previousBlock) + previousBlock.length : 0;
                if (startIndex === endIndex || startIndex === -1) {
                    startIndex = 0;
                }
                let rule = result.slice(startIndex, endIndex);
                while(rule.match(kReg)){
                    const [input1] = rule.match(kReg);
                    const key1 = getId("reserved");
                    expressions[key1] = input1;
                    result = result.replace(input1, key1);
                    rule = rule.replace(input1, key1);
                }
            });
        }
        while(Object.keys(expressions).filter((k)=>k.startsWith("block")
        ).find((k)=>result.indexOf(k) > -1
        )){
            const key1 = Object.keys(expressions).filter((k)=>k.startsWith("block")
            ).find((k)=>result.indexOf(k) > -1
            );
            if (key1) {
                const expression = expressions[key1];
                result = result.replace(key1, expression);
            }
        }
        return result;
    }
    preserve(str, expressions, template) {
        let result = str;
        const splitted = result.split(template[0]).filter((s)=>s.indexOf(template[1]) > -1
        );
        splitted.forEach((s)=>{
            let c = s.split(template[1])[0];
            const key1 = getId("__");
            const content = `${template[0]}${c}${template[1]}`;
            expressions[key1] = content;
            result = result.replace(content, key1);
        });
        return result;
    }
    transform(cssStr, scopeId) {
        let result = cssStr;
        let expressions = {
        };
        result = this.preserve(result, expressions, [
            "(",
            ")"
        ]);
        result = this.preserve(result, expressions, [
            "[",
            "]"
        ]);
        result = this.preserveRegexp(result, expressions, /(\@keyframes)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(\@font-feature-values)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(\@font-face)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(\@counter-style)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(\@page)([\s\w\d\-]*)+(block\d+)/);
        result = this.preserveRegexp(result, expressions, /(?=(:{2}))([^\s]*)+/);
        const match = result.match(/([^\{\}])+(?=\{)/gi);
        const matches = match ? match.filter((s)=>!s.trim().startsWith("@")
        ) : null;
        if (matches) {
            matches.forEach((select)=>{
                let selector = select.replace(/((reserved|block)\d+)/gi, '');
                let s = selector;
                const inputs = selector.split(/([\s,\>\<\(\)\+\:])+/gi).filter((s1)=>s1.trim().length && !s1.match(/^([^a-zA-Z])$/gi)
                ).map((inp)=>{
                    const key1 = getId("k");
                    s = s.replace(inp, key1);
                    return {
                        key: key1,
                        value: inp
                    };
                });
                inputs.forEach((inp, i4, arr)=>{
                    let { value  } = inp;
                    if (value.indexOf(":") > -1) {
                        value = value.split(":")[0];
                    }
                    const savedPseudoElement = value.match(/(reserved\d+)+$/);
                    value = value.replace(/(reserved\d+)+$/, "");
                    value = value.replace(value, `${value}[${scopeId}]${savedPseudoElement ? savedPseudoElement[0] : ""}`);
                    arr[i4].value = value;
                });
                while(inputs.find((inp)=>s.indexOf(inp.key) > -1 && (s = s.replace(inp.key, inp.value))
                )){
                }
                result = result.replace(selector, s);
            });
        }
        result = getDeepTranslation1(result, expressions);
        return result;
    }
}
const keyframes = {
    "fade-in-bottom-left": `\n      @-webkit-keyframes fade-in-bottom-left{\n        from{\n            -webkit-opacity: 0;\n            -webkit-transform: translate3d(-100%, 100%, 0);\n        }\n        to{\n            -webkit-opacity: 1;\n            -webkit-transform: translate3d(0, 0, 0);\n        }\n    }\n\n    @keyframes fade-in-bottom-left{\n        from{\n            opacity: 0;\n            transform: translate3d(-100%, 100%, 0);\n        }\n        to{\n            opacity: 1;\n            transform: translate3d(0, 0, 0);\n        }\n    }\n      `,
    "fade-in-bottom-right": `\n      @-webkit-keyframes fade-in-bottom-right{\n        from{\n            -webkit-opacity: 0;\n            -webkit-transform: translate3d(100%, 100%, 0);\n        }\n        to{\n            -webkit-opacity: 1;\n            -webkit-transform: translate3d(0, 0, 0);\n        }\n      }\n\n      @keyframes fade-in-bottom-right{\n          from{\n              opacity: 0;\n              transform: translate3d(100%, 100%, 0);\n          }\n          to{\n              opacity: 1;\n              transform: translate3d(0, 0, 0);\n          }\n      }`,
    "fade-in-down": `\n        @-webkit-keyframes fade-in-down{\n          from{\n              -webkit-opacity: 0;\n              -webkit-transform: translate3d(0, -100%, 0);\n          }\n          to{\n              -webkit-opacity: 1;\n              -webkit-transform: translate3d(0, 0, 0);\n          }\n        }\n\n        @keyframes fade-in-down{\n            from{\n                opacity: 0;\n                transform: translate3d(0, -100%, 0);\n            }\n            to{\n                opacity: 1;\n                transform: translate3d(0, 0, 0);\n            }\n        }`,
    "fade-in-left": `\n          @-webkit-keyframes fade-in-left{\n            from{\n                -webkit-opacity: 0;\n                -webkit-transform: translate3d(-100%, 0, 0);\n            }\n            to{\n                -webkit-opacity: 1;\n                -webkit-transform: translate3d(0, 0, 0);\n            }\n          }\n\n          @keyframes fade-in-left{\n              from{\n                  opacity: 0;\n                  transform: translate3d(-100%, 0, 0);\n              }\n              to{\n                  opacity: 1;\n                  transform: translate3d(0, 0, 0);\n              }\n          }`,
    "fade-in-right": `\n            @-webkit-keyframes fade-in-right{\n              from{\n                  -webkit-opacity: 0;\n                  -webkit-transform: translate3d(100%, 0, 0);\n              }\n              to{\n                  -webkit-opacity: 1;\n                  -webkit-transform: translate3d(0, 0, 0);\n              }\n            }\n\n            @keyframes fade-in-right{\n                from{\n                    opacity: 0;\n                    transform: translate3d(100%, 0, 0);\n                }\n                to{\n                    opacity: 1;\n                    transform: translate3d(0, 0, 0);\n                }\n            }`,
    "fade-in-top-left": `\n            @-webkit-keyframes fade-in-top-left{\n              from{\n                  -webkit-opacity: 0;\n                  -webkit-transform: translate3d(-100%, -100%, 0);\n              }\n              to{\n                  -webkit-opacity: 1;\n                  -webkit-transform: translate3d(0, 0, 0);\n              }\n          }\n\n          @keyframes fade-in-top-left{\n              from{\n                  opacity: 0;\n                  transform: translate3d(-100%, -100%, 0);\n              }\n              to{\n                  opacity: 1;\n                  transform: translate3d(0, 0, 0);\n              }\n          }`,
    "fade-in-top-right": `\n            @-webkit-keyframes fade-in-top-right{\n              from{\n                  -webkit-opacity: 0;\n                  -webkit-transform: translate3d(100%, -100%, 0);\n              }\n              to{\n                  -webkit-opacity: 1;\n                  -webkit-transform: translate3d(0, 0, 0);\n              }\n            }\n\n            @keyframes fade-in-top-right{\n              from{\n                  opacity: 0;\n                  transform: translate3d(100%, -100%, 0);\n              }\n              to{\n                  opacity: 1;\n                  transform: translate3d(0, 0, 0);\n              }\n            }`,
    "fade-in-up": `\n              @-webkit-keyframes fade-in-up{\n                from{\n                    -webkit-opacity: 0;\n                    -webkit-transform: translate3d(0, 100%, 0);\n                }\n                to{\n                    -webkit-opacity: 1;\n                    -webkit-transform: translate3d(0, 0, 0);\n                }\n            }\n\n            @keyframes fade-in-up{\n                from{\n                    opacity: 0;\n                    transform: translate3d(0, 100%, 0);\n                }\n                to{\n                    opacity: 1;\n                    transform: translate3d(0, 0, 0);\n                }\n            }`,
    "fade-in": `\n              @-webkit-keyframes fade-in{\n                from{\n                    -webkit-opacity: 0;\n                }\n                to{\n                    -webkit-opacity: 1;\n                }\n            }\n\n            @keyframes fade-in{\n                from{\n                    opacity: 0;\n                }\n                to{\n                    opacity: 1;\n                }\n            }`,
    "fade-out-bottom-left": `\n              @-webkit-keyframes fade-out-bottom-left{\n                from{\n                    -webkit-opacity: 1;\n                    -webkit-transform: translate3d(0, 0, 0);\n                }\n                to{\n                    -webkit-opacity: 0;\n                    -webkit-transform: translate3d(-100%, 100%, 0);\n                }\n              }\n\n              @keyframes fade-out-bottom-left{\n                  from{\n                      opacity: 1;\n                      transform: translate3d(0, 0, 0);\n                  }\n                  to{\n                      opacity: 0;\n                      transform: translate3d(-100%, 100%, 0);\n                  }\n              }`,
    "fade-out-bottom-right": `\n                @-webkit-keyframes fade-out-bottom-right{\n                  from{\n                      -webkit-opacity: 1;\n                      -webkit-transform: translate3d(0, 0, 0);\n                  }\n                  to{\n                      -webkit-opacity: 0;\n                      -webkit-transform: translate3d(100%, 100%, 0);\n                  }\n                }\n\n                @keyframes fade-out-bottom-right{\n                    from{\n                        opacity: 1;\n                        transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        opacity: 0;\n                        transform: translate3d(100%, 100%, 0);\n                    }\n                }`,
    "fade-bottom-right": `\n                  @-webkit-keyframes fade-out-down{\n                    from{\n                        -webkit-opacity: 1;\n                        -webkit-transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        -webkit-opacity: 0;\n                        -webkit-transform: translate3d(0, 100%, 0);\n                    }\n                }\n\n                @keyframes fade-out-down{\n                    from{\n                        opacity: 1;\n                        transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        opacity: 0;\n                        transform: translate3d(0, 100%, 0);\n                    }\n                }`,
    "fade-out-left": `\n                  @-webkit-keyframes fade-out-left{\n                    from{\n                        -webkit-opacity: 1;\n                        -webkit-transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        -webkit-opacity: 0;\n                        -webkit-transform: translate3d(-100%, 0, 0);\n                    }\n                  }\n\n                  @keyframes fade-out-left{\n                      from{\n                          opacity: 1;\n                          transform: translate3d(0, 0, 0);\n                      }\n                      to{\n                          opacity: 0;\n                          transform: translate3d(-100%, 0, 0);\n                      }\n                  }`,
    "fade-out-right": `\n                  @-webkit-keyframes fade-out-right{\n                    from{\n                        -webkit-opacity: 1;\n                        -webkit-transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        -webkit-opacity: 0;\n                        -webkit-transform: translate3d(100%, 0, 0);\n                    }\n                }\n\n                @keyframes fade-out-right{\n                    from{\n                        opacity: 1;\n                        transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        opacity: 0;\n                        transform: translate3d(100%, 0, 0);\n                    }\n                }`,
    "fade-out-top-left": `\n                  @-webkit-keyframes fade-out-top-left{\n                    from{\n                        -webkit-opacity: 1;\n                        -webkit-transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        -webkit-opacity: 0;\n                        -webkit-transform: translate3d(-100%, -100%, 0);\n                    }\n                }\n\n                @keyframes fade-out-top-left{\n                    from{\n                        opacity: 1;\n                        transform: translate3d(0, 0, 0);\n                    }\n                    to{\n                        opacity: 0;\n                        transform: translate3d(-100%, -100%, 0);\n                    }\n                }`
};
class StyleDocument extends Utils {
    static renderElement(styleBundle, bundle, component) {
        let result = '';
        const entries = Array.from(styleBundle.mapDocument.entries());
        entries.forEach(([selector, parent])=>{
            result += `${selector} { `;
            const { childs  } = parent;
            childs.forEach((item)=>{
                const propsEntries = Object.entries(item.properties.props);
                const props = propsEntries.length ? propsEntries.map(([name2, value])=>`${name2}: ${value};`
                ).join('') : null;
                if (props) {
                    result += `${item.selector} { ${props} } `;
                }
            });
            result += `} `;
        });
        return result;
    }
    static saveElement(styleBundle, bundle, component, opts) {
        const { item  } = opts;
        if (!styleBundle.mapDocument.has(item.isDocument)) styleBundle.mapDocument.set(item.isDocument, {
            childs: [
                item
            ]
        });
        else {
            const doc = styleBundle.mapDocument.get(item.isDocument);
            doc.childs.push(item);
        }
    }
}
class StyleKeyframes extends Utils {
    static renderElement(styleBundle, bundle, component, opts) {
        let result = '';
        const render = ([selector, item])=>{
            if (item.isNestedKeyframes) {
                const { props  } = item.properties;
                const { parent  } = item;
                const keys = Object.keys(props);
                const animationKeys = keys.filter((k)=>k.indexOf('animation') > -1
                );
                const keyframes1 = [];
                Object.entries(props).filter(([k])=>k.indexOf('animation') < 0
                ).map(([k, value])=>{
                    const newValue = value.split('|');
                    newValue.forEach((v, i4)=>{
                        keyframes1[i4] = keyframes1[i4] || {
                        };
                        keyframes1[i4][k] = v.trim().length ? v.trim() : keyframes1[i4 - 1] ? keyframes1[i4 - 1][k] : '';
                    });
                    return [
                        k,
                        newValue
                    ];
                });
                const m = item.selector.match(/@keyframes\s+(.*)/i);
                if (m) {
                    let [, name2] = m;
                    props["animation-name"] = props["animation-name"] || name2;
                } else {
                    this.error(`${component.file}\n\t@keyframes requires a name\n\tplease follow this pattern: @keyframes <name> { ... }\n\tinput: ${item.selector} { ... }`);
                }
                result += this.template(`{% parentRule %} {% keyframesSelector %} { {% frames %} } `, {
                    parentRule: item.parent && !item.parent.isSpecial ? `{% parent.selector %} { {% animation %} }` : '',
                    frames: keyframes1.map((keyframe, i4, arr)=>{
                        const total = arr.length - 1;
                        let percent = Math.round(i4 / total * 100);
                        const entries = Object.entries(keyframe);
                        return `${Number.isNaN(percent) ? 0 : percent}% {${entries.map(([k, v])=>`${k}: ${v};`
                        ).join('')}}`;
                    }).join(''),
                    parent,
                    keyframesSelector: `@keyframes ${props["animation-name"]}`,
                    animation: `${animationKeys.map((key1)=>`${key1}:${props[key1]};`
                    ).join('')} {% animationProp %}`,
                    animationProp: !props["animation"] ? `animation-name: ${props["animation-name"]};` : ''
                });
            } else if (item.isKeyframes) {
                const propsEntries = Object.entries(item.properties.props);
                const props = propsEntries.length ? propsEntries.map(([name2, value])=>`${name2}: ${value};`
                ).join('') : null;
                if (props) {
                    result += `${item.selector} { ${props} } `;
                }
            }
        };
        if (opts && opts.id) {
            const candidate = styleBundle.mapKeyframes.get(opts.id);
            if (opts.id && candidate) [
                [
                    opts.id,
                    candidate
                ]
            ].forEach(render);
        } else {
            const entries = Array.from(styleBundle.mapKeyframes.entries());
            entries.forEach(render);
        }
        return result;
    }
    static saveElement(styleBundle, bundle, component, opts) {
        const { item  } = opts;
        if (!styleBundle.mapKeyframes.has(item.id)) styleBundle.mapKeyframes.set(item.id, item);
        else {
            this.error(`${component.file}\n\tduplicated keyframes.\n\tinput: ${item.selector} {...}`);
        }
    }
}
class StyleParser extends Utils {
    regularAtRules = /^(\@(import|namespace|charset))/i;
    nestedAtRules = /^(\@(media|keyframes|supports|document))\b/i;
    mapStyleBundle = new Map();
    getContextRecursive(styleBundle, bundle, component, opts) {
        let result = opts && opts.imported ? `(() => {` : '';
        const { expressions  } = styleBundle.tokens;
        const varEntries = Array.from(styleBundle.mapVars.entries());
        styleBundle.mapImports.forEach((item)=>{
            const { name: name2  } = item;
            result += `\nconst $${name2} = ${this.getContextRecursive(item.bundle, bundle, component, {
                imported: true
            })};`;
        });
        varEntries.forEach(([key1, item])=>{
            switch(true){
                case item.eval:
                    result += `\nconst $${key1} = typeof ${item.value} === "string" ? ${item.value} :\n            typeof ${item.value} === "function" ? ${item.value}() : eval(${item.value});`;
                    break;
                case !item.eval && typeof item.value === "string":
                    result += `\nconst $${key1} = "${item.value}";\n`;
                    break;
                case item.isSelector:
                    result += `\nconst $${key1} = $$target;\n`;
                    break;
            }
        });
        if (opts && opts.imported) {
            let exported = '{';
            varEntries.filter(([, item])=>item.exportable
            ).map(([key1])=>{
                exported += `${key1}: $${key1},`;
            });
            exported += '}';
            result += `\nreturn (${exported}); })()`;
        } else {
            result += `\n        if ('{% context %}' === 'spread' && ($$target ? $$target : {% subject %})) {\n          const _target = ($$target ? $$target : {% subject %});\n          if (!_target.value || !_target.value[0] || !_target.value[0].children) {\n            this.error(\`{% component.file %}\n\tError in style of Component: {% subject.trim() %} is not a rule.\n\tyou're getting this error cause you're trying to spread a non-rule value\n\tcant spread it inside another one\n\tinput: ...{% subject.trim() %}\`);\n          }\n          $$item.children = [\n              ...$$item.children,\n              ..._target.value[0].children,\n            ];\n          $$item.props = {\n            ...$$item.props,\n            ..._target.value[0].properties.props,\n          };\n        }\n        if ('{% context %}' === 'value') {\n          return {% subject %};\n        }\n      `;
        }
        return this.getDeepTranslation(result, expressions);
    }
    getValueOf(variable, styleBundle, bundle, component, opts) {
        const { value  } = variable;
        const { expressions  } = styleBundle.tokens;
        let result = this.getDeepTranslation(value, expressions);
        const imports = Object.fromEntries(styleBundle.mapImports.entries());
        const names = Object.keys(imports);
        names.forEach((name2)=>{
            const componentsRegExp = new RegExp(`(\\$${name2})(\.([\\w\\d\\_\\-]*)+)*`);
            const m = result.match(componentsRegExp);
            if (m) {
                const [match, nameOfComponent] = m;
                const functionBody = this.template(this.getContextRecursive(styleBundle, bundle, component), {
                    context: 'value',
                    subject: match,
                    component
                });
                const renderContext = new Function('$$item', '$$target', functionBody).bind(this);
                const newValue = renderContext(result, styleBundle.mapImports.get(nameOfComponent.replace(/^\$/, '')));
                result = result.replace(match, newValue);
            }
        });
        return result;
    }
    getProperties(css, styleBundle, bundle, component, opts) {
        const result = {
            children: [],
            props: {
            }
        };
        const { expressions  } = styleBundle.tokens;
        const endExp = /(?:;\n*(?=(?:\s+(?:.+?)\s*\:)|(?=(?:.+?)\d+_block)))/;
        const parts = css.split(endExp);
        parts.filter((rule)=>rule && rule.trim().length
        ).forEach((rule)=>{
            const isChild = rule.match(/(\d+_block)/);
            const isSpread = rule.match(/(\.{3})(.*)/);
            if (isChild) {
                const [block] = isChild;
                result.children.push(rule);
            } else if (isSpread) {
                let [, , variable] = isSpread;
                variable = this.getDeepTranslation(variable, expressions).replace(/(\;)$/, '');
                const functionBody = this.template(this.getContextRecursive(styleBundle, bundle, component), {
                    context: 'spread',
                    subject: variable,
                    component
                });
                const renderContext = new Function('$$item', '$$target', functionBody).bind(this);
                const target = this.getComponentContext(styleBundle, bundle, component, {
                    variable
                }) || styleBundle.mapVars.get(variable.replace(/^\$/, ''));
                renderContext(result, target);
            } else {
                const item = rule.split(/\:/);
                if (item) {
                    let [prop, value] = item;
                    if (value) {
                        let realValue = this.getDeepTranslation(value.trim(), expressions);
                        prop = this.getDeepTranslation(prop.trim(), expressions);
                        result.props[prop] = realValue;
                        const regReference = /@([\w\_\-]*)+/;
                        const regVars = /(?<!\-{2})\$(\w+)+/;
                        const vars = Object.fromEntries(styleBundle.mapVars.entries());
                        while(result.props[prop].match(regReference)){
                            const m = result.props[prop].match(regReference);
                            if (m) {
                                const [, ref] = m;
                                if (!result.props[ref]) {
                                    this.error(`${component.file}\n\tStyle error:\n\tcan't find value of property ${ref}.\n\tif it's defined, please place it before the property ${prop}.\n\tinput: ${prop}: ${realValue}`);
                                }
                                result.props[prop] = result.props[prop].replace(`@${ref}`, result.props[ref]);
                            }
                        }
                        while(result.props[prop].match(regVars)){
                            const m = result.props[prop].match(regVars);
                            if (m) {
                                const [, ref] = m;
                                const variableValue = this.getValueOf(vars[ref], styleBundle, bundle, component, {
                                    context: 'value'
                                });
                                if (!variableValue) {
                                    this.error(`${component.file}\n\tStyle error:\n\t${ref} is undefined.\n\tinput: ${prop}: ${realValue}`);
                                }
                                result.props[prop] = result.props[prop].replace(`$${ref}`, variableValue);
                            }
                        }
                    }
                }
            }
        });
        styleBundle.mapSelectors.get(opts.selector).properties = result;
        return result;
    }
    getComponentContext(styleBundle, bundle, component, opts = {
        variable: ''
    }) {
        if (opts) {
            const text = opts.variable;
            const entries = Array.from(styleBundle.mapImports.entries());
            const usedComponent = entries.find(([name2])=>text.startsWith(`$${name2}.`)
            );
            if (usedComponent && usedComponent[1].bundle) {
                const { mapVars  } = usedComponent[1].bundle;
                const entriesMapVars = Array.from(mapVars.entries());
                const usedVar = entriesMapVars.find(([name2])=>text.endsWith(`$${usedComponent[0]}.${name2}`)
                );
                return usedVar && usedVar[1];
            }
        }
    }
    static isNotSpecial(selector) {
        const special = [
            "@media",
            "@keyframes",
            "@font-face",
            "@supports",
            "@font-feature-values",
            "@counter-style",
            "@page",
            "@document"
        ];
        let result = !special.find((r3)=>selector.trim().startsWith(r3)
        );
        return result;
    }
    getRules(css, styleBundle, bundle, component, opts = {
    }) {
        let result = css;
        if (typeof result !== "string") {
            return;
        }
        const rules = [];
        const regExp = /(\d+_block)/gi;
        const matches = result.match(regExp);
        if (matches) {
            matches.forEach((block, i4, arr)=>{
                const endIndex = css.indexOf(block) + block.length;
                const previousBlock = arr[i4 - 1];
                let startIndex = previousBlock ? css.indexOf(previousBlock) + previousBlock.length : 0;
                if (startIndex === endIndex || startIndex === -1) {
                    startIndex = 0;
                }
                const rule = css.slice(startIndex, endIndex);
                const isKeyframes = rule.trim().startsWith("@keyframes");
                const isMedia = rule.trim().startsWith("@media");
                const isDocument = rule.trim().startsWith("@document");
                const isSupports = rule.trim().startsWith("@supports");
                const expressions = styleBundle.tokens.expressions;
                const typedExpressions = styleBundle.tokens.typedExpressions;
                let selector = this.getDeepTranslation(rule.replace(block, '').trim(), expressions);
                const keySelector = "k" + Math.random();
                if (isDocument && opts.parent) {
                    this.error(`${component.file}\n\tcan't nest @document`);
                }
                const style = __default2({
                    expressions,
                    typedExpressions,
                    value: expressions[block].trim().slice(1).slice(0, -1),
                    array: tokens
                });
                styleBundle.mapSelectors.set(keySelector, {
                    id: keySelector,
                    selector,
                    rule,
                    properties: null,
                    parent: opts.parent ? opts.parent : null,
                    children: [],
                    isSpecial: !StyleParser.isNotSpecial(rule.trim()),
                    omitOutputSelector: opts.omitOutputSelector,
                    isMedia: opts.isMedia ? opts.isMedia : false,
                    isDocument: isDocument ? selector : opts.isDocument ? opts.isDocument : false,
                    isSupports: isSupports ? selector : opts.isSupports ? opts.isSupports : false,
                    isNestedMedia: false,
                    isKeyframes
                });
                const { props: properties , children  } = this.getProperties(style, styleBundle, bundle, component, {
                    selector: keySelector
                });
                if (opts.parent && isMedia) {
                    if (children.length) {
                        this.error(`${component.file}\nError in Style, can't assign nested rule inside a nested @media.\ninput: ${selector} {${this.getDeepTranslation(children[0], expressions)}}`);
                    }
                    const item = styleBundle.mapSelectors.get(keySelector);
                    item.isNestedMedia = selector;
                    item.isMedia = selector;
                }
                if (opts.parent && isKeyframes) {
                    if (children.length) {
                        this.error(`${component.file}\nError in Style, can't assign nested rule inside a nested @keyframes.\n\tif you're trying to use classic @keyframes please use it at the style's top level\ninput: ${selector} {${this.getDeepTranslation(children[0], expressions)}}`);
                    }
                    const item = styleBundle.mapSelectors.get(keySelector);
                    item.isNestedKeyframes = selector;
                    item.isKeyframes = selector;
                }
                if (!isKeyframes) {
                    children.forEach((child)=>{
                        this.getRules(child, styleBundle, bundle, component, {
                            parent: styleBundle.mapSelectors.get(keySelector),
                            isMedia: rule.trim().startsWith('@media') ? selector : !!opts.isMedia ? opts.isMedia : false,
                            isDocument: rule.trim().startsWith('@document') ? selector : !!opts.isDocument ? opts.isDocument : false,
                            isSupports: rule.trim().startsWith('@supports') ? selector : !!opts.isSupports ? opts.isSupports : false
                        });
                    });
                }
                if (opts.parent) {
                    opts.parent.children.push(styleBundle.mapSelectors.get(keySelector));
                }
                result = result.replace(rule, '');
                rules.push(styleBundle.mapSelectors.get(keySelector));
            });
        }
        return {
            rules,
            value: result
        };
    }
    getTokens(styleBundle, bundle, component) {
        let result = styleBundle.value;
        const expressions = styleBundle.tokens.expressions;
        const typedExpressions = styleBundle.tokens.typedExpressions;
        result = __default2({
            expressions,
            typedExpressions,
            value: result,
            array: nullish.concat(tokens).concat(tokens)
        });
        styleBundle.value = result;
        return result;
    }
}
class StyleMediaQueries extends Utils {
    static renderElement(styleBundle, bundle, component, opts) {
        let result = '';
        const render = ([selector, item])=>{
            const { queries  } = item;
            queries.forEach((query)=>{
                let type2 = "normal";
                let target = query;
                if (query.id.trim() !== selector.trim()) {
                    switch(true){
                        case query.selector.trim().startsWith('@keyframes'):
                            type2 = "keyframes";
                            break;
                        case query.selector.trim().startsWith('@supports'):
                            type2 = "supports";
                            break;
                        case query.selector.trim().startsWith('@media'):
                            type2 = "media";
                            break;
                    }
                    result += StyleRenderer.render(styleBundle, bundle, component, {
                        type: type2,
                        id: target.id,
                        selector: target.selector
                    });
                } else {
                    result += `${query.selector} { `;
                    const propsEntries = Object.entries(query.properties.props);
                    const props = propsEntries.length ? propsEntries.map(([name2, value])=>`${name2}: ${value};`
                    ).join('') : null;
                    if (props) {
                        result += `${(query.isNestedMedia ? query.parent : query).selector} { ${props} } `;
                    }
                }
            });
            result += `} `;
        };
        if (opts && opts.id) {
            const candidate = styleBundle.mapMedia.get(opts.id);
            if (candidate) {
                [
                    [
                        opts.id,
                        candidate
                    ]
                ].forEach(render);
            } else {
                const candidate2 = styleBundle.mapSelectors.get(opts.id);
                [
                    [
                        opts.id,
                        candidate2
                    ]
                ].forEach(render);
            }
        } else {
            const entries = Array.from(styleBundle.mapMedia.entries());
            entries.forEach(render);
        }
        return result;
    }
    static saveElement(styleBundle, bundle, component, opts) {
        const { item  } = opts;
        if (!styleBundle.mapMedia.has(item.id)) styleBundle.mapMedia.set(item.id, {
            queries: [
                item
            ]
        });
        else {
            const itemMedia = styleBundle.mapMedia.get(item.id);
            itemMedia.queries.push(item);
        }
    }
}
class StyleRenderer extends StyleParser {
    static render(styleBundle, bundle, component, opts) {
        let result = '';
        if (opts && opts.type) {
            switch(opts.type){
                case "supports":
                    result += StyleSupports.renderElement(styleBundle, bundle, component, {
                        id: opts.selector
                    });
                    styleBundle.mapSupports.delete(opts.selector);
                    break;
                case "keyframes":
                    result += StyleKeyframes.renderElement(styleBundle, bundle, component, {
                        id: opts.id
                    });
                    styleBundle.mapKeyframes.delete(opts.id);
                    break;
                case "media":
                    result += StyleMediaQueries.renderElement(styleBundle, bundle, component, {
                        id: opts.id
                    });
                    styleBundle.mapMedia.delete(opts.id);
                    break;
                case "normal":
                    result += this.renderRules(styleBundle, bundle, component, {
                        id: opts.id
                    });
                    styleBundle.mapSelectors.delete(opts.id);
                    break;
            }
        } else {
            result += StyleDocument.renderElement(styleBundle, bundle, component);
            result += StyleSupports.renderElement(styleBundle, bundle, component);
            result += this.renderPreservedRules(styleBundle, bundle, component);
            result += this.renderRules(styleBundle, bundle, component);
            result += StyleMediaQueries.renderElement(styleBundle, bundle, component);
            result += StyleKeyframes.renderElement(styleBundle, bundle, component);
        }
        return result;
    }
    static renderRules(styleBundle, bundle, component, opts) {
        let result = '';
        const render = (item)=>{
            if (!item.isSpecial && !item.omitOutputSelector) {
                if (item.parent && this.isNotSpecial(item.parent.selector.trim()) && this.isNotSpecial(item.selector.trim())) {
                    let { selector  } = item;
                    const match = selector.match(/&/gi);
                    if (!match) {
                        selector = `${item.parent.selector} ${selector}`;
                    } else {
                        selector = selector.replace(/&/gi, item.parent.selector);
                    }
                    item.selector = selector;
                }
                const entries = Object.entries(item.properties.props);
                const props = entries.length ? entries.map(([name2, value])=>`${name2}: ${value};`
                ).join('') : null;
                if (props) {
                    result += this.template(`${item.selector} { {%props%} } `, {
                        props
                    });
                }
            }
        };
        if (opts && opts.id) {
            const rule = styleBundle.mapSelectors.get(opts.id);
            if (rule) {
                render(rule);
            } else {
                this.error(`rule not found`);
            }
        } else {
            styleBundle.mapSelectors.forEach(render);
        }
        return result;
    }
    static renderPreservedRules(styleBundle, bundle, component) {
        let result = '';
        styleBundle.mapPreservedRules.forEach((rule)=>{
            result += `${rule};`;
        });
        return this.getDeepTranslation(result, styleBundle.tokens.expressions);
    }
}
class StyleSupports extends Utils {
    static renderElement(styleBundle, bundle, component, opts) {
        let result = '';
        const render = ([selector, parent])=>{
            result += `${selector} { `;
            const { childs  } = parent;
            childs.forEach((item)=>{
                if (item.selector.trim() === selector.trim()) return;
                let type2 = "normal";
                switch(true){
                    case item.selector.trim().startsWith('@keyframes'):
                        type2 = "keyframes";
                        break;
                    case item.selector.trim().startsWith('@media'):
                        type2 = "media";
                        break;
                    case item.selector.trim().startsWith('@supports'):
                        type2 = "supports";
                        break;
                }
                if (item.selector !== selector) {
                    result += StyleRenderer.render(styleBundle, bundle, component, {
                        type: type2,
                        id: item.id,
                        selector: item.selector
                    });
                }
            });
            result += `} `;
        };
        if (opts && opts.id) {
            const candidate = styleBundle.mapSupports.get(opts.id);
            if (candidate) {
                [
                    [
                        opts.id,
                        candidate
                    ]
                ].forEach(render);
            } else {
                this.error(`@supports not found`);
            }
        } else {
            const entries = Array.from(styleBundle.mapSupports.entries());
            entries.forEach(render);
        }
        return result;
    }
    static saveElement(styleBundle, bundle, component, opts) {
        const { item  } = opts;
        if (!styleBundle.mapSupports.has(item.isSupports)) styleBundle.mapSupports.set(item.isSupports, {
            childs: [
                item
            ]
        });
        else {
            const doc = styleBundle.mapSupports.get(item.isSupports);
            doc.childs.push(item);
        }
    }
}
class StyleOutput extends StyleRenderer {
    getOutput(styleBundle, bundle, component) {
        let result = '';
        styleBundle.mapSelectors.forEach((item)=>{
            let rule = '';
            item.properties.children.forEach((child)=>{
                if (child.parent) {
                    child.parent = item;
                }
            });
            if (!!item.isSupports) {
                StyleSupports.saveElement(styleBundle, bundle, component, {
                    item
                });
            }
            if (!!item.isDocument) {
                StyleDocument.saveElement(styleBundle, bundle, component, {
                    item
                });
            }
            if (!!item.isKeyframes) {
                StyleKeyframes.saveElement(styleBundle, bundle, component, {
                    item
                });
            }
            if (!!item.isMedia) {
                StyleMediaQueries.saveElement(styleBundle, bundle, component, {
                    item
                });
            }
            result += rule;
        });
        result += StyleRenderer.render(styleBundle, bundle, component);
        styleBundle.value += result;
        return result;
    }
}
class StyleMemory extends StyleOutput {
    getVars(styleBundle, bundle, component) {
        let result = styleBundle.value;
        const parts = result.split(/(?:(;|\n+))/);
        const regExpVarsExported = /(@export)\s+(const\*{0,1})\s+(\w+)+\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+)(.*)/;
        const regExpVars = /(@const\*{0,1})\s+(\w+)+\s*((?:\-|\+){0,1}\s*\=(?:[\s\n]*)+)(.*)/;
        result = parts.map((statement)=>{
            if (statement.trim().match(this.regularAtRules)) {
                styleBundle.mapPreservedRules.set(statement, statement);
                return;
            }
            if (statement.trim().length && statement.trim().match(/(\@(const|export))/)) {
                const isConstant = statement.match(regExpVars);
                const isExportable = statement.match(regExpVarsExported);
                if (isExportable) {
                    let [match, exportable, kConst, name2, equal, value] = isExportable;
                    const evaluated = kConst.trim().endsWith('*');
                    if (styleBundle.mapVars.get(name2)) {
                        this.error(`${name2} already defined.`);
                    }
                    const isSelector = !evaluated && !!value.match(/(\d+_block)$/);
                    styleBundle.mapVars.set(name2, {
                        value: isSelector ? this.getRules(value, styleBundle, bundle, component, {
                            omitOutputSelector: true
                        }).rules : value,
                        eval: evaluated,
                        isSelector,
                        exportable: true
                    });
                } else if (isConstant) {
                    let [match, kConst, name2, equal, value] = isConstant;
                    const evaluated = kConst.trim().endsWith('*');
                    if (styleBundle.mapVars.get(name2)) {
                        this.error(`${name2} already defined.`);
                    }
                    const isSelector = !evaluated && !!value.match(/(\d+_block)$/);
                    styleBundle.mapVars.set(name2, {
                        value: isSelector ? this.getRules(value, styleBundle, bundle, component, {
                            omitOutputSelector: true
                        }).rules : value,
                        eval: evaluated,
                        isSelector,
                        exportable: false
                    });
                }
                return '';
            }
            if (statement.match(/(;|\n+)/)) {
                return '';
            }
            return statement;
        }).join('');
        styleBundle.value = result;
        return result;
    }
    async getNewStyleBundle(css, bundle, component) {
        const styleBundle = {
            input: css,
            value: css,
            mapImports: new Map(),
            mapVars: new Map(),
            mapMedia: new Map(),
            mapDocument: new Map(),
            mapSupports: new Map(),
            mapKeyframes: new Map(),
            mapSelectors: new Map(),
            mapPreservedRules: new Map(),
            component,
            tokens: {
                expressions: {
                },
                typedExpressions: {
                    blocks: {
                    },
                    parentheses: {
                    }
                }
            }
        };
        this.trace(`Style bundle created for component: ${component.file}`);
        this.getTokens(styleBundle, bundle, component);
        this.trace('All tokens analyze done');
        await this.getImports(styleBundle, bundle, component);
        this.trace(`All imports saved for component: ${component.file}`);
        this.getVars(styleBundle, bundle, component);
        this.trace(`Style variables saved`);
        styleBundle.value = this.getRules(styleBundle.value, styleBundle, bundle, component).value;
        this.getOutput(styleBundle, bundle, component);
        return styleBundle;
    }
    async getImports(styleBundle, bundle, component) {
        const entries = Object.entries(component.imports);
        for await (const [tag2, filePath] of entries){
            if (tag2 === 'Self') continue;
            if (filePath !== component.file) {
                const subcomp = bundle.components.get(filePath);
                if (!subcomp) {
                    this.error(`${component.file}\n\tStyle Use Error while fetching component: component not found.\n\tinput: ${tag2}`);
                } else {
                    styleBundle.mapImports.set(tag2, {
                        name: tag2,
                        tag: tag2
                    });
                    const item = styleBundle.mapImports.get(tag2);
                    if (item) {
                        item.bundle = await this.getNewStyleBundle(subcomp.elements.styles.map((style)=>{
                            if (style.getInnerHTML) {
                                return style.getInnerHTML();
                            }
                        }).join('\n'), bundle, subcomp);
                    }
                }
            }
        }
    }
}
class Style1 extends StyleMemory {
    async read(css, bundle, component) {
        this.trace('getting new style bundle');
        const styleBundle = await this.getNewStyleBundle(css, bundle, component);
        this.mapStyleBundle.set("k" + Math.random(), styleBundle);
        return styleBundle.value;
    }
}
class StylesheetBuilder1 extends Utils {
    static mapStyle = new Map();
    CSSScoper = new CSSScoper1();
    Style = new Style1();
    async read(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            this.trace('start component style analyze');
            for await (const [, component] of entries){
                const { styles: styles1  } = component.elements;
                this.trace('start style node analyze');
                for await (const element of styles1){
                    let styleContent = element.getInnerHTML ? element.getInnerHTML() : null;
                    const isGlobal = element.attributes.global;
                    if (styleContent) {
                        let compiledCss = "";
                        const src = element.attributes.src ? element.attributes.src.trim() : "";
                        const relativePath = join2(component.file, src);
                        const remoteRelativePath = absolute1(component.file, src);
                        const isAbsoluteRemote = [
                            "http",
                            "ws",
                            "https",
                            "ftp"
                        ].includes(src.split("://")[0]);
                        if (src.length && !component.remote) {
                            const p = existsSync1(src) ? src : existsSync1(relativePath) ? isAbsoluteRemote ? await fetchRemoteRessource(src) : relativePath : null;
                            switch(true && !!p){
                                case !p:
                                    this.error(`style's src attribute is not found. \ncomponent${component.file}\ninput: ${src}`);
                                default:
                                    this.error(`style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`);
                            }
                        } else if (src.length && component.remote) {
                            this.warn(`Downloading style: ${isAbsoluteRemote ? src : remoteRelativePath}`);
                            const p = isAbsoluteRemote ? await fetchRemoteRessource(src) : await fetchRemoteRessource(remoteRelativePath);
                            switch(true){
                                case !p:
                                    this.error(`style's src attribute is not reachable. \ncomponent${component.file}\ninput: ${src}`);
                                default:
                                    this.error(`style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`);
                            }
                        }
                        this.trace('end style element analyze, start assignment');
                        switch(element.attributes.lang){
                            default:
                                compiledCss = styleContent;
                                break;
                        }
                        if (element.attributes['--keyframes']) {
                            compiledCss = `${compiledCss} \n ${this.readKeyframes(element.attributes['--keyframes'])}`;
                        }
                        this.trace('start component style transformations');
                        compiledCss = await this.Style.read(compiledCss, bundle, component);
                        this.trace('end component style transformations, start mapStyleBundle assignment');
                        component.mapStyleBundle = this.Style.mapStyleBundle;
                        const css = isGlobal ? compiledCss : this.CSSScoper.transform(compiledCss, component.uuid);
                        component.style.push(css);
                        StylesheetBuilder1.sendChanges(component, css);
                    }
                }
            }
        } catch (err) {
            this.error(`StylesheetBuilder: ${err.message}\n${err.stack}`);
        }
    }
    async transformAllStyleElements(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            this.trace('start component style analyze');
            for await (const [, component] of entries){
                const { rootNode  } = component;
                const { nodeList  } = rootNode;
                const { styles: styles1  } = component.elements;
                const allStyles = nodeList.filter((el)=>!styles1.includes(el) && el.tagName === 'style'
                );
                for await (let element of allStyles){
                    let styleContent = element.getInnerHTML ? element.getInnerHTML() : null;
                    const isGlobal = element.attributes.global;
                    if (styleContent) {
                        let compiledCss = "";
                        const src = element.attributes.src ? element.attributes.src.trim() : "";
                        const relativePath = join2(component.file, src);
                        const remoteRelativePath = absolute1(component.file, src);
                        const isAbsoluteRemote = [
                            "http",
                            "ws",
                            "https",
                            "ftp"
                        ].includes(src.split("://")[0]);
                        if (src.length && !component.remote) {
                            const p = existsSync1(src) ? src : existsSync1(relativePath) ? isAbsoluteRemote ? await fetchRemoteRessource(src) : relativePath : null;
                            switch(true && !!p){
                                case !p:
                                    this.error(`style's src attribute is not found. \ncomponent${component.file}\ninput: ${src}`);
                                default:
                                    this.error(`style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`);
                            }
                        } else if (src.length && component.remote) {
                            this.warn(`Downloading style: ${isAbsoluteRemote ? src : remoteRelativePath}`);
                            const p = isAbsoluteRemote ? await fetchRemoteRessource(src) : await fetchRemoteRessource(remoteRelativePath);
                            switch(true){
                                case !p:
                                    this.error(`style's src attribute is not reachable. \ncomponent${component.file}\ninput: ${src}`);
                                default:
                                    this.error(`style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`);
                            }
                        }
                        this.trace('end style element analyze, start assignment');
                        switch(element.attributes.lang){
                            default:
                                compiledCss = styleContent;
                                break;
                        }
                        if (element.attributes['--keyframes']) {
                            compiledCss = `${compiledCss} \n ${this.readKeyframes(element.attributes['--keyframes'])}`;
                        }
                        this.trace('start component style transformations');
                        compiledCss = await this.Style.read(compiledCss, bundle, component);
                        compiledCss = component.elements.template?.attributes.protected || component.elements.template?.attributes.private || isGlobal || element.parentNode === component.elements.head ? compiledCss : this.CSSScoper.transform(compiledCss, component.uuid);
                        element.childNodes[0].rawText = compiledCss;
                    }
                }
            }
        } catch (err) {
            this.error(`StylesheetBuilder: ${err.message}\n${err.stack}`);
        }
    }
    readKeyframes(keyframesEvaluated) {
        try {
            const fn = new Function('get', `return (${keyframesEvaluated});`);
            const get = (name2, opts)=>{
                switch(true){
                    case typeof name2 !== 'string':
                        this.error('using keyframes fade: argument one has to be a string.');
                        break;
                }
                return `\n        .${name2} {\n          animation-name: ${name2};\n          animation-duration: ${opts.time || 1}s;\n          animation-iteration-count: ${opts.iteration || 1};\n          animation-fill-mode: ${opts.iteration || 'forwards'};\n          animation-timing-function: ${opts.style || 'linear'};\n        }\n        ${keyframes[name2]}\n      `;
            };
            const k = fn(get);
            return Array.isArray(k) ? k.join('\n') : k;
        } catch (err) {
            this.error(`StylesheetBuilder: ${err.message}\n${err.stack}`);
        }
    }
    static sendChanges(component, css) {
        if (!this.mapStyle.has(component.uuid)) {
            this.mapStyle.set(component.uuid, css);
        } else {
            const item = this.mapStyle.get(component.uuid);
            if (item !== css) {
                HMR.postMessage({
                    type: 'style',
                    uuid: component.uuid,
                    output: css
                });
                this.mapStyle.set(component.uuid, css);
            }
        }
    }
}
class ComponentTopLevelAnalyzer1 extends Utils {
    read(bundle) {
        try {
            bundle.components.forEach((c)=>{
                c.rootNode.childNodes.filter((node, id1)=>id1 !== 0
                ).forEach((node)=>{
                    if (node.nodeType === 3 && node.rawText && node.rawText.trim().length) {
                        const position2 = MapPosition.mapNodes.get(node);
                        this.error(`${c.file}:${position2 && position2.line || 0}:${position2 && position2.column || 0}\n\tTop level text are not allowed, excepted for the first lines, these will serve for the imports, services.\nplease wrap this text into the template:\n\t${node.rawText.trim()}\n\t`);
                    }
                });
            });
        } catch (err) {
            this.error(`ComponentTopLevelAnalyzer: ${err.message}\n${err.stack}`);
        }
    }
    cleanRoot(bundle) {
        try {
            bundle.components.forEach((c)=>{
                c.rootNode.childNodes = c.rootNode.childNodes.filter((node, id1)=>{
                    return node.tagName !== "style" && node.tagName !== "script" && node.tagName !== "proto" && node.nodeType !== 8 || node.nodeType === 3 && node.rawText && !node.rawText.trim().length || id1 === 0 && node.nodeType !== 3;
                });
            });
        } catch (err) {
            this.error(`ComponentTopLevelAnalyzer: ${err.message}\n${err.stack}`);
        }
    }
    switchRootNodeToTemplateNode(bundle) {
        try {
            this.read(bundle);
            bundle.components.forEach((component)=>{
                const forbiddenNode = component.rootNode.childNodes.find((n)=>n && n.nodeType === 1 && ![
                        "template",
                        "proto"
                    ].includes(n.tagName)
                );
                if (forbiddenNode) {
                    const position2 = MapPosition.mapNodes.get(forbiddenNode);
                    this.error(`Component Structure Error: ${component.file}:${position2.line}:${position2.column}\n          [v0.29.0] Only proto and template elements are allowed at the top-level of the component:\n          please follow this pattern:\n            <template>\n              <${forbiddenNode.tagName} />\n            </template>\n            <proto>\n              ...\n            </proto>\n\n          you're getting this error cause the ${forbiddenNode.tagName} element is not wrapped into the template element.\n          This is to keep a scalable structure for your components.\n\n          Also note that since 0.29.0, to style your component you will need to define the style element into the template element.\n          the first style elements will be scoped as before 0.29.0\n        `);
                }
                if (component.elements.template) {
                    component.rootNode.childNodes = component.elements.template.childNodes.slice();
                    component.rootNode.childNodes.forEach((n)=>{
                        n.parentNode = component.rootNode;
                    });
                }
            });
        } catch (err) {
            this.error(`ComponentTopLevelAnalyzer: ${err.message}\n${err.stack}`);
        }
    }
}
class StoreArgumentReader1 extends Utils {
    read(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            entries.forEach(([pathToComponent, component])=>{
                if (!component.rootNode || component.type === "store") return;
                const cr = component.rootNode.childNodes;
                const stores = cr.filter((child)=>{
                    const { tagName  } = child;
                    if (!tagName) return;
                    const isImported = component.imports[tagName];
                    const subComponent = bundle.components.get(isImported);
                    return subComponent && subComponent.type === "store";
                });
                component.hasStore = stores.length > 0;
                stores.forEach((store)=>{
                    const forbiddenElement = store.childNodes.find((c)=>c.nodeType !== 3
                    );
                    if (forbiddenElement) {
                        this.error(`elements are note allowed inside store elements ${forbiddenElement.tagName} \n\t Error in component: ${component.file}`);
                    }
                    const textnode = store.childNodes[0];
                    if (textnode) {
                        const data = mod3.parse(textnode.rawText, {
                        });
                        console.warn(data);
                    }
                });
            });
        } catch (err) {
            this.error(`StoreArgumentReader: ${err.message}\n${err.stack}`);
        }
    }
}
class RouterAnalyzer1 extends Utils {
    allowedKeys = [
        "path",
        "redirect",
        "component",
        "name",
        "children",
        "title",
        "once", 
    ];
    requiredKeys = [
        "path",
        "component", 
    ];
    startRecursiveRouterInspection(bundle, component, route, opts) {
        try {
            if (!route) return;
            const keys = Object.keys(route);
            const unsupported = keys.find((k)=>!this.allowedKeys.includes(k)
            );
            const missingKey = this.requiredKeys.find((k)=>!(k in route)
            );
            if (missingKey) {
                this.error(`${missingKey} is undefined in one route of component ${component.file}`);
            }
            if (unsupported) {
                this.error(`${unsupported} is not supported in this version of Ogone\n            error found in: ${component.file}`);
            }
            if (route.component) {
                const c = component.imports[route.component];
                if (c) {
                    if (!bundle.components.get(c)) {
                        this.error(`incorrect path: ${c} is not a component. error found in: ${component.file}`);
                    }
                    const newcomp = bundle.components.get(c);
                    if (newcomp) {
                        route.component = `${newcomp.uuid}-nt`;
                        route.uuid = newcomp.uuid;
                        route.isAsync = newcomp.type === "async";
                        route.isRouter = newcomp.type === "router";
                        route.isTemplatePrivate = !!newcomp.elements.template?.attributes.private;
                        route.isTemplateProtected = !!newcomp.elements.template?.attributes.protected;
                    }
                } else {
                    this.error(`${route.component} is not imported in the component.\n              please use this syntaxe to import a component: use @/... as '${route.component}'\n              error found in: ${component.file}`);
                }
            }
            if (route.path && opts.parentPath) {
                route.path = `${opts.parentPath}/${route.path}`;
                route.path = route.path.replace(/\/\//gi, "/");
            }
            if (route.children) {
                if (!Array.isArray(route.children)) {
                    this.error(`route.children should be an Array.\n              error found in: ${component.file}`);
                }
                route.children.forEach((child)=>{
                    this.startRecursiveRouterInspection(bundle, component, child, {
                        routes: opts.routes,
                        parentPath: route.path
                    });
                });
            }
            opts.routes.push(route);
        } catch (err) {
            this.error(`RouterAnalyzer: ${err.message}\n${err.stack}`);
        }
    }
    inspectRoutes(bundle, component, routes) {
        try {
            if (!Array.isArray(routes)) {
                this.error(`inspectRoutes is waiting for an array as argument 2.\n              error found in: ${component.file}`);
            }
            const opts = {
                parentPath: null,
                routes: []
            };
            routes.forEach((route)=>{
                this.startRecursiveRouterInspection(bundle, component, route, opts);
            });
            return opts.routes;
        } catch (err) {
            this.error(`RouterAnalyzer: ${err.message}\n${err.stack}`);
        }
    }
}
const registry = {
};
class ComponentTypeGetter1 extends Utils {
    RouterAnalyzer = new RouterAnalyzer1();
    async setTypeOfComponents(bundle) {
        try {
            bundle.components.forEach((component)=>{
                const proto = component.elements.proto[0];
                if (proto) {
                    component.type = proto.attributes?.type || 'component';
                    bundle.types[component.type] = true;
                }
            });
        } catch (err) {
            this.error(`ComponentTypeGetter: ${err.message}\n${err.stack}`);
        }
    }
    setApplication(bundle) {
        try {
            const rootComponent = bundle.components.get(Configuration.entrypoint);
            const entries = Array.from(bundle.components.entries()).map(([, c])=>c
            );
            if (rootComponent) {
                const { head , template  } = rootComponent.elements;
                if (rootComponent.type !== "app") {
                    this.error(`${rootComponent.file}\n\troot component type should be defined as app.`);
                }
                if (head && head.getInnerHTML) {
                    const headHasChanged = Configuration.setHead(head.getInnerHTML());
                    if (headHasChanged) {
                        this.infos('head element has changed. waiting 1 second before reloading application.');
                        setTimeout(()=>{
                            this.infos('head element changed, reloading.');
                            HMR.postMessage({
                                type: 'reload'
                            });
                        }, 1000);
                    }
                    if (template) {
                        template.childNodes.splice(template.childNodes.indexOf(head), 1);
                    }
                }
                this.setApplicationConfiguration(rootComponent);
                rootComponent.type = "component";
            }
            entries.forEach((component)=>{
                if (component.type === 'app') {
                    component.type = 'component';
                }
            });
        } catch (err) {
            this.error(`ComponentTypeGetter: ${err.message}\n${err.stack}`);
        }
    }
    forbiddenUseOfPrivateOnTemplate(bundle) {
        try {
            bundle.components.forEach((component)=>{
                const template = component.elements.template;
                if ([
                    'store',
                    'router',
                    'controller'
                ].includes(component.type) && template) {
                    const position2 = MapPosition.mapNodes.get(template);
                    if (template.attributes.private || template.attributes.protected) {
                        this.error(`${component.file}:${position2.line}:${position2.column}\n\t\n            Using a private|protected template is not allowed for ${component.type} components\n            `);
                    }
                } else if (template && template.attributes.private && template.attributes.protected) {
                    const position2 = MapPosition.mapNodes.get(template);
                    this.error(`${component.file}:${position2.line}:${position2.column}\n\t\n          cannot set both, private and protected, on template. please choose one attribute.\n          `);
                }
            });
        } catch (err) {
            this.error(`ComponentTypeGetter: ${err.message}\n${err.stack}`);
        }
    }
    assignTypeConfguration(bundle) {
        try {
            registry[bundle.uuid] = registry[bundle.uuid] || {
            };
            bundle.components.forEach((component)=>{
                const proto = component.elements.proto[0];
                const position2 = MapPosition.mapNodes.get(proto);
                if (proto) {
                    const { type: type2  } = component;
                    if (!Ogone.allowedTypes.includes(type2)) {
                        this.error(`${component.file}:${position2.line}:${position2.column}\n\t\n              ${type2} is not supported, in this version.\n                supported types of component: ${Ogone.allowedTypes.join(" ")}`);
                    }
                    if (type2 === "controller") {
                        const namespace = proto.attributes.namespace;
                        if (namespace && /[^\w]/gi.test(namespace)) {
                            const __char = namespace.match(/[^\w]/);
                            this.error(`${component.file}:${position2.line}:${position2.column}\n\tforbidden character in namespace found. please remove it.\ncharacter: ${__char}`);
                        }
                        if (namespace && namespace.length) {
                            component.namespace = namespace;
                        } else {
                            this.error(`${component.file}:${position2.line}:${position2.column}\n\tproto's namespace is missing in ${type2} component.\nplease set the attribute namespace, this one can't be empty.`);
                        }
                        const comp = {
                            namespace: component.namespace,
                            protocol: `(${component.context.protocolClass})`,
                            runtime: `(${component.scripts.runtime})`,
                            file: component.file
                        };
                        if (registry[bundle.uuid] && registry[bundle.uuid][comp.namespace]) {
                            this.error(`${component.file}:${position2.line}:${position2.column}\n\tnamespace already used`);
                        }
                        Ogone.controllers[comp.namespace] = comp;
                        registry[bundle.uuid][comp.namespace] = true;
                    }
                    if (type2 === "router") {
                        if (!component.data.routes) {
                            const position3 = MapPosition.mapNodes.get(proto);
                            this.error(`${component.file}:${position3.line}:${position3.column}\nall router components should provide routes through a def modifier`);
                        }
                        component.routes = this.RouterAnalyzer.inspectRoutes(bundle, component, Object.values(component.data.routes));
                        component.data = {
                        };
                    }
                    if (type2 === "store") {
                        if (proto.attributes.namespace) {
                            component.namespace = proto.attributes.namespace;
                        }
                    }
                    if ([
                        "store",
                        "controller"
                    ].includes(type2)) {
                        component.rootNode.childNodes.filter((child)=>{
                            return child.tagName && child.tagName !== "proto";
                        }).map((child)=>{
                            const position3 = MapPosition.mapNodes.get(child);
                            this.error(`${component.file}:${position3.line}:${position3.column}\n\ta forbidden element found in ${type2} component.\nelement: ${child.tagName}`);
                        });
                    }
                }
            });
        } catch (err) {
            this.error(`ComponentTypeGetter: ${err.message}\n${err.stack}`);
        }
    }
    setApplicationConfiguration(component) {
        let result;
        if (component.elements.proto) {
            const [proto] = component.elements.proto;
            result = proto.attributes.base;
            if (result) {
                result = absolute1(component.file, result);
                const position2 = MapPosition.mapNodes.get(proto);
                if (!existsSync(result)) {
                    this.error(`${component.file}:${position2.line}:${position2.column}\n\t base folder does not exist.`);
                }
                const info = Deno.statSync(result);
                if (info.isFile) {
                    this.error(`${component.file}:${position2.line}:${position2.column}\n\t a folder is required for proto's base attribute.`);
                }
            }
        }
        Configuration.static = result ? `${result.replace(/\/$/, '')}/` : Configuration.static;
    }
}
function readDestructuration(destructured, opts) {
    try {
        const { typedExpressions , registry: registry1 ,  } = opts;
        if (!typedExpressions.blocks[destructured]) return null;
        const content = typedExpressions.blocks[destructured];
        const blocks1 = content.match(/(?<=([\:\=]\s*))\d+_block/gi);
        const propertiesRegExp = /(([\w\d]+)+(?=\s*\}$)|(([\w\d]+)+(?=\s*,))|((?<=([\w\d]+)+\s*\:)([\w\d]+)+)|(([\w\d]+)+(?=\s*\=)))/gi;
        const properties = content.match(propertiesRegExp);
        if (properties) {
            registry1.push(...properties);
        }
        if (blocks1) {
            blocks1.forEach((block)=>{
                readDestructuration(block, opts);
            });
        }
        return true;
    } catch (err) {
        throw err;
    }
}
let i4 = 0;
function reinit() {
    i4 = 0;
}
function* gen1() {
    while(true){
        yield i4++;
    }
}
const iterator1 = gen1();
const arrayAliasIterator = gen1();
iterator1.next().value;
arrayAliasIterator.next().value;
class ForFlagBuilder1 extends Utils {
    startAnalyze(bundle) {
        try {
            reinit();
            const entries = bundle.components.entries();
            for (let [path3, component] of entries){
                this.read(bundle, path3, component.rootNode);
            }
        } catch (err) {
            this.error(`ForFlagBuiler: ${err.message}\n${err.stack}`);
        }
    }
    async read(bundle, keyComponent, node, legacy = {
        limit: 0,
        ctx: {
        },
        script: [],
        getLengthDeclarationAfterArrayEvaluation: "",
        declarationScript: [],
        callbackDeclaration: ""
    }) {
        try {
            const component = bundle.components.get(keyComponent);
            let contextLegacy = {
            };
            if (component && node.attributes) {
                const attrs = Object.keys(node.attributes);
                const keyData = Object.keys(component.data);
                attrs.forEach((key1)=>{
                    if (!key1.startsWith("--")) return;
                    node.hasFlag = true;
                    keyData.forEach((key2)=>{
                        if (node.attributes[key1].indexOf && node.attributes[key1].indexOf(key2) > -1 && !node.dependencies.includes(key2)) {
                            node.dependencies.push(key2);
                        }
                    });
                });
            }
            if (node.tagName) {
                if (!node.attributes) {
                    node.attributes = {
                    };
                }
                if (component && node.attributes) {
                    node.attributes[component.uuid] = true;
                }
            }
            if (legacy) {
                contextLegacy = Object.assign(legacy, {
                });
            }
            if (node.attributes["--for"]) {
                const v = node.attributes["--for"];
                const oForFlag = this.getForFlagDescription(v);
                const { item , index , array , destructured  } = oForFlag;
                const arrayAlias = `_____a_${arrayAliasIterator.next().value}`;
                if (legacy.ctx) {
                    if (legacy.ctx[item]) {
                        this.error(`'${item}' is already defined in the template, as item`);
                    }
                    if (legacy.ctx[index]) {
                        this.error(`'${index}' is already defined in the template, as index`);
                    }
                    legacy.ctx[index] = true;
                    legacy.ctx[item] = oForFlag;
                    node.hasFlag = true;
                    const getLengthScript = (opts)=>{
                        if (!opts.filter) {
                            return `\n                  if (GET_LENGTH) {\n                    if (!${arrayAlias}) {\n                      return 0;\n                    }\n                    return ${arrayAlias}.length;\n                  }`;
                        }
                        return this.template(`\n                let {% arrayAlias %}2 = ({% arrayAlias %} || []).filter(({%item%}, {%index%}) => {%filter%});\n                {%item%} = ({% arrayAlias %}2)[{%index%}];\n                if (GET_LENGTH) {\n                  return ({% arrayAlias %}2).length;\n                }`, {
                            item,
                            index,
                            arrayAlias,
                            filter: opts.filter
                        });
                    };
                    legacy.arrayName = array;
                    legacy.getLength = getLengthScript;
                    legacy.item = item;
                    let aliasItem;
                    if (!item.match(/^\w/)) {
                        aliasItem = `alias_${node.id}`;
                        legacy.aliasItem = aliasItem;
                    }
                    legacy.destructured = destructured;
                    if (contextLegacy) {
                        const reg = /^((this\.){0,1}[\w\d]+?)(\b)(.*?)$/i;
                        const arrayMatch = reg.test(array);
                        const parentItem = array.replace(reg, '$1');
                        const ogoneRefsForArrays = `Ogone.arrays[${component.uuid.replace(/\-/, '_')}_${node.id}]`;
                        const preventError = `!!${parentItem}\n            && ${array} || []`;
                        const declarationScript = [
                            `const ${arrayAlias} = ${!component?.isRecursive ? ogoneRefsForArrays + ' ||' : ''} ${arrayMatch ? preventError : `${array}`};`,
                            `\n                          let ${index} = POSITION[${contextLegacy.limit}],\n                          ${item} = (${arrayAlias})[${index}];`,
                            !component?.isRecursive ? `if (${ogoneRefsForArrays} !== ${arrayAlias}) ${ogoneRefsForArrays} = ${arrayAlias};` : '',
                            aliasItem ? `const ${aliasItem} = (${arrayAlias})[${index}];` : '', 
                        ];
                        if (contextLegacy && contextLegacy.declarationScript) {
                            contextLegacy.declarationScript = contextLegacy.declarationScript.concat(declarationScript);
                        }
                    }
                }
            }
            if (node.childNodes?.length) {
                for (let el of node.childNodes){
                    if (component && component.data && el.nodeType === 3) {
                        const data = el.rawText;
                        Object.keys(component.data).forEach((key1)=>{
                            const result = data;
                            if (result && result.indexOf("\${") > -1 && result.indexOf(`${key1}`) > -1) {
                                if (!node.dependencies.includes(key1)) {
                                    node.dependencies.push(key1);
                                }
                            }
                        });
                    }
                    if (contextLegacy) {
                        this.read(bundle, keyComponent, el, {
                            ...contextLegacy,
                            ctx: {
                                ...contextLegacy.ctx
                            },
                            declarationScript: [
                                ...contextLegacy && contextLegacy.declarationScript ? contextLegacy.declarationScript : [], 
                            ],
                            callbackDeclaration: "",
                            limit: contextLegacy.limit + 1
                        });
                    }
                }
            }
            if (contextLegacy) {
                const value = `${contextLegacy.declarationScript ? contextLegacy.declarationScript.join("") : ""} `;
                contextLegacy.script = {
                    value,
                    node,
                    item: legacy.item,
                    aliasItem: legacy.aliasItem,
                    destructured: legacy.destructured,
                    ctx: legacy.ctx,
                    level: contextLegacy.limit,
                    getLength: legacy.getLength,
                    array: legacy.arrayName
                };
                if (component && node.id) {
                    component.for[node.id] = contextLegacy;
                }
            }
        } catch (oRenderDOMException) {
            this.error(oRenderDOMException);
        }
    }
    getForFlagDescription(value) {
        try {
            const expressions = {
            };
            const typedExpressions = __default();
            const flagValue = __default2({
                expressions,
                value,
                typedExpressions,
                array: [
                    ...nullish,
                    ...tokens.filter((el)=>el.name === 'block'
                    ), 
                ]
            });
            const itemAndIndexRegExp = /^\((.+?),\s*(\w+?)\)\s+of\s+(.+?)$/gi;
            const itemRegExp = /^(.+?)\s+of\s+(.+?)$/gi;
            let oForRegExp = itemAndIndexRegExp.exec(flagValue.trim());
            const registry1 = [];
            if (oForRegExp) {
                itemAndIndexRegExp.exec(flagValue.trim());
                let [input1, item, index, arrayName] = oForRegExp;
                readDestructuration(item, {
                    typedExpressions,
                    registry: registry1
                });
                arrayName = flagValue.split("of")[1].trim();
                return {
                    index: index ? index : `i${iterator1.next().value}`,
                    item: getDeepTranslation1(item, expressions),
                    array: getDeepTranslation1(arrayName, expressions),
                    content: getDeepTranslation1(flagValue, expressions),
                    destructured: registry1
                };
            }
            oForRegExp = itemRegExp.exec(flagValue.trim());
            if (!oForRegExp) {
                throw this.error(`Syntax Error: ${flagValue} \n\tPlease follow this --for syntax. (item [, i]) of array `);
            }
            itemAndIndexRegExp.exec(flagValue.trim());
            let [input1, item, arrayName] = oForRegExp;
            readDestructuration(item, {
                typedExpressions,
                registry: registry1
            });
            arrayName = flagValue.split("of")[1].trim();
            return {
                index: `i${iterator1.next().value}`,
                item: getDeepTranslation1(item, expressions),
                array: getDeepTranslation1(arrayName, expressions),
                content: getDeepTranslation1(flagValue, expressions),
                destructured: registry1
            };
        } catch (err) {
            this.error(`ForFlagBuiler: ${err.message}\n${err.stack}`);
        }
    }
}
class MapFile {
    static files = new Map();
}
class XMLJSXOutputBuilder extends Utils {
    flags = [
        "--click",
        "--mouseenter",
        "--mouseover",
        "--mousemove",
        "--mousedown",
        "--mouseup",
        "--mouseleave",
        "--mouseout",
        "--dblclick",
        "--resize",
        "--drag",
        "--dragend",
        "--dragstart",
        "--input",
        "--change",
        "--blur",
        "--focus",
        "--focusin",
        "--focusout",
        "--select",
        "--keydown",
        "--keyup",
        "--keypress",
        "--submit",
        "--reset",
        "--touchcancel",
        "--touchmove",
        "--touchend",
        "--touchenter",
        "--touchstart",
        "--wheel", 
    ];
    renderPragma({ bundle , component , isOgone , node , props , nId , getNodeCreations , isImported , idComponent , nodeIsDynamic , isRoot , setAttributes , nodesPragma , params , flags , query , appending , isTemplate , isAsyncNode , isRemote , isSVG , svgParentRef  }) {
        try {
            const at = isSVG ? '_atns' : '_at';
            const subcomp = isImported ? bundle.components.get(component.imports[node.tagName]) : null;
            const start = isRoot ? this.template(`\n      (function({%params%}) {\n          let p = pos.slice();\n          let o = null;\n`, {
                params
            }) : "";
            const end = isRoot ? this.template(`\n          return {%nId%};\n          });\n          `, {
                nId
            }) : "";
            let nodeSuperCreation = "";
            if (isRoot) {
                const idList = [];
                getNodeCreations(idList);
                const constants = idList.map(([k, v])=>`${k} = ${v}`
                );
                nodeSuperCreation = `const ${constants};`;
            }
            const reuseStatement = component.context.reuse;
            return this.template(`\n              {% start %}\n              {% nodeSuperCreation %}\n              {% setAwait %}\n              {% setOgone.isOgone %}\n              {% setNodeAwait %}\n              {% publicComponentSetAttribute %}\n              {% setAttributes %}\n              {% nodesPragma %}\n              {% storeRender %}\n              {% recycleWebcomponent %}\n              {%end%}`, {
                nId,
                end,
                start,
                idComponent,
                nodeSuperCreation,
                isAsyncNode,
                isImported,
                isRemote,
                component,
                subcomp,
                svgParentRef,
                publicComponentSetAttribute: !(component.elements.template?.attributes.private || component.elements.template?.attributes.protected) ? `${at}({% svgParentRef %} {% nId %},${idComponent.replace(/\-/, '_')}, '');` : '',
                isTemplate: isTemplate || !!isImported && !!subcomp,
                isTemplatePrivate: !!isImported && !!subcomp && !!subcomp.elements.template?.attributes.private,
                isTemplateProtected: !!isImported && !!subcomp && !!subcomp.elements.template?.attributes.protected,
                isAsync: !!isImported && !!subcomp && subcomp.type === "async",
                isRouter: !!isImported && !!subcomp && subcomp.type === "router",
                isStore: !!isImported && !!subcomp && subcomp.type === "store",
                isController: !!isImported && !!subcomp && subcomp.type === "controller",
                recycleWebcomponent: isRoot && reuseStatement ? `\n          OnodeRecycleWebComponent({% nId %}, {\n            id: '${idComponent}',\n            name: '${reuseStatement.split(':')[0]}',\n            extends: '${reuseStatement.split(':')[1]}',\n            component: ctx,\n            isSync: ${component.context.engine.includes(ComponentEngine.TemplateSyncWithWebcomponent)},\n          });\n          ` : '',
                setAwait: node.attributes && node.attributes.await ? `${at}({% svgParentRef %} {%nId%},'await', '');` : "",
                setNodeAwait: isOgone && node.attributes && node.attributes.nodeAwait && !isRoot ? `ctx.promises.push(new Promise((rs) => {\n            ${''}\n            {%nId%}.connectedCallback();\n            for(let n of {%nId%}.nodes) {\n              n.addEventListener('load', () => {\n                rs();\n              });\n            }\n          }));` : "",
                setAttributes: !(nodeIsDynamic && !isRoot && !isImported) ? setAttributes : "",
                storeRender: !!isImported && !!subcomp && subcomp.type === "store" ? '{%nId%}.connectedCallback();' : '',
                nodesPragma: nodesPragma.length ? `l++; ${nodesPragma}  l--; ${appending}` : "",
                setOgone: {
                    isOgone: isOgone ? `\n            o = {\n              isRoot: false,\n              isOriginalNode: true,\n              original: {%nId%},\n              placeholder: new Text(' '),\n              {%setOgone.tagname%}\n              {%setOgone.tree%}\n              {%setOgone.positionLevelIndex%}\n              {%setOgone.inheritedCTX%}\n              {%setOgone.flags%},\n              isTemplate: {% isTemplate %},\n              isTemplatePrivate: {% isTemplatePrivate %},\n              isTemplateProtected: {% isTemplateProtected %},\n              isAsync: {% isAsync %},\n              isRouter: {% isRouter %},\n              isStore: {% isStore %},\n              isController: {% isController %},\n              isAsyncNode: {% isAsyncNode %},\n              isImported: {% isImported %},\n              isRemote: {% isRemote %},\n              extends: '{% setOgone.extends %}',\n              uuid: '{% component.uuid %}',\n              {%setOgone.positionInParentComponent%}\n              {% setOgone.nodeProps %}\n            };\n              {%nId%}.placeholder = o.placeholder;\n              setOgone({%nId%}, o); o = null;` : "",
                    inheritedCTX: isImported && subcomp ? "" : "component: ctx,",
                    flags: `flags: ${flags}`,
                    tagname: isImported ? `name: "${node.tagName}",` : "",
                    tree: isImported || nodeIsDynamic ? `tree: "${query}",` : "",
                    extends: isTemplate || isImported ? `-nt` : `-${node.id}`,
                    positionLevelIndex: !isImported ? "position: p, level: l, index: i," : "",
                    positionInParentComponent: isImported && subcomp ? `positionInParentComponent: p, levelInParentComponent: l, parentComponent: ctx, parentCTXId: '${idComponent}-${node.id}', props: (${JSON.stringify(props)}),\n            uuid: '${subcomp.uuid}',\n            routes: ${JSON.stringify(subcomp.routes)},\n            namespace: '${subcomp.namespace ? subcomp.namespace : ""}',\n            requirements: (${subcomp && subcomp.requirements ? JSON.stringify(subcomp.requirements) : null}),\n            dependencies: ${JSON.stringify(node.dependencies)},` : "",
                    nodeProps: props.length && !isTemplate && !isImported && !isRoot ? `nodeProps: (${JSON.stringify(props)}),` : ''
                }
            });
        } catch (err) {
            this.error(`XMLJSXOutputBuilder: ${err.message}\n${err.stack}`);
        }
    }
    setNodesPragma(expressions, rootNode) {
        try {
            const nodes = Object.values(expressions).reverse();
            let pragma = null;
            for (let node of nodes){
                if (node.tagName === 'head' || node.tagName === 'proto' || rootNode.childNodes.find((child)=>child.id === node.id && node.tagName === "style"
                )) {
                    continue;
                }
                const params = "ctx, pos = [], i = 0, l = 0";
                if (node.nodeType === 1) {
                    const { isSVG , svg  } = this.isSVG(node);
                    const { isCanvas , canvas  } = this.isCanvas(node);
                    const h = isSVG ? '_hns' : '_h';
                    const ap = '_ap';
                    const at = isSVG ? '_atns' : '_at';
                    const nodeIsDynamic = !!Object.keys(node.attributes).find((attr)=>attr.startsWith(":") || attr.startsWith("--") || attr.startsWith("@") || attr.startsWith("&") || attr.startsWith("_")
                    );
                    const nId = `n${nodeIsDynamic ? "d" : ""}${node.id}`;
                    node.id = nId;
                    node.isSVG = isSVG;
                    node.isCanvas = isCanvas;
                    pragma = (bundle, component, isRoot)=>{
                        let identifier = [];
                        const svgParentRef = svg && node !== svg && svg.id + ',' || '';
                        const idComponent = component.uuid;
                        const imports = Object.keys(component.imports);
                        const isImported = imports.includes(node.tagName || "");
                        const isTemplate = node.tagName === null;
                        const isRouter = isTemplate && component.type === "router";
                        const isStore = isTemplate && component.type === "store";
                        const isAsync = isTemplate && component.type === "async";
                        const isRemote = !!component.remote;
                        let setAttributes = Object.entries(node.attributes).filter(([key1, value])=>!(key1.startsWith(":") || isSVG && key1 === 'xmlns' || key1.startsWith("--") || key1.startsWith("@") || key1.startsWith("&") || key1.startsWith("o-") || key1.startsWith("_"))
                        ).map(([key1, val])=>{
                            if (key1 === component.uuid) return '';
                            if (val === true) return `${at}(${svgParentRef} ${nId},'${key1}', '');`;
                            let value = val.replace(/\'/gi, "\\'");
                            if (isSVG && /^(xmlns|xmlns\:|xlink\:)/.test(key1)) {
                                return `${at}(${svgParentRef} ${nId},'${key1.replace(/^(xmlns\:|xlink\:)/, '')}', '${value}');`;
                            }
                            return key1 !== "ref" ? `${at}(${svgParentRef} ${nId},'${key1}', '${value}');` : `\n                  ctx.refs['${value}'] = ctx.refs['${value}'] || [];\n                  ctx.refs['${value}'][i] = ${nId};`;
                        }).join("");
                        let nodesPragma = node.childNodes.filter((child)=>child.pragma
                        ).map((child, i5, arr)=>{
                            return child.pragma ? child.pragma(bundle, component, false).value : "";
                        }).join("");
                        let appending = node.childNodes.filter((child)=>child.pragma && child.pragma(bundle, component, false).id
                        ).map((child)=>child.pragma ? `${ap}(${nId},${child.pragma(bundle, component, false).id});` : ""
                        ).join("\n");
                        let extensionId = "";
                        if (isImported && component.imports[node.tagName]) {
                            const newcomponent = bundle.components.get(component.imports[node.tagName]);
                            if (newcomponent) extensionId = newcomponent.uuid;
                        }
                        const props = Object.entries(node.attributes).filter(([key1])=>key1.startsWith(":")
                        ).map(([key1, value])=>{
                            return [
                                key1.replace(/^\:/, ""),
                                value
                            ];
                        });
                        let nodeCreation = `const ${nId} = ${h}(${node.varName});`;
                        identifier[0] = `${nId}`;
                        identifier[1] = `${h}(${svgParentRef}${node.varName})`;
                        if (nodeIsDynamic && !isImported && !isRoot || isImported) {
                            identifier[1] = `${h}(${svgParentRef}_ogone_node_)`;
                        }
                        nodeCreation = `const ${nId} = ${identifier[1]};`;
                        const flags = this.parseFlags(node, {
                            nodeIsDynamic,
                            isImported
                        });
                        let query = node.tagName;
                        if (nodeIsDynamic || isImported) {
                            let parentN = node.parentNode;
                            while(parentN){
                                query += `<${parentN.tagName}`;
                                parentN = parentN.parentNode;
                            }
                            query = query?.split("<").reverse().join(">");
                        }
                        const isOgone = isImported || nodeIsDynamic && !isImported && !isRoot;
                        const opts = {
                            bundle,
                            component,
                            svg,
                            query,
                            props,
                            flags,
                            params,
                            nodeCreation,
                            isOgone,
                            node,
                            nId,
                            isSVG,
                            svgParentRef,
                            getNodeCreations (idList) {
                                idList.push(identifier);
                                node.childNodes.filter((child)=>child.pragma
                                ).map((child)=>{
                                    if (child.pragma) {
                                        const id1 = child.pragma(bundle, component, false);
                                        if (id1.getNodeCreations) {
                                            id1.getNodeCreations(idList);
                                        }
                                    }
                                });
                            },
                            isImported,
                            idComponent,
                            nodeIsDynamic,
                            isRoot,
                            setAttributes,
                            nodesPragma,
                            appending,
                            isTemplate,
                            isAsync,
                            isRouter,
                            isStore,
                            isAsyncNode: !isTemplate && !isImported && !!node.flags && !!node.flags.await,
                            isRemote
                        };
                        if (isRoot) {
                            return this.renderPragma(opts);
                        }
                        return {
                            id: nId,
                            identifier,
                            getNodeCreations (idList) {
                                idList.push(identifier);
                                node.childNodes.filter((child)=>child.pragma
                                ).map((child)=>{
                                    if (child.pragma) {
                                        const id1 = child.pragma(bundle, component, false);
                                        if (id1.getNodeCreations) {
                                            id1.getNodeCreations(idList);
                                        }
                                    }
                                });
                            },
                            value: this.renderPragma(opts)
                        };
                    };
                }
                if (node.nodeType === 3) {
                    const nId = `t${node.id}`;
                    node.id = nId;
                    pragma = (bundle, component, isRoot)=>{
                        const idComponent = component.uuid;
                        const isEvaluated = node.rawText.indexOf("${") > -1;
                        const saveText = isEvaluated ? `\n                  {%nId%}.getContext = Ogone.contexts[{%contextId%}] ? Ogone.contexts[{%contextId%}].bind(ctx.data) : null; /* getContext function */\n                  {%nId%}.code = '{%evaluatedString%}';\n                  {% dependencies %}\n                  const p{%textConstant%} = p.slice();\n                  /*removes txt position and root position*/\n                  p{%textConstant%}[l-2]=i;\n                  {%nId%}.position = p{%textConstant%};\n                  ctx.texts.push({%nId%});\n                ` : "";
                        if (!isEvaluated) {
                            return {
                                id: nId,
                                getNodeCreations: (idList)=>idList.push([
                                        nId,
                                        `\`${node.rawText.replace(/\n/gi, " ").trim()}\``
                                    ])
                                ,
                                value: " /**/"
                            };
                        }
                        return {
                            id: nId,
                            getNodeCreations: (idList)=>idList.push([
                                    nId,
                                    `new Text('${isEvaluated ? " " : node.rawText}')`
                                ])
                            ,
                            value: this.template(`\n                  {%saveText%}`, {
                                nId,
                                saveText,
                                contextId: `${idComponent}-${node.id}`.replace(/\-/gi, '_'),
                                getContextConstant: `g${nId}`,
                                textConstant: `t${nId}`,
                                dependencies: node.parentNode && node.parentNode.dependencies.length ? `{%nId%}.dependencies = (k) => !${JSON.stringify(node.parentNode?.dependencies)}.includes(k);` : "",
                                evaluatedString: `\`${node.rawText.replace(/\n/gi, " ").replace(/\\/gi, "\\\\").replace(/\'/gi, "\\'").trim()}\``
                            })
                        };
                    };
                }
                node.pragma = pragma;
            }
        } catch (err) {
            this.error(`XMLJSXOutputBuilder: ${err.message}\n${err.stack}`);
        }
    }
    parseFlags(node, opts) {
        try {
            let result = {
                if: "",
                then: "",
                defer: "",
                await: "",
                style: "",
                class: "",
                html: "",
                catch: "",
                events: [],
                elseIf: "",
                finally: "",
                spread: "",
                else: false
            };
            const { nodeIsDynamic , isImported  } = opts;
            if (nodeIsDynamic || isImported) {
                const { attributes  } = node;
                const keys = Object.keys(attributes);
                for (let key1 of keys){
                    for (let flag of this.flags){
                        switch(true){
                            case key1.startsWith(flag) && !key1.match(/(\-){2}(\w+\:)([^\s]*)+/):
                                throw this.getSyntaxEventException(flag);
                            case key1.startsWith(flag):
                                const m = key1.match(/(\-){2}(\w+\:)([^\s]*)+/);
                                if (m) {
                                    const [input1, t, ev, caseName] = m;
                                    const infos = {
                                        type: flag.slice(2),
                                        case: `${ev}${caseName}`,
                                        filter: null,
                                        target: null
                                    };
                                    if (flag.startsWith("--key")) {
                                        infos.target = "document";
                                    }
                                    if (node.attributes[key1] !== true) {
                                        infos.filter = node.attributes[key1];
                                    }
                                    result.events.push(infos);
                                }
                                break;
                        }
                    }
                }
                for (let key2 of keys){
                    switch(true){
                        case key2 === "--router-go":
                            result.events.push({
                                type: "click",
                                name: "router-go",
                                eval: attributes[key2]
                            });
                            break;
                        case key2 === "--router-dev-tool":
                            result.events.push({
                                type: "click",
                                name: "router-dev-tool",
                                eval: attributes[key2]
                            });
                            break;
                        case key2.startsWith("--event:") && key2.split(':').length === 3:
                            const name2 = key2.slice(2);
                            const tokens1 = key2.split(':');
                            result.events.push({
                                name: "event",
                                type: tokens1[1],
                                case: name2,
                                eval: tokens1[2]
                            });
                            node.hasFlag = true;
                            break;
                        case key2 === "--class":
                            result.class = `${attributes[key2]}`;
                            node.hasFlag = true;
                            break;
                        case key2 === "--style":
                            result.style = `${attributes[key2]}`;
                            node.hasFlag = true;
                            break;
                        case key2 === "--if":
                            result.if = `${attributes[key2]}`;
                            node.hasFlag = true;
                            break;
                        case key2 === "--else":
                            result.else = true;
                            node.hasFlag = true;
                            break;
                        case key2 === "--else-if":
                            result.elseIf = `${attributes[key2]}`;
                            node.hasFlag = true;
                            break;
                        case key2 === "--html":
                            result.html = `${attributes[key2]}`;
                            node.hasFlag = true;
                            break;
                        case key2 === "--await":
                            result.await = attributes[key2] === true ? true : `${attributes[key2]}`;
                            if (isImported) {
                                node.attributes.await = true;
                            } else if (!node.attributes.nodeAwait) {
                                node.attributes.nodeAwait = true;
                            }
                            node.hasFlag = true;
                            break;
                        case key2 === "--defer":
                            result.defer = `${attributes[key2]}`;
                            node.hasFlag = true;
                            break;
                        case key2 === "--spread":
                            result.spread = `${attributes[key2]}`;
                            node.hasFlag = true;
                            break;
                        case key2.startsWith("--then:"):
                            result.then = key2.slice(2);
                            node.hasFlag = true;
                            break;
                        case key2.startsWith("--catch:"):
                            result.catch = key2.slice(2);
                            node.hasFlag = true;
                            break;
                        case key2.startsWith("--finally:"):
                            result.finally = key2.slice(2);
                            node.hasFlag = true;
                            break;
                        case key2 === "--bind":
                            result.bind = attributes[key2];
                            node.hasFlag = true;
                    }
                }
                node.hasFlag = true;
                node.flags = result;
                Object.keys(result).forEach((key3)=>{
                    if (typeof result[key3] === 'string' && !result[key3].length) {
                        delete result[key3];
                    }
                });
                return JSON.stringify(result);
            }
            return null;
        } catch (err) {
            this.error(`XMLJSXOutputBuilder: ${err.message}\n${err.stack}`);
        }
    }
    getSyntaxEventException(event) {
        try {
            return this.error(`wrong syntax of ${event} event. it should be: ${event}:case`, {
                returns: true
            });
        } catch (err) {
            this.error(`XMLJSXOutputBuilder: ${err.message}\n${err.stack}`);
        }
    }
    isSVG(node) {
        let parent = node;
        let result = node.tagName === 'svg';
        while(!result && parent){
            parent = parent.parentNode;
            result = parent?.tagName === 'svg';
        }
        this.trace(`node is inside a svg?: ${result} ${node.tagName}`);
        return {
            isSVG: result,
            svg: parent
        };
    }
    isCanvas(node) {
        let parent = node;
        let result = node.tagName === 'canvas';
        while(!result && parent){
            parent = parent.parentNode;
            result = parent?.tagName === 'canvas';
        }
        this.trace(`node is inside a canvas?: ${result} ${node.tagName}`);
        return {
            isCanvas: result,
            canvas: parent
        };
    }
}
const openComment = "<!--";
const closeComment = "-->";
function savePosition1(node, opts) {
    return MapPosition.mapNodes.set(node, opts);
}
function translateAll(str4, expressions) {
    return getDeepTranslation1(str4, expressions, (key1)=>expressions[key1].expression
    );
}
class XMLParser1 extends XMLJSXOutputBuilder {
    textMarginStart = 0;
    textMarginEnd = 0;
    originalHTML = '';
    ForFlagBuilder = new ForFlagBuilder1();
    getUniquekey(id = "", iterator) {
        iterator.value = __default1.next().value;
        return `§§${iterator.value}${id}§§`;
    }
    getNodeUniquekey(id = "", iterator) {
        iterator.node++;
        return `§§${iterator.node}${id}§§`;
    }
    getTextUniquekey(id = "", iterator) {
        iterator.text++;
        return `§§${iterator.text}${id}§§`;
    }
    saveNode(text, opts) {
        const { expressions , node , value , margin  } = opts;
        const { key: key1  } = node;
        const exp = expressions;
        if (node && node.nodeType === 1 && !MapOutput.outputs.vars.includes(node.declarationVarName)) {
            MapOutput.outputs.vars.push(node.declarationVarName);
        }
        if (!translateAll(value, exp).trim().length || text.indexOf(key1) < 0) return;
        const file = translateAll(text, exp);
        const part1 = translateAll(text.slice(0, text.indexOf(key1, margin)), exp);
        const start = translateAll(part1, exp).length;
        const end = translateAll(value, exp).length + start;
        return savePosition1(node, {
            start,
            end,
            column: MapPosition.getColumn(file, {
                start,
                end
            }, margin),
            line: MapPosition.getLine(file, {
                start,
                end
            }, margin)
        });
    }
    setInnerOuterHTML(rootnode, expressions) {
        const { nodeList  } = rootnode;
        nodeList.forEach((node)=>{
            node.getOuterTSX = (component)=>{
                if (node.nodeType === 1) {
                    let templateOuterTSX = `\n<{%tagname%} {%attrs%}>\n{%outers%}\n</{%tagname%}>`;
                    if (node.tagName === 'style') {
                        templateOuterTSX = `\n<{%tagname%} {%attrs%}>\n{\`{%outers%}\`}\n</{%tagname%}>`;
                    }
                    if (node.autoclosing && !node.isSVG) {
                        templateOuterTSX = `\n<{%tagname%} {%attrs%} />\n`;
                    }
                    if (node.attributes['--for']) {
                        const value = node.attributes['--for'];
                        const flagDescript = this.ForFlagBuilder.getForFlagDescription(value);
                        const { array , item , index  } = flagDescript;
                        const filter = node.attributes['--if'] ? `(${node.attributes['--if']})\n            && ` : '';
                        templateOuterTSX = `{\n              ${array}\n            .map((\n              ${item},\n              ${index}: number\n            ) =>\n              ${filter}\n              ${templateOuterTSX}\n            )\n          }`;
                    } else if (node.attributes['--if']) {
                        templateOuterTSX = `{\n              ${node.attributes['--if']} ?\n              (<>\n                ${templateOuterTSX}\n              </>) : null\n            }`;
                    }
                    let result = this.template(templateOuterTSX, {
                        outers: node.childNodes.map((c)=>{
                            if (c.getOuterTSX) {
                                return c.getOuterTSX(component);
                            } else {
                                return "";
                            }
                        }).join(""),
                        tagname: node.tagName,
                        attrs: Object.entries(node.attributes).map(([key1, value])=>{
                            if (key1 === component.uuid) return '';
                            if (key1 === '--spread') {
                                return `\n{${value}}`;
                            }
                            if (key1.match(/^(\-){2}/)) {
                                return '';
                            }
                            if (value === true) {
                                return `\n${key1} `;
                            }
                            if (key1.startsWith(`:`)) {
                                return `\n${key1.slice(1)}={${value}}`;
                            }
                            if (node.isSVG) {
                                return `\n${key1.replace(/[\:]/gi, '-')}="${value}"`;
                            }
                            return `\n${key1}="${value}"`;
                        }).join(' ')
                    });
                    return getDeepTranslation1(result, expressions);
                }
                const value = node.rawText?.replace(/\</gi, "&lt;").replace(/\>/gi, "&rt;");
                return getDeepTranslation1(`\n${value}\n` || "", expressions);
            };
            node.getOuterHTML = ()=>{
                if (node.nodeType === 1) {
                    let result = this.template(`<{%tagname%} {%attrs%}>{%outers%}</{%tagname%}>`, {
                        outers: node.childNodes.map((c)=>{
                            if (c.getOuterHTML) {
                                return c.getOuterHTML();
                            } else {
                                return "";
                            }
                        }).join(""),
                        tagname: node.tagName,
                        attrs: node.rawAttrs
                    });
                    return getDeepTranslation1(result, expressions, (key1)=>expressions[key1].expression
                    );
                }
                return getDeepTranslation1(node.rawText || "", expressions, (key1)=>expressions[key1].expression
                );
            };
            node.getInnerHTML = ()=>{
                if (node.nodeType === 1) {
                    let result = this.template("{%outers%}", {
                        outers: node.childNodes.map((c)=>{
                            if (c.getOuterHTML) {
                                return c.getOuterHTML();
                            } else {
                                return "";
                            }
                        }).join("")
                    });
                    return getDeepTranslation1(result, expressions, (key1)=>expressions[key1].expression
                    );
                }
                return getDeepTranslation1(node.rawText || "", expressions);
            };
        });
    }
    setDNA(rootnode, node, expressions) {
        if (rootnode !== node) {
            rootnode.nodeList.push(node);
        }
        if (!node.dna) {
            node.dna = "";
        }
        if (node.tagName) {
            node.dna += node.tagName;
            rootnode.dna += node.tagName;
            if (node.parentNode) node.parentNode.dna += node.tagName;
        }
        if (node.rawAttrs) {
            node.dna += node.rawAttrs;
            rootnode.dna += node.rawAttrs;
            if (node.parentNode) node.parentNode.dna += node.rawAttrs;
        }
        if (node.rawText) {
            node.dna += node.rawText;
            rootnode.dna += node.rawText;
            if (node.parentNode) node.parentNode.dna += node.rawText;
        }
        node.dna = getDeepTranslation1(node.dna, expressions, (key1)=>expressions[key1].expression
        );
        if (node.childNodes && node.childNodes.length) {
            node.childNodes.forEach((child, i5, arr)=>{
                this.setDNA(rootnode, child, expressions);
            });
        }
    }
    setElementSiblings(node) {
        if (node.childNodes && node.childNodes.length) {
            node.childNodes.forEach((child, i5, arr)=>{
                if (arr[i5 - 1]) {
                    child.previousElementSibling = arr[i5 - 1];
                } else {
                    child.previousElementSibling = null;
                }
                if (arr[i5 + 1]) {
                    child.nextElementSibling = arr[i5 + 1];
                } else {
                    child.nextElementSibling = null;
                }
                this.setElementSiblings(child);
            });
        }
    }
    getRootnode(html, expressions) {
        const keysOfExp = Object.keys(expressions);
        const key1 = keysOfExp.find((key2)=>html.indexOf(key2) > -1
        );
        if (key1) {
            let result = expressions[key1];
            result.type = "root";
            delete result.id;
            return result;
        } else {
            return null;
        }
    }
    parseNodes(html, expressions, componentPath) {
        let result = html;
        Object.entries(expressions).filter(([key1, value])=>value.type === "node"
        ).forEach(([key1, value])=>{
            const { expression , rawAttrs  } = value;
            let attrs = `${rawAttrs}`.split(/[\s\n\r]/).filter((s)=>s.trim().length
            );
            attrs.forEach((attr)=>{
                const attrIDRE = /([^\s]*)+(§{2}\d*attr§§)/;
                if (attr.endsWith('attr§§')) {
                    const m = attr.match(attrIDRE);
                    if (m && expressions[m[2]]) {
                        let [input1, attributeName, id2] = m;
                        const { value: value1 , expression: expression1 , isTSX , isAttrSpreadTSX  } = expressions[id2];
                        let attributeFormatted = isTSX && !attributeName.startsWith('--') ? `:${attributeName}` : attributeName;
                        if (isAttrSpreadTSX && expressions[key1].attributes[attributeFormatted]) {
                            let textError = null;
                            const position2 = MapPosition.mapNodes.get(expressions[key1]);
                            let column1 = 0, line2 = 0;
                            if (position2) {
                                const file = translateAll(html, expressions);
                                column1 = MapPosition.getColumn(file, position2, this.textMarginStart);
                                line2 = MapPosition.getLine(file, position2, this.textMarginStart);
                                textError = file.slice(position2.start, position2.end);
                            }
                            this.error(`${componentPath}:${line2}:${column1}\n                Cannot spread multiple time on the same element:\n                  input: ${textError || expression1?.slice(1)}`);
                        }
                        expressions[key1].attributes[attributeFormatted] = value1;
                    }
                } else if (expressions[key1] && !expressions[key1].attributes[attr.trim()]) {
                    expressions[key1].attributes[attr.trim()] = true;
                }
            });
        });
        const keysOfExp = Object.keys(expressions);
        Object.entries(expressions).reverse().filter(([key1, value])=>value.type === "node"
        ).forEach(([key1, node])=>{
            const opening = node.key;
            const { closingTag  } = node;
            const open = result.split(opening);
            open.filter((content)=>closingTag && content.indexOf(closingTag) > -1
            ).forEach((content)=>{
                let innerHTML = content.split(closingTag)[0];
                const outerContent = `${opening}${innerHTML}${closingTag}`;
                keysOfExp.filter((k)=>innerHTML.indexOf(k) > -1 && expressions[k]
                ).sort((a, b)=>innerHTML.indexOf(a) - innerHTML.indexOf(b)
                ).forEach((k)=>{
                    expressions[key1].childNodes.push(expressions[k]);
                    expressions[k].parentNode = expressions[key1];
                });
                keysOfExp.filter((k)=>node.rawAttrs.indexOf(k) > -1 && expressions[k].type === "attr"
                ).forEach((k)=>{
                    node.rawAttrs = node.rawAttrs.replace(k, expressions[k].expression);
                });
                result = result.replace(outerContent, opening);
                delete expressions[key1].closingTag;
                delete expressions[key1].key;
                delete expressions[key1].autoclosing;
                delete expressions[key1].closing;
                delete expressions[key1].expression;
            });
        });
        return result;
    }
    parseTextNodes(html, expression, iterator) {
        let result = html;
        const regexp = /(\<)§§\d+node§§(\>)/;
        const textnodes = result.split(regexp);
        textnodes.filter((content)=>content.trim().length
        ).forEach((content)=>{
            const key1 = this.getTextUniquekey("text", iterator);
            expression[key1] = {
                type: "text",
                key: key1,
                value: content,
                expression: content,
                id: iterator.text,
                nodeType: 3,
                rawAttrs: "",
                rawText: "",
                childNodes: [],
                parentNode: null,
                pragma: null,
                tagName: undefined,
                attributes: {
                },
                flags: null,
                dependencies: []
            };
            result = result.replace(`>${content}<`, `>${key1}<`);
            this.saveNode(result, {
                margin: this.textMarginStart,
                value: content,
                expressions: expression,
                node: expression[key1]
            });
        });
        return result;
    }
    preserveNodes(html, expression, iterator) {
        let result = html;
        const regexp = /\<(\/){0,1}([a-zA-Z][^\>\s]*)([^\>]*)+(\/){0,1}\>/gi;
        const matches = result.match(regexp);
        matches?.forEach((node)=>{
            const regexpID = /\<(\/){0,1}([a-zA-Z][^\>\s\/]*)([^\>\/]*)+(\/){0,1}\>/;
            const id2 = node.match(regexpID);
            if (id2) {
                let [input1, slash, tagName, attrs, closingSlash] = id2;
                const varName = '___' + tagName.replace(/(\w+)(\b)/, '$1_');
                const declarationVarName = `const ${varName} = '${tagName}';`;
                attrs = this.parseTSXSpreadAndAddSpreadFlag(attrs, expression, iterator);
                const key1 = `<${this.getNodeUniquekey("node", iterator)}>`;
                if (!!slash) {
                    const tag2 = Object.values(expression).reverse().find((n)=>n.type === "node" && n.tagName && n.tagName.trim() === tagName.trim() && n.id && n.id < iterator.node && n.closingTag === null && !n.closing && !n.autoclosing
                    );
                    if (tag2 && expression[tag2.key || ""]) {
                        expression[tag2.key].closingTag = key1;
                        expression[key1] = {
                            key: key1,
                            tagName,
                            varName,
                            declarationVarName,
                            id: iterator.node,
                            rawAttrs: attrs,
                            attributes: {
                            },
                            closing: !!slash,
                            autoclosing: !!closingSlash,
                            type: "node",
                            nodeType: 30,
                            closingTag: null,
                            expression: input1,
                            childNodes: [],
                            rawText: "",
                            parentNode: null,
                            pragma: null,
                            flags: null,
                            dependencies: []
                        };
                    }
                } else {
                    expression[key1] = {
                        key: key1,
                        tagName,
                        varName,
                        declarationVarName,
                        id: iterator.node,
                        rawAttrs: attrs,
                        attributes: {
                        },
                        closing: !!slash,
                        autoclosing: !!closingSlash,
                        type: "node",
                        nodeType: 1,
                        closingTag: null,
                        expression: input1,
                        childNodes: [],
                        rawText: "",
                        parentNode: null,
                        pragma: null,
                        flags: null,
                        dependencies: []
                    };
                }
                result = result.replace(input1, key1);
                this.saveNode(result, {
                    margin: this.textMarginStart,
                    value: input1,
                    expressions: expression,
                    node: expression[key1]
                });
            }
        });
        return result;
    }
    preserveTemplates(html, expression, iterator) {
        let result = html;
        const templates = [
            "${",
            "}"
        ];
        const [beginTemplate, traillingTemplate] = templates;
        result.split(/[^\\](\$\{)/).filter((content, id2, arr)=>content.indexOf("}") > -1 && arr[id2 - 1] === beginTemplate
        ).forEach((content)=>{
            let str4 = content.split(/(?<!\\)(\})/gi)[0];
            const allTemplate = `${beginTemplate}${str4}${traillingTemplate}`;
            const key1 = this.getUniquekey("templ", iterator);
            expression[key1] = {
                key: key1,
                expression: allTemplate,
                value: str4,
                type: "template",
                rawText: "",
                rawAttrs: "",
                tagName: null,
                childNodes: [],
                pragma: null,
                parentNode: null,
                id: null,
                nodeType: 1,
                attributes: {
                },
                flags: null,
                dependencies: []
            };
            result = result.replace(allTemplate, key1);
            this.saveNode(result, {
                margin: this.textMarginStart,
                value: str4,
                expressions: expression,
                node: expression[key1]
            });
        });
        return result;
    }
    preserveStrings(html, expression, iterator) {
        let result = html;
        result.split(/((?<!\\)`)/).filter((content)=>content !== "`"
        ).forEach((content)=>{
            let str4 = content.split(/((?<!\\)`)/);
            str4.forEach((contentOfStr)=>{
                const allLit = `\`${contentOfStr}\``;
                if (result.indexOf(allLit) < 0) return;
                const key1 = this.getUniquekey("str", iterator);
                expression[key1] = {
                    key: key1,
                    expression: allLit,
                    value: contentOfStr,
                    type: "string",
                    rawAttrs: "",
                    rawText: "",
                    childNodes: [],
                    parentNode: null,
                    pragma: null,
                    id: null,
                    tagName: undefined,
                    nodeType: 0,
                    attributes: {
                    },
                    dependencies: [],
                    flags: null
                };
                result = result.replace(allLit, key1);
                this.saveNode(result, {
                    margin: this.textMarginStart,
                    value: allLit,
                    expressions: expression,
                    node: expression[key1]
                });
            });
        });
        return result;
    }
    preserveStringsAttrs(html, expression, iterator) {
        let result = html;
        const regEmptyStr = /\=\"\"/gi;
        const quotes = [
            '="',
            '"'
        ];
        const [beginQuote, closinQuote] = quotes;
        const matchesEmpty = result.match(regEmptyStr);
        matchesEmpty?.forEach((match)=>{
            const key1 = this.getUniquekey("attr", iterator);
            result = result.replace(match, key1);
            expression[key1] = {
                key: key1,
                expression: match,
                value: match,
                type: "attr",
                rawAttrs: "",
                rawText: "",
                childNodes: [],
                parentNode: null,
                pragma: null,
                id: null,
                nodeType: 0,
                tagName: undefined,
                attributes: {
                },
                dependencies: [],
                flags: null
            };
            this.saveNode(result, {
                margin: this.textMarginStart,
                value: match,
                expressions: expression,
                node: expression[key1]
            });
        });
        result.split(beginQuote).filter((content)=>/[^\\](")/.test(content)
        ).forEach((content)=>{
            let str4 = content.split(/(?<!\\)(")/gi)[0];
            const allstring = `${beginQuote}${str4}${closinQuote}`;
            const key1 = this.getUniquekey("attr", iterator);
            expression[key1] = {
                key: key1,
                expression: allstring,
                value: str4,
                type: "attr",
                rawAttrs: "",
                rawText: "",
                childNodes: [],
                parentNode: null,
                pragma: null,
                id: null,
                tagName: undefined,
                nodeType: 0,
                attributes: {
                },
                dependencies: [],
                flags: null
            };
            result = result.replace(allstring, key1);
            this.saveNode(result, {
                margin: this.textMarginStart,
                value: allstring,
                expressions: expression,
                node: expression[key1]
            });
        });
        return result;
    }
    preserveComments(html, expression, iterator) {
        let result = html;
        result.split(openComment).filter((open)=>open.indexOf(closeComment) > -1
        ).forEach((open)=>{
            let comment = open.split(closeComment)[0];
            let key1 = this.getUniquekey("com", iterator);
            const allComment = `${openComment}${comment}${closeComment}`;
            result = result.replace(allComment, "");
            expression[key1] = {
                expression: allComment,
                value: comment,
                nodeType: 8,
                type: "comment",
                rawAttrs: "",
                rawText: "",
                childNodes: [],
                parentNode: null,
                pragma: null,
                id: null,
                tagName: undefined,
                attributes: {
                },
                dependencies: [],
                flags: null
            };
        });
        return result;
    }
    cleanNodes(expressions) {
        for (let key1 of Object.keys(expressions)){
            delete expressions[key1].type;
        }
        const nodes = Object.values(expressions);
        for (let node of nodes){
            if (node.nodeType === 3) {
                const { value  } = node;
                let rawText = value;
                rawText = getDeepTranslation1(rawText, expressions, (key2)=>expressions[key2].expression
                );
                node.rawText = rawText;
            }
        }
    }
    preserveBlocks(str, globalExpressions, typedExpressions) {
        let result = __default2({
            value: str,
            array: nullish.filter((item)=>item.name !== 'comment'
            ).concat(tokens),
            expressions: globalExpressions,
            typedExpressions
        });
        return result;
    }
    parseTSXSpreadAndAddSpreadFlag(text, expression, iterator) {
        let result = text;
        const attrSpreadTSXBlockRegExp = /(?<=\s)(\d+_block)\b/gi;
        const attrTSXBlockRegExp = /(?<=\=)\d+_block\b/gi;
        const expressions = {
        };
        const typedExpressions = __default();
        result = __default2({
            name: 'block',
            value: result,
            array: tokens,
            expressions,
            typedExpressions
        });
        result = result.replace(attrSpreadTSXBlockRegExp, '--spread=$1');
        let match = result.match(attrTSXBlockRegExp);
        if (match) {
            match.forEach((value)=>{
                const allblock = getDeepTranslation1(value, expressions);
                if (!allblock.match(/^\{\s*\.{3}/)) {
                    return;
                }
                const key1 = this.getUniquekey("attr", iterator);
                expression[key1] = {
                    key: key1,
                    expression: `=${allblock}`,
                    value: allblock.slice(1, -1),
                    type: "attr",
                    rawAttrs: "",
                    rawText: "",
                    childNodes: [],
                    parentNode: null,
                    pragma: null,
                    id: null,
                    tagName: undefined,
                    nodeType: 0,
                    isTSX: true,
                    isAttrSpreadTSX: true,
                    attributes: {
                    },
                    dependencies: [],
                    flags: null
                };
                result = result.replace(`=${value}`, key1);
                this.saveNode(text, {
                    margin: this.textMarginStart,
                    value: allblock,
                    expressions: expression,
                    node: expression[key1]
                });
            });
        }
        return result;
    }
    preserveBlocksAttrs(html, globalExpressions, expression, iterator) {
        let result = html;
        const attrTSXBlockRegExp = /(?<=\=)\d+_block\b/gi;
        let match = html.match(attrTSXBlockRegExp);
        if (match) {
            match.forEach((value)=>{
                const allblock = getDeepTranslation1(value, globalExpressions);
                const key1 = this.getUniquekey("attr", iterator);
                expression[key1] = {
                    key: key1,
                    expression: `=${allblock}`,
                    value: allblock.slice(1, -1),
                    type: "attr",
                    rawAttrs: "",
                    rawText: "",
                    childNodes: [],
                    parentNode: null,
                    pragma: null,
                    id: null,
                    tagName: undefined,
                    nodeType: 0,
                    isTSX: true,
                    attributes: {
                    },
                    dependencies: [],
                    flags: null
                };
                result = result.replace(`=${value}`, key1);
                this.saveNode(result, {
                    margin: this.textMarginStart,
                    value,
                    expressions: expression,
                    node: expression[key1]
                });
            });
        }
        return result;
    }
    parse(componentPath, html) {
        let expressions = {
        };
        let globalExpressions = {
        };
        const typedExpressions = __default();
        let iterator2 = {
            value: 0,
            node: 0,
            text: 0
        };
        const start = '<template>';
        const end = '</template>';
        let str4 = this.template(`{% start %}{% html %}{% end %}`, {
            html,
            start,
            end
        });
        this.originalHTML = html;
        this.textMarginStart = start.length;
        this.textMarginEnd = end.length;
        str4 = this.preserveComments(str4, expressions, iterator2);
        this.trace('preserve comments');
        str4 = this.preserveBlocks(str4, globalExpressions, typedExpressions);
        this.trace('preserve blocks for TSX');
        str4 = this.preserveBlocksAttrs(str4, globalExpressions, expressions, iterator2);
        this.trace('preserve strings of attrs and strings');
        str4 = getDeepTranslation1(str4, globalExpressions);
        this.trace('remove all blocks transformation deep Translation');
        str4 = this.preserveStringsAttrs(str4, expressions, iterator2);
        this.trace('remove all blocks transformation preserve Strings Attrs');
        str4 = this.preserveStrings(str4, expressions, iterator2);
        this.trace('remove all blocks transformation preserve Strings');
        str4 = this.preserveTemplates(str4, expressions, iterator2);
        this.trace('preserve templates ${}');
        str4 = this.preserveNodes(str4, expressions, iterator2);
        this.trace('preserve nodes');
        str4 = this.parseTextNodes(str4, expressions, iterator2);
        this.trace('parse text nodes');
        str4 = this.parseNodes(str4, expressions, componentPath);
        this.trace('parse nodes');
        const rootNode = this.getRootnode(str4, expressions);
        if (rootNode) {
            let result = rootNode;
            result.id = "t";
            result.nodeList = [];
            this.cleanNodes(expressions);
            this.setNodesPragma(expressions, result);
            this.setElementSiblings(result);
            this.setDNA(result, result, expressions);
            result.dna = translateAll(result.dna, expressions);
            this.setInnerOuterHTML(result, expressions);
            result.tagName = null;
            return result;
        } else {
            return null;
        }
    }
}
export { XMLParser1 as default };
class ComponentBuilder1 extends Utils {
    static mapUuid = new Map();
    XMLParser = new XMLParser1();
    getComponent(source, opts) {
        try {
            const template = opts.rootNode.childNodes.find((n)=>n.nodeType === 1 && n.tagName === "template"
            );
            const head = template && template.childNodes.find((n)=>n.nodeType === 1 && n.tagName === "head"
            );
            const styles1 = [];
            if (template && !(template.attributes.private || template.attributes.protected)) {
                for (let n of template.childNodes){
                    if (n.nodeType === 1 && n.tagName === "style") {
                        template.childNodes.splice(template.childNodes.indexOf(n), 1);
                        styles1.push(n);
                    } else if (n.nodeType === 1 && n.tagName !== "head") {
                        break;
                    }
                }
            }
            const protos = opts.rootNode.childNodes.filter((n)=>n.nodeType === 1 && n.tagName === "proto"
            );
            const uuid = ComponentBuilder1.mapUuid.get(opts.file) || `o${crypto.getRandomValues(new Uint32Array(1)).join('')}`;
            return {
                uuid,
                source,
                isTyped: false,
                get isRecursive () {
                    return !!this.rootNode?.nodeList.find((node)=>node.nodeType === 1 && node.tagName === "Self"
                    );
                },
                dynamicImportsExpressions: "",
                esmExpressions: "",
                exportsExpressions: "",
                data: {
                },
                style: [],
                scripts: {
                    runtime: "function run(){};"
                },
                imports: {
                    Self: opts.file
                },
                deps: [],
                flags: [],
                for: {
                },
                refs: {
                },
                reactive: {
                },
                protocol: null,
                routes: null,
                namespace: null,
                modules: [],
                type: "component",
                requirements: null,
                hasStore: false,
                ...opts,
                mapStyleBundle: undefined,
                elements: {
                    styles: styles1,
                    template,
                    proto: protos,
                    head
                },
                context: {
                    data: '',
                    props: '',
                    protocol: '',
                    protocolClass: '',
                    reuse: template?.attributes?.is || null,
                    engine: protos[0] && protos[0].attributes.engine ? protos[0].attributes.engine.split(' ') : []
                },
                modifiers: {
                    beforeEach: '',
                    compute: '',
                    cases: [],
                    default: '',
                    build: ''
                }
            };
        } catch (err) {
            this.error(`ComponentBuilder: ${err.message}\n${err.stack}`);
        }
    }
    read(bundle) {
        try {
            bundle.files.forEach((local, i5)=>{
                const { path: path3 , file  } = local;
                const index = path3;
                const overwrite = Array.from(MapFile.files).find((item)=>item[0].endsWith(path3)
                );
                const rootNode = this.XMLParser.parse(path3, overwrite ? overwrite[1].content : file);
                if (rootNode) {
                    const component = this.getComponent(file, {
                        rootNode,
                        file: index,
                        remote: null
                    });
                    if (!ComponentBuilder1.mapUuid.get(index)) {
                        ComponentBuilder1.mapUuid.set(index, component.uuid);
                        ComponentBuilder1.mapUuid.set(normalize2(join2(Deno.cwd(), index)), component.uuid);
                    }
                    bundle.components.set(index, component);
                    bundle.repository[component.uuid] = {
                    };
                }
            });
            bundle.remotes.forEach((remote, i5)=>{
                const { path: path3 , file  } = remote;
                const index = path3;
                const rootNode = this.XMLParser.parse(path3, file);
                if (rootNode) {
                    const component = this.getComponent(file, {
                        remote,
                        rootNode,
                        file: index
                    });
                    bundle.components.set(index, component);
                    bundle.repository[component.uuid] = {
                    };
                }
            });
            bundle.files.concat(bundle.remotes).forEach((localOrRemote)=>{
                if (localOrRemote.item) {
                    const parent = bundle.components.get(localOrRemote.parent);
                    if (parent) {
                        bundle.repository[parent.uuid] = bundle.repository[parent.uuid] || {
                        };
                        bundle.repository[parent.uuid][localOrRemote.item.path] = localOrRemote.path;
                    }
                }
            });
        } catch (err) {
            this.error(`ComponentBuilder: ${err.message}\n${err.stack}`);
        }
    }
}
class ProtocolClassConstructor1 extends ProtocolReactivity1 {
    mapProtocols = new Map();
    ProtocolReactivity = new ProtocolReactivity1();
    setItem(component) {
        try {
            this.mapProtocols.set(component.uuid, {
                value: '',
                props: '',
                types: [],
                importedComponentsTypes: []
            });
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
    static getInterfaceProps(component) {
        try {
            return component.requirements ? component.requirements.map(([name2, type2])=>`\n${name2}: ${type2};`
            ).join('') : '';
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
    static getPropsFromNode(node) {
        try {
            return Object.entries(node.attributes).filter(([key1])=>key1.startsWith(":")
            ).map(([key1, value])=>`\n${key1.slice(1)}: ${value === '=""' ? null : value}`
            ).join("\n,");
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
    saveProtocol(component, ctx) {
        try {
            if (ctx.token === 'declare') {
                const item = this.mapProtocols.get(component.uuid);
                if (item) {
                    item.value = this.template(Protocol.PROTOCOL_TEMPLATE.trim(), {
                        data: ctx.value.trim()
                    });
                }
            }
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
    recursiveInspectionOfNodes(bundle, component, opts) {
        try {
            const { importedComponent , tagName , n ,  } = opts;
            const item = this.mapProtocols.get(component.uuid);
            const { requirements  } = importedComponent;
            let propsTypes = "";
            if (n.tagName === tagName) {
                if (requirements && requirements.length) {
                    propsTypes = this.template(`{% props %}`, {
                        props: ProtocolClassConstructor1.getInterfaceProps(importedComponent)
                    });
                }
                const ctx = bundle.mapContexts.get(`${component.uuid}-${n.id}`);
                if (ctx) {
                    let result = this.template(Protocol.USED_COMPONENT_TEMPLATE, {
                        tagName,
                        tagNameFormatted: tagName.replace(/(\-)([a-z])/gi, "_$2"),
                        propsTypes,
                        genericType: `Ogone${importedComponent.type.toUpperCase()}Component`,
                        position: ctx.position,
                        data: ctx.data,
                        modules: ctx.modules,
                        value: ctx.value,
                        props: ProtocolClassConstructor1.getPropsFromNode(n)
                    });
                    if (item) {
                        item.importedComponentsTypes.push(result);
                    }
                }
            }
            if (n.childNodes) {
                for (let nc of n.childNodes){
                    this.recursiveInspectionOfNodes(bundle, component, {
                        importedComponent,
                        tagName,
                        n: nc
                    });
                }
            }
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
    getAllUsedComponents(bundle, component) {
        try {
            for (let [tagName, imp] of Object.entries(component.imports)){
                const subc = bundle.components.get(imp);
                if (subc) {
                    this.recursiveInspectionOfNodes(bundle, component, {
                        tagName,
                        importedComponent: subc,
                        n: component.rootNode
                    });
                }
            }
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
    async buildProtocol(component) {
        try {
            const item = this.mapProtocols.get(component.uuid);
            if (item) {
                Object.defineProperty(component.context, 'protocol', {
                    get: ()=>{
                        const runtime = this.getComponentRuntime(component);
                        const namespaces = __default3(runtime);
                        return this.template(Protocol.BUILD, {
                            runtime,
                            namespaces,
                            modules: component.deps.map((dep)=>dep.importStatementAbsolutePath
                            ).join('\n'),
                            protocol: item.value.length ? item.value : `class Protocol {\n              ${component.data ? Object.entries(component.data).map(([key1, value])=>`\n${key1} = (${JSON.stringify(value)});\n`
                            ) : ''}\n            }`,
                            allUsedComponents: item.importedComponentsTypes.join('\n'),
                            tsx: this.getComponentTSX(component)
                        });
                    }
                });
                Object.defineProperty(component.context, 'protocolClass', {
                    get: ()=>item.value
                });
            }
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
    getComponentTSX(component) {
        try {
            let result = '';
            const { template  } = component.elements;
            if (template && template.getOuterTSX) {
                result = template.getOuterTSX(component);
            }
            return result;
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
    getComponentRuntime(component) {
        try {
            let casesValue = component.modifiers.cases.map((modifier)=>`${modifier.token} ${modifier.argument}: ${modifier.value}`
            ).join('\n');
            let script = this.template(Context.TEMPLATE_COMPONENT_RUNTIME_PROTOCOL, {
                body: Context.TEMPLATE_COMPONENT_RUNTIME_BODY,
                switchBody: `\n${casesValue}\ndefault:\n${component.modifiers.default}`,
                file: component.file,
                caseGate: component.modifiers.cases.length || component.modifiers.default.length ? this.template(Context.CASE_GATE, {
                    declaredCases: component.modifiers.cases.map((modifier)=>modifier.argument
                    ).join(',')
                }) : '',
                reflections: component.modifiers.compute,
                beforeEach: component.modifiers.beforeEach,
                async: [
                    "async",
                    "store",
                    "controller"
                ].includes(component.type) ? "async" : ""
            });
            return script;
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
    async setComponentRuntime(component) {
        try {
            let casesValue = component.modifiers.cases.map((modifier)=>`${modifier.token} ${modifier.argument}: ${modifier.value}`
            ).join('\n');
            let script = this.template(Context.TEMPLATE_COMPONENT_RUNTIME_PROTOCOL_AS_FUNCTION, {
                modules: component.deps.map((dep)=>dep.destructuredOgoneRequire
                ).join('\n'),
                body: Context.TEMPLATE_COMPONENT_RUNTIME_BODY,
                switchBody: `\n${casesValue}\ndefault:\n${component.modifiers.default}`,
                file: component.file,
                caseGate: component.modifiers.cases.length || component.modifiers.default.length ? this.template(Context.CASE_GATE, {
                    declaredCases: component.modifiers.cases.map((modifier)=>modifier.argument
                    ).join(',')
                }) : '',
                reflections: component.modifiers.compute,
                beforeEach: component.modifiers.beforeEach,
                async: [
                    "async",
                    "store",
                    "controller"
                ].includes(component.type) ? "async" : ""
            });
            const runtime = await TSTranspiler.transpile(script);
            component.scripts.runtime = component.isTyped && !component.context.engine.includes(ComponentEngine.ComponentInlineReaction) || !component.isTyped && component.context.engine.includes(ComponentEngine.ComponentProxyReaction) ? runtime : this.getReactivity({
                text: runtime
            });
        } catch (err) {
            this.error(`ProtocolClassConstructor: ${err.message}\n${err.stack}`);
        }
    }
}
class ProtocolDataProvider1 extends Utils {
    DefinitionProvider = new DefinitionProvider1();
    ProtocolBodyConstructor = new ProtocolBodyConstructor1();
    ProtocolClassConstructor = new ProtocolClassConstructor1();
    ProtocolModifierGetter = new ProtocolModifierGetter1();
    ProtocolReactivity = new ProtocolReactivity1();
    async read(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            entries.forEach(([, component])=>{
                const proto = component.elements.proto[0];
                if (!proto || !proto.getInnerHTML) return;
                const position2 = MapPosition.mapNodes.get(proto);
                const protocol = proto.getInnerHTML();
                this.ProtocolClassConstructor.setItem(component);
                this.ProtocolModifierGetter.registerModifierProviders(protocol, {
                    modifiers: [
                        {
                            token: 'def',
                            unique: true,
                            indentStyle: true,
                            exclude: [
                                'declare'
                            ],
                            onParse: (ctx)=>{
                                this.DefinitionProvider.saveDataOfComponent(component, ctx);
                            }
                        },
                        {
                            token: 'declare',
                            unique: true,
                            indentStyle: true,
                            exclude: [
                                'def'
                            ],
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                this.transformInheritedPropertiesInContext(component, ctx);
                                component.isTyped = true;
                                this.ProtocolClassConstructor.saveProtocol(component, ctx);
                            }
                        },
                        {
                            token: 'default',
                            unique: true,
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                component.modifiers.default = ctx.value;
                            }
                        },
                        {
                            token: 'before-each',
                            unique: true,
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                this.ProtocolBodyConstructor.setBeforeEachContext(component, ctx);
                            }
                        },
                        {
                            token: 'compute',
                            unique: true,
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                this.ProtocolBodyConstructor.setComputeContext(component, ctx);
                            }
                        },
                        {
                            token: 'case',
                            argumentType: 'string',
                            unique: false,
                            isReactive: component.type !== "controller",
                            onParse: (ctx)=>{
                                this.ProtocolBodyConstructor.setCaseContext(component, ctx);
                            }
                        }, 
                    ],
                    onError: (err)=>{
                        this.error(`Error in component: ${component.file}:${position2.line}:${position2.column} \n\t${err.message}\n${err.stack}`);
                    }
                });
            });
            for await (const [, component] of entries){
                await this.DefinitionProvider.setDataToComponentFromFile(component);
                this.DefinitionProvider.transformInheritedProperties(component);
            }
            for await (const [, component1] of entries){
                this.ProtocolClassConstructor.getAllUsedComponents(bundle, component1);
                await this.ProtocolClassConstructor.buildProtocol(component1);
                await this.ProtocolClassConstructor.setComponentRuntime(component1);
            }
        } catch (err) {
            this.error(`ProtocolDataProvider: ${err.message}\n${err.stack}`);
        }
    }
    setReactivity(text) {
        try {
            return this.ProtocolReactivity.getReactivity({
                text
            });
        } catch (err) {
            this.error(`ProtocolDataProvider: ${err.message}\n${err.stack}`);
        }
    }
    transformInheritedPropertiesInContext(component, ctx) {
        try {
            const expressions = {
            };
            const typedExpressions = __default();
            let result = __default2({
                value: ctx.value,
                array: nullish.concat(tokens).concat([
                    {
                        name: 'inherit',
                        reg: /(inherit)(?:\s+)([^\s\:\n\=\;\?]+)+((?<undefinedAllowed>\s*\?\s*){0,1}\:(?<types>.+?)){0,1}(?<last>\=|\;|\n)/,
                        open: false,
                        id: (value, matches)=>{
                            const id2 = `${__default1.next().value}_tokenIn`;
                            if (matches) {
                                const [input1, statement, property] = matches;
                                const types = matches && matches.groups && matches.groups.types ? matches.groups.types : '';
                                component.requirements = component.requirements || [];
                                component.requirements.push([
                                    property.trim(),
                                    getDeepTranslation1(types, expressions)
                                ]);
                                expressions[id2] = value.replace(/^\s*inherit\b/, '');
                                return id2;
                            }
                            expressions[id2] = value;
                            return id2;
                        },
                        close: false
                    }
                ]),
                expressions,
                typedExpressions
            });
            ctx.value = getDeepTranslation1(result, expressions);
        } catch (err) {
            this.error(`ProtocolDataProvider: ${err.message}\n${err.stack}`);
        }
    }
}
class ComponentCompiler1 extends Utils {
    static mapData = new Map();
    static mapDepsAmount = new Map();
    async startAnalyze(bundle) {
        try {
            const entries = Array.from(bundle.components);
            for await (let [, component] of entries){
                await this.read(bundle, component);
            }
        } catch (err) {
            this.error(`ComponentCompiler: ${err.message}\n${err.stack}`);
        }
    }
    getControllers(bundle, component) {
        try {
            const controllers = Object.entries(component.imports).filter(([key1, path3])=>{
                const comp = bundle.components.get(path3);
                return key1 !== 'Self' && comp && comp.type === "controller";
            });
            if (controllers.length && component.type !== "store") {
                this.error(this.template(`forbidden use of a controller inside a non-store component. \ncomponent: {% component.file %}`, {
                    component
                }));
            }
            return controllers;
        } catch (err) {
            this.error(`ComponentCompiler: ${err.message}\n${err.stack}`);
        }
    }
    async read(bundle, component) {
        try {
            const { mapRender  } = bundle;
            if (component.data instanceof Object) {
                const { runtime  } = component.scripts;
                const { modules  } = component;
                const controllers = this.getControllers(bundle, component);
                const ControllersAPI = controllers.length > 0 ? `\n            const Controllers = {};\n            ${controllers.map(([tagName, path3])=>{
                    const subcomp = bundle.components.get(path3);
                    let result = subcomp ? `\n            Controllers["${tagName}"] = {\n                async get(rte) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`)).blob()).text(); },\n                async post(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op, body: JSON.stringify(data || {}), method: 'POST'})).blob()).text(); },\n                async put(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op,  body: JSON.stringify(data || {}), method: 'PUT'})).blob()).text(); },\n                async delete(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op,  body: JSON.stringify(data || {}), method: 'DELETE'})).blob()).text(); },\n                async patch(rte, data = {}, op = {}) { return await (await (await fetch(\`${subcomp.namespace}$\{rte}\`, { ...op,  body: JSON.stringify(data || {}), method: 'PATCH'})).blob()).text(); },\n              }` : "";
                    return result;
                })}\n            Object.seal(Controllers);\n          ` : "";
                const store = `\n        const Store = {\n          dispatch: (id, ctx) => {\n            const path = id.split('/');\n            if (path.length > 1) {\n              const [namespace, action] = path;\n              const mod = Onode.component.store[namespace];\n              if (mod && mod.runtime) {\n                return mod.runtime(\`action:$\{action}\`, ctx)\n                  .catch((err) => displayError(err.message, \`Error in dispatch. action: \${action} component: {% component.file %}\`, err));\n              }\n            } else {\n              const mod = Onode.component.store[null];\n              if (mod && mod.runtime) {\n                return mod.runtime(\`action:$\{id}\`, ctx)\n                  .catch((err) => displayError(err.message, \`Error in dispatch. action: \${action} component: {% component.file %}\`, err));\n              }\n            }\n          },\n          commit: (id, ctx) => {\n            const path = id.split('/');\n            if (path.length > 1) {\n              const [namespace, mutation] = path;\n              const mod = Onode.component.store[namespace];\n              if (mod && mod.runtime) {\n                return mod.runtime(\`mutation:$\{mutation}\`, ctx).catch((err) => displayError(err.message, \`Error in commit. mutation: \${mutation} component: {% component.file %}\`, err));\n              }\n            } else {\n              const mod = Onode.component.store[null];\n              if (mod && mod.runtime) {\n                return mod.runtime(\`mutation:$\{id}\`, ctx).catch((err) => displayError(err.message, \`Error in commit. mutation: \${id} component: {% component.file %}\`, err));\n              }\n            }\n          },\n          get: (id) => {\n            const path = id.split('/');\n            if (path.length > 1) {\n              const [namespace, get] = path;\n              const mod = Onode.component.store[namespace];\n              if (mod && mod.data) {\n                return mod.data[get];\n              }\n            } else {\n              const mod = Onode.component.store[null];\n              if (mod && mod.data) {\n                return mod.data[id];\n              }\n            }\n          },\n        };`;
                const AsyncAPI = `\n          const Async = {\n            resolve: (...args) => {\n              if (Onode.component.resolve) {\n                const promise = Onode.component.resolve(...args);\n                if (Onode.component.dispatchAwait) {\n                  Onode.component.dispatchAwait();\n                  Onode.component.dispatchAwait = false;\n                  Onode.component.promiseResolved = true;\n                }\n                Onode.component.resolve = null;\n                return promise;\n              } else if (Onode.component.resolve === null) {\n                const DoubleUseOfResolveException = new Error('Double use of resolution in async component');\n                displayError(DoubleUseOfResolveException.message, 'Double Resolution of Promise', {\n                 message: \`component: {% component.file %}\`\n                });\n                throw DoubleUseOfResolveException;\n              }\n            },\n          };\n          // freeze Async Object;\n          Object.freeze(Async);\n          `;
                let result = `function (Onode) {\n            {% modules %}\n            {% ControllersAPI %}\n            {% StoreAPI %}\n            const ___ = (prop, inst, value) => {\n              OnodeUpdate(Onode, prop);\n              return value;\n            };\n            const ____r = (name, use, once) => {\n              Onode.component.runtime(name, use[0], use[1], once);\n            };\n            const Refs = {\n              {% refs %}\n            };\n            {% AsyncAPI %}\n            {% protocol %}\n            {% protocolDeclarationForTypedComponent %}\n            const data = {% data %};\n            return {\n              data,\n              Refs,\n              runtime: ({% runtime %}).bind(data),\n            }\n          };\n          `;
                const componentVar = `${component.uuid.replace(/\-/gi, '_')}`;
                const d = {
                    component,
                    componentVar,
                    modules: component.deps.map((dep)=>dep.destructuredOgoneRequire
                    ).join('\n'),
                    AsyncAPI: component.type === "async" ? AsyncAPI : "let Async;",
                    protocol: component.protocol ? component.protocol : "",
                    dataSource: component.isTyped ? `new Ogone.protocols[{% componentVar %}]` : JSON.stringify(component.data),
                    data: component.isTyped || component.context.engine.includes(ComponentEngine.ComponentProxyReaction) && !component.context.engine.includes(ComponentEngine.ComponentInlineReaction) ? `setReactivity({% dataSource %}, (prop) => OnodeUpdate(Onode, prop))` : '{% dataSource %}',
                    runtime,
                    ControllersAPI: component.type === "store" ? ControllersAPI : "let Controllers;",
                    refs: Object.entries(component.refs).length ? Object.entries(component.refs).map(([key1, value])=>`'${key1}': '${value}',`
                    ) : "",
                    StoreAPI: !!component.hasStore ? store : "let Store;",
                    protocolDeclarationForTypedComponent: component.isTyped ? `\n          Ogone.protocols[{% componentVar %}] = Ogone.protocols[{% componentVar %}] || ${component.context.protocolClass}\n          ` : ''
                };
                result = await TSTranspiler.transpile(`  ${this.template(result, d)}`);
                if (mapRender.has(result)) {
                    const item = mapRender.get(result);
                    result = this.template(`Ogone.components[{% componentVar %}] = Ogone.components['{% item.id %}'];\n            `, {
                        ...d,
                        item
                    });
                    result = this.template(result, d);
                } else {
                    mapRender.set(result, {
                        id: component.uuid
                    });
                    result = this.template(`Ogone.components[{% componentVar %}] = ${result.trim()};\n            `, d);
                }
                MapOutput.outputs.data.push(result);
                ComponentCompiler1.sendChanges({
                    output: result,
                    component,
                    variable: componentVar
                });
                ComponentCompiler1.checkDepsAmountChanges(component);
            }
        } catch (err) {
            this.error(`ComponentCompiler: ${err.message}\n${err.stack}`);
        }
    }
    static async sendChanges(opts) {
        const { component , output , variable  } = opts;
        if (this.mapData.has(component.uuid)) {
            const item = this.mapData.get(component.uuid);
            if (item !== output) {
                let result = `\n        Ogone.protocols[${variable}] = null;\n        ${output}\n        `;
                HMR.postMessage({
                    output: await TSTranspiler.transpile(result),
                    uuid: component.uuid,
                    type: 'data'
                });
                this.mapData.set(component.uuid, output);
            }
        } else {
            this.mapData.set(component.uuid, output);
        }
    }
    static checkDepsAmountChanges(component) {
        if (!this.mapDepsAmount.has(component.uuid)) {
            this.mapDepsAmount.set(component.uuid, component.deps.length);
            return;
        }
        const previousAmount = this.mapDepsAmount.get(component.uuid);
        if (component.deps.length === previousAmount) return;
        this.mapDepsAmount.set(component.uuid, component.deps.length);
        setTimeout(()=>{
            if (HMR.diagnostics.length) return;
            Utils.infos('reloading. synchronization of dependencies.');
            HMR.postMessage({
                type: 'reload'
            });
        }, 5000);
    }
}
class SwitchContextBuilder1 extends Utils {
    static mapContexts = new Map();
    async startAnalyze(bundle) {
        try {
            const entries = Array.from(bundle.components);
            for await (let [path3] of entries){
                await this.read(bundle, path3);
            }
        } catch (err) {
            this.error(`SwitchContextBuilder: ${err.message}\n${err.stack}`);
        }
    }
    read(bundle, keyComponent) {
        try {
            const component = bundle.components.get(keyComponent);
            if (component) {
                Object.entries(component.for).forEach(([nId, flag])=>{
                    const { script  } = flag;
                    const { modules  } = component;
                    const { node , ctx , getLength , array , item: itemName , aliasItem , destructured  } = script;
                    let contextIf = null;
                    if (node.attributes && node.attributes["--if"]) {
                        let nxt = node.nextElementSibling;
                        node.hasFlag = true;
                        node.ifelseBlock = {
                            main: node.attributes["--if"],
                            ifFlag: {
                                [node.id]: node.attributes["--if"]
                            },
                            elseIf: {
                            },
                            elseFlag: {
                            }
                        };
                        while(nxt && nxt.attributes && (nxt.attributes["--else-if"] || nxt.attributes["--else"])){
                            nxt.ifelseBlock = node.ifelseBlock;
                            if (nxt.attributes["--else-if"]) {
                                node.ifelseBlock.elseIf[nxt.id] = nxt.attributes["--else-if"];
                            } else {
                                node.ifelseBlock.elseFlag[nxt.id] = nxt.attributes["--else"];
                            }
                            const elseDir = !!nxt.attributes["--else"];
                            nxt = nxt.nextElementSibling;
                            if (elseDir && nxt && nxt.attributes && (!!nxt.attributes["--else"] || !!nxt.attributes["--else-if"])) {
                                this.error("else flag has to be the last in if-else-if blocks, no duplicate of --else are allowed.");
                            }
                        }
                    }
                    if (node.ifelseBlock && node.attributes && !node.attributes["--for"]) {
                        node.hasFlag = true;
                        const { ifFlag , elseFlag , elseIf , main  } = node.ifelseBlock;
                        const isElse = elseFlag[node.id];
                        const isElseIf = elseIf[node.id];
                        const isMain = ifFlag[node.id];
                        const allElseIf = Object.values(elseIf);
                        if (!!isMain) {
                            contextIf = `\n              if (GET_LENGTH && !(${main})) {\n                return 0;\n              }\n            `;
                        } else if (!!isElseIf) {
                            contextIf = `\n              if (GET_LENGTH && (${main})) {\n                return 0;\n              } else if (GET_LENGTH && !(${isElseIf})) {\n                return 0;\n              }\n            `;
                        } else if (!!isElse) {
                            contextIf = `\n              if (GET_LENGTH && (${main})) {\n                return 0;\n              ${allElseIf.map((key1)=>{
                                return `\n              } else if (GET_LENGTH && ${key1}) {\n                return 0;`;
                            }).join("\n")}\n              }\n            `;
                        }
                    }
                    function renderConditions(item) {
                        if (!!item.ifelseBlock && item.id) {
                            item.hasFlag = true;
                            const { ifFlag , elseFlag , elseIf , main  } = item.ifelseBlock;
                            const isElse = elseFlag[item.id];
                            const isElseIf = elseIf[item.id];
                            const isMain = ifFlag[item.id];
                            const allElseIf = Object.values(elseIf);
                            if (!!isMain) {
                                return `(${main})`;
                            } else if (!!isElseIf) {
                                return `!(${main}) && (${isElseIf})`;
                            } else if (!!isElse && allElseIf.length) {
                                return `!(${main}) && !(${allElseIf.join(" && ")})`;
                            } else if (!!isElse) {
                                return `!(${main})`;
                            }
                        }
                        return "";
                    }
                    const nodeHasProps = !!Object.keys(node.attributes).find((n)=>n.startsWith(":")
                    );
                    const isImported = bundle.components.get(keyComponent)?.imports[node.tagName];
                    const isNodeDynamic = nodeHasProps && !node.attributes['--for'] && !isImported;
                    const contextScript = node.hasFlag || !node.tagName && node.nodeType === 1 || isNodeDynamic ? `\n          Ogone.contexts[{% context.id %}] = function(opts) {\n            const GET_TEXT = opts.getText;\n            const GET_LENGTH = opts.getLength;\n            const POSITION = opts.position;\n            {% data %}\n            {% value %}\n            {% modules %}\n            {% context.if %}\n            {% context.getNodeDynamicLength || context.getLength %}\n            try {\n              if (GET_TEXT) {\n                  return eval('('+GET_TEXT+')');\n                }\n                return { {% context.result %} };\n            } catch(err) {\n              if (typeof {% itemName %} === 'undefined' || !({% itemName %})) { return undefined }\n              displayError('Error in component:\\n\\t {%component.file%} '+\`$\{GET_TEXT}\`, err.message ,err);\n              throw err;\n            }\n          };\n        ` : `Ogone.contexts[{% context.id %}] = Ogone.contexts[{% context.parentId %}];`;
                    const result = this.template(contextScript, {
                        component,
                        data: component.context.data,
                        value: script.value || "",
                        itemName: aliasItem || itemName,
                        context: {
                            id: `${component.uuid}_${nId}`.replace(/\-/gi, '_'),
                            if: contextIf ? contextIf : "",
                            parentId: node.parentNode ? `${component.uuid}_${node.parentNode.id}`.replace(/\-/gi, '_') : "",
                            result: component.data ? [
                                ...Object.keys(ctx).filter((key1)=>!key1.match(/^(\{|\[)/)
                                ),
                                ...destructured ? destructured : [],
                                ...Object.keys(component.data)
                            ].join(',') : '',
                            getNodeDynamicLength: isNodeDynamic ? `\n            if (GET_LENGTH) {\n              return 1;\n            }` : null,
                            getLength: getLength ? getLength({
                                filter: renderConditions(node)
                            }) : ""
                        },
                        modules: component.deps.map((dep)=>dep.destructuredOgoneRequire
                        ).join('\n')
                    });
                    const key1 = `${component.uuid}-${node.id}`;
                    bundle.mapContexts.set(key1, {
                        position: `const POSITION: number[] = Array.from(new Array(${script.level})).map((a,i) => 0);`,
                        data: component.data instanceof Object ? Object.keys(component.data).map((prop)=>`const ${prop} = this.${prop};`
                        ).join("\n") : "",
                        value: script.value || "",
                        modules: modules ? modules.map((md)=>md[0]
                        ).join(";\n") : ""
                    });
                    MapOutput.outputs.context.push(result);
                    SwitchContextBuilder1.sendChanges({
                        output: result,
                        key: key1,
                        component
                    });
                });
            }
        } catch (err) {
            this.error(`SwitchContextBuilder: ${err.message}\n${err.stack}`);
        }
    }
    static sendChanges(opts) {
        const { key: key1 , output , component  } = opts;
        if (this.mapContexts.has(key1)) {
            const item = this.mapContexts.get(key1);
            if (item !== output) {
                HMR.postMessage({
                    output,
                    invalid: item,
                    uuid: component.uuid,
                    type: 'context'
                });
                this.mapContexts.set(key1, output);
            }
        } else {
            this.mapContexts.set(key1, output);
        }
    }
}
class WebComponentDefinition extends Utils {
    static mapRender = new Map();
    static mapTypes = new Map();
    render(bundle, component, node) {
        try {
            if (!component) return "";
            const isTemplate = node.tagName === null && node.nodeType === 1;
            const isImported = node.tagName ? component.imports[node.tagName] : false;
            const isProduction = Env._env === "production";
            let componentPragma = node.pragma ? node.pragma(bundle, component, true) : "";
            if (isImported) {
                return "";
            }
            const templateSlots = {
                component,
                elementId: isTemplate ? `${component.uuid}-nt` : `${component.uuid}-${node.id}`
            };
            const variable = templateSlots.elementId.replace(/\-/gi, '_');
            let componentExtension = ``;
            const render = `Ogone.render[${variable}] = ${componentPragma.replace(/\n/gi, "").replace(/\s+/gi, " ")}`;
            const types = `Ogone.types[${variable}] = ogone_types_{% component.type %};`;
            const newrender = this.template(render, templateSlots);
            const newtypes = this.template(types, templateSlots);
            MapOutput.outputs.render.push(newrender);
            MapOutput.outputs.types.push(newtypes);
            if (isTemplate) {
                WebComponentDefinition.sendChanges({
                    node,
                    key: component.uuid,
                    component,
                    render: newrender,
                    types: newtypes
                });
            }
            if ([
                "controller"
            ].includes(component.type)) {
                return `class extends HTMLTemplateElement {\n        constructor(){super();}\n        connectedCallBack(){this.remove()} };`;
            }
            return this.template(componentExtension, templateSlots);
        } catch (err) {
            this.error(`WebComponentDefinition: ${err.message}\n${err.stack}`);
        }
    }
    static sendChanges(opts) {
        const { render , types , key: key1 , component , node  } = opts;
        const output = `\n    ${MapOutput.outputs.vars.filter((v)=>v && v.includes(component.uuid)
        ).join('\n')}\n      ${MapOutput.outputs.context.filter((v)=>v && v.includes(component.uuid)
        ).join('\n')}\n    ${render}\n    `;
        if (this.mapRender.has(key1)) {
            const item = this.mapRender.get(key1);
            if (item !== node.dna) {
                HMR.postMessage({
                    output,
                    invalid: item,
                    uuid: component.uuid,
                    type: 'render'
                });
                this.mapRender.set(key1, node.dna);
            }
        } else {
            this.mapRender.set(key1, node.dna);
        }
    }
}
class NodeAnalyzerCompiler1 extends WebComponentDefinition {
    async startAnalyze(bundle) {
        try {
            const entries = Array.from(bundle.components);
            for await (let [path3, component] of entries){
                await this.read(bundle, path3, component.rootNode);
            }
        } catch (err) {
            this.error(`Constructor: ${err.message}\n${err.stack}`);
        }
    }
    async read(bundle, keyComponent, node) {
        try {
            const component = bundle.components.get(keyComponent);
            if (component) {
                const protoNoStrictTagname = component.elements.proto[0] && component.elements.proto[0].attributes.engine === ComponentEngine.NoStrictTagName;
                const isImported = component.imports[node.tagName];
                const subcomp = bundle.components.get(isImported);
                if (node.attributes && node.attributes["--await"] && component.type !== "async") {
                    const BadUseOfAwaitInSyncComponentException = `--await must be used in an async component. define type="async" to the proto.\n Error in component: ${component.file}\n node: ${node.tagName}`;
                    this.error(BadUseOfAwaitInSyncComponentException);
                }
                this.trace('BadUseOfAwaitInSyncComponentException passed.');
                if (node.attributes && node.attributes["--await"] && isImported && subcomp && subcomp.type !== "async") {
                    const BadUseOfAwaitInSyncComponentException = `--await must be called only on async components. change type of <${node.tagName} --await /> or erase --await.\n Error in component: ${component.file}\n node: ${node.tagName}`;
                    this.error(BadUseOfAwaitInSyncComponentException);
                }
                this.trace('BadUseOfAwaitInSyncComponentException passed.');
                if (node.attributes && node.attributes["--defer"] && !isImported) {
                    const BadUseDeferFlagException = `--defer must be called only on async components. discard <${node.tagName} --defer="${node.attributes["--defer"]}" />.\n Error in component: ${component.file}\n node: ${node.tagName}`;
                    this.error(BadUseDeferFlagException);
                }
                this.trace('BadUseDeferFlagException passed.');
                if (node.attributes && node.attributes["--defer"] && isImported && subcomp && subcomp.type !== "async") {
                    const BadUseDeferFlagException = `--defer must be called only on async components. change type of <${node.tagName} --defer="${node.attributes["--defer"]}" /> or delete it.\n Error in component: ${component.file}\n node: ${node.tagName}`;
                    this.error(BadUseDeferFlagException);
                }
                this.trace('BadUseDeferFlagException passed.');
                switch(true){
                    case !protoNoStrictTagname && subcomp && [
                        "async",
                        "store",
                        "router"
                    ].includes(subcomp.type) && node.tagName && ![
                        "Self"
                    ].includes(node.tagName) && !node.tagName.startsWith(`${subcomp.type[0].toUpperCase()}${subcomp.type.slice(1)}`):
                        if (subcomp) {
                            this.error(`'${node.tagName}' is not a valid selector of ${subcomp.type} component. please use the following syntax:\n                import ${subcomp.type[0].toUpperCase()}${subcomp.type.slice(1)}${node.tagName} from '${isImported}';\n                component: ${component.file}\n              `);
                        }
                }
                this.trace('Valid tag name passed.');
                const nodeIsDynamic = node.nodeType === 1 && Object.keys(node.attributes).find((key1)=>key1.startsWith(':')
                );
                if (node.nodeType === 1 && node.childNodes && node.childNodes.length) {
                    for await (const child of node.childNodes){
                        await this.read(bundle, keyComponent, child);
                    }
                }
                if (node.tagName === null || node.hasFlag && node.tagName || nodeIsDynamic) {
                    this.render(bundle, component, node);
                }
            }
        } catch (err) {
            this.error(`NodeAnalyzerCompiler: ${err.message}\n${err.stack}`);
        }
    }
}
class ImportsAnalyzer1 extends Utils {
    AssetsParser = new AssetsParser1();
    inspect(bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            for (const [, component] of entries){
                const firstNode = component.rootNode.childNodes.find((node)=>node.nodeType !== 3
                );
                if (firstNode) {
                    const index = component.rootNode.childNodes.indexOf(firstNode);
                    const textNodes = component.rootNode.childNodes.filter((node, id2)=>node.nodeType === 3 && id2 < index
                    );
                    let declarations = ``;
                    textNodes.forEach((node)=>{
                        declarations += node.rawText;
                    });
                    if (declarations.length) {
                        const importBody = this.AssetsParser.parseImportStatement(declarations);
                        if (importBody.body && importBody.body.imports) {
                            const { imports  } = importBody.body;
                            component.deps = Object.values(imports).filter((imp)=>!imp.isComponent
                            ).map((imp)=>new Dependency(component, imp)
                            );
                        }
                        if (importBody.body && importBody.body.imports) {
                            Object.values(importBody.body.imports).forEach((item)=>{
                                if (!item.isComponent && item.path.endsWith('.o3')) {
                                    this.error(`${component.file}\n                    Wrong Syntax for Component importation\n                    please follow this pattern\n\n                    pattern: import component ComponentName from '${item.path}';\n                    component: ${component.file}\n                  `);
                                }
                                if (!item.isComponent || !item.path.endsWith('.o3')) return;
                                const pathComponent = bundle.repository[component.uuid][item.path];
                                const tagName = item.defaultName;
                                switch(true){
                                    case !tagName:
                                        this.error(`this Ogone version only supports default exports.\n                      input: import component ... from ${item.path}\n                      component: ${component.file}\n                    `);
                                    case tagName === "proto":
                                        this.error(`proto is a reserved tagname, don\'t use it as selector of your component.\n                      input: import component ${item.defaultName} from ${item.path}\n                      component: ${component.file}\n                    `);
                                    case tagName === "Self":
                                        this.error(`Self is a reserved tagname, don\'t use it as selector of your component.\n                      input: import component ${item.defaultName} from ${item.path}\n                      component: ${component.file}\n                    `);
                                    case !tagName.match(/^([A-Z])((\w+))+$/):
                                        this.error(`'${tagName}' is not a valid component name. Must be PascalCase. please use the following syntax:\n\n                      import component YourComponentName from '${item.path}'\n\n                      input: import component ${item.defaultName} from ${item.path}\n                      component: ${component.file}\n\n                      note: if the component is typed you must provide the name into the tagName\n                    `);
                                    case !!component.imports[tagName]:
                                        this.error(`component name already in use. please use the following syntax:\n\n                      import component ${tagName}2 from '${item.path}'\nimport { ImportDescription } from '../';\n\n                      input: import component ${item.defaultName} from ${item.path}\n                      component: ${component.file}\n                    `);
                                    default:
                                        component.imports[tagName] = pathComponent;
                                        break;
                                }
                            });
                        }
                        textNodes.forEach((node)=>{
                            node.rawText = "";
                        });
                        component.requirements = this.AssetsParser.parseRequireStatement(declarations).body.properties;
                    }
                }
            }
        } catch (err) {
            this.error(`ImportsAnalyzer: ${err.message}\n${err.stack}`);
        }
    }
}
class Constructor extends Utils {
    StoreArgumentReader = new StoreArgumentReader1();
    ComponentTypeGetter = new ComponentTypeGetter1();
    ProtocolDataProvider = new ProtocolDataProvider1();
    ComponentTopLevelAnalyzer = new ComponentTopLevelAnalyzer1();
    ComponentCompiler = new ComponentCompiler1();
    SwitchContextBuilder = new SwitchContextBuilder1();
    NodeAnalyzerCompiler = new NodeAnalyzerCompiler1();
    StylesheetBuilder = new StylesheetBuilder1();
    ForFlagBuilder = new ForFlagBuilder1();
    ImportsAnalyzer = new ImportsAnalyzer1();
    ComponentsSubscriber = new ComponentsSubscriber1();
    ComponentBuilder = new ComponentBuilder1();
    async getBundle(entrypoint) {
        try {
            const bundle = {
                uuid: `b${crypto.getRandomValues(new Uint32Array(10)).join('')}`,
                output: '',
                files: [],
                components: new Map(),
                mapRender: new Map(),
                mapClasses: new Map(),
                mapContexts: new Map(),
                remotes: [],
                repository: {
                },
                types: {
                    component: true,
                    app: true,
                    store: false,
                    async: false,
                    router: false,
                    controller: false
                }
            };
            this.trace('Bundle created');
            await this.ComponentsSubscriber.inspect(entrypoint, bundle);
            this.trace('Subscriptions done');
            await this.ComponentBuilder.read(bundle);
            this.trace('Components created');
            MapOutput.saveDeclarations(bundle);
            this.trace('saved declarations');
            this.ComponentTypeGetter.setTypeOfComponents(bundle);
            this.trace('Components Protocol\'s Type Setting');
            this.ComponentTypeGetter.forbiddenUseOfPrivateOnTemplate(bundle);
            this.trace('Components Protocol\'s checking private components');
            await this.StylesheetBuilder.transformAllStyleElements(bundle);
            this.trace('Style Sheet transformation of all style elements done');
            this.ComponentTypeGetter.setApplication(bundle);
            this.trace('App Component switched to component type and Configuration.head is defined if the head was provided');
            await this.ImportsAnalyzer.inspect(bundle);
            this.trace('Imports Checking');
            await this.ComponentTopLevelAnalyzer.switchRootNodeToTemplateNode(bundle);
            this.trace('Root Node changed to the template node');
            await this.ForFlagBuilder.startAnalyze(bundle);
            this.trace('Contexts analyzes done');
            await this.SwitchContextBuilder.startAnalyze(bundle);
            this.trace('Switch block context created');
            await this.ProtocolDataProvider.read(bundle);
            this.trace('Component\'s data provided');
            this.ComponentTypeGetter.assignTypeConfguration(bundle);
            this.trace('Last Component configurations');
            this.StoreArgumentReader.read(bundle);
            this.trace('Store Components analyze done');
            await this.StylesheetBuilder.read(bundle);
            this.trace('Style Sheet done');
            await this.ComponentTopLevelAnalyzer.cleanRoot(bundle);
            this.trace('Component\'s Top level cleaned');
            await this.ComponentCompiler.startAnalyze(bundle);
            this.trace('Compilation done.');
            await this.NodeAnalyzerCompiler.startAnalyze(bundle);
            this.trace('Node Analyzer done.');
            await MapOutput.getOutputs(bundle);
            this.trace('outputs of all components, done.');
            await TSTranspiler.getRuntime(bundle);
            this.trace('Ogone\'s runtime output, done.');
            return bundle;
        } catch (err) {
            this.error(`Constructor: ${err.message}\n${err.stack}`);
        }
    }
}
const importMeta1 = {
    url: "file:///home/rudy/.vscode/extensions/Otone/Ogone/src/classes/Env.ts",
    main: false
};
const importMeta2 = {
    url: "file:///home/rudy/.vscode/extensions/Otone/Ogone/src/classes/TSTranspiler.ts",
    main: false
};
class MapOutput {
    static outputs = {
        vars: [],
        render: [],
        data: [],
        context: [],
        customElement: [],
        types: []
    };
    static runtime = '';
    static async getOutputs(bundle) {
        bundle.output += `\n      const ogone_types_component = "component";\n      const ogone_types_store = "store";\n      const ogone_types_async = "async";\n      const ogone_types_router = "router";\n      const ogone_types_controller = "controller";\n      const ogone_types_app = "app";\n      const ogone_types_gl = "gl";\n      ${this.outputs.vars.join('\n')}\n      ${this.outputs.types.join('\n')}\n      ${this.outputs.data.join('\n')}\n      ${this.outputs.context.slice().reverse().join('\n')}\n      ${this.outputs.render.join('\n')}\n    `;
        bundle.output = bundle.output.replace(/l\+{2};\s*\/\*+\/\s*l\-{2};/gi, '');
        bundle.output = await TSTranspiler.transpile(bundle.output);
        this.cleanOutputs();
    }
    static cleanOutputs() {
        this.outputs.context.splice(0);
        this.outputs.data.splice(0);
        this.outputs.types.splice(0);
        this.outputs.render.splice(0);
    }
    static saveDeclarations(bundle) {
        const entries = Array.from(bundle.components.entries()).map(([k, c])=>c
        );
        entries.forEach((component)=>{
            const { nodeList  } = component.rootNode;
            const declarationVars = `const ${component.uuid.replace(/\-/gi, '_')} = '${component.uuid}'`;
            const declarationVarsTemplate = `const ${component.uuid.replace(/\-/gi, '_')}_nt = '${component.uuid}-nt'`;
            if (!MapOutput.outputs.vars.includes(declarationVars)) {
                MapOutput.outputs.vars.push(declarationVars, declarationVarsTemplate);
            }
            nodeList.forEach((node)=>{
                const nId = node.tagName === null ? 'nt' : node.id;
                const declarationVarsNode = `const ${(component.uuid + `_${nId}`).replace(/\-/gi, '_')} = '${component.uuid}-${nId}'`;
                if (!MapOutput.outputs.vars.includes(declarationVarsNode)) {
                    MapOutput.outputs.vars.push(declarationVarsNode);
                }
            });
        });
    }
}
class Dependency extends Utils {
    static depsRegistry = [];
    AssetsParser = new AssetsParser1();
    children = [];
    file = '';
    uuid = `dep_${crypto.getRandomValues(new Uint16Array(4)).join('')}`;
    constructor(component, data1, parent = null){
        super();
        this.component = component;
        this.data = data1;
        this.parent = parent;
        this.resolveRemoteComponentDependency();
        if (Dependency.depsRegistry.includes(this.absolutePathURL.pathname)) {
            return;
        }
        if (this.component.deps.find((dep)=>dep.absolutePathURL === this.absolutePathURL
        )) {
            return;
        }
        Dependency.depsRegistry.push(this.absolutePathURL.pathname);
        this.trace(`Dep: ${this.absolutePathURL.pathname}`);
        this.getTranspiledFile();
        (async ()=>{
            this.getChildren();
        })().then(()=>{
            this.watch();
        });
    }
    get isRemote() {
        return !!this.data.isRemote;
    }
    get origin() {
        return this.parent && this.parent.absolutePathURL || new URL(this.component.file, `file://${Deno.cwd()}/`);
    }
    get position() {
        const position2 = MapPosition.mapTokens.get(this.data.key);
        return position2;
    }
    get absolutePathURL() {
        if (this.isRemote) {
            return new URL(this.data.path);
        }
        const url = new URL(this.data.path, this.origin);
        if (!existsSync(url.pathname)) {
            const position2 = this.position;
            if (position2) {
                const { blue: blue1  } = mod;
                const line2 = MapPosition.getLine(this.component.source, position2);
                const column1 = MapPosition.getColumn(this.component.source, position2);
                this.error(`${this.component.file}:${line2}:${column1}\n                Cannot resolve module: ${blue1(url.pathname)}\n                    from ${blue1(this.component.file)}\n                    input: ${blue1(this.data.path)}\n                `);
            }
        }
        return url;
    }
    get type() {
        return this.data.type;
    }
    get input() {
        return this.data.value;
    }
    get importStatementAbsolutePath() {
        if (this.isRemote) return this.input;
        if (Env._env !== 'production') return this.input.replace(this.data.path, `${this.absolutePathURL.pathname}?uuid=${this.component.uuid}`);
        return this.input.replace(this.data.path, this.absolutePathURL.pathname);
    }
    get importRemoteDepencyForDev() {
        if (!this.isRemote) return null;
        if (Env._env !== 'production') {
            return this.input.replace(this.data.path, `/?serve_module=${this.absolutePathURL.href}`);
        }
        return this.input;
    }
    get structuredOgoneRequire() {
        const { defaultName , allAsName , members: members1 , path: path3 , isType , isRemote  } = this.data;
        if (isType) return '';
        const graph = this.graphAbsolutePaths;
        function getStructure(pathToModule, memberName, opts) {
            const { isDefault , isMember , isAllAs  } = opts;
            if (isRemote) `Ogone.require[${pathToModule}].${memberName} = ${memberName}`;
            let result = `\n            Ogone.require[${pathToModule}].${memberName} = ${memberName}\n            `;
            if (Env._env !== 'production') {
                result += `\n                HMR.subscribe(${pathToModule}, (mod) => {\n                    Ogone.require[${pathToModule}].${memberName} = mod${isDefault ? '.default' : isAllAs ? '' : memberName}\n                });\n                HMR.setGraph(${pathToModule}, ${JSON.stringify(graph)});`;
            }
            return result;
        }
        let importStatement = `\n/**\n * struct import for ${this.component.file}\n * */\n${this.importRemoteDepencyForDev || this.importStatementAbsolutePath}\n/**\n * save imports for ${this.component.file}\n*/\nOgone.require['{% absolute %}'] = Ogone.require['{% absolute %}'] || {};`;
        members1.forEach((member)=>{
            importStatement += `\n/** member */\n${getStructure("'{% absolute %}'", member.alias || member.name, {
                isDefault: false,
                isAllAs: false,
                isMember: true
            })}\n            `;
        });
        if (defaultName) {
            importStatement += `\n/** default */\n${getStructure("'{% absolute %}'", defaultName, {
                isDefault: true,
                isAllAs: false,
                isMember: false
            })}\n`;
        }
        if (allAsName) {
            importStatement += `\n/** default */\n${getStructure("'{% absolute %}'", allAsName, {
                isDefault: false,
                isAllAs: true,
                isMember: false
            })}\n`;
        }
        return this.template(importStatement, {
            absolute: this.absolutePathURL.pathname
        });
    }
    get destructuredOgoneRequire() {
        const { defaultName , allAsName , members: members1 , path: path3 , isType  } = this.data;
        if (isType) return '';
        let destructured = `\n        ${defaultName ? defaultName + ',' : ''}\n        ${allAsName ? allAsName + ',' : ''}\n        ${members1.map((member)=>member.alias || member.name
        ).join(', ')}\n        `;
        return this.template(`const { {% destructured %} } = Ogone.require['{% absolute %}'];\n`, {
            destructured,
            absolute: this.absolutePathURL.pathname
        });
    }
    getChildren() {
        const result = [];
        if (existsSync(this.absolutePathURL.pathname)) {
            const file = Deno.readTextFileSync(this.absolutePathURL.pathname);
            this.file = file;
            const importBody = this.AssetsParser.parseImportStatement(file);
            if (importBody.body && importBody.body.imports) {
                const { imports  } = importBody.body;
                const deps = Object.values(imports).filter((imp)=>!imp.isComponent
                ).map((imp)=>new Dependency(this.component, imp, this)
                );
                result.push(...deps);
                this.children.push(...deps);
                this.component.deps.push(...deps);
            }
            if (importBody.body && importBody.body.exports) {
                const deps = Object.values(importBody.body.exports).filter((exp)=>exp.path.length
                ).map((exp)=>new Dependency(this.component, exp, this)
                );
                result.push(...deps);
                this.children.push(...deps);
                this.component.deps.push(...deps);
            }
        }
        return result;
    }
    async getTranspiledFile() {
        if (this.data.path.endsWith('.ts')) {
            this.file = await TSTranspiler.transpile(this.file);
        }
    }
    async watch() {
        if (this.isRemote) return;
        const watcher = Deno.watchFs(this.absolutePathURL.pathname);
        for await (const event of watcher){
            const { kind  } = event;
            this.invalidate();
            if (kind === "access") {
                HMR.postMessage({
                    uuid: this.component.uuid,
                    type: 'module',
                    pathToModule: this.absolutePathURL.pathname,
                    uuidReq: `i${crypto.getRandomValues(new Uint32Array(10)).join('')}`
                });
            }
        }
    }
    get graphAbsolutePaths() {
        if (this.children.length) {
            return [
                ...this.children.map((dep)=>dep.absolutePathURL.pathname
                ),
                ...this.children.map((dep)=>dep.graphAbsolutePaths
                ).flat(), 
            ];
        } else {
            return [];
        }
    }
    get firstAncestor() {
        if (this.parent) return this.parent.firstAncestor;
        else return this;
    }
    invalidate() {
        const dependency_path = this.absolutePathURL.pathname;
        const cachePaths = [
            `.ogone/.cache/${__default4(dependency_path)}`, 
        ];
        for (let p of cachePaths){
            if (existsSync(p)) {
                Deno.removeSync(p);
            }
        }
    }
    resolveRemoteComponentDependency() {
        if (!this.data.isRemote && !!this.component.remote) {
            const remotePath = this.component.remote.path;
            const newPath = absolute1(remotePath, this.data.path);
            this.data.isRemote = true;
            this.data.path = newPath;
        }
    }
}
class Env extends Constructor {
    bundle = null;
    env = "development";
    applicationUpdatedCount = 0;
    static _env = "development";
    TSXContextCreator = new TSXContextCreator1();
    serviceDev = new Worker(new URL("../workers/server-dev.ts", importMeta1.url).href, {
        type: "module",
        deno: true
    });
    hmrContext = new Worker(new URL("../workers/hmr-context.ts", importMeta1.url).href, {
        type: "module",
        deno: true
    });
    lspWebsocketClientWorker = new Worker(new URL("../workers/lsp-websocket-client.ts", importMeta1.url).href, {
        type: "module",
        deno: true
    });
    lspHSEServer = new Worker(new URL("../workers/lsp-hse-server.ts", importMeta1.url).href, {
        type: "module",
        deno: true
    });
    constructor(){
        super();
        this.devtool = Configuration.devtool;
        Env._devtool = Configuration.devtool;
    }
    setBundle(bundle) {
        this.bundle = bundle;
    }
    setDevTool(hasdevtool) {
        this.devtool = hasdevtool && this.env !== "production";
    }
    setEnv(env) {
        this.env = env;
        Env._env = env;
    }
    async compile(entrypoint, shouldBundle) {
        try {
            const bundle = await this.getBundle(entrypoint);
            this.sendComponentsToLSP(bundle);
            if (shouldBundle) {
                this.setBundle(bundle);
                return bundle;
            }
            return bundle;
        } catch (err) {
            this.error(`Env: ${err.message}\n${err.stack}`);
        }
    }
    sendComponentsToLSP(bundle) {
        try {
            const components = Array.from(bundle.components.entries()).map(([p, c])=>c
            );
            components.forEach((component1)=>{
                const lightComponent = {
                    file: component1.file,
                    imports: component1.imports,
                    context: component1.context,
                    modifiers: component1.modifiers,
                    uuid: component1.uuid,
                    isTyped: component1.isTyped,
                    requirements: component1.requirements
                };
                this.lspWebsocketClientWorker.postMessage({
                    type: Workers.LSP_SEND_COMPONENT_INFORMATIONS,
                    component: lightComponent
                });
            });
        } catch (err) {
            this.error(`Env: ${err.message}\n${err.stack}`);
        }
    }
    async listenLSPHSEServer() {
        try {
            Configuration.OgoneDesignerOpened = true;
            WebviewEngine.subscribe('update LSP current Component', (content)=>{
                const data1 = JSON.parse(content);
                console.clear();
                this.infos(`compiling...`);
                this.updateLSPCurrentComponent(data1);
            });
        } catch (err) {
            this.error(`Env: ${err.message}\n${err.stack}`);
        }
    }
    updateLSPCurrentComponent(data) {
        const filePath = data.path;
        const file = this.template(BoilerPlate.ROOT_COMPONENT_PREVENT_COMPONENT_TYPE_ERROR, {
            filePath: filePath.replace(Deno.cwd(), '@')
        });
        const tmpFile = Deno.makeTempFileSync({
            prefix: 'ogone_boilerplate_webview',
            suffix: '.o3'
        });
        Deno.writeTextFileSync(tmpFile, file);
        this.compile(tmpFile).then(async (bundle)=>{
            const application = await this.renderBundle(tmpFile, bundle);
            this.serviceDev.postMessage({
                type: Workers.LSP_UPDATE_SERVER_COMPONENT,
                application
            });
            WebviewEngine.updateDevServerApplicationFile(application);
            Deno.removeSync(tmpFile);
            console.clear();
            this.exposeSession();
            await this.TSXContextCreator.read(bundle, {
                checkOnly: filePath.replace(Deno.cwd(), '')
            });
        }).catch((error)=>{
            Deno.remove(tmpFile);
        });
    }
    async resolveAndReadText(path) {
        try {
            const isFile = path.startsWith("/") || path.startsWith("./") || path.startsWith("../") || !path.startsWith("http://") || !path.startsWith("https://");
            const isTsFile = isFile && path.endsWith(".ts");
            if (Deno.build.os !== "windows") {
                Deno.chmodSync(path, 511);
            }
            const text = Deno.readTextFileSync(path);
            return isTsFile ? (await Deno.transpileOnly({
                [path]: text
            }, {
                sourceMap: false
            }))[path].source : text;
        } catch (err) {
            this.error(`Env: ${err.message}\n${err.stack}`);
        }
    }
    listenHMRWebsocket() {
        this.trace('setting HMR server');
        HMR.setServer(new WebSocketServer(HMR.port));
        this.hmrContext.postMessage({
            type: Workers.WS_INIT
        });
        try {
            this.hmrContext.addEventListener('message', async (event)=>{
                console.warn('message from hmr context', event.data);
                if (event.data.isOgone) {
                    console.clear();
                    this.infos('HMR - running tasks...');
                    if (event.data.path === Configuration.entrypoint || ComponentBuilder1.mapUuid.get(event.data.path) === ComponentBuilder1.mapUuid.get(Configuration.entrypoint)) {
                        this.updateRootComponent(event);
                    } else {
                        this.updateWithTMPFile(event);
                    }
                }
            });
        } catch (err) {
            this.error(`Env: ${err.message}\n${err.stack}`);
        }
    }
    updateWithTMPFile(event) {
        const { data: data2  } = event;
        switch(data2.type){
            case Workers.WS_FILE_UPDATED:
                const filePath = data2.path;
                const file = this.template(BoilerPlate.ROOT_COMPONENT_PREVENT_COMPONENT_TYPE_ERROR, {
                    filePath: filePath.replace(Deno.cwd(), '@')
                });
                if (data2.isOgone) {
                    const tmpFile = Deno.makeTempFileSync({
                        prefix: 'ogone_boilerplate_hmr',
                        suffix: '.o3'
                    });
                    Deno.writeTextFileSync(tmpFile, file);
                    let startPerf = performance.now();
                    this.compile(tmpFile).then(async (bundle)=>{
                        console.clear();
                        if (HMR.clients.size) {
                            this.infos(`HMR - sending output.`);
                            HMR.postMessage({
                                output: bundle.output,
                                uuid: ComponentBuilder1.mapUuid.get(data2.path)
                            });
                            this.infos(`HMR - application updated. ~${Math.floor(performance.now() - startPerf)} ms`);
                        } else {
                            this.warn(`HMR - no connection...`);
                        }
                        await this.compile(Configuration.entrypoint, true).then(async (completeBundle)=>{
                            await this.sendNewApplicationToServer();
                            this.infos(`HMR - tasks completed. ~${Math.floor(performance.now() - startPerf)} ms`);
                            this.exposeSession();
                            await this.TSXContextCreator.read(completeBundle);
                        });
                    }).then(()=>{
                        Deno.remove(tmpFile);
                    }).catch(()=>{
                        Deno.remove(tmpFile);
                    });
                }
                break;
        }
    }
    updateRootComponent(event) {
        const { data: data2  } = event;
        let startPerf = performance.now();
        this.compile(Configuration.entrypoint, true).then(async (completeBundle)=>{
            console.clear();
            if (HMR.clients.size) {
                this.infos(`HMR - sending output.`);
                HMR.postMessage({
                    output: completeBundle.output,
                    uuid: ComponentBuilder1.mapUuid.get(data2.path)
                });
                this.infos(`HMR - application updated. ~${Math.floor(performance.now() - startPerf)} ms`);
            } else {
                this.warn(`HMR - no connection...`);
            }
            await this.sendNewApplicationToServer(true);
            this.infos(`HMR - tasks completed. ~${Math.floor(performance.now() - startPerf)} ms`);
            this.exposeSession();
            await this.TSXContextCreator.read(completeBundle);
        });
    }
    async initServer() {
        try {
            this.serviceDev.postMessage({
                type: Workers.INIT_MESSAGE_SERVICE_DEV,
                application: await this.getApplication(),
                controllers: Ogone.controllers,
                Configuration: {
                    ...Configuration
                }
            });
        } catch (err) {
            this.error(`EnvServer: ${err.message}\n${err.stack}`);
        }
    }
    async sendNewApplicationToServer(allowReload) {
        try {
            this.serviceDev.postMessage({
                type: Workers.UPDATE_APPLICATION,
                application: await this.getApplication(),
                controllers: Ogone.controllers,
                Configuration: {
                    ...Configuration
                }
            });
            this.applicationUpdatedCount++;
            if (allowReload && this.applicationUpdatedCount > 10) {
                this.applicationUpdatedCount = 0;
                this.infos(`sync: reloading application`);
                HMR.postMessage({
                    type: 'reload'
                });
            }
        } catch (err) {
            this.error(`EnvServer: ${err.message}\n${err.stack}`);
        }
    }
    async renderBundle(entrypoint, bundle) {
        try {
            const entries = Array.from(bundle.components.entries());
            const stylesDev = entries.map((entry)=>{
                let result = "";
                if (entry[1].style.join("\n").trim().length) {
                    result = `<style id="${entry[1].uuid}">${entry[1].style.join("\n")}</style>`;
                }
                return result;
            }).join("\n");
            const style = stylesDev;
            const rootComponent = bundle.components.get(entrypoint);
            const dependencies = entries.map(([, component1])=>component1
            ).map((component1)=>{
                return component1.deps.map((dep)=>dep.structuredOgoneRequire
                ).join('\n');
            }).join('\n');
            if (rootComponent) {
                const scriptDev = this.template(`\n        const ___perfData = window.performance.timing;\n        const ROOT_UUID = "${rootComponent.uuid}";\n        const ROOT_IS_PRIVATE = ${!!rootComponent.elements.template?.attributes.private};\n        const ROOT_IS_PROTECTED = ${!!rootComponent.elements.template?.attributes.protected};\n        const _ogone_node_ = "o-node";\n\n        ${MapOutput.runtime}\n        {% dependencies %}\n        {%start%}\n        `, {
                    start: `document.body.append(\n            document.createElement(_ogone_node_)\n          );`,
                    render: {
                    },
                    root: bundle.components.get(entrypoint),
                    destroy: {
                    },
                    nodes: {
                    },
                    dependencies
                });
                const DOMDev = ` `;
                let script = `\n      <script type="module">\n        ${await TSTranspiler.transpile(scriptDev.trim())}\n      </script>`;
                let head = `\n          <base href="/${Configuration.static}" />\n          ${style}\n          ${Configuration.head || ""}\n          `;
                let body = this.template(HTMLDocument1.PAGE, {
                    head,
                    script,
                    dom: DOMDev
                });
                return body;
            } else {
                return "no root-component found";
            }
        } catch (err) {
            this.error(`Env: ${err.message}\n${err.stack}`);
        }
    }
    async renderBundleAndBuildForProduction(entrypoint, bundle, buildPath) {
        try {
            const entries = Array.from(bundle.components.entries());
            const rootComponent = bundle.components.get(entrypoint);
            const cssPath = './style.css';
            const jsPath = './app.js';
            if (rootComponent) {
                const css = {
                    path: join2(buildPath, cssPath),
                    source: entries.map(([, component1])=>component1.style.join("\n")
                    ).join("")
                };
                const dependencies = entries.map(([, component1])=>component1
                ).map((component1)=>{
                    return component1.deps.map((dep)=>dep.structuredOgoneRequire
                    ).join('\n');
                }).join('\n');
                const js = {
                    path: join2(buildPath, jsPath),
                    source: await TSTranspiler.bundleText(this.template(`\n          const ROOT_UUID = "${rootComponent.uuid}";\n          const ROOT_IS_PRIVATE = ${!!rootComponent.elements.template?.attributes.private};\n          const ROOT_IS_PROTECTED = ${!!rootComponent.elements.template?.attributes.protected};\n          const _ogone_node_ = "o-node";\n          ${MapOutput.runtime}\n          {% dependencies %}\n          `, {
                        render: {
                        },
                        root: bundle.components.get(entrypoint),
                        destroy: {
                        },
                        nodes: {
                        },
                        dependencies
                    }).trim())
                };
                const html = {
                    path: join2(buildPath, './index.html'),
                    source: this.template(HTMLDocument1.PAGE_BUILD, {
                        head: `\n            <link rel="stylesheet" href="${cssPath}" />\n            <script src="${jsPath}" ></script>\n            <base href="./static/" />\n            ${Configuration.head || ""}`,
                        script: ``,
                        dom: `<o-node></o-node>`
                    })
                };
                return {
                    css,
                    html,
                    js,
                    ressources: []
                };
            } else {
                Deno.exit(1);
            }
        } catch (err) {
            this.error(`Env: ${err.message}\n${err.stack}`);
        }
    }
    async getApplication() {
        try {
            if (!this.bundle) {
                throw this.error("undefined bundle, please use setBundle method before accessing to the application");
            }
            let result = await this.renderBundle(Configuration.entrypoint, this.bundle);
            return result;
        } catch (err) {
            this.error(`Env: ${err.message}\n${err.stack}`);
        }
    }
    async build(app) {
        const { css , html , js , ressources  } = app;
        const { blue: blue1 , cyan: cyan1 , gray: gray1  } = mod;
        let perf = performance.now();
        const start = perf;
        await this.copyStaticFolder(app);
        await this.minifyJS(js);
        await this.minifyCSS(css);
        if (Configuration.deploySPA) {
            await this.deploySPA(app);
        }
        await Deno.writeTextFile(html.path, html.source, {
            create: true
        });
        await Deno.writeTextFile(css.path, css.source, {
            create: true
        });
        await Deno.writeTextFile(js.path, js.source, {
            create: true
        });
        const statHTML = Deno.statSync(html.path);
        const statCSS = Deno.statSync(css.path);
        const statJS = Deno.statSync(js.path);
        perf = performance.now() - perf;
        const versions = gray1(`\n\t\t\tdeno:\t\t${Deno.version.deno}\n\t\t\ttypescript:\t${Deno.version.typescript}`);
        this.success(`\n${versions}\n\t\t\thtml:\t\t${cyan1(html.path)}\t${gray1(`${statHTML.size} bytes`)}\n\t\t\tjs:\t\t${cyan1(js.path)}\t${gray1(`${statJS.size} bytes`)}\n\t\t\tcss:\t\t${cyan1(css.path)}\t${gray1(`${statCSS.size} bytes`)}`);
    }
    async minifyCSS(css) {
        const { blue: blue1 , cyan: cyan1 , gray: gray1  } = mod;
        let perf = performance.now();
        let message8 = '';
        this.infos(gray1(`Loading csso from esm.sh/csso`));
        try {
            perf = performance.now();
            const csso = await import("https://esm.sh/csso");
            if (csso) {
                const { minify  } = csso;
                css.source = (await minify(css.source, {
                    restructure: false
                })).css;
                message8 = gray1(` \ttook ${(performance.now() - perf).toFixed(4)} ms`);
                this.success(`style minified.${message8}`);
            }
        } catch (err) {
            this.warn('Couldn\'t load csso from esm.sh/csso or something went wrong');
        }
    }
    async minifyJS(js) {
        const { blue: blue1 , cyan: cyan1 , gray: gray1  } = mod;
        let perf = performance.now();
        let message8 = '';
        this.infos(gray1(`Loading terser from esm.sh/terser`));
        try {
            perf = performance.now();
            const terser = await import("https://esm.sh/terser");
            if (terser) {
                const { minify  } = terser;
                js.source = (await minify(js.source, {
                    mangle: {
                        toplevel: true
                    }
                })).code;
                message8 = gray1(` \ttook ${(performance.now() - perf).toFixed(4)} ms`);
                this.success(`script minified.${message8}`);
            }
        } catch (err) {
            this.warn('Couldn\'t load terser from esm.sh/terser or something went wrong');
        }
    }
    async copyStaticFolder(app) {
        const dest = join2(Configuration.build, 'static');
        await copy(Configuration.static, dest);
        const files = walkSync(dest, {
            includeFiles: true,
            includeDirs: false
        });
        for (let file of files){
            if (!file.path.endsWith('.ts')) {
                app.ressources.push({
                    path: file.path,
                    source: Deno.readTextFileSync(file.path)
                });
                continue;
            }
            Deno.removeSync(file.path);
        }
    }
    async deploySPA(app) {
        const { blue: blue1 , cyan: cyan1 , gray: gray1  } = mod;
        const dest = join2(Configuration.build, 'static');
        let perf = performance.now();
        const project = this.template(Deployer.App, {
            ressources: app.ressources,
            static: dest,
            requests: app.ressources.map((file)=>{
                const candidateURL = file.path.replace(Configuration.build, '');
                return `\n        case PATHNAME === '${candidateURL}':\n          files['${candidateURL}'] = await (await (await fetch(new URL(".${candidateURL}", import.meta.url).href)).blob()).text();\n          return new Response(files['${candidateURL}'], {\n            headers: {\n              "content-type": "${getHeaderContentTypeOf(file.path)[1]}; charset=UTF-8",\n            },\n          });\n        `;
            })
        });
        const projectPath = join2(Configuration.build, 'deploy.ts');
        await Deno.writeTextFile(projectPath, project, {
            create: true
        });
        const stats = Deno.statSync(projectPath);
        let message8 = gray1(` \ttook ${(performance.now() - perf).toFixed(4)} ms`);
        this.success(`Deno deploy file is ready.${message8}\n\n    \t\t\tdeploy file:\t${cyan1(projectPath)} ${gray1(`${stats.size} bytes`)}\n`);
    }
}
class TSTranspiler extends Utils {
    static runtimeURL = new URL('../main/Ogone.ts', importMeta2.url);
    static subdistFolderUrl = './.ogone';
    static outputURL = './.ogone/out.ts';
    static transpileCompilerOptions = {
        sourceMap: false,
        removeComments: false
    };
    static bundleCompilerOptions = {
        removeComments: false
    };
    static cache = {
    };
    static async transpile(text) {
        try {
            if (this.cache[text]) return this.cache[text];
            const result = (await Deno.emit('/transpiled.ts', {
                check: false,
                sources: {
                    "/transpiled.ts": text
                },
                compilerOptions: this.transpileCompilerOptions
            })).files["file:///transpiled.ts.js"];
            if (!this.cache[text] || this.cache[text] !== result) {
                this.cache[text] = result;
            }
            return result;
        } catch  {
            return text;
        }
    }
    static async bundle(url) {
        try {
            let result = await Deno.emit(url, {
                bundle: 'esm',
                check: false,
                compilerOptions: this.bundleCompilerOptions
            });
            const file = result.files['deno:///bundle.js'];
            return file;
        } catch (err) {
            this.error(`TSTranspiler: ${err.message}`);
        }
    }
    static async bundleText(text) {
        const url = Deno.makeTempFileSync({
            prefix: 'ogone_production',
            suffix: '.ts'
        });
        try {
            Deno.writeTextFileSync(url, text);
            let result = await Deno.emit(url, {
                bundle: 'esm',
                check: false,
                compilerOptions: this.bundleCompilerOptions
            });
            const file = result.files['deno:///bundle.js'];
            Deno.removeSync(url);
            return file;
        } catch (err) {
            Deno.removeSync(url);
            this.error(`TSTranspiler: ${err.message}`);
        }
    }
    static get runtimeBaseURL() {
        if (Env._env === 'production') return new URL('../main/OgoneProduction.ts', importMeta2.url);
        return new URL('../main/OgoneDev.ts', importMeta2.url);
    }
    static async getRuntime(bundle) {
        const file = `\n      import {\n        Ogone,\n        displayError,\n      } from '${this.runtimeBaseURL}';\n      import {\n        setReactivity,\n        _h,\n        _ap,\n        _at,\n        _hns,\n        _atns,\n        imp,\n        construct,\n        setOgone,\n        setNodeProps,\n        setPosition,\n        setProps,\n        useSpread,\n        setNodes,\n        removeNodes,\n        destroy,\n        setEvents,\n        routerSearch,\n        setActualRouterTemplate,\n        setNodeAsyncContext,\n        setAsyncContext,\n        OnodeRecycleWebComponent,\n        saveUntilRender,\n        bindValue,\n        bindClass,\n        bindHTML,\n        bindStyle,\n        setContext,\n        setDevToolContext,\n        showPanel,\n        infosMessage,\n        renderSlots,\n        renderNode,\n        renderStore,\n        renderRouter,\n        renderAsyncRouter,\n        renderAsyncStores,\n        renderAsyncComponent,\n        renderComponent,\n        renderAsync,\n        renderingProcess,\n        renderContext,\n        triggerLoad,\n        setDeps,\n        routerGo,\n        OnodeTriggerDefault,\n        OnodeUpdate,\n        OnodeRenderTexts,\n        OnodeReactions,\n        initStore,\n        OnodeUpdateStore,\n        OnodeUpdateService,\n        OnodeUpdateProps,\n        OnodePlugWebComponent,\n        OnodeDestroyPluggedWebcomponent,\n        OnodeListRendering,\n      } from '${this.runtimeURL}';\n      // outputs\n      ${bundle.output}\n    `;
        Deno.writeTextFileSync(this.outputURL, file);
        MapOutput.runtime = (await this.bundle(this.outputURL)).replace(/\n/gi, ' ');
    }
}
