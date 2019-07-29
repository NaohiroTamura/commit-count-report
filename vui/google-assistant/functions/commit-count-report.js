'use strict'; 

const https = require('https');
const util = require('util');

https.request[util.promisify.custom] = (options, postData) => {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => { body += d });
            res.on('end', () => { resolve([res, body]) });
        });
        if (postData) {
            req.write(postData);
        }
        req.on('error', reject);
        req.end();
    });
}


const demo = 'ec29e90c-188d-11e8-bb72-00163ec1cd01:0b82fe63b6bd450519ade02c3cb8f77ee581f25a810db28f3910e6cdd9d041bf'


const commit_count_report = (owner, name, since, until) => {
    console.log('name:', name);
    console.log('since:', since);
    console.log('until:', until
               );
    
    let payload = {
        'input': {
            'github': {
                'target': 'fujitsu.com',
                'owner': owner,           // 'naohirotamura',
                'name': name,             // 'faasshell',
                'since': since,           // '2018-06-21T00:00:00+00:00',
                'until': until            // '2018-07-20T00:00:00+00:00'
            },
            'gsheet': {
                'sheetId': '1ywCxG8xTKOYK89AEZIqgpTvbvpbrb1s4H_bMVvKV59I'
            }
        }
    }

    const options = {
        hostname: 'protected-depths-49487.herokuapp.com',
        port: 443,
        path: '/statemachine/commit_count_report.json?blocking=true',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(payload)),
            'Authorization': 'Basic ' + Buffer.from(demo).toString('base64')
        }
    }
    return util.promisify(https.request)(options, JSON.stringify(payload))
}

exports.commit_count_report = commit_count_report;

if (module === require.main) {
    (async () => {
        try {
            const [res, body] = await commit_count_report(
                'naohirotamura', 'faasshell',
                '2018-06-21T00:00:00+00:00', '2018-07-20T00:00:00+00:00')
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            console.log(JSON.parse(body).output.github.output.values[0]);
        }
        catch(err) {
            console.error(err);
        }
    })()
}
