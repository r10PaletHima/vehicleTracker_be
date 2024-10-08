const geolib = require("geolib");

exports.calculateTripStats = (coordinates) => {
  let totalDistance = 0;
  let totalDuration = 0;
  let idlingDuration = 0;
  let stoppageDuration = 0;
  let maxSpeed = 0;
  let speeds = [];

  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];

    const distance = geolib.getDistance(
      { latitude: prev.latitude, longitude: prev.longitude },
      { latitude: curr.latitude, longitude: curr.longitude }
    );

    const timeDiff =
      (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000 / 60; // in minutes
    const speed = ((distance / timeDiff) * 60) / 1000; // km/h

    totalDistance += distance;
    totalDuration += timeDiff;

    if (speed === 0) {
      if (curr.ignition) {
        idlingDuration += timeDiff;
      } else {
        stoppageDuration += timeDiff;
      }
    }

    maxSpeed = Math.max(maxSpeed, speed);
    speeds.push(speed);
  }

  const avgSpeed =
    speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;

  return {
    totalDistance: (totalDistance / 1000).toFixed(2), // km
    totalDuration: totalDuration.toFixed(2),
    idlingDuration: idlingDuration.toFixed(2),
    stoppageDuration: stoppageDuration.toFixed(2),
    maxSpeed: maxSpeed.toFixed(2),
    avgSpeed: avgSpeed.toFixed(2),
  };
};

exports.calculateDistance = function (point1, point2) {
  // This is a simple placeholder. For accurate calculations, use the Haversine formula
  const lat1 = point1.latitude;
  const lon1 = point1.longitude;
  const lat2 = point2.latitude;
  const lon2 = point2.longitude;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

exports.calculateAverageSpeed = function (trip) {
  // This is a placeholder. You'd need to implement actual calculations based on your data
  const totalDistance = this.calculateDistance(
    trip.gpsData[0],
    trip.gpsData[trip.gpsData.length - 1]
  );
  const totalTime = (trip.endTime - trip.startTime) / 3600000; // Convert to hours
  return totalDistance / totalTime; // km/h
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
