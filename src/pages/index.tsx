import { getCurrentLocation } from '@apps-in-toss/framework';
import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const Route = createRoute('/', {
  component: LocationConsentPage,
});

const BRAND_PRIMARY = '#EDB07F';

function LocationConsentPage() {
  const navigation = Route.useNavigation();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAgreeAndContinue = async () => {
    setIsRequesting(true);
    try {
      await getCurrentLocation.openPermissionDialog();
    } catch (err) {
      console.error('위치 권한 요청 실패:', err);
    } finally {
      setIsRequesting(false);
    }
    navigation.navigate('/map');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>위치 권한이 필요해요</Text>
        <Text style={styles.description}>
          주변 카페가 한산한지 확인하려면{'\n'}
          위치 접근 권한을 허용해 주세요.
        </Text>
        <Text style={styles.subDescription}>
          위치 정보는 지도에서 주변 카페를 보여주는 데만 사용돼요.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isRequesting && styles.buttonDisabled]}
          onPress={handleAgreeAndContinue}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>동의하고 지도 보기</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  subDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 40,
  },
  button: {
    backgroundColor: BRAND_PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
