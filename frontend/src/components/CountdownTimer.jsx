import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { FaClock, FaFire } from 'react-icons/fa';

const CountdownTimer = ({ endTime, onExpire, isCompact = false }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(endTime).getTime() - new Date().getTime();
    if (difference <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const isUrgent = timeLeft.total > 0 && timeLeft.total < 3600 * 1000 * 2; // Under 2 hours
  const isEnded = timeLeft.total <= 0;

  if (isEnded) {
    return (
      <Badge bg='secondary' className='px-2 py-1' style={{ fontSize: isCompact ? '0.75rem' : '0.9rem' }}>
        Auction Ended
      </Badge>
    );
  }

  const pad = num => String(num).padStart(2, '0');

  if (isCompact) {
    return (
      <span
        className={`d-inline-flex align-items-center fw-bold ${
          isUrgent ? 'text-danger' : 'text-primary'
        }`}
        style={{ fontSize: '0.85rem' }}
      >
        {isUrgent ? <FaFire className='me-1 text-danger' /> : <FaClock className='me-1' />}
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
      </span>
    );
  }

  return (
    <div className='d-flex align-items-center gap-2'>
      <div
        className={`px-3 py-2 rounded text-center shadow-sm ${
          isUrgent ? 'bg-danger text-white' : 'bg-dark text-white'
        }`}
        style={{ minWidth: '70px', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className='fs-4 fw-bold'>{timeLeft.days > 0 ? timeLeft.days : pad(timeLeft.hours)}</div>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
          {timeLeft.days > 0 ? 'Days' : 'Hours'}
        </div>
      </div>
      <span className='fs-4 fw-bold text-muted'>:</span>
      <div
        className={`px-3 py-2 rounded text-center shadow-sm ${
          isUrgent ? 'bg-danger text-white' : 'bg-dark text-white'
        }`}
        style={{ minWidth: '70px', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className='fs-4 fw-bold'>{pad(timeLeft.minutes)}</div>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
          Minutes
        </div>
      </div>
      <span className='fs-4 fw-bold text-muted'>:</span>
      <div
        className={`px-3 py-2 rounded text-center shadow-sm ${
          isUrgent ? 'bg-danger text-white' : 'bg-dark text-white'
        }`}
        style={{ minWidth: '70px', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className='fs-4 fw-bold'>{pad(timeLeft.seconds)}</div>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
          Seconds
        </div>
      </div>
      {isUrgent && (
        <Badge bg='danger' className='ms-2 py-2 px-2 animate-pulse'>
          <FaFire className='me-1' /> Ending Soon
        </Badge>
      )}
    </div>
  );
};

export default CountdownTimer;
