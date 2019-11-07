const { extractDomainFromString } = require('../../../build/utils/utils');

describe('Utils Functions', () => {
  it('extractDomainFromString', () => {
    expect(extractDomainFromString('http://www.foo.com')).toEqual('foo.com');
    expect(extractDomainFromString('.foo.com')).toEqual('foo.com');
    expect(extractDomainFromString('https://foo.bar.local/foo/ui/portal')).toEqual('bar.local');
    expect(extractDomainFromString('.bar.local')).toEqual('bar.local');
    expect(extractDomainFromString('http://foo.example.com/path/to/page?name=ferret&color=purple')).toEqual('example.com');
    expect(extractDomainFromString('ftp://127.0.0.1:5500/index.html#foo?bar=baz')).toEqual('127.0.0.1');
    expect(extractDomainFromString('https://www.gojobs.gov.on.ca/Jobs.aspx')).toEqual('gov.on.ca');
    expect(extractDomainFromString('.co.uk')).toEqual('co.uk');
  })
})