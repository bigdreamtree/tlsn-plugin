import icon from '../assets/full_tree.png';
import config_json from '../config.json';
import { redirect, getCookiesByHost, getHeadersByHost, notarize, outputJSON } from './utils/hf.js';


const requestUrl = 'https://x.com/i/api/graphql/BQ6xjFU6Mgm-WhEP3OiT9w/UserByScreenName';

const createFullRequestUrl = (screen_name) => {
  const features = {
    hidden_profile_subscriptions_enabled: true,
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    subscriptions_verification_info_is_identity_verified_enabled: true,
    subscriptions_verification_info_verified_since_enabled: true,
    highlights_tweets_tab_ui_enabled: true,
    responsive_web_twitter_article_notes_tab_enabled: true,
    subscriptions_feature_can_gift_premium: true,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
  };

  const fieldToggles = {
    withAuxiliaryUserLabels: false,
  };

  const encodeQueryData = (data) => {
    return Object.keys(data)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');
  };

  return `${requestUrl}?${encodeQueryData({
    variables: JSON.stringify({screen_name}),
    features: JSON.stringify(features),
    fieldToggles: JSON.stringify(fieldToggles)
  })}`;
}

export function config() {
  outputJSON({
    ...config_json,
    icon: icon,
    requests: [
      {
        url: "https://x.com/i/api/graphql/BQ6xjFU6Mgm-WhEP3OiT9w/UserByScreenName*",
        method: 'GET',
      },
    ],
  });
}

function isValidHost(urlString: string) {
  const url = new URL(urlString);
  return url.hostname === 'twitter.com' || url.hostname === 'x.com';
}

export function start() {
  const cookies1 = getCookiesByHost('christmasmerkletree.xyz');
  const cookies2 = getCookiesByHost('merkle.ddns.net');
  const screenName = cookies1.target_handle || cookies2.target_handle;

  if (!isValidHost(Config.get('tabUrl'))) {
    redirect(`https://x.com/${screenName}`);
    outputJSON(false);
    return;
  }
  outputJSON(true);
}

export function two() {
  const cookies = getCookiesByHost('x.com');
  const headers = getHeadersByHost('x.com');

  const cookies1 = getCookiesByHost('christmasmerkletree.xyz');
  const cookies2 = getCookiesByHost('merkle.ddns.net');
  const screenName = cookies1.target_handle || cookies2.target_handle;
  const fullRequestUrl = createFullRequestUrl(screenName);

  if (
    !cookies.auth_token ||
    !cookies.ct0 ||
    !headers['x-csrf-token'] ||
    !headers['authorization']
  ) {
    outputJSON(false);
    return;
  }
  
  outputJSON({
    url: fullRequestUrl,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-twitter-client-language': 'en',
      'x-csrf-token': headers['x-csrf-token'],
      'x-client-uuid': headers['x-client-uuid'],
      Host: 'x.com',
      authorization: headers.authorization,
      Cookie: `lang=en; auth_token=${cookies.auth_token}; ct0=${cookies.ct0}`,
      'Accept-Encoding': 'identity',
      Connection: 'close',
    },
    secretHeaders: [
      `x-csrf-token: ${headers['x-csrf-token']}`,
      `cookie: lang=en; auth_token=${cookies.auth_token}; ct0=${cookies.ct0}`,
      `authorization: ${headers.authorization}`,
    ],
  });
}

export function parseTwitterResp() {
  const bodyString = Host.inputString();
  const params = JSON.parse(bodyString);

  if (params.data && params.data.user && params.data.user.result) {
    const userResult = params.data.user.result;

    const followedBy = userResult.legacy.followed_by !== undefined ? userResult.legacy.followed_by : null;
    const following = userResult.legacy.following !== undefined ? userResult.legacy.following : null;

    const revealed = `"followed_by":${followedBy},"following":${following}`;
    const selectionStart = bodyString.indexOf(revealed);
    const selectionEnd = selectionStart + revealed.length;

    const secretResps = [
      bodyString.substring(0, selectionStart),
      bodyString.substring(selectionEnd, bodyString.length),
    ];

    outputJSON(secretResps);
  } else {
    outputJSON(false);
  }
}


export function three() {
  const params = JSON.parse(Host.inputString());

  if (!params) {
    outputJSON(false);
  } else {
    const id = notarize({
      ...params,
      getSecretResponse: 'parseTwitterResp',
    });
    outputJSON(id);
  }
}
