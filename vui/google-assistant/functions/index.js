// Copyright 2019 FUJITSU LIMITED
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {
    dialogflow,
    Confirmation,
    DateTime,
    Permission,
    SimpleResponse,
    Suggestions,
} = require('actions-on-google');

const functions = require('firebase-functions');

const app = dialogflow({debug: true});

const moment = require('moment');

app.middleware(conv => {
    moment.locale(conv.user.locale);
});

const faasshell = require('./commit-count-report.js');

const owner = {
    'faasshell': 'naohirotamura',
    'buildah': 'containers',
    'kubernetes': 'kubernetes'
}

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
    // conv.user.storage = {};
    const name = conv.user.storage.userName;
    if (!name) {
        conv.ask(new Permission({
            context: 'こんにちは',
            permissions: 'NAME',
        }));
    } else {
        //conv.ask(`ようこそ ${name} さん、 貢献数を知りたいOSSリポジトリは？`);
        conv.ask(`ようこそ、 貢献数を知りたいOSSリポジトリは？`);
        conv.ask(new Suggestions('faasshell', 'buildah', 'kubernetes'));
    }
});

// Create a Dialogflow intent with the `actions_intent_PERMISSION` event
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
      conv.ask(`了解しました。貢献数を知りたいOSSリポジトリは？`);
      conv.ask(new Suggestions('faasshell', 'buildah', 'kubernetes'));
  } else {
      conv.user.storage.userName = conv.user.name.display;
      conv.ask(`承認ありがとう ${conv.user.storage.userName} さん ` +
               `貢献数を知りたいOSSリポジトリは？`);
      conv.ask(new Suggestions('faasshell', 'buildah', 'kubernetes'));
  }
});

app.intent('oss repository', (conv, {ossRepository}) => {
    conv.user.storage.ossRepository = ossRepository;
    const options = {
        prompts: {
            initial: '知りたい貢献数の開始日は？',
            date: '開始日は？',
            time: '開始時間は？'
        },
    };
    conv.data.startFlag = true;
    conv.ask(new DateTime(options));
});

// Create a Dialogflow intent with the `actions_intent_DATETIME` event
app.intent('duration', (conv, params, datetime) => {
    const { year, month, day } = datetime.date;
    const { hours, minutes, seconds } = datetime.time

    if (conv.data.startFlag) {
        conv.data.startFlag = false;
        conv.user.storage.startDateTime = datetime;
        
        const options = {
            prompts: {
                initial: `知りたい貢献数の終了日は？`,
                date: '終了日は？',
                time: '終了時間は？'
            },
        };
        conv.ask(new DateTime(options));
    }
    else {
        conv.user.storage.endDateTime = datetime;
        const repository = conv.user.storage.ossRepository;
        const start = conv.user.storage.startDateTime;
        const end = conv.user.storage.endDateTime;
        conv.ask(new Confirmation(
            `${start.date.year}年`  +
                `${start.date.month}月` +
                `${start.date.day}日` +
                `${start.time.hours || 0}時` +
                // `${start.time.minutes || 0}分` +
                `から${end.date.year}年` +
                `${end.date.month}月` +
                `${end.date.day}日` +
                `${end.time.hours || 0}時` +
                // `${end.time.minutes || 0}分` +
                `までのOSS リポジトリ${repository}` +
                `への貢献数でよろしいですか？`
            ));
    }
});

// Create a Dialogflow intent with the `actions_intent_CONFIRMATION` event
app.intent('Get Confirmation', (conv, input, confirmation) => {
    if (confirmation) {
        const name = conv.user.storage.ossRepository;
        const start = conv.user.storage.startDateTime;
        const end = conv.user.storage.endDateTime;

        const since = moment().set({
            'year': start.date.year,
            'month': start.date.month,
            'date': start.date.day,
            'hour': start.time.hours || 0,
            'minute': start.time.minutes || 0,
            'second': start.time.seconds || 0
        }).format();

        const until = moment().set({
            'year': end.date.year,
            'month': end.date.month,
            'date': end.date.day,
            'hour': end.time.hours || 0,
            'minute': end.time.minutes || 0,
            'second': end.time.seconds || 0
        }).format();
        
        /*
        conv.close(new SimpleResponse({
            speech: '貢献数は2 です。',
            text: `${name} start on ${since} end on ${until}`
        }));

        */
        return faasshell.commit_count_report(owner[name], name, since, until)
            .then(([res, body]) => {
                const report = JSON.parse(body).output.github.output.values[0];
                conv.close(`${report[0]} の ${report[2]} への貢献数は` +
                           `${report[5].toString()} です。`);
            })
            .catch( (error) => {
                conv.close(`貢献数の取得は${error} で失敗しました。`);
            });
    } else {
        conv.close(`中止しました。`)
    }
})

// Create a Dialogflow intent with the `actions_intent_NO_INPUT` event
app.intent('actions_intent_NO_INPUT', (conv) => {
  const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
    if (repromptCount === 0) {
        conv.ask('聞き取れませんでした');
    } else if (repromptCount === 1) {
        conv.ask('スクリーンの選択肢も参考にしてください。');
    } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
        conv.close('ごめんなさい、うまく聞き取れませんでした。' +
                   'しばらくしてから再度お試しください。それでは失礼します。');
    }
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
