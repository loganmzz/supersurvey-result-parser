const csv = require('./csv');
const text = require('./text');

class Counters {
    proposals = new Map();

    size() {
        return this.proposals.size;
    }

    init(proposal) {
        this.proposals.set(proposal, {
            proposal,
            score: 0,
            ranks: {},
        });
        //console.log(`Counters.init(${text.stringify(proposal)}): ${text.stringify(this.proposals)}`);
    }

    push(proposal, score, rank) {
        const counter = this.proposals.get(proposal);
        if (counter === undefined) {
            throw new Error(`Unknown proposal '${proposal}'`);
        }
        counter.score += score;
        counter.ranks[rank] = (counter.ranks[rank] ?? 0) + 1;
    }

    compute() {
        let proposals = Array.from(this.proposals.values());
        proposals.sort((a, b) => b.score - a.score);
        return proposals;
    }
}

class Analyzer {
    responses = [];

    parseInputLine([id, answers, email, country, city, region, date, time, browser, ip_address]) {
        const response = {};
        response.id = id;
        response.answers = [];
        const answer_regexp = new RegExp('<div><strong>([^<]+)</strong> - ', 'g');
        let answer_match;
        while ((answer_match = answer_regexp.exec(answers)) !== null) {
            response.answers.push(answer_match[1]);
        }
        return response;
    }

    init(data) {
        this.responses = data.flatMap((line, index) => index == 0 ? [] : [this.parseInputLine(line)]);
    }

    // https://en.wikipedia.org/wiki/Borda_count
    computeBordaCount() {
        // Aggregate all proposal
        const counters = new Counters();
        this.responses.forEach(response => {
            response.answers.forEach(proposal => {
                counters.init(proposal);
            });
        });

        // Compute score
        this.responses.forEach(response => {
            response.answers.forEach((proposal, index) => {
                const score = counters.size() - index;
                counters.push(proposal, score, index);
            });
        });

        return counters.compute();
    }
}

if (require.main === module) {
    const fs = require("fs");
    const stdin = fs.readFileSync("/dev/stdin", "utf-8");
    const data = new csv.Reader(stdin).readAll();
    const analyzer = new Analyzer();
    analyzer.init(data);
    //console.log(text.stringify(analyzer.responses));
    console.log(text.stringify(analyzer.computeBordaCount()));
}
