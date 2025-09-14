self.addEventListener('push', function (event) {
    if (event.data) {
      const data = event.data.json()
      event.waitUntil(self.registration.showNotification(data.title, {
        body: data.body,
        data: {
          dateOfArrival: Date.now(),
          primaryKey: '2',
        },
      }))
    }
  })
   