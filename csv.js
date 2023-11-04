debug = {
    log: false,
};

class Reader {
    location = {l: 0, c:0};
    i = 0;
    constructor(stdin) {
        this.stdin = stdin;
        this.current = this.stdin.length > 0 ? this.stdin[0] : undefined;
    }

    next() {
        if (this.i < this.stdin.length) {
            this.i++;this.location.c++;
            this.current = this.stdin[this.i];
            if (this.current == '\n') {
                this.location.l++;
                this.location.c = 0;
            }
        } else {
            this.current = undefined;
        }
        return this.current;
    }
    substring(start, end) {
        return this.stdin.substring(start, end);
    }

    readUntil(chars) {
        if (debug?.log) {
            console.log(`Reader.readUntil: start (${this.location.l},${this.location.c})`);
        }
        let start = 0;
        while (this.current !== undefined && !chars.includes(this.current)) {
            this.next();
        }
        return this.substring(start, this.i);
    }

    readSpaces() {
        if (debug?.log) {
            console.log(`Reader.readSpaces: start (${this.location.l},${this.location.c})`);
        }
        let start = this.i;
        let next = this.current();
        while (this.current === ' ') {
            next = this.next();
        }
        return this.substring(start, this.i);
    }

    readValue() {
        if (debug?.log) {
            console.log(`Reader.readValue: start (${this.location.l},${this.location.c})`);
        }
        const enclosed = this.current === '"';
        if (enclosed) {
            this.next(); // Passed '"'
            let string = '';
            let finished = false;
            let start = this.i;
            while (!finished) {
                let substring = this.readUntil('"');
                string += substring;
                this.next(); // Passed '"'
                if (this.current === '"') {
                    string += this.current;
                    this.next();  // Passed '"'
                    start = this.i;
                } else {
                    finished = true;
                }
            }
            if (debug?.log) {
                console.log(`Reader.readValue: end (${this.location.l},${this.location.c}: ${string})`);
            }
            return string;
        } else {
            let string = this.readUntil([',', '\n']);
            if (debug?.log) {
                console.log(`Reader.readValue: end (${this.location.l},${this.location.c}: ${string})`);
            }
            return string;
        }
    }

    readRow() {
        if (debug?.log) {
            console.log(`Reader.readRow: start (${this.location.l},${this.location.c})`);
        }
        let row = [];
        let finished = false;
        while (!finished) {
            let value = this.readValue();
            row.push(value);
            switch (this.current) {
                case ',':
                    // Go next value
                    this.next();
                    break;
                case '\n':
                    this.next();
                    finished = true;
                    break;
                default:
                    // Error
                    throw `Invalid character (${this.current}) at (${this.location.l},${this.location.c}}): expected value separator (',') or end of line ('\n')`;
            }
        }
        return row;
    }

    readAll() {
        if (debug?.log) {
            console.log(`Reader.readAll: start (${this.location.l},${this.location.c})`);
        }
        let rows = [];
        let finished = false;
        while (!finished) {
            let row = this.readRow();
            rows.push(row);
            finished = this.current === undefined;
        }
        return rows;
    }
}

module.exports = {
    debug,
    Reader,
};

if (require.main === module) {
    const fs = require("fs");
    const stdin = fs.readFileSync("/dev/stdin", "utf-8");
    console.log(JSON.stringify(new Reader(stdin).readAll(), undefined, 2));
}
