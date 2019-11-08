const { extractDomainFromString } = require('../../../build/utils/utils');

describe('Utils Functions', () => {
  it('extractDomainFromString parses urls', () => {
    expect(extractDomainFromString('http://www.foo.com')).toEqual('foo.com');
    expect(extractDomainFromString('.foo.com')).toEqual('foo.com');
    expect(extractDomainFromString('https://foo.bar.local/foo/ui/portal')).toEqual('bar.local');
    expect(extractDomainFromString('.bar.local')).toEqual('bar.local');
    expect(extractDomainFromString('http://foo.example.com/path/to/page?name=ferret&color=purple')).toEqual('example.com');
    expect(extractDomainFromString('ftp://127.0.0.1:5500/index.html#foo?bar=baz')).toEqual('127.0.0.1');
    expect(extractDomainFromString('https://www.gojobs.gov.on.ca/Jobs.aspx')).toEqual('gov.on.ca');
    expect(extractDomainFromString('.co.uk')).toEqual('co.uk');
  })

  it('extractDomainFromString has the same result for url and cookie domains', () => {
    expect(extractDomainFromString('http://www.google.ca')).toEqual(extractDomainFromString('.google.ca'));
    expect(extractDomainFromString('http://www.example.com')).toEqual(extractDomainFromString('www.example.com'));
    expect(extractDomainFromString('http://ostep.foo.local/path/to/ui')).toEqual(extractDomainFromString('.foo.local'));
    expect(extractDomainFromString('http://site.co.uk')).toEqual(extractDomainFromString('site.co.uk'));
    expect(extractDomainFromString('http://192.168.1.1:3000')).toEqual(extractDomainFromString('192.168.1.1'));
  })
})