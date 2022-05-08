export const showNotification = async (message: string) => {
  console.log(1, 'NOTIFICATION?')
  if (window.Notification) {
    console.log(2, Notification.permission)
    if (Notification.permission === 'granted') {
      console.log(3)
      new Notification(message)
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          new Notification(message)
        }
      })
    }
  }
}
