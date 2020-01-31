import { ContentClass, ContentType, TopicType } from '../../src/types/content';

let currentId = 0;
function generateId(): number {
  return currentId++;
}

export function generateSampleContent(): ContentType {
  const id = generateId().toString();
  return {
    id,
    key: `VIDEO:${id}`,
    description: `description ${id}`,
    rating: {
      average: 4,
      count: 5,
      my: 5,
    },
    title: `title ${id}`,
    thumbnail: 'thumbnail',
    class: ContentClass.Video,
    additionalData: {
      plays: 100,
      length: 100,
    },
    topics: [],
    createdDate: new Date(),
    keywords: ['test'],
    favourite: false,
  };
}

export function generateSampleTopic(contents: Array<string>): TopicType {
  const id = generateId();
  return {
    id,
    name: `name ${id}`,
    description: `description ${id}`,
    contents,
    level: 2,
  };
}
