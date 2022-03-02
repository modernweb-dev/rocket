import { addPlugin } from 'plugins-manager';
import markdown from 'remark-parse';
import emoji from 'remark-emoji';

export const setupUnifiedPlugins = [addPlugin(emoji, {}, { location: markdown })];
