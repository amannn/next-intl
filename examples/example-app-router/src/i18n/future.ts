export async function rootParams(): Promise<{
  locale?: string;
}> {
  // Outside of `[locale]`
  // return Promise.resolve({
  //   locale: undefined
  // });

  // In `[locale]`
  return Promise.resolve({
    locale: 'en'
  });
}
