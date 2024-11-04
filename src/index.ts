import icon from '../assets/icon.png';
import config_json from '../config.json';
import { getCookiesByHost, getHeadersByHost, notarize, outputJSON, redirect } from './utils/hf.js';


const requestUrl = 'https://x.com/i/api/graphql/BQ6xjFU6Mgm-WhEP3OiT9w/UserByScreenName';

const createFullRequestUrl = () => {
  // const tabUrl = Config.get('tabUrl');
  // const screenName = tabUrl ? new URL(tabUrl).pathname.split('/').pop() || '' : '';

  // const variables = {
  //   screen_name: screenName
  // };
  const variables = {
    screen_name: "0xdarron"
  };

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
    variables: JSON.stringify(variables),
    features: JSON.stringify(features),
    fieldToggles: JSON.stringify(fieldToggles)
  })}`;
}

const fullRequestUrl = createFullRequestUrl();

export function config() {
  outputJSON({
    ...config_json,
    icon: icon,
    requests: [
      {
        url: fullRequestUrl,
        method: 'GET',
      },
    ],
  });
}

function isValidHost(urlString: string) {
  const url = new URL(urlString);
  return url.hostname === 'twitter.com' || url.hostname === 'x.com';
}

// function getPath(urlString: string) {
//   const url = new URL(urlString);
  
//   return url.pathname;
// }

export function start() {
  if (!isValidHost(Config.get('tabUrl'))) {
    redirect('https://x.com/0xdarron');
    // redirect(Config.get('tabUrl'))
    outputJSON(false);
    return;
  }
  outputJSON(true);
}

export function two() {
  const cookies = getCookiesByHost('x.com');
  const headers = getHeadersByHost('x.com');
  
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

  console.log(params);

  if (params.data && params.data.user && params.data.user.result) {
    const userResult = params.data.user.result;

    const followedBy = userResult.legacy.followed_by !== undefined ? userResult.legacy.followed_by : null;
    const following = userResult.legacy.following !== undefined ? userResult.legacy.following : null;

    const revealed = `"followed_by":${followedBy},"following":${following}`;
    const selectionStart = bodyString.indexOf(revealed);
    const selectionEnd = selectionStart + revealed.length;

    const screenName = params.data.user.result.legacy.screen_name;
    const revealed2 = `"screen_name":"${screenName}"`;
    const selectionStart2 = bodyString.indexOf(revealed2);
    const selectionEnd2 = selectionStart2 + revealed2.length;

    const secretResps = [
      bodyString.substring(0, selectionStart),
      bodyString.substring(selectionEnd, selectionStart2),
      bodyString.substring(selectionEnd2, bodyString.length),
    ];

    console.log(secretResps[0]);
    console.log(secretResps[1]);
    console.log(secretResps[2]);

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
