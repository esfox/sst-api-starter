import { SSTConfig } from 'sst';
import { API } from './stacks/api';

const esbuild = {
  target: 'node18',
  bundle: true,
  minify: false,
  sourcemap: true,
  external: ['aws-sdk'],
};

export default {
  config(_input) {
    return {
      name: 'template-sst-ts',
      region: process.env.AWS_REGION ?? 'us-east-1',
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({ nodejs: { esbuild } });
    app.stack(API);
  },
} satisfies SSTConfig;
