'use client';

import {
  EmbeddedTweet,
  TweetNotFound,
  TweetSkeleton,
  useTweet
} from 'react-tweet';
import type {Tweet as TweetData} from 'react-tweet/api';

type Props = {
  id: string;
};

// The Twitter syndication API occasionally returns `entities` as an empty
// array (instead of an object) when a tweet has no entities. react-tweet
// assumes an object and crashes while iterating `entities.hashtags` & friends
// ("TypeError: … is not iterable"), which takes down the entire page. We
// normalize the shape defensively before handing the tweet to react-tweet.
function normalizeTweet(tweet: TweetData): TweetData {
  const entities = tweet.entities as Partial<TweetData['entities']> | undefined;

  return {
    ...tweet,
    entities: {
      hashtags: entities?.hashtags ?? [],
      urls: entities?.urls ?? [],
      user_mentions: entities?.user_mentions ?? [],
      symbols: entities?.symbols ?? [],
      media: entities?.media
    }
  };
}

export default function Tweet({id}: Props) {
  const {data, error, isLoading} = useTweet(id);

  if (isLoading) return <TweetSkeleton />;
  if (error || !data) return <TweetNotFound error={error} />;

  return <EmbeddedTweet tweet={normalizeTweet(data)} />;
}
