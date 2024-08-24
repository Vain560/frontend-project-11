const parseRSS = (xml) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');

  // Обработка ошибки парсинга
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParseError = true;
    throw error;
  }

  const posts = [...xmlDoc.querySelectorAll('item')].map((post) => ({
    title: post.querySelector('title').textContent,
    link: post.querySelector('link').textContent,
    description: post.querySelector('description').textContent,
  }));

  return {
    title: xmlDoc.querySelector('title').textContent,
    link: xmlDoc.querySelector('link'),
    description: xmlDoc.querySelector('description').textContent,
    posts,
  };
};

export default parseRSS;
