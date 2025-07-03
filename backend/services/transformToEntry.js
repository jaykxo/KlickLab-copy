function isNotEmpty(obj) {
  return obj && Object.keys(obj).length > 0;
}

function transformToEntry(data) {
  const utcDate = new Date(data.timestamp);
  const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

  const {
    event_name,
    client_id,
    user_id,
    session_id,
    user_gender = null,
    user_age = null,
    properties = {},
    context = {},
  } = data;

  const {
    page_path,
    page_title,
    referrer,
    time_on_page_seconds = null,
    ...restProperties
  } = properties;

  const { device = {}, traffic_source = {}, ...restContext } = context;

  const {
    device_type = null,
    os = null,
    browser = null,
    language = null,
    ...filteredDevice
  } = device;

  const {
    traffic_medium = null,
    traffic_source: trafficSourceName = null,
    campaign = null,
    ...filteredTraffic
  } = traffic_source;

  const filteredContext = {
    ...restContext,
    ...(isNotEmpty(filteredDevice) && { device: filteredDevice }),
    ...(isNotEmpty(filteredTraffic) && { traffic_source: filteredTraffic }),
  };

  const entry = {
    event_name,
    timestamp: kstDate.toISOString(),
    client_id,
    user_id,
    session_id,

    page_path,
    page_title,
    referrer,
    time_on_page_seconds,

    device_type,
    os,
    browser,
    language,

    traffic_medium,
    traffic_source: trafficSourceName,
    traffic_campaign: campaign,

    user_gender,
    user_age,

    ...(isNotEmpty(restProperties) && { properties: restProperties }),
    ...(isNotEmpty(filteredContext) && { context: filteredContext }),
  };

  return entry;
}

module.exports = { transformToEntry };