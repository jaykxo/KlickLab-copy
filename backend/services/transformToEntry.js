function isNotEmpty(obj) {
  return obj && Object.keys(obj).length > 0;
}

function formatTimestampToKST(dateStr) {
  const utc = new Date(dateStr);
  const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace("T", " ").replace("Z", "");
}

function transformToEntry(data) {
  const {
    event_name,
    client_id,
    user_id,
    session_id,
    user_gender,
    user_age,
    properties = {},
    context = {},
  } = data;

  const {
    page_path,
    page_title,
    referrer,
    time_on_page_seconds = null,
    click_x,
    click_y,
    page_x,
    page_y,
    target_text,
    target_tag,
    target_class,
    target_id,
    target_href,
    target_type,
    target_value,
    is_button = false,
    is_link = false,
    is_input = false,
    is_textarea = false,
    is_select = false,
    form_action,
    form_method,
    form_id,
    form_class,
    form_fields,
    form_field_count,
    scroll_percentage,
    max_scroll_percentage,
  } = properties;

  const {
    device = {},
    traffic_source = {},
    geo = {},
    user_agent,
    screen_resolution,
    viewport_size,
    utm_params = {},
  } = context;

  const {
    device_type = null,
    os = null,
    browser = null,
    language = null,
    timezone = null,
  } = device;

  const {
    traffic_medium = null,
    traffic_source: trafficSourceName = null,
    traffic_campaign = null,
  } = traffic_source;

  const entry = {
    event_name,
    timestamp: formatTimestampToKST(data.timestamp),
    client_id,
    user_id,
    session_id,
    user_gender,
    user_age,

    // 페이지 정보
    page_path,
    page_title,
    referrer,
    time_on_page_seconds,

    // 디바이스
    device_type,
    os,
    browser,
    language,
    timezone,

    // 트래픽
    traffic_medium,
    traffic_source: trafficSourceName,
    traffic_campaign,

    // 클릭/폼/스크롤 정보
    click_x,
    click_y,
    page_x,
    page_y,
    target_text,
    target_tag,
    target_class,
    target_id,
    target_href,
    target_type,
    target_value,
    is_button: is_button ? 1 : 0,
    is_link: is_link ? 1 : 0,
    is_input: is_input ? 1 : 0,
    is_textarea: is_textarea ? 1 : 0,
    is_select: is_select ? 1 : 0,

    element_tag: data.element_tag || null,
    element_id: data.element_id || null,
    element_class: data.element_class || null,
    element_text: data.element_text || null,
    element_path: data.element_path || null,

    form_action,
    form_method,
    form_id,
    form_class,
    form_fields: isNotEmpty(form_fields) ? JSON.stringify(form_fields) : null,
    form_field_count,

    scroll_percentage,
    max_scroll_percentage,

    // context 평탄화
    geo_country: geo.country ?? null,
    geo_city: geo.city ?? null,
    geo_timezone: geo.timezone ?? null,
    user_agent,
    screen_resolution,
    viewport_size,
    utm_params: isNotEmpty(utm_params) ? JSON.stringify(utm_params) : null,
  };

  return entry;
}

module.exports = { transformToEntry };