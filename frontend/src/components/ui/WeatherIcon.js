import React from 'react';
import PropTypes from 'prop-types';
import './WeatherIcon.css';

const WeatherIcon = ({ weather, size = 'small', showTemp = false, temperature = null }) => {
  const getWeatherIcon = (weather) => {
    if (!weather) return '❔';
    
    const weatherLower = weather.toLowerCase();
    
    if (weatherLower.includes('晴') || weatherLower.includes('快晴')) {
      return '☀️';
    } else if (weatherLower.includes('曇')) {
      return '☁️';
    } else if (weatherLower.includes('雨')) {
      return '🌧️';
    } else if (weatherLower.includes('雪')) {
      return '❄️';
    } else if (weatherLower.includes('雷')) {
      return '⚡';
    } else if (weatherLower.includes('霧')) {
      return '🌫️';
    } else if (weatherLower.includes('風')) {
      return '💨';
    } else {
      return '🌤️'; // デフォルト
    }
  };

  const getWeatherColor = (weather) => {
    if (!weather) return '#999';
    
    const weatherLower = weather.toLowerCase();
    
    if (weatherLower.includes('晴') || weatherLower.includes('快晴')) {
      return '#FF6B35';
    } else if (weatherLower.includes('曇')) {
      return '#757575';
    } else if (weatherLower.includes('雨')) {
      return '#4285F4';
    } else if (weatherLower.includes('雪')) {
      return '#E8F5E8';
    } else if (weatherLower.includes('雷')) {
      return '#9C27B0';
    } else {
      return '#81C784';
    }
  };

  const icon = getWeatherIcon(weather);
  const color = getWeatherColor(weather);

  return (
    <div 
      className={`weather-icon ${size}`} 
      style={{ color }}
      title={weather ? `天気: ${weather}${temperature !== null ? ` (${Math.round(temperature)}°C)` : ''}` : undefined}
    >
      <span className="weather-emoji">{icon}</span>
      {showTemp && temperature !== null && (
        <span className="temperature">{Math.round(temperature)}°</span>
      )}
    </div>
  );
};

WeatherIcon.propTypes = {
  weather: PropTypes.string,
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
  showTemp: PropTypes.bool,
  temperature: PropTypes.number,
};

WeatherIcon.defaultProps = {
  weather: null,
  size: 'small',
  showTemp: false,
  temperature: null,
};

export default WeatherIcon;
