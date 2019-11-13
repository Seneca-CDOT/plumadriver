const { extractDomainFromUrl } = require('../../../build/utils/utils');

describe('Utils Functions', () => {
  it('extractDomainFromString parses urls', () => {
    expect(extractDomainFromUrl('http://www.foo.com')).toEqual('www.foo.com');
    expect(extractDomainFromUrl('https://foo.bar.local/foo/ui/portal')).toEqual('foo.bar.local');
    expect(extractDomainFromUrl('http://foo.example.com/path/to/page?name=ferret&color=purple')).toEqual('foo.example.com');
    expect(extractDomainFromUrl('ftp://127.0.0.1:5500/index.html#foo?bar=baz')).toEqual('127.0.0.1');
    expect(extractDomainFromUrl('https://www.company.gov.on.ca/Jobs.aspx')).toEqual('www.company.gov.on.ca');
  })
})