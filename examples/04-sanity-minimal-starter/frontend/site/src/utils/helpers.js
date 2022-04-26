import { client } from '../lib/sanityClient.js';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);

export function getSanityImageURL(source) {
  return builder.image(source);
}
