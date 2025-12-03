import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";

// Check if analytics is enabled via cookies
const isAnalyticsEnabled = () => {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) return false;
  try {
    const prefs = JSON.parse(consent);
    return prefs.analytics === true;
  } catch {
    return false;
  }
};

// Analytics utility for tracking page views and events
export const trackEvent = async (eventName, eventData = {}) => {
  // Only track if user has accepted analytics cookies
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics] Tracking disabled - no consent');
    return;
  }

  // Track to database for dashboard metrics
  try {
    await base44.entities.AnalyticsEvent.create({
      event_type: eventName,
      page: window.location.pathname,
      content_id: eventData.content_id || eventData.post_id || '',
      content_title: eventData.content_title || eventData.page_name || '',
      value: JSON.stringify(eventData),
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    });
  } catch (e) {
    console.log('[Analytics] DB save error:', e);
  }

  // Also save to localStorage as backup
  const events = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
  events.push({
    event: eventName,
    data: eventData,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    referrer: document.referrer || 'direct'
  });
  localStorage.setItem('analyticsEvents', JSON.stringify(events.slice(-500)));
  
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }
};

// Session management
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analyticsSessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analyticsSessionId', sessionId);
  }
  return sessionId;
};

export const trackPageView = (pageName) => {
  trackEvent('page_view', { page_name: pageName });
};

export const trackContentView = (contentType, contentId, contentTitle) => {
  trackEvent('content_view', { 
    content_type: contentType, 
    content_id: contentId,
    content_title: contentTitle 
  });
};

export const trackSearch = (searchTerm, resultsCount) => {
  trackEvent('search', { 
    search_term: searchTerm, 
    results_count: resultsCount 
  });
};

export const trackClick = (elementName, elementType) => {
  trackEvent('click', { 
    element_name: elementName, 
    element_type: elementType 
  });
};

// Track scroll depth
export const trackScrollDepth = (postId, depth) => {
  trackEvent('scroll_depth', {
    post_id: postId,
    depth_percent: depth
  });
};

// Track time on page
export const trackTimeOnPage = (postId, seconds) => {
  trackEvent('time_on_page', {
    post_id: postId,
    seconds: seconds
  });
};

// Track engagement (likes, comments)
export const trackEngagement = (type, postId, action) => {
  trackEvent('engagement', {
    type: type, // 'like' or 'comment'
    post_id: postId,
    action: action // 'add' or 'remove'
  });
};

// Track share
export const trackShare = (postId, platform) => {
  trackEvent('share', {
    post_id: postId,
    platform: platform
  });
};

// Get analytics data
export const getAnalyticsData = () => {
  return JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
};

// Get engagement stats for a specific post
export const getPostEngagementStats = (postId) => {
  const events = getAnalyticsData();
  const postEvents = events.filter(e => 
    e.data?.post_id === postId || 
    e.data?.content_id === postId
  );
  
  const scrollEvents = postEvents.filter(e => e.event === 'scroll_depth');
  const timeEvents = postEvents.filter(e => e.event === 'time_on_page');
  const likeEvents = postEvents.filter(e => e.event === 'engagement' && e.data?.type === 'like');
  const commentEvents = postEvents.filter(e => e.event === 'engagement' && e.data?.type === 'comment');
  const shareEvents = postEvents.filter(e => e.event === 'share');
  
  return {
    views: postEvents.filter(e => e.event === 'content_view').length,
    avgScrollDepth: scrollEvents.length > 0 
      ? Math.round(scrollEvents.reduce((acc, e) => acc + (e.data?.depth_percent || 0), 0) / scrollEvents.length)
      : 0,
    avgTimeOnPage: timeEvents.length > 0 
      ? Math.round(timeEvents.reduce((acc, e) => acc + (e.data?.seconds || 0), 0) / timeEvents.length)
      : 0,
    likes: likeEvents.filter(e => e.data?.action === 'add').length - likeEvents.filter(e => e.data?.action === 'remove').length,
    comments: commentEvents.filter(e => e.data?.action === 'add').length,
    shares: shareEvents.length,
    sharePlatforms: shareEvents.reduce((acc, e) => {
      const platform = e.data?.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {})
  };
};

// Get overall analytics summary
export const getAnalyticsSummary = () => {
  const events = getAnalyticsData();
  
  const pageViews = events.filter(e => e.event === 'page_view');
  const contentViews = events.filter(e => e.event === 'content_view');
  const engagements = events.filter(e => e.event === 'engagement');
  const shares = events.filter(e => e.event === 'share');
  const searches = events.filter(e => e.event === 'search');
  
  // Traffic sources
  const trafficSources = events.reduce((acc, e) => {
    const referrer = e.referrer || 'direct';
    let source = 'direct';
    if (referrer.includes('google')) source = 'google';
    else if (referrer.includes('twitter') || referrer.includes('x.com')) source = 'twitter';
    else if (referrer.includes('facebook')) source = 'facebook';
    else if (referrer.includes('linkedin')) source = 'linkedin';
    else if (referrer !== 'direct') source = 'other';
    
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  
  // Page popularity
  const pagePopularity = pageViews.reduce((acc, e) => {
    const page = e.data?.page_name || e.page || 'unknown';
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {});
  
  // Content popularity
  const contentPopularity = contentViews.reduce((acc, e) => {
    const title = e.data?.content_title || 'unknown';
    acc[title] = (acc[title] || 0) + 1;
    return acc;
  }, {});
  
  // Engagement over time (last 7 days)
  const now = new Date();
  const engagementByDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayEvents = events.filter(e => e.timestamp?.startsWith(dateStr));
    engagementByDay.push({
      date: dateStr,
      pageViews: dayEvents.filter(e => e.event === 'page_view').length,
      likes: dayEvents.filter(e => e.event === 'engagement' && e.data?.type === 'like' && e.data?.action === 'add').length,
      comments: dayEvents.filter(e => e.event === 'engagement' && e.data?.type === 'comment').length,
      shares: dayEvents.filter(e => e.event === 'share').length
    });
  }
  
  // User demographics (based on user agent)
  const demographics = {
    devices: { desktop: 0, mobile: 0, tablet: 0 },
    browsers: {}
  };
  
  events.forEach(e => {
    const ua = e.userAgent || '';
    if (/mobile/i.test(ua)) demographics.devices.mobile++;
    else if (/tablet|ipad/i.test(ua)) demographics.devices.tablet++;
    else demographics.devices.desktop++;
    
    let browser = 'other';
    if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'chrome';
    else if (/firefox/i.test(ua)) browser = 'firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'safari';
    else if (/edge/i.test(ua)) browser = 'edge';
    
    demographics.browsers[browser] = (demographics.browsers[browser] || 0) + 1;
  });
  
  return {
    totalPageViews: pageViews.length,
    totalContentViews: contentViews.length,
    totalEngagements: engagements.length,
    totalShares: shares.length,
    totalSearches: searches.length,
    uniqueSessions: [...new Set(events.map(e => e.sessionId))].length,
    trafficSources,
    pagePopularity,
    contentPopularity,
    engagementByDay,
    demographics
  };
};

// Analytics Provider Component
export default function Analytics({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname);
  }, [location]);

  useEffect(() => {
    // Listen for analytics consent
    const handleConsent = (e) => {
      if (e.detail) {
        console.log('[Analytics] Consent granted, initializing tracking');
        // Initialize any third-party analytics here
      }
    };

    window.addEventListener('analyticsConsent', handleConsent);
    return () => window.removeEventListener('analyticsConsent', handleConsent);
  }, []);

  return children;
}