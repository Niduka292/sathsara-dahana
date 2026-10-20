import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Ramp up to 200 virtual users over 30 seconds, hold for 1 minute, then ramp down
  stages: [
    { duration: '30s', target: 200 },
    { duration: '1m', target: 200 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://sathsaradahana.netlify.app/lightshow');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}