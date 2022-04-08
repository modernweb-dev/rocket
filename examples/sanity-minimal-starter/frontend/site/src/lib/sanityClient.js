import 'dotenv/config';
import sanityClient from '@sanity/client';

const config = {
  projectId: process.env.SANITY_PROJECT_ID || '8hj1t7km',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_READ_TOKEN,
  apiVersion: process.env.SANITY_API_VERSION || 'v1',
  useCdn: false,
};

export const client = sanityClient(config);
