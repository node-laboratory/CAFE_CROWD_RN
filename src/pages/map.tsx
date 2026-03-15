import {
  Accuracy,
  getCurrentLocation,
  GetCurrentLocationPermissionError,
  type Location,
} from '@apps-in-toss/framework';
import { getNaverMapClientId } from '../config/naverMap';
import { createRoute } from '@granite-js/react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

export const Route = createRoute('/map', {
  component: MapPage,
});

type Cafe = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isRelaxed: boolean; // 한산하면 true(파란 핀), 아니면 false(회색 핀)
};

const MIN_RADIUS_M = 300;
const MAX_RADIUS_M = 1000;
const RADIUS_STEP_M = 50;

function clampRadius(radius: number) {
  return Math.max(MIN_RADIUS_M, Math.min(MAX_RADIUS_M, radius));
}

/** WebView에 넣을 네이버 지도 HTML. 스크립트 로드 후에만 update 하도록 대기 처리함. */
function getNaverMapHtml(clientId: string): string {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    html, body, #map { margin:0; padding:0; width:100%; height:100%; background:#fff; }
    .pin { width:16px; height:16px; border-radius:999px; border:2px solid #fff; box-shadow:0 2px 10px rgba(0,0,0,.18); }
  </style>
  <script src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = null, circle = null, markers = [], pendingPayload = null;

    function clearMarkers() {
      for (var i = 0; i < markers.length; i++) markers[i].setMap(null);
      markers = [];
    }
    function distanceMeters(lat1, lng1, lat2, lng2) {
      var R = 6371000, toRad = function(d){ return d * Math.PI / 180; };
      var dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
      var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)*Math.sin(dLng/2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    function ensureMap(center) {
      if (map) return;
      map = new naver.maps.Map('map', { center: new naver.maps.LatLng(center.lat, center.lng), zoom: 15 });
    }
    function drawCircle(center, radiusM) {
      if (circle) circle.setMap(null);
      circle = new naver.maps.Circle({ map: map, center: new naver.maps.LatLng(center.lat, center.lng), radius: radiusM, fillColor: 'rgba(255,0,0,0.12)', fillOpacity: 1, strokeColor: '#FF0000', strokeOpacity: 0.9, strokeWeight: 2 });
    }
    function drawCafes(center, radiusM, cafes) {
      clearMarkers();
      for (var i = 0; i < (cafes || []).length; i++) {
        var cafe = cafes[i], d = distanceMeters(center.lat, center.lng, cafe.latitude, cafe.longitude);
        if (d > radiusM) continue;
        var color = cafe.isRelaxed ? '#0064FF' : '#9AA4B2';
        markers.push(new naver.maps.Marker({ map: map, position: new naver.maps.LatLng(cafe.latitude, cafe.longitude), icon: { content: '<div class="pin" style="background:' + color + '"></div>', anchor: new naver.maps.Point(8, 8) } }));
      }
    }
    function update(payload) {
      if (!payload || !payload.center) return;
      if (typeof naver === 'undefined' || !naver.maps) {
        pendingPayload = payload;
        return;
      }
      ensureMap(payload.center);
      map.setCenter(new naver.maps.LatLng(payload.center.lat, payload.center.lng));
      drawCircle(payload.center, payload.radiusM);
      drawCafes(payload.center, payload.radiusM, payload.cafes || []);
    }
    function handleMessage(raw) {
      try {
        var payload = JSON.parse(raw);
        if (payload && payload.type === 'UPDATE') update(payload);
      } catch (e) {}
    }
    function tryApplyPending() {
      if (pendingPayload && typeof naver !== 'undefined' && naver.maps) {
        update(pendingPayload);
        pendingPayload = null;
      }
    }
    document.addEventListener('message', function(e) { handleMessage(e.data); });
    window.addEventListener('message', function(e) { if (e && e.data) handleMessage(e.data); });
    setInterval(tryApplyPending, 200);
  </script>
</body>
</html>`;
}

type LocationErrorType = 'permission' | 'unknown';

function MapPage() {
  const webViewRef = useRef<WebView>(null);
  const [radiusM, setRadiusM] = useState<number>(MIN_RADIUS_M);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<LocationErrorType | null>(null);

  // TODO: 실제 백엔드/API에서 가져오세요.
  const cafes: Cafe[] = useMemo(
    () => [
      { id: '1', name: '카페 A', latitude: 37.5665, longitude: 126.978, isRelaxed: true },
      { id: '2', name: '카페 B', latitude: 37.5658, longitude: 126.9773, isRelaxed: false },
    ],
    [],
  );

  const fetchLocation = useCallback(async () => {
    setLocationError(null);
    try {
      const loc = await getCurrentLocation({ accuracy: Accuracy.Balanced });
      setLocation(loc);
    } catch (e) {
      if (e instanceof GetCurrentLocationPermissionError) {
        setLocationError('permission');
      } else {
        setLocationError('unknown');
        console.error('위치 정보를 가져오는 데 실패했어요:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleCheckPermission = useCallback(async () => {
    try {
      const permission = await getCurrentLocation.getPermission();
      Alert.alert('위치 권한 상태', `현재 권한: ${String(permission)}`);
    } catch (err) {
      console.error(err);
      Alert.alert('확인 실패', '권한 상태를 확인할 수 없어요.');
    }
  }, []);

  const handleRequestPermission = useCallback(async () => {
    try {
      await getCurrentLocation.openPermissionDialog();
      await fetchLocation();
    } catch (err) {
      console.error('권한 요청 또는 위치 조회 실패:', err);
      setLocationError('permission');
    }
  }, [fetchLocation]);

  const center = useMemo(() => {
    if (!location) return null;
    return { lat: location.coords.latitude, lng: location.coords.longitude };
  }, [location]);

  const html = useMemo(() => {
    return getNaverMapHtml(getNaverMapClientId());
  }, []);

  useEffect(() => {
    if (!center) return;
    const msg = JSON.stringify({ type: 'UPDATE', center, radiusM, cafes });
    webViewRef.current?.postMessage(msg);
  }, [center, radiusM, cafes]);

  const decreaseRadius = () => setRadiusM((r) => clampRadius(r - RADIUS_STEP_M));
  const increaseRadius = () => setRadiusM((r) => clampRadius(r + RADIUS_STEP_M));

  const isLoading = !location && !locationError;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>현재 위치를 불러오는 중…</Text>
          </View>
        ) : locationError === 'permission' ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>위치 권한이 필요해요</Text>
            <Text style={styles.errorMessage}>
              주변 카페를 보려면 위치 권한을 허용해 주세요.
            </Text>
            <TouchableOpacity style={styles.errorButton} onPress={handleCheckPermission}>
              <Text style={styles.errorButtonText}>권한 확인하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.errorButton, styles.errorButtonPrimary]}
              onPress={handleRequestPermission}
            >
              <Text style={styles.errorButtonTextPrimary}>권한 요청하기</Text>
            </TouchableOpacity>
          </View>
        ) : locationError === 'unknown' ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>위치를 가져올 수 없어요</Text>
            <Text style={styles.errorMessage}>
              잠시 후 다시 시도해 주세요.
            </Text>
            <TouchableOpacity style={styles.errorButton} onPress={fetchLocation}>
              <Text style={styles.errorButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html }}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
          />
        )}
      </View>

      <View style={styles.controls}>
        <Text style={styles.radiusLabel}>반경 {radiusM}m</Text>
        <View style={styles.radiusButtons}>
          <TouchableOpacity onPress={decreaseRadius} style={styles.radiusButton}>
            <Text style={styles.radiusButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={increaseRadius} style={styles.radiusButton}>
            <Text style={styles.radiusButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>300m ~ 1000m 사이에서 조절할 수 있어요.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapContainer: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingText: { color: '#4A5568' },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  errorButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    marginBottom: 10,
  },
  errorButtonPrimary: { backgroundColor: '#EDB07F' },
  errorButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  errorButtonTextPrimary: { fontSize: 16, fontWeight: '600', color: '#fff' },
  controls: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    backgroundColor: '#fff',
  },
  radiusLabel: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  radiusButtons: { flexDirection: 'row', gap: 12, marginTop: 10 },
  radiusButton: {
    width: 48,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusButtonText: { fontSize: 18, fontWeight: '700', color: '#202632' },
  hint: { marginTop: 8, fontSize: 12, color: '#6B7280' },
});
