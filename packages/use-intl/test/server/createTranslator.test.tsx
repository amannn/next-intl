import createTranslator from '../../src/server/createTranslator';

(global as any).__DEV__ = true;

const messages = {
  Home: {
    title: 'Hello world!',
    rich: '<b>Hello <i>{name}</i>!</b>'
  }
};

it('can translate a message within a namespace', () => {
  const t = createTranslator({
    locale: 'en',
    namespace: 'Home',
    messages
  });

  expect(t('title')).toBe('Hello world!');
});

it('can translate a message without a namespace', () => {
  const t = createTranslator({
    locale: 'en',
    messages
  });
  // @ts-expect-error TODO: Figure out types
  expect(t('Home.title')).toBe('Hello world!');
});

describe('t.rich', () => {
  it('can translate a message', () => {
    const t = createTranslator({
      locale: 'en',
      namespace: 'Home',
      messages
    });

    expect(
      t.rich('rich', {
        name: 'world',
        b: (chunks) => `<b>${chunks}</b>`,
        i: (chunks) => `<i>${chunks}</i>`
      })
    ).toBe('<b>Hello <i>world</i>!</b>');
  });
});

describe('t.raw', () => {
  it('can translate a message', () => {
    const t = createTranslator({
      locale: 'en',
      namespace: 'Home',
      messages
    });

    expect(t.raw('rich')).toBe('<b>Hello <i>{name}</i>!</b>');
  });
});
