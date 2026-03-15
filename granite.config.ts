import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'cafecrowd',
  plugins: [
    appsInToss({
      brand: {
        displayName: '카페붐빔', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
        primaryColor: '#EDB07F', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
        icon: "https://drive.google.com/file/d/14pY4S9j4A4N9gLwBrlX7tGa7Q0ZzEgIt/view?usp=drive_link", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
      },
      permissions: [
        { name: 'geolocation', access: 'access' },
      ],
    }),
  ],
});
