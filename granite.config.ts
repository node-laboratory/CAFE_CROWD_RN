import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';
import { router } from '@granite-js/plugin-router';

export default defineConfig({
  scheme: 'intoss',
  appName: 'nodelab-cafe',
  plugins: [
    router({ watch: true }),
    appsInToss({
      brand: {
        displayName: '카페붐빔',
        primaryColor: '#3182F6',
        icon: "",
      },
      permissions: [
        { name: 'geolocation', access: 'access' },
      ],
    }),
  ],
});
