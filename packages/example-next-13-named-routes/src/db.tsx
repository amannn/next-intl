const guitars = [
  {
    id: 1,
    name: 'Fender Stratocaster',
    slug: 'fender-stratocaster',
    description: {
      en: 'The Fender Stratocaster, colloquially known as the Strat, is a model of electric guitar designed in 1952 by Leo Fender, Bill Carson, George Fullerton, and Freddie Tavares. The Fender Musical Instruments Corporation has continuously manufactured the Stratocaster from 1954 to the present. The guitar has been manufactured in Mexico, Japan, and the United States.',
      de: 'Die Fender Stratocaster, auch bekannt als Strat, ist ein Modell einer E-Gitarre, das 1952 von Leo Fender, Bill Carson, George Fullerton und Freddie Tavares entworfen wurde. Die Fender Musical Instruments Corporation hat die Stratocaster seit 1954 ununterbrochen hergestellt. Die Gitarre wurde in Mexiko, Japan und den Vereinigten Staaten hergestellt.'
    }
  },
  {
    id: 2,
    name: 'Gibson Les Paul',
    slug: 'gibson-les-paul',
    description: {
      en: 'The Gibson Les Paul is a solid body electric guitar that was first sold by the Gibson Guitar Corporation in 1952. It is Les Pauls signature model and is among the most popular electric guitars of all time. The Les Paul is a direct descendent of the Gibson ES-335, which was introduced in 1958. The Les Paul is a double-cutaway guitar with a solid mahogany body and a carved maple top. The neck is a one-piece mahogany neck with a rosewood fingerboard. The Les Paul has two humbucking pickups, one at the neck and one at the bridge. The Les Paul is available in a variety of finishes, including sunburst, cherry, and black. The Les Paul is available in a variety of body styles, including the Les Paul Standard, the Les Paul Custom, the Les Paul Junior, the Les Paul Special, and the Les Paul Studio.',
      de: 'Die Gibson Les Paul ist eine E-Gitarre mit festem Korpus, die 1952 von der Gibson Guitar Corporation zum ersten Mal verkauft wurde. Es ist Les Pauls Signaturmodell und gehört zu den beliebtesten E-Gitarren aller Zeiten. Die Les Paul ist ein direkter Nachkomme der Gibson ES-335, die 1958 eingeführt wurde. Die Les Paul ist eine Doppel-Cutaway-Gitarre mit einem festen Mahagonikörper und einer gehobelten Ahornoberfläche. Der Hals ist ein einstückiger Mahagonihals mit einem Palisandergriffbrett. Die Les Paul hat zwei Humbucker-Pickups, einen am Hals und einen am Brücke. Die Les Paul ist in einer Vielzahl von Ausführungen erhältlich, darunter Sonnenuntergang, Kirsche und Schwarz. Die Les Paul ist in einer Vielzahl von Körperformen erhältlich, darunter die Les Paul Standard, die Les Paul Custom, die Les Paul Junior, die Les Paul Special und die Les Paul Studio.'
    }
  }
];

export function getAllGuitars(locale: string) {
  return guitars.map((guitar) => ({
    ...guitar,
    description: (guitar.description as any)[locale]
  }));
}

export function getGuitarBySlug(slug: string, locale: string) {
  const guitar = guitars.find((cur) => cur.slug === slug);

  if (!guitar) {
    return undefined;
  }

  return {...guitar, description: (guitar.description as any)[locale]};
}
