const assert = require('assert');
const sinon = require('sinon');
require('jsdom-global')();
const log = require('../../app/log');

let xhr;
let requests;

describe('log', () => {
  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function pushRequest(req) { requests.push(req); };
  });

  afterEach(() => {
    xhr.restore();
  });

  it('should send navigate event', () => {
    const toUrl = 'http://test';
    const dataProp = { some: 'props', keys: [1, 2, 3] };

    log.navigatePage(toUrl, dataProp);

    assert.equals(requests.length = 1);
    assert.match(requests[0].url, '/todo/42/items');
  });

  // We will place our tests cases here
});
