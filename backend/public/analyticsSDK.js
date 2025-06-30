(function () {
  let currentUserId = null;
  let isReady = false;
  let eventQueue = [];

  const getClientId = () => {
    let clientId = localStorage.getItem("analytics_client_id");
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem("analytics_client_id", clientId);
    }
    return clientId;
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `sess_${new Date().toISOString()}_${crypto.randomUUID().split("-")[0]}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(ua);
    const os = /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : "Desktop";
    const browser = /Chrome/.test(ua)
      ? "Chrome"
      : /Safari/.test(ua)
      ? "Safari"
      : /Firefox/.test(ua)
      ? "Firefox"
      : "Other";

    return {
      type: isMobile ? "mobile" : "desktop",
      os,
      browser,
      language: navigator.language,
    };
  };

  const parseTrafficSource = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      medium: params.get("utm_medium") || "direct",
      source: params.get("utm_source") || document.referrer || "direct",
      campaign: params.get("utm_campaign"),
      utm: {
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_term: params.get("utm_term"),
        utm_content: params.get("utm_content"),
      },
    };
  };

  const sendEvent = (eventName, properties = {}, userId = null) => {
    const eventData = {
      event_name: eventName,
      timestamp: Date.now(),
      client_id: getClientId(),
      user_id: userId || currentUserId,
      session_id: getSessionId(),
      properties: {
        page_path: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer,
        ...properties,
      },
      context: {
        geo: {
          country: null,
          city: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        device: getDeviceInfo(),
        traffic_source: parseTrafficSource(),
      },
    };

    if (!isReady) {
      eventQueue.push(eventData);
    } else {
      dispatchEvent(eventData);
    }
  };

  function setUserId(id) {
    currentUserId = id;
    isReady = true;

    // 큐에 쌓인 이벤트들 전송
    while (eventQueue.length > 0) {
      const event = eventQueue.shift();
      event.user_id = id;
      dispatchEvent(event);
    }
  }

  function dispatchEvent(eventData) {
    fetch("http://localhost:3001/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    }).catch(console.error);
    console.log(JSON.stringify(eventData));
  }

  // 전역으로 등록
  window.analytics = {
    sendEvent,
    setUserId,
    getClientId,
    getSessionId,
    getDeviceInfo,
    parseTrafficSource,
  };

  // 페이지 로딩 시 자동 page_view 전송
  // window.addEventListener("DOMContentLoaded", () => {
  //   sendEvent("page_view");
  // });
  function listenForPageViews() {
    let lastPath = window.location.pathname;

    const track = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        sendEvent("page_view");
      }
    };

    const wrap = (fn) => {
      const original = history[fn];
      history[fn] = function (...args) {
        const result = original.apply(this, args);
        track();
        return result;
      };
    };

    wrap("pushState");
    wrap("replaceState");
    window.addEventListener("popstate", track);

    // 최초 로딩 시에도 1번 전송
    sendEvent("page_view");
  }

  // 클릭 이벤트 자동 수집 (data-analytics-click 속성 대상)
  /* data-analytics-click가 있으면 그 label 사용
     없으면 fallback으로 innerText, id, aria-label 자동 추출 */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("button, a, [role='button'], tr, td");
  
    if (el) {
      const manual = el.getAttribute("data-analytics-click");
      const auto = el.getAttribute("aria-label") || el.innerText?.trim().slice(0, 30) || el.id || "unknown";
      const label = manual || auto;
      const tag = el.tagName.toLowerCase();
      const id = el.id || null;
      const className = el.className || null;
  
      sendEvent("click", { label, tag, id, class: className, });
    }
  });
  
  listenForPageViews();
})();