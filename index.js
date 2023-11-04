const csv = require('./csv');

class Response {
    id = undefined;
    answers = undefined;
    email = undefined;
    country = undefined;
    city = undefined;
    region = undefined;
    date = undefined;
    time = undefined;
    browser = undefined;
    ip_address = undefined;

    static parse([id, answers, email, country, city, region, date, time, browser, ip_address]) {
        const response = new Response();
        response.id = id;
        response.answers = [];
        const answer_regexp = new RegExp('<div><strong>([^<]+)</strong> - ', 'g');
        let answer_match;
        while ((answer_match = answer_regexp.exec(answers)) !== null) {
            response.answers.push(answer_match[1]);
        }
        return response;
    }
}

if (require.main === module) {
    const fs = require("fs");
    const stdin = fs.readFileSync("/dev/stdin", "utf-8");
    const data = new csv.Reader(stdin).readAll();
    const responses = data.flatMap((line, index) => index == 0 ? [] : [Response.parse(line)]);
    console.log(JSON.stringify(responses, undefined, 2));
}
