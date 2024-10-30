importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js');
let firebaseConfig = {
  apiKey: "AIzaSyC4ndRbqQZpSmCxsnO9L6MrXX5lNB_4g48",
  authDomain: "alian-hub-beta.firebaseapp.com",
  projectId: "alian-hub-beta",
  storageBucket: "alian-hub-beta.appspot.com",
  messagingSenderId: "553732026731",
  appId: "1:553732026731:web:116968b86ddedd84595c2e",
  measurementId: "G-FG9R8JL3VX"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ACTIVATION
self.addEventListener('activate', () => {
  console.log('Service worker activated');
});

// CLICK HANDLER
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const redirectionUrl = event.notification.data['click_action'];
  if (redirectionUrl !== undefined) {
    event.waitUntil(
      clients.openWindow(redirectionUrl)
    );
  }
});

// NOTIFICATION HANDLER
self.addEventListener('push', event => {
  const data = event.data.json();
  const notificationData = data?.data ? data.data : data.notification
  const title = notificationData?.title || 'Notification';
  const options = {
    body: notificationData.body || 'New notification received',
    icon: notificationData.icon || './logo.png',
    data: notificationData,
    image: notificationData.image || 'image',
    sound: "default"
  };
  event.waitUntil(self.registration.showNotification(title, options));
})