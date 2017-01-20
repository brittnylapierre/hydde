import { HyddePage } from './app.po';

describe('hydde App', function() {
  let page: HyddePage;

  beforeEach(() => {
    page = new HyddePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
